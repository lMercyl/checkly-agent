import WebSocket from 'ws';
import { ToolConfig } from './all-tools.js';

interface UploadImageArgs {
  imageUrl: string;
}

export const UploadImageTool: ToolConfig<UploadImageArgs> = {
  definition: {
    type: 'function',
    function: {
      name: 'upload_image',
      description: 'Sends an image URL to the receipt assistant for processing.',
      parameters: {
        type: 'object',
        properties: {
          imageUrl: {
            type: 'string',
            description: 'URL of the image.',
          },
        },
        required: ['imageUrl'],
      },
    },
  },
  handler: async (args: { imageUrl: string }) => {
    const { imageUrl } = args;

    const wsUrl = process.env.RECEIPT_ASSISTANT_WS_URL;
    if (!wsUrl) {
      throw new Error('RECEIPT_ASSISTANT_WS_URL is not defined');
    }

    const ws = new WebSocket(wsUrl);

    return new Promise((resolve, reject) => {
      ws.on('open', () => {
        console.log('Connected to Receipt Assistant WebSocket server');
        ws.send(JSON.stringify({ type: 'photo', imageUrl }));
      });

      ws.on('message', (message) => {
        try {
          const data = JSON.parse(message.toString());
          if (data.type === 'response') {
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