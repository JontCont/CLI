import React, { useState, useEffect } from "react";
import {
  Typography,
  Box,
  Paper,
  CircularProgress,
  Button,
  Snackbar,
  Alert,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import ApiManager from "./services/ApiManager";
import ProjectsList from "./components/ProjectsList";
import { concatMap, mergeMap, finalize, tap, from } from "rxjs";
import { toArray } from "rxjs/operators";

function Projects() {
  // States
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  const navigate = useNavigate();

  // Close notification
  const handleCloseNotification = () => {
    setNotification((prev) => ({ ...prev, open: false }));
  };

  // Show notification
  const showNotification = (message, severity = "info") => {
    setNotification({
      open: true,
      message,
      severity,
    });
  };

  // Initial data loading
  useEffect(() => {
    console.log("[Projects] Component mounted, initializing...");

    // Get or initialize the API service
    const apiService =
      ApiManager.getCurrentService() || ApiManager.loadFromSession();

    console.log("[Projects] API Service initialized:", !!apiService);

    if (!apiService) {
      console.error("[Projects] API service initialization failed");
      setError("API service not initialized. Please log in again.");
      setLoading(false);
      navigate("/");
      return;
    }

    // Fetch projects
    setLoading(true);
    setError(null);
    apiService
      .getProjects()
      .pipe(
        mergeMap((data) => {
          const items = data["value"] || [];
          return from(items).pipe(
            mergeMap(async (project) => {
              let resolved = project;
              if (project && typeof project.then === "function") {
                resolved = await project;
              }

              if (!resolved) return null;
              const items = resolved["value"] || [];
              return items
            })
          );
        }),
        tap((projects) => {
          const validProjects = projects.filter((project) => project != null);
          setProjects(validProjects);
        }),
        finalize(() => {
          setLoading(false);
        })
      )
      .subscribe({
        error: (err) => {
          setError(
            `Failed to load projects: ${err.message || "Unknown error"}`
          );
          setLoading(false);
        },
      });
  }, [navigate]);

  // Handle project selection
  const handleSelectProject = (project) => {
    // Store selected project in session storage
    sessionStorage.setItem("selectedProject", JSON.stringify(project));

    // Navigate to repositories view for this project
    navigate(
      `/repos?projectId=${project.id}&projectName=${encodeURIComponent(
        project.name
      )}`
    );
  };

  // Render component
  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          p: 4,
        }}
      >
        <CircularProgress size={40} sx={{ mb: 2 }} />
        <Typography variant="body1">Loading projects...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Typography color="error" sx={{ p: 2 }}>
        {error}
      </Typography>
    );
  }

  return (
    <Box>
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
        <ProjectsList
          projects={projects}
          loading={loading}
          error={error}
          onSelectProject={handleSelectProject}
        />
      </Paper>

      {/* Notification snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          sx={{ width: "100%" }}
          variant="filled"
          elevation={6}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default Projects;
