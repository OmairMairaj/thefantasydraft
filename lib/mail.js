import { createTransport } from 'nodemailer';

export const sendEmail = (to, subject, body) => {
    const transporter = createTransport({
        service: 'gmail',
        auth: {
            user: process.env.NEXT_PUBLIC_EMAIL,
            pass: process.env.NEXT_PUBLIC_EMAIL_PASSWORD
        }
    });
    const mailOptions = {
        from: process.env.NEXT_PUBLIC_EMAIL,
        to: to,
        subject: subject,
        html: body
    };

    try {
        return transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
            } else {
                console.log(info);
            }
        });
    } catch (err) {
        throw new Error(err);
    }
}