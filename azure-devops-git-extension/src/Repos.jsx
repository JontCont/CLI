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
import { finalize } from 'rxjs';

function Repos() {
  const [repos, setRepos] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedTab, setSelectedTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);
  const navigate = useNavigate();
  
  // 调试辅助函数
  const showDebugInfo = () => {
    if (window.apiDebug) {
      setDebugInfo({
        responses: window.apiDebug.responses,
        errors: window.apiDebug.errors,
        time: new Date().toLocaleTimeString()
      });
    } else {
      setDebugInfo({ message: "No API debug info available", time: new Date().toLocaleTimeString() });
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('authData');
    ApiManager.clear();
    navigate('/');
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };
  useEffect(() => {
    console.log('[Repos] Component mounted, initializing...');
    
    // Get or initialize the API service
    const apiService = ApiManager.getCurrentService() || ApiManager.loadFromSession();
    
    console.log('[Repos] API Service initialized:', !!apiService);
    
    if (!apiService) {
      console.error('[Repos] API service initialization failed');
      setError('API service not initialized. Please log in again.');
      setLoading(false);
      navigate('/');
      return;
    }

    // Fetch projects first, then repositories
    setLoading(true);
    setError(null);

    // 使用 setTimeout 确保状态更新完成
    setTimeout(() => {
      console.log('[Repos] Starting API requests...');
      
      // 先分别获取项目和仓库数据
      const fetchProjects = () => {
        console.log('[Repos] Fetching projects');
        apiService.getProjects().subscribe({
          next: (data) => {
            console.log('[Repos] Projects data received:', data);
            if (data && data.value) {
              console.log('[Repos] Projects found:', data.value.length);
              setProjects(data.value);
            } else {
              console.warn('[Repos] No projects data or empty array');
              setProjects([]);
            }
          },
          error: (error) => {
            console.error('[Repos] Projects fetch error:', error);
            setError('Failed to fetch projects: ' + (error.message || 'Unknown error'));
            setLoading(false);
          },
          complete: () => {
            console.log('[Repos] Projects fetch completed');
          }
        });
      };
      
      const fetchRepositories = () => {
        console.log('[Repos] Fetching repositories');
        apiService.getAllRepositories().subscribe({
          next: (data) => {
            console.log('[Repos] Repositories data received:', data);
            if (data && data.value) {
              console.log('[Repos] Repositories found:', data.value.length);
              setRepos(data.value);
            } else {
              console.warn('[Repos] No repositories data or empty array');
              setRepos([]);
            }
            setLoading(false);
          },
          error: (error) => {
            console.error('[Repos] Repositories fetch error:', error);
            setError('Failed to fetch repositories: ' + (error.message || 'Unknown error'));
            setLoading(false);
          },
          complete: () => {
            console.log('[Repos] Repositories fetch completed');
            setLoading(false);
          }
        });
      };
      
      // 执行两个请求
      fetchProjects();
      fetchRepositories();
      
    }, 0);
    
    // 没有需要清理的订阅，因为订阅是局部的
    return () => {
      console.log('[Repos] Component unmounting');
    };
  }, [navigate]);
  
  // 直接从会话获取凭据并手动获取数据进行测试
  const fetchDataManually = () => {
    setLoading(true);
    setError(null);
    
    try {
      // 从会话直接获取凭据
      const authDataString = sessionStorage.getItem('authData');
      if (!authDataString) {
        setError('No auth data in session');
        setLoading(false);
        return;
      }
      
      const { token, url } = JSON.parse(authDataString);
      
      if (!token || !url) {
        setError('Missing token or URL');
        setLoading(false);
        return;
      }
      
      console.log('[Manual] Fetching projects from:', url);
      
      // 手动构建请求
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };
      
      // 获取项目
      fetch(`${url}/_apis/projects?api-version=7.0`, { headers })
        .then(response => {
          console.log('[Manual] Projects response status:', response.status);
          return response.json();
        })
        .then(data => {
          console.log('[Manual] Projects data:', data);
          if (data && data.value) {
            setProjects(data.value);
          }
          
          // 获取仓库
          return fetch(`${url}/_apis/git/repositories?api-version=7.0`, { headers });
        })
        .then(response => {
          console.log('[Manual] Repos response status:', response.status);
          return response.json();
        })
        .then(data => {
          console.log('[Manual] Repos data:', data);
          if (data && data.value) {
            setRepos(data.value);
          }
          setLoading(false);
        })
        .catch(error => {
          console.error('[Manual] Fetch error:', error);
          setError(`Manual fetch failed: ${error.message}`);
          setLoading(false);
        });
    } catch (error) {
      console.error('[Manual] Error:', error);
      setError(`Error: ${error.message}`);
      setLoading(false);
    }
  };
  
  return (
    <Box sx={{ flexGrow: 1 }}>      <AppBar position="static" sx={{ mb: 2 }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Azure DevOps Git Extension
          </Typography>          <Button 
            color="inherit"
            onClick={fetchDataManually}
            variant="text"
            sx={{ mr: 2 }}
          >
            Fetch Manual
          </Button>
          <Button 
            color="inherit"
            onClick={showDebugInfo}
            variant="text"
            sx={{ mr: 2 }}
          >
            Debug
          </Button>
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
              <Tab label="Projects" />
              <Tab label="Repositories" />
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
            </>          ) : (
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
              )}            </>
          )}
          
          {/* 调试信息区域 */}
          {debugInfo && (
            <Box sx={{ mt: 4, p: 2, bgcolor: 'rgba(0,0,0,0.03)', borderRadius: 1, overflow: 'auto', maxHeight: '400px' }}>
              <Typography variant="h6" gutterBottom>Debug Info ({debugInfo.time})</Typography>
              {debugInfo.message ? (
                <Typography>{debugInfo.message}</Typography>
              ) : (
                <>
                  <Typography variant="subtitle2">API Responses: {debugInfo.responses?.length || 0}</Typography>
                  <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.8rem' }}>
                    {JSON.stringify(debugInfo.responses, null, 2)}
                  </pre>
                  
                  <Typography variant="subtitle2" sx={{ mt: 2 }}>API Errors: {debugInfo.errors?.length || 0}</Typography>
                  <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.8rem' }}>
                    {JSON.stringify(debugInfo.errors, null, 2)}
                  </pre>
                </>
              )}
            </Box>
          )}
        </Paper>
      </Container>
    </Box>
  );
}

export default Repos;
