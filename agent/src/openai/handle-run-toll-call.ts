import OpenAI from 'openai';
import { Thread } from 'openai/resources/beta/threads/threads';
import { Run } from 'openai/resources/beta/threads/runs/runs';
import { tools, ToolConfig } from '../tools/all-tools.js';

export async function handleRunToolCalls(
  run: Run,
  client: OpenAI,
  thread: Thread
): Promise<Run> {
  const toolCalls = run.required_action?.submit_tool_outputs?.tool_calls;
  if (!toolCalls) return run;

  const toolOutputs = await Promise.all(
    toolCalls.map(async (tool) => {
      const toolName = tool.function.name as keyof typeof tools;
      const toolConfig: ToolConfig | undefined = tools[toolName];
      if (!toolConfig) {
        console.log(`Tool ${tool.function.name} not found`);
        return null;
      }

      try {
        const args = JSON.parse(tool.function.arguments);
        const output = await (toolConfig as ToolConfig).handler(args);
        return {
          tool_call_id: tool.id,
          output: String(output),
        };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        return {
          tool_call_id: tool.id,
          output: `Error ${errorMessage}`,
        };
      }
    })
  );

  const validOptions = toolOutputs.filter(
    Boolean
  ) as OpenAI.Beta.Threads.Runs.RunSubmitToolOutputsParams.ToolOutput[];
  if (validOptions.length === 0) return run;

  return client.beta.threads.runs.submitToolOutputsAndPoll(thread.id, run.id, {
    tool_outputs: validOptions,
  });
}
