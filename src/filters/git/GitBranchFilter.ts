import { ProgramOptions } from '../../cli.ts';
import { getBranchName } from '../../lib.ts';
import { FilterContext } from '../FilterContext.ts';
import type { IFilter } from '../IFilter.ts';

export type BranchContext = {
  branchName: string;
};

export class GitBranchFilter implements IFilter<BranchContext> {
  async initContext(path: string, context: Readonly<Partial<FilterContext>>): Promise<BranchContext> {
    let branchName = context.branchName || '';
    if (context.isRepository && !branchName) branchName = await getBranchName(path);
    return { branchName };
  }

  isOk(options: Readonly<ProgramOptions>, { branchName }: Readonly<BranchContext>) {
    if (options.includeBranch.length > 0 && !options.includeBranch.includes(branchName)) {
      return false;
    }
    if (options.excludeBranch.length > 0 && options.excludeBranch.includes(branchName)) {
      return false;
    }
    return true;
  }
}
