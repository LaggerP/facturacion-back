"use strict";
const nodemailer = require("nodemailer");
const fs = require('fs');
const handlebars = require('handlebars');
const path = require("path");

// async..await is not allowed in global scope, must use a wrapper
const sendRegistrationEmail = async (email, packageName) => {

    const filePath = path.join(__dirname, './mailTemplates/registrationEmailTemplate.html');
    const source = fs.readFileSync(filePath, 'utf-8').toString();
    const template = handlebars.compile(source);
    const replacements = {
        packageName: `${packageName}`
    };
    const htmlToSend = template(replacements)

    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        host: process.env.FyA_EMAIL_SMTP,
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.FyA_EMAIL_USER,
            pass: process.env.FyA_EMAIL_PASS,
        },
    });


    // send mail with defined transport object
    let info = await transporter.sendMail({
        from: '"no-reply" <notflix.fya@notflix.com>', // sender address
        to: email, // list of receivers
        subject: "Se realizó una suscripción a nuevo paquete", // Subject line
        attachments: [{
            filename: 'notflixLogo.png',
            path: __dirname +'/notflixLogo.png',
            cid: 'logo' //my mistake was putting "cid:logo@cid" here!
        }],
        html: htmlToSend
    });

    console.log("Message sent: %s", info.messageId);
    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
}


module.exports = {
    sendRegistrationEmail
}
