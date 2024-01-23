const PDFParser  = require("pdf2json");
const fs = require('fs/promises');
const path = require('path');
const { existsSync } = require('fs');
const jsonrawtoxlsx = require('jsonrawtoxlsx');

const PDF_DIR = path.resolve(__dirname, "./pdf")
const OUT_DIR = path.resolve(__dirname, "./out")
const JSON_DIR = path.resolve(__dirname, "./json")

let arquivos = 0;

async function main() {
    const files_pdf = await fs.readdir(PDF_DIR)
    arquivos = files_pdf.length;

    files_pdf.forEach(async (pdf) => {
        const json_name = path.basename(pdf).split(".")[0] + ".json";
        const path_final_json = path.join(JSON_DIR, json_name);
        if (existsSync(path_final_json))
            await fs.rm(path_final_json)
        const pdfParser = new PDFParser();
        pdfParser.on("pdfParser_dataError", errData => console.error(errData.parserError));

        pdfParser.on("pdfParser_dataReady", async (pdfData) => {
            const regexTelefone = /(\d{2})[\D\-]?\d{5}[\D\-]?\d{4}/;
            const regexDinheiro = /(\d{2})%2C(\d{2})/;
            const regexDinheiroCentena = /(\d{3})%2C(\d{2})/;
            const regexDinheiroNova = /(\d{1}.(\d{3})%2C(\d{2}))/;

            const telNumeros = []
            const dinheiro = []
            let liberar = 0;

            Object.values(pdfData["Pages"]).forEach(pages => {
                Object.values(pages["Texts"]).forEach(linhas => {
                    Object.values(linhas["R"]).forEach((r, index, arr) => {
                        const linhaT = String(r["T"]);

                        if(regexTelefone.test(linhaT) && linhaT.includes("%20")){
                            const l = linhaT.split("%20").join("")
                            if(l.length == 13 && !telNumeros.includes(l)){
                                telNumeros.push(l)
                            }
                        }
                        else{
                            if(linhaT.includes("TOTAL%20PARA%20CADA%20CELULAR"))liberar=6
                            if((regexDinheiro.test(linhaT) || regexDinheiroCentena.test(linhaT) || regexDinheiroNova.test(linhaT)) && (linhaT.length >= 7 && linhaT.length <= 10) && liberar > 0){
                                const formatedMoney = linhaT.split("%2C").join(",")
                                dinheiro.push(formatedMoney)
                                liberar -=1;
                            }
                        }
                    })
                })
            })
            const obj = []
            
            for(let i = 0; i < telNumeros.length; i++){
                obj.push({
                    numero : telNumeros[i],
                    dinheiro: dinheiro[i]
                })
            }
            await fs.writeFile(path_final_json, JSON.stringify(obj), "utf-8");
            arquivos -= 1
        });
       
        pdfParser.loadPDF(path.join(PDF_DIR, pdf))
    })
}

const  checarSeAcabou = setInterval( async () => {
    if(arquivos  === 0){
        clearInterval(checarSeAcabou)
        const arquivos_json = await fs.readdir(JSON_DIR);
        const diretorio_xls = path.join(OUT_DIR, "arquivo_final.xlsx")

        for (i in arquivos_json){
            const arquivo = arquivos_json[i]
            const diretorio_json = path.join(JSON_DIR, arquivo)
            const diretorio_xls = path.join(OUT_DIR, arquivo.split(".")[0] + ".xlsx")
            const file = JSON.parse(await fs.readFile(diretorio_json));
            const buffer = jsonrawtoxlsx(file)
            await fs.writeFile(diretorio_xls, buffer, "binary")
        }


    }
}, 1000)


main();