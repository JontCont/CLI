/**
 * Azure DevOps Git Repository Types
 * Based on response from https://dev.azure.com/<org>/_apis/git/repositories?api-version=7.0
 */

/**
 * Project within a repository
 */
export interface Project {
  id: string;
  name: string;
  url: string;
  state: string;
  revision: number;
  visibility: string;
  lastUpdateTime: string;
}

/**
 * Git repository details
 */
export interface Repository {
  id: string;
  name: string;
  url: string;
  project: Project;
  defaultBranch: string;
  size: number;
  remoteUrl: string;
  sshUrl: string;
  webUrl: string;
  isDisabled: boolean;
  isInMaintenance: boolean;
}

/**
 * Response structure from repositories API
 */
export interface RepositoriesResponse {
  value: Repository[];
  count: number;
}

/**
 * Branch details
 */
export interface Branch {
  name: string;
  objectId: string;
  creator: {
    id: string;
    displayName: string;
    uniqueName: string;
    imageUrl: string;
  };
  url: string;
}

/**
 * Response structure from branches API
 */
export interface BranchesResponse {
  value: Branch[];
  count: number;
}

/**
 * Basic commit info
 */
export interface CommitRef {
  commitId: string;
  url: string;
}

/**
 * Commit details
 */
export interface Commit {
  commitId: string;
  author: {
    name: string;
    email: string;
    date: string;
  };
  committer: {
    name: string;
    email: string;
    date: string;
  };
  comment: string;
  changeCounts: {
    add: number;
    edit: number;
    delete: number;
  };
  url: string;
}

/**
 * Response structure from commits API
 */
export interface CommitsResponse {
  value: Commit[];
  count: number;
}
