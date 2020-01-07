const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const OAuth2 = google.auth.OAuth2;

const oauth2Client = new OAuth2(
  process.env.GMAIL_CLIENT_ID, // ClientID
  process.env.GMAIL_CLIENT_SECRET, // Client Secret
  'https://developers.google.com/oauthplayground' // Redirect URL
);

oauth2Client.setCredentials({
  refresh_token: process.env.GMAIL_REFRESH_TOKEN
});

const accessToken = oauth2Client.getAccessToken();

const sendMail = async mail => {
  // create reusable transporter object using the default SMTP transport
  const smtpTransport = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    auth: {
      type: 'OAuth2',
      user: process.env.GMAIL_USER,
      clientId: process.env.GMAIL_CLIENT_ID,
      clientSecret: process.env.GMAIL_CLIENT_SECRET,
      refreshToken: process.env.GMAIL_REFRESH_TOKEN,
      accessToken: accessToken
    }
  });

  const mailOptions = {
    from: mail.from, // sender address
    to: mail.to, // list of receivers
    subject: mail.subject, // Subject line
    generateTextFromHTML: true,
    html: mail.html // html body
  };

  // send mail with defined transport object
  let info = await smtpTransport.sendMail(mailOptions);

  smtpTransport.close();

  console.log('Message sent: %s', info.messageId);
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

  // Preview only available when sending through an Ethereal account
  console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
};

module.exports = sendMail;
