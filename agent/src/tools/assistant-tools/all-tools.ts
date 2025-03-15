import { AnalyzeDataTool } from "./analyze-data.js";
import { GenerateReportTool } from "./generate-report.js";
import { UploadImageTool } from "./upload-image.js";

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
  upload_imageНет: UploadImageTool,
  analyze_data: AnalyzeDataTool,
  generate_report: GenerateReportTool,
};
