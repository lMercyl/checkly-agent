import { AnalyzeImageTool } from './analyze-image.js';
import { UploadImageTool } from './upload-image.js';

export interface ToolConfig<T = any> {
    definition: {
      type: 'function';
      function: {
        name: string;
        description: string;
        parameters: {
          type: 'object';
          properties: Record<string, unknown>;
          required: string[];
        };
      };
    };
    handler: (args: T) => Promise<any>;
  }

export const tools = {
  upload_image: UploadImageTool,
  analyze_image: AnalyzeImageTool,
};