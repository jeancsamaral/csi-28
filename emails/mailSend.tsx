import axios from 'axios';

const MAILERSEND_API_KEY = 'mlsn.bd91590f01b979d63ddc91dce69bd842295219447419aabb509e1fa4e5a50127'; // Substitua pelo seu API Key do MailerSend

export default async function sendEmail(recipientEmail: string, subject: string, htmlContent: string): Promise<void> {
    try {
        const response = await axios.post('https://api.mailersend.com/v1/email', {
            from: {
                email: 'inoachallenge@gmail.com', // Seu email de envio verificado no MailerSend
                name: 'INOA'
            },
            to: [
                {
                    email: recipientEmail,
                    name: 'Recipient Name'
                }
            ],
            subject: subject,
            html: htmlContent
        }, {
            headers: {
                'Authorization': `Bearer ${MAILERSEND_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('Email sent successfully:', response.data);
    } catch (error) {
        if (axios.isAxiosError(error)) {
            // `error` é um AxiosError, então podemos acessar `error.response` para detalhes do erro
            console.error('Error sending email:', error.response?.data || error.message);
        } else {
            // `error` é de um tipo desconhecido
            console.error('Unknown error:', error);
        }
    }
}

// Exemplo de uso
sendEmail('jeancarlosimpliamaral@hotmail.com', 'Hello!', '<h1>This is a test email</h1><p>Testing the MailerSend API!</p>');
