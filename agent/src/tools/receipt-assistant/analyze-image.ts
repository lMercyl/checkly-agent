import OpenAI from 'openai';
import { ToolConfig } from './all-tools.js';

interface AnalyzeImageArgs {
  fileId: string;
}

export const AnalyzeImageTool: ToolConfig<AnalyzeImageArgs> = {
  definition: {
    type: 'function',
    function: {
      name: 'analyze_image',
      description: 'Analyzes an image file uploaded to OpenAI.',
      parameters: {
        type: 'object',
        properties: {
          fileId: {
            type: 'string',
            description: 'ID of the uploaded image file to be analyzed.',
          },
        },
        required: ['fileId'],
      },
    },
  },
  handler: async (args: { fileId: string }) => {
    const { fileId } = args;

    // Создаем клиента OpenAI
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // Получаем информацию о загруженном файле
    const fileInfo = await client.files.retrieve(fileId);

    // Анализируем изображение
    const prompt = `
      Ты получил изображение чека. Проанализируй его и извлеки следующие данные:
      - Позиции товаров
      - Цены
      - Количество
      - Общая сумма
    `;

    const response = await client.completions.create({
      model: 'gpt-4',
      prompt: `${prompt}\n\n${fileInfo.url}`,
      max_tokens: 500,
    });

    // Возвращаем проанализированные данные
    return response.choices[0].text.trim();
  },
};