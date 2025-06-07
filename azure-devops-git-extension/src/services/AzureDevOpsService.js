/**
 * Azure DevOps API Service
 * Handles all requests to the Azure DevOps API
 */
import { from } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

const API_VERSION = 'api-version=7.0';

class AzureDevOpsService {
  /**
   * Initialize the service with credentials
   * @param {string} baseUrl - The base URL for the Azure DevOps API
   * @param {string} token - The personal access token
   */
  constructor(baseUrl, token) {
    this.baseUrl = baseUrl;
    this.token = token;
    this.headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Get list of projects
   * @returns {Observable} An observable of ProjectListResponse
   */
  getProjects() {
    const url = `${this.baseUrl}/_apis/projects?${API_VERSION}`;
    return this._makeApiCall(url);
  }

  /**
   * Get a specific project by ID
   * @param {string} projectId - The project ID
   * @returns {Observable} An observable of Project
   */
  getProject(projectId) {
    const url = `${this.baseUrl}/_apis/projects/${projectId}?${API_VERSION}`;
    return this._makeApiCall(url);
  }

  /**
   * Get list of repositories for a project
   * @param {string} projectId - The project ID
   * @returns {Observable} An observable of RepositoryListResponse
   */
  getRepositories(projectId) {
    const url = `${this.baseUrl}/${projectId}/_apis/git/repositories?${API_VERSION}`;
    return this._makeApiCall(url);
  }

  /**
   * Get all repositories across all projects
   * @returns {Observable} An observable of RepositoryListResponse
   */
  getAllRepositories() {
    const url = `${this.baseUrl}/_apis/git/repositories?${API_VERSION}`;
    return this._makeApiCall(url);
  }

  /**
   * Get a specific repository by ID
   * @param {string} repositoryId - The repository ID
   * @param {string} projectId - The project ID (optional)
   * @returns {Observable} An observable of Repository
   */
  getRepository(repositoryId, projectId) {
    const projectSegment = projectId ? `${projectId}/` : '';
    const url = `${this.baseUrl}/${projectSegment}_apis/git/repositories/${repositoryId}?${API_VERSION}`;
    return this._makeApiCall(url);
  }

  /**
   * Get list of branches for a repository
   * @param {string} repositoryId - The repository ID
   * @param {string} projectId - The project ID (optional)
   * @returns {Observable} An observable of BranchListResponse
   */
  getBranches(repositoryId, projectId) {
    const projectSegment = projectId ? `${projectId}/` : '';
    const url = `${this.baseUrl}/${projectSegment}_apis/git/repositories/${repositoryId}/refs?${API_VERSION}`;
    return this._makeApiCall(url);
  }

  /**
   * Helper method to make API calls and handle errors
   * @private
   * @param {string} url - The URL to call
   * @param {Object} options - The fetch options
   * @returns {Observable} An observable of the API response
   */
  _makeApiCall(url, options = {}) {
    const fetchOptions = {
      method: 'GET',
      headers: this.headers,
      ...options
    };

    return from(fetch(url, fetchOptions)).pipe(
      map(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      }),
      catchError(error => {
        console.error('API call failed:', error);
        throw error;
      })
    );
  }
}

export default AzureDevOpsService;
