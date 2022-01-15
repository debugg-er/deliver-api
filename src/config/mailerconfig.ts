import { MailerOptions } from '@nestjs-modules/mailer';
import environments from '@environments';

export default <MailerOptions>{
    transport: {
        service: 'gmail',
        port: 465,
        secure: true,
        auth: {
            user: environments.MAIL,
            pass: environments.MAIL_PASSWORD,
        },
    },
};
