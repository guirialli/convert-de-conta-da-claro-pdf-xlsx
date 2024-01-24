const { ipcRenderer } = require("electron");

function handleConvertPDFToXLSX(path_pdf){
    ipcRenderer.send("convertPDFToXLSX", path_pdf);
    ipcRenderer.on("convertPDFToXLSX-reply", (event, textoSucesso) => {
        document.getElementById("error").innerText = "";
        document.getElementById("sucess").innerText = textoSucesso;
    });
    ipcRenderer.on("convertPDFToXLSX-error", (event, erro_string) => {
        document.getElementById("error").innerText = erro_string? String(erro_string) : "Erro desconhecido!";
        document.getElementById("sucess").innerText = ""
    });
}

module.exports = {
    handleConvertPDFToXLSX
}