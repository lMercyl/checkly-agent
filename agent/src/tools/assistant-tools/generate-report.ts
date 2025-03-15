import OpenAI from 'openai';
import { ToolConfig } from './all-tools.js';

interface GenerateReportArgs {
  chatId: string;
  data: any;
}

export const GenerateReportTool: ToolConfig<GenerateReportArgs> = {
  definition: {
    type: 'function',
    function: {
      name: 'generate_report',
      description: 'Generates a detailed report based on the analyzed data.',
      parameters: {
        type: 'object',
        properties: {
          chatId: {
            type: 'string',
            description: 'ID of the chat where the report request was made.',
          },
          data: {
            type: 'object',
            description: 'Analyzed data to be included in the report.',
          },
        },
        required: ['chatId', 'data'],
      },
    },
  },
  handler: async (args: { chatId: string; data: any }) => {
    const { chatId, data } = args;

    // Создаем клиента OpenAI
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // Создаем запрос для генерации отчета
    const prompt = `
      Ты получил следующие данные от ассистента по распознаванию чеков:
      ${JSON.stringify(data, null, 2)}

      Составь подробный отчет по данному чеку, включая информацию о том, кто что покупал.
    `;

    // Выполняем запрос к OpenAI для генерации отчета
    const response = await client.completions.create({
      model: 'gpt-4',
      prompt,
      max_tokens: 500,
    });

    // Получаем отчет из ответа
    const report = response.choices[0].text.trim();

    // Отправляем запрос в Telegram бот для подтверждения генерации отчета
    const wsUrl = process.env.TELEGRAM_BOT_WS_URL;
    if (!wsUrl) {
      throw new Error('TELEGRAM_BOT_WS_URL is not defined');
    }

    const ws = new WebSocket(wsUrl);

    return new Promise((resolve, reject) => {
      ws.on('open', () => {
        console.log('Connected to Telegram Bot WebSocket server');
        ws.send(JSON.stringify({ type: 'report_request', chatId, report }));
      });

      ws.on('message', (message) => {
        try {
          const data = JSON.parse(message.toString());
          if (data.type === 'report_confirmation' && data.chatId === chatId) {
            resolve(data);
          } else {
            reject(new Error('Unexpected response type'));
          }
        } catch (error) {
          reject(error);
        } finally {
          ws.close();
        }
      });

      ws.on('error', (error) => {
        reject(error);
      });
    });
  },
};