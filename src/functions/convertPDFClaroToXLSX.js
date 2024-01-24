
const { existsSync } = require('fs');
const fs = require('fs/promises');
const PDFParser = require("pdf2json");
const jsonrawtoxlsx = require('jsonrawtoxlsx');
const path = require('path');

async function convert(PDF_DIR, MODELO_DIR = undefined) {
    if (!existsSync(PDF_DIR))
        throw new Error("PDF file does not exist!");

    const basename = String(path.basename(PDF_DIR));
    const basenameArr = basename.split('.');

    if (basenameArr[basenameArr.length - 1].toLowerCase() != "pdf")
        throw new Error("Não é um arquivo em PDF!");
    
    const xls_final = path.join(path.dirname(PDF_DIR), basename.split(".")[0] + ".xlsx");

    const pdfParser = new PDFParser();
    pdfParser.on("pdfParser_dataError", errData => console.error(errData.parserError));
    pdfParser.on("pdfParser_dataReady", async (pdfData) => {
        const regexTelefone = /(\d{2})[\D\-]?\d{5}[\D\-]?\d{4}/;
        const regexDinheiro = /(\d{2})%2C(\d{2})/;
        const regexDinheiroCentena = /(\d{3})%2C(\d{2})/;
        const regexDinheiroMilhar = /(\d{1}.(\d{3})%2C(\d{2}))/;

        const telNumeros = []
        const dinheiro = []
        let liberar = 0;

        Object.values(pdfData["Pages"]).forEach(pages => {
            Object.values(pages["Texts"]).forEach(linhas => {
                Object.values(linhas["R"]).forEach((r) => {
                    const linhaT = String(r["T"]);

                    if (regexTelefone.test(linhaT) && linhaT.includes("%20")) {
                        const l = linhaT.split("%20").join("")
                        if (l.length == 13 && !telNumeros.includes(l)) {
                            telNumeros.push(l)
                        }
                    }
                    else {
                        if (linhaT.includes("TOTAL%20PARA%20CADA%20CELULAR")) liberar = 6
                        else if ((regexDinheiro.test(linhaT) || regexDinheiroCentena.test(linhaT) || regexDinheiroMilhar.test(linhaT))
                            && (linhaT.length >= 7 && linhaT.length <= 10)
                            && liberar > 0) {
                            const formatedMoney = linhaT.split("%2C").join(",")
                            dinheiro.push(formatedMoney)
                            liberar -= 1;
                        }
                    }
                })
            })
        })

        const obj = []
        for (let i = 0; i < telNumeros.length; i++) {
            obj.push({
                numero: telNumeros[i],
                dinheiro: dinheiro[i]
            })
        }

        if(MODELO_DIR && existsSync(MODELO_DIR)){

            return;
        }
        const buffer = jsonrawtoxlsx(obj)
        await fs.writeFile(xls_final, buffer, "binary");
    });

    pdfParser.loadPDF(PDF_DIR);
    return xls_final;

}

module.exports = convert