import { ProgramOptions } from '../../cli.ts';
import { getDiff } from '../../lib.ts';
import { FilterContext } from '../FilterContext.ts';
import type { IFilter } from '../IFilter.ts';

export type GitDiffContext = {
  diff: string[];
};

export class GitDiffFilter implements IFilter<GitDiffContext> {
  async initContext(path: string, context: Readonly<Partial<FilterContext>>): Promise<GitDiffContext> {
    let diff: string[] = context.diff || [];
    if (context.isRepository) diff = await getDiff(path);
    return { diff };
  }

  isOk(options: Readonly<ProgramOptions>, { diff }: Readonly<GitDiffContext>) {
    if (options.diff) {
      return diff.length > 0;
    }
    if (!options.diff) {
      return diff.length === 0;
    }
    return true;
  }
}
