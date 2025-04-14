import { ToolConfig } from './all-tools.js';

export const AnalyzeReceiptTool: ToolConfig = {
  definition: {
    type: 'function',
    function: {
      name: 'analyze_receipt',
      description: 'Анализ чека с автоматическим созданием структурированных данных и отчета',
      parameters: {
        type: 'object',
        properties: {
          imageId: {
            type: 'string',
            description: 'ID загруженного изображения чека'
          }
        },
        required: ['imageId']
      }
    }
  },
  handler: async ({ imageId }: { imageId: string }) => {
    try {
      // Шаг 1: Извлечение структурированных данных
      const analysisResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          response_format: { type: "json_object" },
          messages: [
            {
              role: 'system',
              content: `Извлеки данные чека в формате JSON и подготовь краткий анализ. Структура ответа:
              {
                "data": {
                  "store": "название",
                  "date": "дата",
                  "total": сумма,
                  "tax": налог,
                  "items": [...]
                },
                "analysis": {
                  "mainCategory": "категория",
                  "expensiveItem": "название",
                  "pricePerUnit": число,
                  "anomalies": ["список аномалий"]
                }
              }`
            },
            {
              role: 'user',
              content: [
                {
                  type: 'image_url',
                  image_url: {
                    url: `https://api.openai.com/v1/files/${imageId}/content`,
                    detail: 'high'
                  }
                },
                {
                  type: 'text',
                  text: 'Проанализируй чек и подготовь полный отчет.'
                }
              ]
            }
          ],
          max_tokens: 2000
        }),
      });

      if (!analysisResponse.ok) {
        const errorData = await analysisResponse.json();
        throw new Error(`Ошибка анализа: ${errorData.error?.message}`);
      }

      const analysisResult = await analysisResponse.json();
      const { data, analysis } = JSON.parse(analysisResult.choices[0].message.content);

      // Шаг 2: Генерация текстового отчета
      const reportResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: `Сгенерируй подробный отчет на русском языке в формате markdown. Включи:
              1. Общую информацию о покупке
              2. Анализ категорий товаров
              3. Выдели необычные расходы
              4. Сравнение цен с рыночными
              5. Рекомендации по экономии`
            },
            {
              role: 'user',
              content: JSON.stringify({ data, analysis })
            }
          ]
        }),
      });

      const reportResult = await reportResponse.json();
      const markdownReport = reportResult.choices[0].message.content;

      return {
        success: true,
        data,
        analysis,
        report: markdownReport,
        warnings: analysis.anomalies?.length > 0 ? 'Обнаружены аномалии' : null
      };

    } catch (error) {
      console.error('Ошибка полного анализа:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Неизвестная ошибка',
        details: error instanceof Error ? error.stack : null
      };
    }
  }
};