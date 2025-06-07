import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  List, 
  ListItem, 
  ListItemText, 
  Paper, 
  Button, 
  AppBar, 
  Toolbar,
  CircularProgress,
  Tabs,
  Tab,
  Divider,
  IconButton
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ApiManager from './services/ApiManager';

function Repos({ token, apiUrl }) {
  const [repos, setRepos] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedTab, setSelectedTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  const handleLogout = () => {
    sessionStorage.removeItem('authData');
    ApiManager.clear();
    navigate('/');
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  useEffect(() => {
    // Get or initialize the API service
    const apiService = ApiManager.getCurrentService() || ApiManager.loadFromSession();
    
    if (!apiService) {
      setError('API service not initialized. Please log in again.');
      setLoading(false);
      return;
    }

    // First, fetch projects
    const projectsSubscription = apiService.getProjects().subscribe({
      next: (data) => {
        setProjects(data.value || []);
        
        // Then, fetch repositories
        const reposSubscription = apiService.getAllRepositories().subscribe({
          next: (data) => {
            setRepos(data.value || []);
            setLoading(false);
          },
          error: (error) => {
            console.error('Failed to fetch repositories:', error);
            setError(error.message || 'Failed to fetch repositories');
            setLoading(false);
          }
        });
        
        return () => reposSubscription.unsubscribe();
      },
      error: (error) => {
        console.error('Failed to fetch projects:', error);
        setError(error.message || 'Failed to fetch projects');
        setLoading(false);
      }
    });
      return () => projectsSubscription.unsubscribe();
  }, []);
  
  return (
    <Box sx={{ flexGrow: 1 }}>      <AppBar position="static" sx={{ mb: 2 }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Azure DevOps Git Extension
          </Typography>
          <Button 
            color="inherit" 
            onClick={handleLogout}
            variant="outlined"
            sx={{ 
              borderColor: 'rgba(255,255,255,0.5)', 
              '&:hover': { 
                borderColor: 'white', 
                bgcolor: 'rgba(255,255,255,0.1)' 
              } 
            }}
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs value={selectedTab} onChange={handleTabChange} aria-label="Azure DevOps tabs">
              <Tab label="Repositories" />
              <Tab label="Projects" />
            </Tabs>
          </Box>
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Typography color="error" sx={{ p: 2 }}>
              {error}
            </Typography>
          ) : selectedTab === 0 ? (
            // Repositories tab
            <>
              <Typography variant="h4" gutterBottom component="h1">
                Your Repositories
              </Typography>
              
              {repos.length === 0 ? (
                <Typography sx={{ p: 2 }}>No repositories found.</Typography>
              ) : (
                <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                  {repos.map((repo) => (
                    <ListItem 
                      key={repo.id} 
                      divider
                      sx={{
                        transition: 'all 0.2s',
                        '&:hover': {
                          backgroundColor: 'rgba(25, 118, 210, 0.08)',
                        },
                      }}
                    >
                      <ListItemText 
                        primary={repo.name} 
                        secondary={`Project: ${repo.project?.name || 'Unknown'}`}
                        primaryTypographyProps={{ fontWeight: 'bold' }}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </>
          ) : (
            // Projects tab
            <>
              <Typography variant="h4" gutterBottom component="h1">
                Your Projects
              </Typography>
              
              {projects.length === 0 ? (
                <Typography sx={{ p: 2 }}>No projects found.</Typography>
              ) : (
                <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                  {projects.map((project) => (
                    <ListItem 
                      key={project.id} 
                      divider
                      sx={{
                        transition: 'all 0.2s',
                        '&:hover': {
                          backgroundColor: 'rgba(25, 118, 210, 0.08)',
                        },
                      }}
                    >
                      <ListItemText 
                        primary={project.name} 
                        secondary={`Last updated: ${new Date(project.lastUpdateTime).toLocaleDateString()}`}
                        primaryTypographyProps={{ fontWeight: 'bold' }}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </>
          )}
        </Paper>
      </Container>
    </Box>
  );
}

export default Repos;
