import JSONFormatter from 'json-formatter-js'

const left = document.getElementById('left')
const table = document.getElementById('table')
const helpPopup = document.getElementById('helpPopup')
const divParamsViewer = document.getElementById('params_json_viewer')
const divResultErrorViewer = document.getElementById('resultError_json_viewer')
let trClass = 1


// clear log
document.getElementById('clear').addEventListener('click', () => {
  divParamsViewer.innerHTML = ''
  divResultErrorViewer.innerHTML = ''
  Array.from(table.childNodes).forEach((node, index) => index > 1 && table.removeChild(node))
})

// show help
document.getElementById('help').addEventListener('click', () => helpPopup.classList.remove('hidden'))
document.getElementById('closeHelp').addEventListener('click', () => helpPopup.classList.add('hidden'))


// process finished request
chrome.devtools.network.onRequestFinished.addListener(request => {

  if (
    request.request &&
    request.request.postData &&
    request.request.postData.mimeType &&
    request.request.postData.mimeType.match(/application\/json/) &&
    request.request.postData.text && request.request.postData.text.match(/jsonrpc/)
  ) {
    request.getContent((body) => {

      const responseJSON = JSON.parse(body)
      const requestJSON = JSON.parse(request.request.postData.text)

      const tr = document.createElement('tr')
      tr.classList.add(trClass > 0 ? 'even' : 'odd')
      trClass *= -1

      const td1 = document.createElement('td')

      if (responseJSON) {
        td1.classList.add(responseJSON && responseJSON.hasOwnProperty && responseJSON.hasOwnProperty('result') ? 'ok' : 'error')
      } else {
        td1.classList.add('reponseNotParsed')
      }

      const td2 = document.createElement('td')
      const td3 = document.createElement('td')
      tr.appendChild(td1)
      tr.appendChild(td2)
      tr.appendChild(td3)

      const wasScrolledToBottom = left.clientHeight + Math.ceil(left.scrollTop) >= left.scrollHeight
      table.appendChild(tr)
      if (wasScrolledToBottom) {
        setImmediate(() => left.scrollTop = left.scrollHeight - left.clientHeight)
      }

      const opts = { animateOpen: false, animateClose: false }

      tr.addEventListener('click', event => {
        Array.from(document.getElementsByTagName('tr')).forEach(el => el.classList.remove('selected'))
        event.currentTarget.classList.add('selected')
        let formatter1
        if (requestJSON && requestJSON.hasOwnProperty && requestJSON.hasOwnProperty('params')) {
          formatter1 = new JSONFormatter(requestJSON.params, 1, opts)
        }
        // [?] too large responses are not available
        let formatter2
        if (responseJSON && responseJSON.hasOwnProperty) {
          if (responseJSON.hasOwnProperty('result')) {
            formatter2 = new JSONFormatter(responseJSON.result, 1, opts)
          }
          if (responseJSON.hasOwnProperty('error')) {
            formatter2 = new JSONFormatter(responseJSON.error, 1, opts)
          }
        }
        divParamsViewer.innerHTML = ''
        if (formatter1) {
          divParamsViewer.appendChild(formatter1.render())
        }
        divResultErrorViewer.innerHTML = ''
        if (formatter2) {
          divResultErrorViewer.appendChild(formatter2.render())
        }
      })

      td1.innerHTML = requestJSON.method
      td2.innerText = Number.isFinite(request.time) ? Math.round(request.time) : ''
      td3.innerText = request.response && request.response.content && request.response.content.size
    })
  }

})
