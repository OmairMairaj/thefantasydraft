import { createTransport } from 'nodemailer';

// export const sendEmail = (to, subject, body) => {

//     const transporter = createTransport({
//         service: 'gmail',
//         auth: {
//             user: process.env.NEXT_PUBLIC_EMAIL,
//             pass: "qfdrlwktygfydbku"
//         }
//     });

//     const mailOptions = {
//         from: process.env.NEXT_PUBLIC_EMAIL,
//         to: to,
//         subject: subject,
//         html: body
//     };

//     try {
//         return transporter.sendMail(mailOptions, (error, info) => {
//             if (error) {
//                 console.log(error);
//             } else {
//                 console.log(info);
//             }
//         });
//     } catch (err) {
//         console.log(err);
//     }
// }


export const sendEmail = (to, subject, body) => {
    return new Promise((resolve, reject) => {
        const transporter = createTransport({
            service: 'gmail',
            auth: {
                user: "thefootygames@gmail.com",
                pass: "qfdrlwktygfydbku"
            }
        });

        const mailOptions = {
            from: process.env.EMAIL,
            to: to,
            subject: subject,
            html: body
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error("Email sending failed:", error); // Use console.error for errors
                return reject(error);
            } else {
                console.log("Email sent successfully:", info);
                return resolve(info);
            }
        });
    });
};

export const sendMultipleEmails = (to, subject, body) => {
    const transporter = createTransport({
        service: 'gmail',
        auth: {
            user: process.env.NEXT_PUBLIC_EMAIL,
            pass: process.env.NEXT_PUBLIC_EMAIL_PASSWORD
        }
    });
    for (const one of to) {
        const mailOptions = {
            from: process.env.NEXT_PUBLIC_EMAIL,
            to: one,
            subject: subject,
            html: body
        };
        try {
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.log(error);
                } else {
                    console.log(info);
                }
            });
        } catch (err) {
            console.log(err);
        }
    }
}