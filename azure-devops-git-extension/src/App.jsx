import React from "react";
import "./App.css";
import {
  ThemeProvider,
  createTheme,
} from "@mui/material";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./Login";
import Repos from "./Repos";

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
  const { token, url } = JSON.parse(authData);

  return <Repos token={token} apiUrl={url} />;
}

export default App;
