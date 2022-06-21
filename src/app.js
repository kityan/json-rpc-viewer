import JSONFormatter from 'json-formatter-js'

const body = document.getElementsByTagName('body')
const left = document.getElementById('left')
const right = document.getElementById('right')
const params = document.getElementById('params')
const table = document.getElementById('table')
const helpPopup = document.getElementById('helpPopup')
const divParamsViewer = document.getElementById('params_json_viewer')
const divResultErrorViewer = document.getElementById('resultError_json_viewer')
const leftResizer = document.getElementById('left_resizer')
const paramsResizer = document.getElementById('params_resizer')
const resetLayoutBtn = document.getElementById('reset_layout')
const opts = {animateOpen: false, animateClose: false}
const currentTheme = chrome.devtools.panels.themeName

let trClass = 1;

// add theme class name
if (currentTheme && body.length > 0) {
    body[0].classList.add('theme-' + currentTheme)
}

loadLayout()

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
        request.getContent(body => {
            // [+] add check for spec?
            const responseJSON = JSON.parse(body)
            const requestJSON = JSON.parse(request.request.postData.text)
            // [+] add check for equal length?

            const isBatch = Array.isArray(requestJSON) && Array.isArray(responseJSON)
            if (!isBatch) {
                addListItem(request, requestJSON, responseJSON)
            } else {
                const reponseJSONIndex = responseJSON.reduce((obj, item) => {
                    obj[item.id] = item;
                    return obj
                }, {})
                // [+] add check and warning for: id duplication? absent id?
                for (let i = 0; i < requestJSON.length; i++) {
                    const inBatch = i == 0 ? 'start' : (i == requestJSON.length - 1 ? 'end' : 'mid')
                    addListItem(request, requestJSON[i], reponseJSONIndex[requestJSON[i].id], inBatch, requestJSON.length)
                }
            }

        })
    }
})


function addListItem(request, requestJSON, responseJSON, inBatch, batchSize) {

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

    const time = Number.isFinite(request.time) ? Math.round(request.time) : ''
    const size = request.response && request.response.content && request.response.content.size

    const method = document.createElement('div');
    const url = document.createElement('div');

    method.classList.add('title');
    url.classList.add('url');

    const origin = request.request.headers.find(({ name }) => name === 'Host');
    const host = origin ? origin.value : '';

    if (!request.request.url.includes(host)) {
      url.classList.add('cors');
    }

    method.innerText = requestJSON.method;
    url.innerText = request.request.url;

    td1.appendChild(method);
    td1.appendChild(url);

    td1.classList.add('methodName');

    if (inBatch) {
        td1.classList.add('inBatch_' + inBatch)
        if (inBatch === 'start') {
            td2.innerText = time
            td3.innerText = size
        } else {
            td2.innerText = ' '
            td3.innerText = ' '
        }
    } else {
        td2.innerText = time
        td3.innerText = size
    }

}

leftResizer.addEventListener('mousedown', function (e) {
    document.addEventListener('mousemove', resizeLeftDiv)
    document.addEventListener('mouseup', stopResizeLeftDiv)
    document.addEventListener('mouseleave', stopResizeLeftDiv)
})

function loadLayout() {
    const leftWidth = localStorage.getItem('left-width')
    const paramsHeight = localStorage.getItem('params-height')

    left.style.width = leftWidth ? leftWidth : '50%';
    params.style.height = paramsHeight ? paramsHeight : '25%';

    if (leftWidth || paramsHeight) {
        resetLayoutBtn.style.display = 'inherit'
    } else {
        resetLayoutBtn.style.display = 'none'
    }
}

/**
 * @param {MouseEvent} e
 */
function resizeLeftDiv(e) {
    left.style.width = (e.pageX / body[0].clientWidth) * 100 + '%';
    localStorage.setItem('left-width', left.style.width)
    resetLayoutBtn.style.display = 'inherit'
}

function stopResizeLeftDiv() {
    document.removeEventListener('mousemove', resizeLeftDiv)
    document.removeEventListener('mouseup', stopResizeLeftDiv)
    document.removeEventListener('mouseleave', stopResizeLeftDiv)
}

paramsResizer.addEventListener('mousedown', function (e) {
    document.addEventListener('mousemove', resizeParamsDiv)
    document.addEventListener('mouseup', stopResizeParamsDiv)
    document.addEventListener('mouseleave', stopResizeParamsDiv)
})

/**
 * @param {MouseEvent} e
 */
function resizeParamsDiv(e) {
    let rightRect = right.getBoundingClientRect()
    params.style.height = ((e.pageY - rightRect.top) / rightRect.height) * 100 + '%';
    localStorage.setItem('params-height', params.style.height)
    resetLayoutBtn.style.display = 'inherit'
}

function stopResizeParamsDiv() {
    document.removeEventListener('mousemove', resizeParamsDiv)
    document.removeEventListener('mouseup', stopResizeParamsDiv)
    document.removeEventListener('mouseleave', stopResizeParamsDiv)
}

resetLayoutBtn.addEventListener('click', function () {
    localStorage.removeItem('params-height')
    localStorage.removeItem('left-width')
    loadLayout()
})
