import OpenAI from 'openai';
import { ToolConfig } from './all-tools.js';
import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

interface UploadImageArgs {
  imageUrl: string;
}

export const UploadImageTool: ToolConfig<UploadImageArgs> = {
  definition: {
    type: 'function',
    function: {
      name: 'upload_image',
      description: 'Uploads an image to OpenAI for processing.',
      parameters: {
        type: 'object',
        properties: {
          imageUrl: {
            type: 'string',
            description: 'URL of the image to be uploaded.',
          },
        },
        required: ['imageUrl'],
      },
    },
  },
  handler: async (args: { imageUrl: string }) => {
    const { imageUrl } = args;

    // Загружаем изображение с указанного URL
    const response = await axios.get(imageUrl, { responseType: 'stream' });

    // Создаем форму данных для загрузки файла
    const form = new FormData();
    form.append('file', response.data, {
      filename: 'receipt.jpg',
      contentType: 'image/jpeg',
    });
    form.append('purpose', 'fine-tune');

    // Загружаем файл в OpenAI
    const uploadResponse = await axios.post('https://api.openai.com/v1/files', form, {
      headers: {
        ...form.getHeaders(),
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
    });

    // Возвращаем результат загрузки файла
    return uploadResponse.data;
  },
};