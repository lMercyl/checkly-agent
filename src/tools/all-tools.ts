import { UploadImageTool } from "./upload-image.js"; // Добавьте этот импорт

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

export const tools: Record<string, ToolConfig> = {
  upload_image: UploadImageTool,
};
