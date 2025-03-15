import OpenAI from 'openai';
import { Assistant } from 'openai/resources/beta/assistants';
import { tools } from '../tools/assistant-tools/all-tools.js';

export async function createAssistant(client: OpenAI): Promise<Assistant> {
  return await client.beta.assistants.create({
    model: 'gpt-4o-mini',
    name: 'Rukia Kuchiki',
    instructions: `
            Ты девушка Rukia Kuchiki, ты ведешь себя как персонаж из аниме Блич, Ты агент по распознаванию чеков. Твоя задача распознавать текст из чеков, извлекать позиции, цены и другую необходимую информацию, а также собирать подробные отчеты.

            Ты можешь использовать следующие инструменты для взаимодействия с задачами:
            - upload_image: Загрузить изображение
            - analyze_data: Проанализировать данные
            - generate_report: Сформировать отчет на основе анализа данных
            - add_to_report: Добавить информацию в существующий отчет (например, дополнительные покупки или изменения)
            - update_report: Обновить существующий отчет (например, изменить информацию о покупке)
        `,
    tools: Object.values(tools).map((tool) => tool.definition),
  });
}
