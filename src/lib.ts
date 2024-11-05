import { EOL } from '@std/fs';
import { ProgramOptions } from './cli.ts';
import { FilePresenceFilter } from './filters/FilePresenceFilter.ts';
import { FilterContext } from './filters/FilterContext.ts';
import type { IFilter } from './filters/IFilter.ts';
import { MatchRegexFilter } from './filters/MatchFilter.ts';
import { NodeProjectFilter } from './filters/NodeProjectFilter.ts';
import { GitBranchFilter } from './filters/git/GitBranchFilter.ts';
import { GitDetachedFilter } from './filters/git/GitDetachedFilter.ts';
import { GitDiffFilter } from './filters/git/GitDiffFilter.ts';
import { GitFilter } from './filters/git/GitFilter.ts';
import { GitStashesFilter } from './filters/git/GitStashesFilter.ts';
import { GitUnpushedFilter } from './filters/git/GitUnpushedFilter.ts';

export async function getDiff(path: string): Promise<string[]> {
  const { stdout } = await runCommand('git', ['diff', '--name-only'], {
    cwd: path,
  });
  return stdout.filter(Boolean);
}

export async function getBranchName(path: string): Promise<string> {
  const { stdout } = await runCommand('git', ['rev-parse', '--abbrev-ref', 'HEAD'], {
    cwd: path,
  });
  return stdout[0];
}

export async function getUnpushedCommits(path: string): Promise<string[]> {
  try {
    const { stdout } = await runCommand('git', ['cherry', '-v'], {
      cwd: path,
    });
    return stdout.filter(Boolean);
  } catch {
    return [];
  }
}

export async function getStashes(path: string): Promise<string[]> {
  const { stdout } = await runCommand('git', ['stash', 'list'], {
    cwd: path,
  });
  return stdout.filter(Boolean);
}

async function readStream(stream: ReadableStream<Uint8Array>): Promise<string> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  const output: string[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    output.push(decoder.decode(value, { stream: true }));
  }
  output.push(decoder.decode());

  return output.join('');
}

async function writeStream(stream: WritableStream<Uint8Array>, value: string): Promise<void> {
  const writer = stream.getWriter();
  const encoder = new TextEncoder();

  try {
    await writer.write(encoder.encode(value));
    await writer.write(encoder.encode(EOL));
  } finally {
    await writer.close();
  }
}

type RunCommandOptions = {
  cwd?: string;
  stdout?: Deno.CommandOptions['stdout'];
  stderr?: Deno.CommandOptions['stderr'];
  stdin?: string;
  signal?: AbortSignal;
  rejects?: boolean;
};

export async function runCommand(
  bin: string,
  args: string[],
  options: RunCommandOptions = {},
): Promise<{ exitCode: number; stdout: string[]; stderr: string[] }> {
  const stdoutOpt = options.stdout || 'piped';
  const stderrOpt = options.stderr || 'piped';
  const command = new Deno.Command(bin, {
    args,
    cwd: options.cwd ?? Deno.cwd(),
    stdout: stdoutOpt,
    stderr: stderrOpt,
    stdin: options.stdin ? 'piped' : 'null',
    signal: options.signal,
  });

  const process = command.spawn();
  if (options.stdin) {
    await writeStream(process.stdin, options.stdin);
  }

  const status = await process.status;
  const stdout = stdoutOpt === 'piped' ? await readStream(process.stdout) : '';
  const stderr = stderrOpt === 'piped' ? await readStream(process.stderr) : '';
  const result = {
    exitCode: status.code,
    stdout: stdout.trim().split(EOL),
    stderr: stderr.trim().split(EOL),
  };

  if (options.rejects && status.code !== 0) return Promise.reject(result);
  return Promise.resolve(result);
}

export function buildFiltersFromOptions(options: ProgramOptions): IFilter<Partial<FilterContext>>[] {
  const filters: IFilter<Partial<FilterContext>>[] = [];

  if (options.match !== undefined) {
    filters.push(new MatchRegexFilter());
  }

  if (options.node !== undefined) {
    filters.push(new NodeProjectFilter());
  }

  if (options.withFile.length > 0 || options.withoutFile.length > 0) {
    filters.push(new FilePresenceFilter());
  }

  if (options.git !== undefined) {
    filters.push(new GitFilter());
  }

  if (options.includeBranch.length > 0 || options.excludeBranch.length > 0 || options.exec.includes('{branch}')) {
    filters.push(new GitBranchFilter());
  }

  if (options.detached !== undefined) {
    filters.push(new GitDetachedFilter());
  }

  if (options.diff !== undefined) {
    filters.push(new GitDiffFilter());
  }

  if (options.unpushed !== undefined) {
    filters.push(new GitUnpushedFilter());
  }

  if (options.stashes !== undefined) {
    filters.push(new GitStashesFilter());
  }

  return filters;
}
