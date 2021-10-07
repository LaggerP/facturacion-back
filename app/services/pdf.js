const pdf = require("html-pdf");
const fs = require("fs");

const createPDFInvoice = async (res, data) => {
    const filePath = require.resolve('./pdfTemplates/invoicePDFTemplate.html');
    let html = fs.readFileSync(filePath, 'utf8')

    const formater = new Intl.NumberFormat("en", { style: "currency", "currency": "ARS" });

    let table = "";

    const invoiceNumber = "0001-" + zfill(data.invoiceNumber, 8)

    let invoiceDate = data.createdAt.toLocaleDateString("es-ES");;

    let subtotal = data.totalAmount;

    table += `<tr>
    <td>${data.description}</td>
    <td>1</td>
    <td>${formater.format(data.totalAmount)}</td>
    <td>${formater.format(data.totalAmount)}</td>
    </tr>`;
    
    const discount = 0;
    const subtotalWithDiscount = subtotal - discount;
    const total = subtotalWithDiscount;

    html = html.replace("{{products}}", table);    
    html = html.replace("{{invoice_number}}", invoiceNumber);
    html = html.replace("{{invoice_date}}", invoiceDate);
    html = html.replace("{{subtotal}}", formater.format(subtotal));
    html = html.replace("{{discount}}", formater.format(discount));
    html = html.replace("{{subtotalWithDiscount}}", formateador.format(subtotalWithDiscount));
    html = html.replace("{{total}}", formater.format(total));

    pdf.create(html).toBuffer(function(err, buffer){
        if(!err){
            res.status(200).send(Buffer.from(buffer).toString('base64'));
        }else{
            const response = {
                data: "Error creating PDF",
                message: err || "Error",
                status: 500
            }
            res.status(500).send(response);
        }
    });
}

function zfill(number, width) {
    var numberOutput = Math.abs(number);
    var length = number.toString().length;
    var zero = "0"; 
    
    if (width <= length) {
        if (number < 0) {
             return ("-" + numberOutput.toString()); 
        } else {
             return numberOutput.toString(); 
        }
    } else {
        if (number < 0) {
            return ("-" + (zero.repeat(width - length)) + numberOutput.toString()); 
        } else {
            return ((zero.repeat(width - length)) + numberOutput.toString()); 
        }
    }
}


module.exports = {
    createPDFInvoice
}