const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = (mail, name) => {

    const msg = {
        to: mail,
        from: 'sherifyasser4795@gmail.com',
        subject: 'Welcome to tOdO',
        html: `<strong> Hello ${name}. <br> <br> Now you can easily manage your tasks with us. <br> <br>
        Very glad to see you here.<br> <br>
  Greetings from tOdO team. </strong>`,
    };

    sgMail.send(msg);
}

const emailList = (receiverMail, senderMail, html) => {
    const msg = {
        to: receiverMail,
        from: senderMail,
        subject: 'From tOdO with Love',
        html
    }
    sgMail.send(msg);
}

module.exports = {
    sendWelcomeEmail,
    emailList
}