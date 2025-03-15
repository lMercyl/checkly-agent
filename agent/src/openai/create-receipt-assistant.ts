import OpenAI from 'openai';
import { Assistant } from 'openai/resources/beta/assistants';

export async function createReceiptAssistant(client: OpenAI): Promise<Assistant> {
    return await client.beta.assistants.create({
      model: 'gpt-4o-mini',
      name: 'Receipt Assistant',
      instructions: `
        Ты агент по распознаванию чеков. Твоя задача - распознавать текст из чеков, извлекать позиции, цены и другую необходимую информацию, а также собирать подробные отчеты. Ты должна делать только это и ничего более.
  
        Ты можешь использовать следующие инструменты для взаимодействия с задачами:
        - upload_image: Загрузить изображение
        - analyze_image: Проанализировать изображение
        - send_data: Отправить данные
      `,
    });
  }