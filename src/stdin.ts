export function getStdin(): Promise<string | null> {
  if (Deno.stdin.isTerminal()) {
    throw new Error('interactive stdin input not supported.');
  }
  return readStdin();
}

async function readStdin(): Promise<string | null> {
  const decoder = new TextDecoder();
  const stdin: string[] = [];

  for await (const chunk of Deno.stdin.readable) {
    stdin.push(decoder.decode(chunk));
  }

  return stdin.join('') || null;
}
