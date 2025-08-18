import { createTransport } from 'nodemailer';

export const sendEmail = (to, subject, body) => {
    // const transporter = createTransport({
    //     host: 'smtp.office365.com',
    //     port: 587,
    //     secure: false, // TLS
    //     auth: {
    //         user: process.env.NEXT_PUBLIC_EMAIL,
    //         pass: process.env.NEXT_PUBLIC_EMAIL_PASSWORD
    //     }
    // });

    const transporter = createTransport({
        host: 'smtp-mail.outlook.com', // Outlook SMTP server
        port: 587, // Standard port for secure SMTP
        secure: false, // Use TLS (true for SSL, false for TLS)
        auth: {
          user: process.env.NEXT_PUBLIC_EMAIL, // Your Outlook email address
          pass: process.env.NEXT_PUBLIC_EMAIL_PASSWORD, // Your Outlook password or app password
        },
        tls: {
          ciphers: "SSLv3", // Specific cipher for compatibility
          rejectUnauthorized: false, // Allow self-signed certificates (use with caution in production)
        },
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
        console.log(err);
    }
}

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