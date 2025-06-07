import React, { useState, useEffect } from "react";
import {
  Typography,
  Box,
  Paper,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import { useNavigate, useSearchParams } from "react-router-dom";
import ApiManager from "./services/ApiManager";
import ProjectsList from "./components/ProjectsList";
import RepositoriesList from "./components/RepositoriesList";
import BranchesList from "./components/BranchesList";
import { concatMap, mergeMap, finalize, tap, from } from "rxjs";
import { toArray } from "rxjs/operators";

function Repos() {
  // Data states
  const [repositories, setRepositories] = useState([]);
  const [branches, setBranches] = useState([]);

  // Selection states
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedRepository, setSelectedRepository] = useState(null);

  // UI states
  const [loading, setLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState("Loading...");
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "info",
  });
  const [view, setView] = useState("repositories"); // 'repositories', 'branches'

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

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
    console.log("[Repos] Component mounted, initializing...");

    // Get or initialize the API service
    const apiService =
      ApiManager.getCurrentService() || ApiManager.loadFromSession();

    console.log("[Repos] API Service initialized:", !!apiService);

    if (!apiService) {
      console.error("[Repos] API service initialization failed");
      setError("API service not initialized. Please log in again.");
      setLoading(false);
      navigate("/");
      return;
    }

    // Get project ID from URL parameters or session storage
    const projectId = searchParams.get("projectId");
    const projectName = searchParams.get("projectName");

    if (!projectId && !projectName) {
      console.error("[Repos] No project ID or name provided in URL");
      setError("No project ID or name provided in URL parameters.");
      setLoading(false);
      return;
    }

    loadRepositories(projectId, apiService);
  }, [navigate, searchParams]);

  // Function to load repositories
  const loadRepositories = (projectId, apiService) => {
    setLoading(true);
    setLoadingMessage("Loading repositories...");
    setError(null);

    console.log("[Repos] Loading repositories for project ID:", projectId);
    apiService
      .getRepositories(projectId)
      .pipe(
        mergeMap((data) => {
          const items = data || [];

          return from(items).pipe(
            mergeMap(async (project) => {
              console.log("[Repos] Resolved repository:", project);
              let resolved = project;
              if (project && typeof project.then === "function") {
                resolved = await project;
              }

              if (!resolved) return null;
              const items = resolved["value"] || [];
              return items;
            })
          );
        }),
        tap((repositories) => {
          console.debug("[Repos] Repositories data received:", repositories);
          const validRepositories = repositories.filter((item) => item != null);
          setRepositories(validRepositories);
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
  };

  // Handle project selection
  const handleSelectProject = (project) => {
    setSelectedProject(project);
    setView("repositories");
    // Store selected project in session storage
    sessionStorage.setItem("selectedProject", JSON.stringify(project));

    // Navigate to repositories view
    loadRepositories(project.id, ApiManager.getCurrentService());
  };

  // Handle repository selection
  const handleSelectRepository = (repository) => {
    setSelectedRepository(repository);
    setView("branches");

    // Store selected repository in session storage
    sessionStorage.setItem("selectedRepository", JSON.stringify(repository));

    if (!selectedProject) {
      console.error("[Repos] No project selected for repository:", repository);
      setError("No project selected for this repository.");
      return;
    }

    // Load branches for selected repository
    loadBranches(repository.id, selectedProject.id);
  };

  // Function to load branches for a repository
  const loadBranches = (repositoryId, projectId) => {
    setLoading(true);
    setLoadingMessage("Loading branches...");
    setError(null);

    const apiService = ApiManager.getCurrentService();
    apiService
      .getBranches(repositoryId, projectId)
      .pipe(
        mergeMap((data) => {
          const items = data || [];

          return from(items).pipe(
            mergeMap(async (project) => {
              console.log("[Branch] Resolved repository:", project);
              let resolved = project;
              if (project && typeof project.then === "function") {
                resolved = await project;
              }

              if (!resolved) return null;
              const items = resolved["value"] || [];
              return items;
            })
          );
        }),
        tap((repositories) => {
          console.debug("[Branch] Repositories data received:", repositories);
          const validRepositories = repositories.filter((item) => item != null);
          setBranches(validRepositories);
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
  };

  // Handle back to projects view
  const handleBackToProjects = () => {
    setSelectedProject(null);
    setSelectedRepository(null);
    setRepositories([]);
    setBranches([]);
    // Navigate to projects page instead of changing view
    navigate("/projects");
  };

  // Handle back to repositories view
  const handleBackToRepositories = () => {
    setSelectedRepository(null);
    setBranches([]);
    setView("repositories");
  };

  // Delete branch
  const handleDeleteBranch = (branch) => {
    if (!selectedRepository || !selectedProject) {
      return Promise.reject(new Error("Repository or project not selected"));
    }

    setLoading(true);
    setLoadingMessage("Deleting branch...");

    const apiService = ApiManager.getCurrentService();
    return new Promise((resolve, reject) => {
      apiService
        .deleteBranch(selectedRepository.id, branch.name, selectedProject.id)
        .subscribe({
          next: (response) => {
            console.log("[Repos] Branch deletion response:", response);

            // Reload branches to reflect changes
            apiService
              .getBranches(selectedRepository.id, selectedProject.id)
              .subscribe({
                next: (data) => {
                  if (data && data.value) {
                    // Filter to include only branches (not tags or other refs)
                    const branchRefs = data.value.filter((ref) =>
                      ref.name.startsWith("refs/heads/")
                    );
                    setBranches(branchRefs);
                  } else {
                    setBranches([]);
                  }
                  setLoading(false);
                  showNotification(
                    `Branch ${branch.name.replace(
                      "refs/heads/",
                      ""
                    )} deleted successfully`,
                    "success"
                  );
                  resolve();
                },
                error: (error) => {
                  console.error("[Repos] Branches refresh error:", error);
                  setError("Failed to refresh branches list");
                  setLoading(false);
                  reject(error);
                },
              });
          },
          error: (error) => {
            console.error("[Repos] Branch deletion error:", error);
            setError(
              "Failed to delete branch: " + (error.message || "Unknown error")
            );
            setLoading(false);
            reject(error);
          },
        });
    });
  };

  // Render the current view
  const renderCurrentView = () => {
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
          <Typography variant="body1">{loadingMessage}</Typography>
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

    switch (view) {
      case "branches":
        return (
          <BranchesList
            branches={branches}
            selectedProject={selectedProject}
            selectedRepository={selectedRepository}
            loading={loading}
            error={error}
            onBackToRepositories={handleBackToRepositories}
            onDeleteBranch={handleDeleteBranch}
          />
        );

      case "repositories":
      default:
        return (
          <RepositoriesList
            repositories={repositories}
            selectedProject={selectedProject}
            loading={loading}
            error={error}
            onSelectRepository={handleSelectRepository}
            onBackToProjects={handleBackToProjects}
          />
        );
    }
  };

  return (
    <Box>
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
        {renderCurrentView()}
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

export default Repos;
