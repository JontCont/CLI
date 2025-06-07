import React, { useState } from 'react';
import './App.css';
import { 
  TextField, 
  Button, 
  Container, 
  Box, 
  Typography, 
  Paper, 
  ThemeProvider, 
  createTheme
} from '@mui/material';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  const [url, setUrl] = useState('');
  const [token, setToken] = useState('');
  const [user, setUser] = useState(null);

  const handleSubmit = async () => {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      setUser(data);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  return (
    <ThemeProvider theme={theme}>
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
              />
            </Box>
            
            <Button 
              variant="contained" 
              color="primary" 
              fullWidth 
              size="large"
              onClick={handleSubmit}
              sx={{ 
                py: 1.5,
                mt: 2,
                fontWeight: 'bold',
                fontSize: '1rem'
              }}
            >
              Authenticate
            </Button>
            
            {user && (
              <Box sx={{ mt: 4, textAlign: 'center' }}>
                <Typography variant="h5" component="h2" sx={{ color: 'green' }}>
                  Welcome, {user.name}
                </Typography>
              </Box>
            )}
          </Paper>
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default App;
