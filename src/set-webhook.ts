import axios from 'axios';

const TELEGRAM_BOT_TOKEN = 'YOUR_TELEGRAM_BOT_TOKEN';
const WEBHOOK_URL = 'https://your-server-url/webhook';

const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook`;

axios.post(TELEGRAM_API_URL, { url: WEBHOOK_URL })
    .then(response => {
        console.log('Webhook set successfully:', response.data);
    })
    .catch(error => {
        console.error('Error setting webhook:', error);
    });
