   
import sgMail from "@sendgrid/mail"

sgMail.setApiKey("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")

export const sendRegistrationEmail = async recipientAddress => {
  const msg = {
    to: 'onlyrajib@gmail.com',
    from: process.env.SENDER_EMAIL, 
    subject: "Sending with SendGrid is Fun",
    text: "and easy to do anywhere, even with Node.js",
    html: "<strong>and easy to do anywhere, even with Node.js</strong>",
  }

  await sgMail.send(msg)
}