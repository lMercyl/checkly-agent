import WebSocket from 'ws';
import { ToolConfig } from './all-tools.js';

interface OutputDataArgs {
  data: any;
}

export const SendDataTool: ToolConfig<OutputDataArgs> = {
  definition: {
    type: 'function',
    function: {
      name: 'output_data',
      description: 'Sends analyzed data to another assistant for further processing.',
      parameters: {
        type: 'object',
        properties: {
          data: {
            type: 'object',
            description: 'Analyzed data to be sent.',
          },
        },
        required: ['data'],
      },
    },
  },
  handler: async (args: { data: any }) => {
    const { data } = args;

    const wsUrl = process.env.ANOTHER_ASSISTANT_WS_URL;
    if (!wsUrl) {
      throw new Error('ANOTHER_ASSISTANT_WS_URL is not defined');
    }

    const ws = new WebSocket(wsUrl);

    return new Promise((resolve, reject) => {
      ws.on('open', () => {
        console.log('Connected to another assistant WebSocket server');
        ws.send(JSON.stringify({ type: 'analyzed_data', data }));
      });

      ws.on('message', (message) => {
        try {
          const response = JSON.parse(message.toString());
          if (response.type === 'acknowledgment') {
            resolve(response);
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