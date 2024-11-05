import { ProgramOptions } from '../../cli.ts';
import { getStashes } from '../../lib.ts';
import type { FilterContext } from '../FilterContext.ts';
import type { IFilter } from '../IFilter.ts';

export type GitStashesContext = {
  stashes: string[];
};

export class GitStashesFilter implements IFilter<GitStashesContext> {
  async initContext(path: string, context: Readonly<Partial<FilterContext>>): Promise<GitStashesContext> {
    let stashes: string[] = context.stashes || [];
    if (context.isRepository) stashes = await getStashes(path);
    return { stashes };
  }

  isOk(options: Readonly<ProgramOptions>, { stashes }: Readonly<GitStashesContext>) {
    if (options.stashes) {
      return stashes.length > 0;
    }
    if (!options.stashes) {
      return stashes.length === 0;
    }
    return true;
  }
}
