/**
 * Types definition for Azure DevOps API responses
 */

// Project response
/**
 * @typedef {Object} Project
 * @property {string} id - The project ID
 * @property {string} name - The project name
 * @property {string} url - The project URL
 * @property {string} state - The project state
 * @property {number} revision - The project revision
 * @property {string} visibility - The project visibility (private, public)
 * @property {string} lastUpdateTime - The project last update time
 */

/**
 * @typedef {Object} ProjectListResponse
 * @property {number} count - The number of projects
 * @property {Project[]} value - The list of projects
 */

// Repository response
/**
 * @typedef {Object} Repository
 * @property {string} id - The repository ID
 * @property {string} name - The repository name
 * @property {string} url - The repository URL
 * @property {Object} project - The project that contains this repository
 * @property {string} project.id - The project ID
 * @property {string} project.name - The project name
 * @property {string} defaultBranch - The default branch (e.g., "refs/heads/main")
 * @property {number} size - The repository size
 * @property {Object} remoteUrl - The remote URL for this repository
 * @property {string} webUrl - The web URL for this repository
 */

/**
 * @typedef {Object} RepositoryListResponse
 * @property {number} count - The number of repositories
 * @property {Repository[]} value - The list of repositories
 */

// Branch response
/**
 * @typedef {Object} Branch
 * @property {string} name - The branch name
 * @property {Object} commit - The commit object
 * @property {string} commit.commitId - The commit ID
 * @property {string} commit.url - The commit URL
 */

/**
 * @typedef {Object} BranchListResponse
 * @property {number} count - The number of branches
 * @property {Branch[]} value - The list of branches
 */

// Export types for documentation, not actually used at runtime
export const AzureDevOpsTypes = {
  Project: {},
  ProjectListResponse: {},
  Repository: {},
  RepositoryListResponse: {},
  Branch: {},
  BranchListResponse: {}
};
