import OpenAI from 'openai';
import { Run } from 'openai/resources/beta/threads/runs/runs';
import { Thread } from 'openai/resources/beta/threads/threads';

export async function createRun(
  client: OpenAI,
  thread: Thread,
  assistantId: string
): Promise<Run> {
  let run = await client.beta.threads.runs.create(thread.id, {
    assistant_id: assistantId,
  });

  // wait for the run to complete and keeep polling
  while (run.status === 'in_progress' || run.status === 'queued') {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    run = await client.beta.threads.runs.retrieve(thread.id, run.id);
  }

  return run;
}
