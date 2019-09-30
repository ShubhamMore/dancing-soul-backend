// 'use strict';
const nodemailer = require('nodemailer');

const sendMail = async (mail) => {

    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        // service : "gmail",
        host: 'smtp.gmail.com',
        port: 465,
        secure: true, // true for 465, false for other ports
        requireTLS: true,
        auth: {
            user: process.env.GMAIL_USER, // generated ethereal user
            pass: process.env.GMAIL_PASSWORD // generated ethereal password
        }
    });

    // send mail with defined transport object
    let info = await transporter.sendMail({
        from: mail.from, // sender address
        to: mail.to, // list of receivers
        subject: mail.subject, // Subject line
        text: mail.text, // plain text body
        html: mail.html // html body
    });

    console.log('Message sent: %s', info.messageId);
    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

    // Preview only available when sending through an Ethereal account
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
}

module.exports = sendMail;