import React, { useState, useEffect } from 'react';
import {
  TextField,
  Button,
  Container,
  Box,
  Typography,
  Paper,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ApiManager from './services/ApiManager';

function Login() {
  const [url, setUrl] = useState('');
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if we have an active session
    const checkAuth = () => {
      const authData = sessionStorage.getItem('authData');
      
      if (authData) {
        const { expiresAt } = JSON.parse(authData);
        
        // If token hasn't expired, redirect to repos
        if (expiresAt > new Date().getTime()) {
          navigate('/repos');
        } else {
          // Clear expired token
          sessionStorage.removeItem('authData');
        }
      }
    };
    
    checkAuth();
  }, [navigate]);

  const saveTokenToSession = (token, userData, url) => {
    const now = new Date();
    // Token expires in 1 hour
    const expiresAt = now.getTime() + (60 * 60 * 1000);
    
    const sessionData = {
      token,
      userData,
      url,
      expiresAt
    };
    
    sessionStorage.setItem('authData', JSON.stringify(sessionData));
  };

  const handleSubmit = () => {
    if (!url || !token) {
      setError('URL and Token are required');
      setOpenSnackbar(true);
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      // Initialize the API service
      const apiService = ApiManager.initService(url, token);
      
      // Test the connection by fetching projects
      const subscription = apiService.getProjects().subscribe({
        next: (data) => {
          console.log('Projects retrieved:', data);
          
          // Extract user info from projects
          const userData = {
            name: "Azure DevOps User",
            projects: data.value || []
          };
          
          // Save token and user data to session storage
          saveTokenToSession(token, userData, url);
          
          // Navigate to repos page
          setTimeout(() => {
            navigate('/repos');
          }, 500);
        },
        error: (err) => {
          console.error('API call failed:', err);
          setError(err.message || 'Authentication failed. Please check URL and Token.');
          setOpenSnackbar(true);
          setLoading(false);
        },
        complete: () => {
          setLoading(false);
        }
      });
      
      return () => subscription.unsubscribe();
    } catch (error) {
      console.error('Validation failed:', error);
      setError(error.message || 'Authentication failed. Please check URL and Token.');
      setOpenSnackbar(true);
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" className="App">
      <Box sx={{ 
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        py: 4
      }}>
        <Paper elevation={3} sx={{
          padding: 4,
          borderRadius: 2,
          width: '100%',
          maxWidth: 600,
          background: 'rgba(255, 255, 255, 0.9)',
        }}>
          <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
            Azure DevOps Git Extension
          </Typography>
          <Typography variant="subtitle1" gutterBottom align="center" sx={{ mb: 3, color: '#555' }}>
            Please enter the URL and Token to proceed
          </Typography>
          
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              label="API URL"
              variant="outlined"
              margin="normal"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://dev.azure.com/{organization}"
              required
              helperText="Example: https://dev.azure.com/yourorganization"
            />
            <TextField
              fullWidth
              label="Access Token"
              variant="outlined"
              margin="normal"
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Enter your personal access token"
              required
              helperText="Paste your Azure DevOps personal access token here"
            />
          </Box>
          
          <Button 
            variant="contained" 
            color="primary" 
            fullWidth 
            size="large"
            onClick={handleSubmit}
            disabled={loading}
            sx={{ 
              py: 1.5,
              mt: 2,
              fontWeight: 'bold',
              fontSize: '1rem'
            }}
          >
            {loading ? (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CircularProgress size={24} color="inherit" sx={{ mr: 1 }} />
                Authenticating...
              </Box>
            ) : 'Authenticate'}
          </Button>
        </Paper>
      </Box>
      <Snackbar 
        open={openSnackbar} 
        autoHideDuration={6000} 
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setOpenSnackbar(false)} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default Login;
