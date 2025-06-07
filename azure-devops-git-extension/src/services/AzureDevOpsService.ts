/**
 * Azure DevOps API Service
 * Handles all requests to the Azure DevOps API
 */
import { from, Observable } from 'rxjs';
import { mergeMap, catchError } from 'rxjs/operators';
import {
  Project,
  Repository,
  RepositoriesResponse,
  Branch,
  BranchesResponse,
  Commit,
  CommitsResponse
} from '../models/AzureDevOpsTypes';

const API_VERSION = 'api-version=7.0';

/**
 * Azure DevOps API Service class
 * Provides strongly-typed methods for interacting with Azure DevOps API
 */
class AzureDevOpsService {
  private baseUrl: string;
  private token: string;
  private headers: Record<string, string>;

  /**
   * Initialize the service with credentials
   * @param baseUrl - The base URL for the Azure DevOps API
   * @param token - The personal access token
   */
  constructor(baseUrl: string, token: string) {
    this.baseUrl = baseUrl;
    this.token = token;
    this.headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Get list of projects
   * @returns Observable of projects response
   */
  getProjects(): Observable<{ count: number, value: Project[] }> {
    const url = `${this.baseUrl}/_apis/projects?${API_VERSION}`;
    return this._makeApiCall<{ count: number, value: Project[] }>(url);
  }

  /**
   * Get a specific project by ID
   * @param projectId - The project ID
   * @returns Observable of project
   */
  getProject(projectId: string): Observable<Project> {
    const url = `${this.baseUrl}/_apis/projects/${projectId}?${API_VERSION}`;
    return this._makeApiCall<Project>(url);
  }

  /**
   * Get list of repositories for a project
   * @param projectId - The project ID
   * @returns Observable of repositories response
   */
  getRepositories(projectId: string): Observable<RepositoriesResponse> {
    const url = `${this.baseUrl}/${projectId}/_apis/git/repositories?${API_VERSION}`;
    return this._makeApiCall<RepositoriesResponse>(url);
  }

  /**
   * Get all repositories across all projects
   * @returns Observable of repositories response
   */
  getAllRepositories(): Observable<RepositoriesResponse> {
    const url = `${this.baseUrl}/_apis/git/repositories?${API_VERSION}`;
    return this._makeApiCall<RepositoriesResponse>(url);
  }

  /**
   * Get a specific repository by ID
   * @param repositoryId - The repository ID
   * @param projectId - The project ID (optional)
   * @returns Observable of repository
   */
  getRepository(repositoryId: string, projectId?: string): Observable<Repository> {
    const projectSegment = projectId ? `${projectId}/` : '';
    const url = `${this.baseUrl}/${projectSegment}_apis/git/repositories/${repositoryId}?${API_VERSION}`;
    return this._makeApiCall<Repository>(url);
  }

  /**
   * Get list of branches for a repository
   * @param repositoryId - The repository ID
   * @param projectId - The project ID (optional)
   * @returns Observable of branches response
   */
  getBranches(repositoryId: string, projectId?: string): Observable<BranchesResponse> {
    const projectSegment = projectId ? `${projectId}/` : '';
    const url = `${this.baseUrl}/${projectSegment}_apis/git/repositories/${repositoryId}/refs?${API_VERSION}`;
    return this._makeApiCall<BranchesResponse>(url);
  }

  /**
   * Get list of commits for a repository
   * @param repositoryId - The repository ID
   * @param projectId - The project ID (optional)
   * @returns Observable of commits response
   */
  getCommits(repositoryId: string, projectId?: string): Observable<CommitsResponse> {
    const projectSegment = projectId ? `${projectId}/` : '';
    const url = `${this.baseUrl}/${projectSegment}_apis/git/repositories/${repositoryId}/commits?${API_VERSION}`;
    return this._makeApiCall<CommitsResponse>(url);
  }

  /**
   * Helper method to make API calls and handle errors
   * @private
   * @param url - The URL to call
   * @param options - The fetch options
   * @returns Observable of the API response
   */  private _makeApiCall<T>(url: string, options: RequestInit = {}): Observable<T> {
    const fetchOptions: RequestInit = {
      method: 'GET',
      headers: this.headers,
      ...options
    };

    console.log(`[API] Making API call to: ${url}`);

    return from(fetch(url, fetchOptions)).pipe(
      mergeMap(response => {
        console.log(`[API] Response status: ${response.status}`);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json() as Promise<T>;
      }),
      mergeMap(data => {
        console.log(`[API] Received data:`, data);
        return Promise.resolve(data);
      }),
      catchError(error => {
        console.error('[API] API call failed:', error);
        throw error;
      })
    );
  }
}

export default AzureDevOpsService;
