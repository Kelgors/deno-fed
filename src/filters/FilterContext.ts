import type { FilePresenceContext } from './FilePresenceFilter.ts';
import type { MatchRegexContext } from './MatchFilter.ts';
import type { NopeProjectContext } from './NodeProjectFilter.ts';
import type { BranchContext } from './git/GitBranchFilter.ts';
import type { GitDetachedFilter } from './git/GitDetachedFilter.ts';
import type { GitDiffContext } from './git/GitDiffFilter.ts';
import type { GitContext } from './git/GitFilter.ts';
import type { GitStashesContext } from './git/GitStashesFilter.ts';
import type { GitUnpushedContext } from './git/GitUnpushedFilter.ts';

export type FilterContext =
  & GitContext
  & GitDiffContext
  & BranchContext
  & GitUnpushedContext
  & GitDetachedFilter
  & NopeProjectContext
  & MatchRegexContext
  & FilePresenceContext
  & GitStashesContext;
