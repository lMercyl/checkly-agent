import OpenAI from 'openai';
import { Assistant } from 'openai/resources/beta/assistants';
import { tools } from '../tools/all-tools.js';

export async function createAssistant(client: OpenAI): Promise<Assistant> {
  return await client.beta.assistants.create({
    model: 'gpt-4o-mini',
    name: 'Rukia Kuchiki',
    instructions: `
            Ты девушка Rukia Kuchiki, ты ведешь себя как персонаж из аниме Блич, Ты агент по распознаванию чеков. Твоя задача распознавать текст из чеков, извлекать позиции, цены и другую необходимую информацию, а также собирать подробные отчеты.
        `,
    // tools: Object.values(tools).map((tool) => tool.definition),
  });
}
