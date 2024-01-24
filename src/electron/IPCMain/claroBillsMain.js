const { ipcMain } = require("electron");
const convertPDFToXLSX = require("../../functions/convertPDFClaroToXLSX");


module.exports = function(){
    ipcMain.on("convertPDFToXLSX", async (event, {PDF_DIR, MODELO_DIR}) => {
        try{
           const xls_final = await convertPDFToXLSX(PDF_DIR, MODELO_DIR);
           event.reply("convertPDFToXLSX-reply", `Convertido com sucesso! Salvo em : ${xls_final}`);
        }catch(e){
            event.reply("convertPDFToXLSX-error", e.message);
        }

    })
}