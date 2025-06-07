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
   */  getProjects() {
    const url = `${this.baseUrl}/_apis/projects?${API_VERSION}`;
    return this._makeApiCall(url).pipe(
      map(response => {
        // 處理各種可能的回應格式
        if (!response || typeof response !== 'object') {
          console.error('[AzureDevOpsService] Invalid response format:', response);
          return { value: [] };
        }
        
        // 如果回應包含 value 屬性且是陣列
        if (response.value && Array.isArray(response.value)) {
          // 檢查是否包含 Promise 對象
          const hasPromises = response.value.some(item => item instanceof Promise || 
                                                (item && typeof item === 'object' && typeof item.then === 'function'));
          
          if (hasPromises) {
            // 將所有 Promise 解析並返回整合後的數據
            return from(Promise.all(
              response.value.map(item => 
                item instanceof Promise || (item && typeof item.then === 'function') 
                  ? item 
                  : Promise.resolve(item)
              )
            )).pipe(
              map(resolvedItems => {
                return { 
                  value: resolvedItems.filter(item => item !== null && item !== undefined),
                  count: resolvedItems.filter(item => item !== null && item !== undefined).length 
                };
              })
            );
          }
          
          return response;
        }
        
        // 如果回應直接是陣列
        if (Array.isArray(response)) {
          const hasPromises = response.some(item => item instanceof Promise || 
                                         (item && typeof item === 'object' && typeof item.then === 'function'));
          
          if (hasPromises) {
            return from(Promise.all(
              response.map(item => 
                item instanceof Promise || (item && typeof item.then === 'function')
                  ? item 
                  : Promise.resolve(item)
              )
            )).pipe(
              map(resolvedItems => {
                return { 
                  value: resolvedItems.filter(item => item !== null && item !== undefined),
                  count: resolvedItems.filter(item => item !== null && item !== undefined).length 
                };
              })
            );
          }
          
          return { value: response, count: response.length };
        }
        
        // 否則，嘗試適配我們收到的內容為預期的格式
        return { value: [response], count: 1 };
      }),
      catchError(error => {
        console.error('[AzureDevOpsService] Error in getProjects:', error);
        throw error;
      })
    );
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
   */  _makeApiCall(url, options = {}) {
    const fetchOptions = {
      method: 'GET',
      headers: this.headers,
      ...options
    };

    console.log(`[AzureDevOpsService] Making API call to: ${url}`);
    
    return from(fetch(url, fetchOptions)).pipe(
      map(response => {
        if (!response.ok) {
          console.error(`[AzureDevOpsService] HTTP error! Status: ${response.status}`);
          throw new Error(`HTTP error! Status: ${response.status}, URL: ${url}`);
        }
        return response.json();
      }),
      map(data => {
        console.log(`[AzureDevOpsService] API response:`, data);
        
        // 檢查數據格式並處理可能的 Promise
        if (data && data.value && Array.isArray(data.value)) {
          const containsPromises = data.value.some(item => 
            item instanceof Promise || 
            (item && typeof item === 'object' && typeof item.then === 'function')
          );
          
          if (containsPromises) {
            console.log(`[AzureDevOpsService] Found promises in response data, will handle in getProjects`);
          }
        }
        
        return data;
      }),
      catchError(error => {
        console.error(`[AzureDevOpsService] API call failed for ${url}:`, error);
        throw error;
      })
    );
  }
}

export default AzureDevOpsService;
