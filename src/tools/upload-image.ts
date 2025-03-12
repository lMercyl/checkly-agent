import axios from 'axios';
import fs from 'fs';
import FormData from 'form-data';
import { ToolConfig } from './all-tools.js';

interface UploadImageArgs {
  imagePath: string;
}

export const UploadImageTool: ToolConfig<UploadImageArgs> = {
    definition: {
        type: 'function',
        function: {
          name: 'upload_image',
          description: 'Uploads an image to the specified endpoint.',
          parameters: {
            type: 'object',
            properties: {
              imagePath: {
                type: 'string',
                description: 'Path to the image.',
              },
            },
            required: ['imagePath'],
          },
        },
      },
  handler: async (args: { imagePath: string }) => {
    const { imagePath } = args;

    const form = new FormData();
    form.append('file', fs.createReadStream(imagePath));
    form.append('purpose', 'analyze_receipt');

    const uploadResponse = await axios.post('https://api.openai.com/v1/uploads', form, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        ...form.getHeaders(),
      },
    });

    if (uploadResponse.status !== 200) {
      throw new Error(`Failed to upload file: ${uploadResponse.statusText}`);
    }

    const uploadData = uploadResponse.data as { id: string };
    return uploadData;
  },
};