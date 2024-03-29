const { ipcRenderer } = require("electron");

function handleConvertPDFToXLSX(path_pdf, modelo_path){
    ipcRenderer.send("convertPDFToXLSX", {PDF_DIR : path_pdf, MODELO_DIR : modelo_path});
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