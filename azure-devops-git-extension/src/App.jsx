import React from "react";
import "./App.css";
import {
  ThemeProvider,
  createTheme,
} from "@mui/material";
import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./Login";
import Repos from "./Repos";
import Projects from "./Projects";
import Dashboard from "./Dashboard";
import MainLayout from "./components/MainLayout";

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

// Main App component with routes
function App() {
  return (
    <ThemeProvider theme={theme}>
      <Router>        <Routes>
          <Route path="/" element={<Login />} />
          <Route
            path="/projects"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Projects />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/repos"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <ReposWrapper />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Dashboard />
                </MainLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </ThemeProvider>
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
  
  if (!authData) {
    console.error('[App] No auth data found in session');
    return <Navigate to="/" />;
  }
    try {
    const parsed = JSON.parse(authData);
    console.log('[App] ReposWrapper auth data:', { 
      tokenExists: !!parsed.token, 
      urlExists: !!parsed.url,
      expiration: new Date(parsed.expiresAt).toLocaleString(),
      isExpired: parsed.expiresAt < Date.now()
    });
    
    if (parsed.expiresAt < Date.now()) {
      console.log('[App] Token expired, redirecting to login');
      sessionStorage.removeItem("authData");
      return <Navigate to="/" />;
    }
    
    // We don't actually need to pass these props as Repos uses ApiManager
    return <Repos />;
  } catch (error) {
    console.error('[App] Error parsing auth data:', error);
    sessionStorage.removeItem("authData");
    return <Navigate to="/" />;
  }
}

export default App;
