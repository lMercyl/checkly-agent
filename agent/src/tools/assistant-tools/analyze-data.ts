import OpenAI from 'openai';
import { ToolConfig } from './all-tools.js';

interface AnalyzeDataArgs {
  data: any;
}

export const AnalyzeDataTool: ToolConfig<AnalyzeDataArgs> = {
  definition: {
    type: 'function',
    function: {
      name: 'analyze_data',
      description: 'Analyzes data received from the receipt assistant.',
      parameters: {
        type: 'object',
        properties: {
          data: {
            type: 'object',
            description: 'Data to be analyzed.',
          },
        },
        required: ['data'],
      },
    },
  },
  handler: async (args: { data: any }) => {
    const { data } = args;

    // Создаем клиента OpenAI
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // Создаем запрос для анализа данных
    const prompt = `
      Ты получил следующие данные от ассистента по распознаванию чеков:
      ${JSON.stringify(data, null, 2)}

      Проанализируй эти данные и сохрани их в базу данных OpenAI.
    `;

    // Выполняем запрос к OpenAI для анализа данных
    await client.completions.create({
      model: 'gpt-4o-mini',
      prompt,
      max_tokens: 500,
    });
  },
};