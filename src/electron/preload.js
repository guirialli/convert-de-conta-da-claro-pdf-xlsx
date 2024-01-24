const {contextBridge} = require('electron');
const {handleConvertPDFToXLSX} = require('./IPCRender/claroBillsRender.js')

contextBridge.exposeInMainWorld('APIConvertClaroBills', {
    pdfToXLSX : handleConvertPDFToXLSX
})