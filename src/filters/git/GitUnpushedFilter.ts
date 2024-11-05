import { ProgramOptions } from '../../cli.ts';
import { getUnpushedCommits } from '../../lib.ts';
import { FilterContext } from '../FilterContext.ts';
import type { IFilter } from '../IFilter.ts';

export type GitUnpushedContext = {
  unpushedCommits: string[];
};

export class GitUnpushedFilter implements IFilter<GitUnpushedContext> {
  async initContext(path: string, context: Readonly<Partial<FilterContext>>): Promise<GitUnpushedContext> {
    let unpushedCommits: string[] = [];
    if (context.isRepository) {
      unpushedCommits = await getUnpushedCommits(path);
    }
    return { unpushedCommits };
  }

  isOk(options: Readonly<ProgramOptions>, { unpushedCommits }: Readonly<GitUnpushedContext>) {
    if (options.unpushed) {
      return unpushedCommits.length > 0;
    }
    if (!options.unpushed) {
      return unpushedCommits.length === 0;
    }
    return true;
  }
}
