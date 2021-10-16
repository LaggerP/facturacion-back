"use strict";
const nodemailer = require("nodemailer");
const fs = require('fs');
const handlebars = require('handlebars');
const path = require("path");

const transporter = nodemailer.createTransport({
    host: process.env.FyA_EMAIL_SMTP,
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.FyA_EMAIL_USER,
        pass: process.env.FyA_EMAIL_PASS,
    },
});

const sendRegistrationEmail = async (email, packageName) => {

    const filePath = path.join(__dirname, './mailTemplates/registrationEmailTemplate.html');
    const source = fs.readFileSync(filePath, 'utf-8').toString();
    const template = handlebars.compile(source);
    const replacements = {
        packageName: `${packageName}`
    };
    const htmlToSend = template(replacements)

    // send mail with defined transport object
    let info = await transporter.sendMail({
        from: '"no-reply" <notflix.fya@notflix.com>', // sender address
        to: email, // list of receivers
        subject: "🎞Se realizó una suscripción a nuevo paquete", // Subject line
        attachments: [{
            filename: 'notflixLogo.png',
            path: __dirname +'/notflixLogo.png',
            cid: 'logo'
        }],
        html: htmlToSend
    });

    console.log("Message sent: %s", info.messageId);
}

const sendNewInvoiceEmail = async (email, description, invoiceNumber) => {

    const filePath = path.join(__dirname, './mailTemplates/newInvoiceEmailTemplate.html');
    const source = fs.readFileSync(filePath, 'utf-8').toString();
    const template = handlebars.compile(source);
    const replacements = {
        description: `${description}`,
        invoiceNumber: `${invoiceNumber}`
    };
    const htmlToSend = template(replacements)

    // send mail with defined transport object
    let info = await transporter.sendMail({
        from: '"no-reply" <notflix.fya@notflix.com>', // sender address
        to: email, // list of receivers
        subject: `🎟Aquí esta su nueva factura #${invoiceNumber} - Notflix`, // Subject line
        attachments: [{
            filename: 'notflixLogo.png',
            path: __dirname +'/notflixLogo.png',
            cid: 'logo'
        }],
        html: htmlToSend
    });

    console.log("Message sent: %s", info.messageId);
}

const sendNonPaidEmail = async (email) => {

    const filePath = path.join(__dirname, './mailTemplates/newNonPaidEmailTemplate.html');
    const source = fs.readFileSync(filePath, 'utf-8').toString();
    const template = handlebars.compile(source);
    const replacements = {
    };
    const htmlToSend = template(replacements)
    // send mail with defined transport object
    let info = await transporter.sendMail({
        from: '"no-reply" <notflix.fya@notflix.com>', // sender address
        to: email, // list of receivers
        subject: `❌ Error al pagar suscripción - Notflix`, // Subject line
        attachments: [{
            filename: 'notflixLogo.png',
            path: __dirname +'/notflixLogo.png',
            cid: 'logo'
        }],
        html: htmlToSend
    });

    console.log("Message sent: %s", info.messageId);
}


module.exports = {
    sendRegistrationEmail,
    sendNewInvoiceEmail,
    sendNonPaidEmail
}
