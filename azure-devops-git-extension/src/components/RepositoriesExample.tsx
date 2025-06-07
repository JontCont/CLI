import React, { useEffect } from 'react';
import { RepositoriesResponse } from '../models/AzureDevOpsTypes';
import ApiManager from '../services/ApiManager';

/**
 * Example component showing how to use the repository types
 */
const RepositoriesExample: React.FC = () => {
  useEffect(() => {
    // Example of getting repositories with correct typing
    const apiService = ApiManager.getCurrentService();
    
    if (apiService) {
      const subscription = apiService.getAllRepositories().subscribe({
        next: (response: RepositoriesResponse) => {
          console.log(`Found ${response.count} repositories:`);
          
          response.value.forEach(repo => {
            console.log(`- ${repo.name} (${repo.id})`);
            console.log(`  Project: ${repo.project.name}`);
            console.log(`  Default Branch: ${repo.defaultBranch}`);
            console.log(`  Size: ${repo.size} bytes`);
            console.log(`  URL: ${repo.webUrl}`);
          });
        },
        error: (err: Error) => {
          console.error('Failed to fetch repositories:', err);
        }
      });
      
      return () => subscription.unsubscribe();
    }
  }, []);
  
  return (
    <div>
      <h2>Repository Types Example</h2>
      <p>Check the console for repository details.</p>
      <pre>{`
// Example of using the Repository type:
interface Repository {
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

// Example of using the API service:
apiService.getAllRepositories().subscribe({
  next: (response: RepositoriesResponse) => {
    console.log(\`Found \${response.count} repositories:\`);
    
    response.value.forEach(repo => {
      console.log(\`- \${repo.name} (\${repo.id})\`);
      console.log(\`  Project: \${repo.project.name}\`);
    });
  }
});
      `}</pre>
    </div>
  );
};

export default RepositoriesExample;
