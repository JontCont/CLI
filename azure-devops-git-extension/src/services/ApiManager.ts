/**
 * API Manager
 * Singleton to manage API service instances and authentication
 */
import AzureDevOpsService from './AzureDevOpsService';

/**
 * Session storage auth data interface
 */
interface AuthData {
  token: string;
  url: string;
  userData: any;
  expiresAt: number;
}

/**
 * API Manager class to handle service instances
 */
class ApiManager {
  private services: Record<string, AzureDevOpsService>;
  private currentService: AzureDevOpsService | null;

  constructor() {
    this.services = {};
    this.currentService = null;
  }

  /**
   * Initialize a service with credentials
   * @param baseUrl - The base URL for the Azure DevOps API
   * @param token - The personal access token
   * @returns The initialized service
   */
  initService(baseUrl: string, token: string): AzureDevOpsService {
    const service = new AzureDevOpsService(baseUrl, token);
    this.services[baseUrl] = service;
    this.currentService = service;
    return service;
  }

  /**
   * Get a service by URL
   * @param baseUrl - The base URL for the Azure DevOps API
   * @returns The service or null if not found
   */
  getService(baseUrl: string): AzureDevOpsService | null {
    return this.services[baseUrl] || null;
  }

  /**
   * Get the current service
   * @returns The current service or null if not initialized
   */
  getCurrentService(): AzureDevOpsService | null {
    return this.currentService;
  }
  /**
   * Create a service from session storage
   * @returns The service or null if not found in session
   */
  loadFromSession(): AzureDevOpsService | null {
    console.log('[ApiManager] Loading service from session');
    const authDataString = sessionStorage.getItem('authData');
    if (!authDataString) {
      console.log('[ApiManager] No auth data found in session');
      return null;
    }

    try {
      const authData = JSON.parse(authDataString) as AuthData;
      console.log('[ApiManager] Auth data found:', { 
        urlPresent: !!authData.url, 
        tokenPresent: !!authData.token,
        expiresAt: authData.expiresAt,
        isExpired: authData.expiresAt < Date.now()
      });
      
      if (!authData.token || !authData.url) {
        console.log('[ApiManager] Missing token or URL in auth data');
        return null;
      }
      
      if (authData.expiresAt < Date.now()) {
        console.log('[ApiManager] Token has expired');
        return null;
      }

      console.log('[ApiManager] Initializing service with URL:', authData.url);
      return this.initService(authData.url, authData.token);
    } catch (error) {
      console.error('[ApiManager] Error loading from session:', error);
      return null;
    }
  }

  /**
   * Clear all services and authentication
   */
  clear(): void {
    this.services = {};
    this.currentService = null;
  }

  /**
   * Check if the user is authenticated
   * @returns True if authenticated, false otherwise
   */
  isAuthenticated(): boolean {
    const authDataString = sessionStorage.getItem('authData');
    if (!authDataString) {
      return false;
    }

    const authData = JSON.parse(authDataString) as AuthData;
    return authData.expiresAt > Date.now();
  }
}

// Export as a singleton
export default new ApiManager();
