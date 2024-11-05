import { ProgramOptions } from '../../cli.ts';
import { getBranchName } from '../../lib.ts';
import { FilterContext } from '../FilterContext.ts';
import type { IFilter } from '../IFilter.ts';
import { BranchContext } from './GitBranchFilter.ts';

export class GitDetachedFilter implements IFilter<BranchContext> {
  async initContext(path: string, context: Readonly<Partial<FilterContext>>): Promise<BranchContext> {
    let branchName = context.branchName || '';
    if (context.isRepository && !branchName) branchName = await getBranchName(path);
    return { branchName };
  }

  isOk(options: Readonly<ProgramOptions>, { branchName }: Readonly<BranchContext>) {
    if (options.detached && branchName !== 'HEAD') {
      return false;
    }
    if (!options.detached && branchName === 'HEAD') {
      return false;
    }
    return true;
  }
}
