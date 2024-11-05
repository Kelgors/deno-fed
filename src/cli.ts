import { EOL } from '@std/fs';
import { basename, join, resolve } from '@std/path';
import { program } from 'commander';
import { FilterContext } from './filters/FilterContext.ts';
import type { IFilter } from './filters/IFilter.ts';
import { buildFiltersFromOptions, runCommand } from './lib.ts';
import { getStdin } from './stdin.ts';
import { VERSION } from './version.ts';

const SHELL = Deno.env.get('SHELL') || '/bin/bash';

export type ProgramOptions = {
  verbose: boolean;
  version: boolean;
  cwd?: string;
  git?: boolean;
  diff?: boolean;
  detached?: boolean;
  unpushed?: boolean;
  stashes?: boolean;
  node?: boolean;
  includeBranch: string[];
  excludeBranch: string[];
  withFile: string[];
  withoutFile: string[];
  match?: string;
  ignoreFailures: boolean;
  exec: string;
};

async function getFileListFromStdin(): Promise<string[] | undefined> {
  try {
    const input = await getStdin();
    if (input) return input.trim().split(EOL);
  } catch {
    // stdin is not available or readable ¯\_(ツ)_/¯
  }
  return undefined;
}

void program
  .description('Iterate over directories')
  .option('-v, --version', 'Display CLI version', false)
  .option('--verbose', 'Display browsed folders')
  .option('--cwd <PATH>', 'Set the working directory')
  .option('--git', 'List only git repositories')
  .option('--no-git', 'List only non git repositories')
  .option('--diff', 'List git repositories with a current diff')
  .option('--no-diff', 'List git repositories without a diff')
  .option('--detached', 'List git repositories detached from a branch')
  .option('--no-detached', 'List git repositories currenly on a branch')
  .option('--unpushed', 'List git repositories containing commits not pushed to remote on the current branch')
  .option('--no-unpushed', 'List git repositories not containing commits not pushed to remote on the current branch')
  .option('--stashes', 'List git repositories with stash in it')
  .option('--no-stashes', 'List git repositories without stash in it')
  .option('--with-file <FILE...>', 'Check file presence', [])
  .option('--without-file <FILE...>', 'Check file absence', [])
  .option('--node', 'List only node projects')
  .option('--no-node', 'List only not node projects')
  .option('--match <REGEX>', 'List only directory names matching the regex')
  .option('--include-branch <BRANCH...>', '', [])
  .option('--exclude-branch <BRANCH...>', '', [])
  .option('--ignore-failures', "Don't stop the program when error occurs", false)
  .option(
    '-x, --exec <cmd>',
    'run command for each directories (available variables {}, {path}, {diff}, {branch})',
    'echo {}',
  )
  .action(async (options: ProgramOptions) => {
    if (options.version) {
      console.log(VERSION);
      return;
    }
    if (
      options.git === undefined &&
      (options.diff !== undefined ||
        options.detached !== undefined ||
        options.unpushed !== undefined ||
        options.stashes !== undefined ||
        options.exec.includes('{diff}') ||
        options.includeBranch.length > 0 ||
        options.excludeBranch.length > 0)
    ) {
      options.git = true;
    }
    options.cwd = resolve(options.cwd ?? Deno.cwd());

    const filters: IFilter<Partial<FilterContext>>[] = buildFiltersFromOptions(options);
    const abortCtrl = new AbortController();
    Deno.addSignalListener('SIGINT', () => abortCtrl.abort(`Received SIGINT`));
    Deno.addSignalListener('SIGTERM', () => abortCtrl.abort(`Received SIGTERM`));

    const files = await getFilteredFiles(options.cwd, options, filters, await getFileListFromStdin());

    for (const { path, relativePath, context } of files) {
      if (options.verbose) console.log('[DIR] %s', relativePath);
      try {
        await runCommand(SHELL, [
          '-c',
          options.exec
            .replaceAll('{}', basename(path))
            .replaceAll('{path}', path)
            .replaceAll('{branch}', context.branchName || '')
            .replaceAll('{diff}', (context.diff || []).join(EOL)),
        ], {
          cwd: path,
          signal: abortCtrl.signal,
          stdout: 'inherit',
          stderr: 'inherit',
          rejects: true,
        });
      } catch (err) {
        if (!options.ignoreFailures) {
          throw err;
        }
        console.error(err);
      }
    }
  })
  .parseAsync(['', '', ...Deno.args]);

async function getDirectories(path: string): Promise<string[]> {
  const output: string[] = [];
  for await (const item of Deno.readDir(path)) {
    if (item.isDirectory) output.push(item.name);
  }
  return output.sort();
}

async function getFilteredFiles(
  cwd: string,
  options: ProgramOptions,
  filters: IFilter<Partial<FilterContext>>[],
  directories?: string[],
) {
  const output: { path: string; relativePath: string; context: Partial<FilterContext> }[] = [];
  directories ||= await getDirectories(cwd);

  for (const dir of directories || []) {
    const context: Partial<FilterContext> = {};
    const dirPath = join(cwd, dir);

    for (const filter of filters) {
      Object.assign(context, await filter.initContext(dirPath, context));
    }

    const filterResults = await Promise.all(filters.map((filter) => filter.isOk(options, context)));
    const okFiltersCount = filterResults.reduce((total, item) => total + Number(item), 0);

    if (okFiltersCount !== filters.length) {
      continue;
    }

    output.push({ path: dirPath, relativePath: dir, context });
  }

  return output;
}
