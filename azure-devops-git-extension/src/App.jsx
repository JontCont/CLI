import React, { useState, useEffect } from "react";
import "./App.css";
import {
  TextField,
  Button,
  Container,
  Box,
  Typography,
  Paper,
  ThemeProvider,
  createTheme,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { from } from "rxjs";
import ApiManager from "./services/ApiManager";

const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#dc004e",
    },
  },
});

// Login component that handles authentication
// Login component with persistent session storage
function Login() {
  const [url, setUrl] = useState("");
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if we have an active session
    const checkAuth = () => {
      const authData = sessionStorage.getItem("authData");

      if (authData) {
        const { expiresAt } = JSON.parse(authData);

        // If token hasn't expired, redirect to repos
        if (expiresAt > new Date().getTime()) {
          navigate("/repos");
        } else {
          // Clear expired token
          sessionStorage.removeItem("authData");
        }
      }
    };

    checkAuth();
  }, [navigate]);

  const saveTokenToSession = (token, userData, url) => {
    const now = new Date();
    // Token expires in 1 hour
    const expiresAt = now.getTime() + 60 * 60 * 1000;

    const sessionData = {
      token,
      userData,
      url,
      expiresAt,
    };

    sessionStorage.setItem("authData", JSON.stringify(sessionData));
  };

  const handleSubmit = async () => {
    if (!url || !token) {
      setError("URL and Token are required");
      setOpenSnackbar(true);
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Initialize the API service with ApiManager
      const apiService = ApiManager.initService(url, token);
      
      // Test the connection by fetching projects
      apiService.getProjects().subscribe({
        next: (data) => {
          console.log('Projects retrieved:', data);
          
          // Extract user info from projects or just use a placeholder
          const userData = {
            name: "Azure DevOps User",
            projects: data.value || []
          };
          
          // Save token and user data to session storage
          saveTokenToSession(token, userData, url);
          
          // Navigate to repos page
          navigate("/repos");
        },
        error: (err) => {
          console.error("API call failed:", err);
          setError(
            err.message || "Authentication failed. Please check URL and Token."
          );
          setOpenSnackbar(true);
          setLoading(false);
        },
        complete: () => {
          setLoading(false);
        }
      });
    } catch (error) {
      console.error("Validation failed:", error);
      setError(
        error.message || "Authentication failed. Please check URL and Token."
      );
      setOpenSnackbar(true);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="md" className="App">
        <Box
          sx={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            py: 4,
          }}
        >
          <Paper
            elevation={3}
            sx={{
              padding: 4,
              borderRadius: 2,
              width: "100%",
              maxWidth: 600,
              background: "rgba(255, 255, 255, 0.9)",
            }}
          >
            <Typography
              variant="h4"
              component="h1"
              gutterBottom
              align="center"
              sx={{ fontWeight: "bold", color: "#1976d2" }}
            >
              Azure DevOps Git Extension
            </Typography>
            <Typography
              variant="subtitle1"
              gutterBottom
              align="center"
              sx={{ mb: 3, color: "#555" }}
            >
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
                fontWeight: "bold",
                fontSize: "1rem",
              }}
            >
              {loading ? "Authenticating..." : "Authenticate"}
            </Button>
          </Paper>
        </Box>
        <Snackbar
          open={openSnackbar}
          autoHideDuration={6000}
          onClose={() => setOpenSnackbar(false)}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            onClose={() => setOpenSnackbar(false)}
            severity="error"
            sx={{ width: "100%" }}
          >
            {error}
          </Alert>
        </Snackbar>
      </Container>
    </ThemeProvider>
  );
}

// Main App component with routes
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/repos"
          element={
            <ProtectedRoute>
              <ReposWrapper />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

// Protected route component to check auth
function ProtectedRoute({ children }) {
  const authData = sessionStorage.getItem("authData");

  if (!authData) {
    return <Navigate to="/" />;
  }

  const { expiresAt } = JSON.parse(authData);

  if (expiresAt < new Date().getTime()) {
    sessionStorage.removeItem("authData");
    return <Navigate to="/" />;
  }

  return children;
}

// Wrapper for Repos component to pass token from session
function ReposWrapper() {
  const authData = sessionStorage.getItem("authData");
  const { token, url } = JSON.parse(authData);

  return <Repos token={token} apiUrl={url} />;
}

export default App;
