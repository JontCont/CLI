/**
 * API Manager
 * Singleton to manage API service instances and authentication
 */
import AzureDevOpsService from './AzureDevOpsService';

class ApiManager {
  constructor() {
    this.services = {};
    this.currentService = null;
  }

  /**
   * Initialize a service with credentials
   * @param {string} baseUrl - The base URL for the Azure DevOps API
   * @param {string} token - The personal access token
   * @returns {AzureDevOpsService} The initialized service
   */
  initService(baseUrl, token) {
    const service = new AzureDevOpsService(baseUrl, token);
    this.services[baseUrl] = service;
    this.currentService = service;
    return service;
  }

  /**
   * Get a service by URL
   * @param {string} baseUrl - The base URL for the Azure DevOps API
   * @returns {AzureDevOpsService|null} The service or null if not found
   */
  getService(baseUrl) {
    return this.services[baseUrl] || null;
  }

  /**
   * Get the current service
   * @returns {AzureDevOpsService|null} The current service or null if not initialized
   */
  getCurrentService() {
    return this.currentService;
  }

  /**
   * Create a service from session storage
   * @returns {AzureDevOpsService|null} The service or null if not found in session
   */
  loadFromSession() {
    const authData = sessionStorage.getItem('authData');
    if (!authData) {
      return null;
    }

    const { token, url } = JSON.parse(authData);
    if (!token || !url) {
      return null;
    }

    return this.initService(url, token);
  }

  /**
   * Clear all services and authentication
   */
  clear() {
    this.services = {};
    this.currentService = null;
  }
}

// Export as a singleton
export default new ApiManager();
