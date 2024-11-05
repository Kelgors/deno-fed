import { runCommand } from '../../src/lib.ts';

export function fed(args: string[], options?: { cwd?: string; stdin?: string }) {
  return runCommand(Deno.execPath(), ['task', 'start', '--cwd', options?.cwd || Deno.cwd(), ...args], options);
}
