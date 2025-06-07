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

    if (!repository) {
      console.error("[Repos] No project selected for repository:", repository);
      setError("No project selected for this repository.");
      return;
    }

    // Load branches for selected repository
    loadBranches(repository.id, repository.project.id);
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

  // 刪除 branch
  const handleDeleteBranch = async (branch) => {
    const apiService = ApiManager.getCurrentService();
    const repo =
      selectedRepository ||
      JSON.parse(sessionStorage.getItem("selectedRepository"));
    const proj =
      selectedProject || JSON.parse(sessionStorage.getItem("selectedProject"));
    if (!repo || !proj) {
      console.error("[Repos] Repository or project not selected", {
        repo,
        proj,
      });
      return Promise.reject(new Error("Repository or project not selected"));
    }
    if (!apiService || typeof apiService.deleteBranch !== "function") {
      setError("API service not initialized or deleteBranch not available");
      return Promise.reject(
        new Error("API service not initialized or deleteBranch not available")
      );
    }
    setLoading(true);
    setLoadingMessage("Deleting branch...");
    return new Promise((resolve, reject) => {
      try {
        apiService
          .deleteBranch(repo.id, branch.name, proj.id, branch.objectId)
          .subscribe({
            next: (response) => {
              console.log("[Repos] deleteBranch API success", response);
              // Reload branches to reflect changes
              apiService.getBranches(repo.id, proj.id).subscribe({
                next: (data) => {
                  if (data && data.value) {
                    loadBranches(repo.id, proj.id);

                    // 自動回到上一頁（如果本頁已無分支且不是第1頁）
                    setTimeout(() => {
                      const filteredCount = getFilteredBranchesCount();
                      const maxPage = Math.max(
                        1,
                        Math.ceil(filteredCount / BRANCHES_PER_PAGE)
                      );
                      if (branchPage > maxPage) {
                        setBranchPage(maxPage);
                      }
                    }, 0);
                  } else {
                    setBranches([]);
                    setBranchPage(1);
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
                  setError("Failed to refresh branches list");
                  setLoading(false);
                  reject(error);
                },
              });
            },
            error: (error) => {
              console.error("[Repos] deleteBranch API error", error);
              setError(
                "Failed to delete branch: " + (error.message || "Unknown error")
              );
              setLoading(false);
              reject(error);
            },
          });
      } catch (err) {
        console.error("[Repos] deleteBranch exception", err);
        setError(
          "Failed to delete branch: " + (err.message || "Unknown error")
        );
        setLoading(false);
        reject(err);
      }
    });
  };

  // 新增 branch 搜尋、分頁、勾選狀態
  const [branchSearch, setBranchSearch] = useState("");
  const [branchPage, setBranchPage] = useState(1);
  const [selectedBranches, setSelectedBranches] = useState([]);
  const BRANCHES_PER_PAGE = 50;

  // 分頁與搜尋後的 branches
  const getFilteredBranches = () => {
    let filtered = branches;
    if (branchSearch) {
      filtered = filtered.filter((b) =>
        b.name.toLowerCase().includes(branchSearch.toLowerCase())
      );
    }
    return filtered;
  };
  const getPagedFilteredBranches = () => {
    const filtered = getFilteredBranches();
    const start = (branchPage - 1) * BRANCHES_PER_PAGE;
    return filtered.slice(start, start + BRANCHES_PER_PAGE);
  };
  const getFilteredBranchesCount = () => getFilteredBranches().length;

  // 勾選/取消勾選分支
  const handleToggleBranch = (branchName) => {
    setSelectedBranches((prev) =>
      prev.includes(branchName)
        ? prev.filter((name) => name !== branchName)
        : [...prev, branchName]
    );
  };

  // 全選/全不選
  const handleToggleAllBranches = () => {
    const pageBranches = getPagedFilteredBranches().map((b) => b.name);
    const allSelected = pageBranches.every((name) =>
      selectedBranches.includes(name)
    );
    setSelectedBranches(
      allSelected
        ? selectedBranches.filter((name) => !pageBranches.includes(name))
        : [
            ...selectedBranches,
            ...pageBranches.filter((name) => !selectedBranches.includes(name)),
          ]
    );
  };

  // 批次刪除勾選分支
  const handleDeleteSelectedBranches = async () => {
    const repo =
      selectedRepository ||
      JSON.parse(sessionStorage.getItem("selectedRepository"));

    const proj =
      selectedProject || JSON.parse(sessionStorage.getItem("selectedProject"));

    if (!repo || !proj) {
      console.error("[Repos] Repository or project not selected", {
        repo,
        proj,
      });
      setError("Repository or project not selected");
      return;
    }

    // 取得 checked branches
    if (selectedBranches.length === 0) {
      showNotification("No branches selected for deletion", "warning");
      return;
    }

    console.log(
      "[Repos] handleDeleteSelectedBranches called with selected branches:",
      selectedBranches
    );

    const arr = selectedBranches.map((name) => {
      const branch = branches.find((b) => b.name === name);
      if (!branch) {
        console.warn("[Repos] Branch not found for deletion:", name);
        return null; // Skip if branch not found
      }
      if (!branch.objectId) {
        console.warn("[Repos] Branch objectId is missing:", name);
        return null; // Skip if objectId is missing
      }
      return {
        name,
        oldObjectId: branch.objectId,
        newObjectId: "0000000000000000000000000000000000000000",
      };
    });

    console.log("[Repos] handleDeleteSelectedBranches array called", arr);

    const apiService = ApiManager.getCurrentService();
    if (!apiService || typeof apiService.batchDeleteBranch !== "function") {
      setError("API service not initialized or batchDeleteBranch not available");
      return;
    }

    setLoading(true);
    setLoadingMessage("Deleting selected branches...");
    apiService
      .batchDeleteBranch(repo.id, arr, proj.id)
      .subscribe({
        next: () => {
          loadBranches(repo.id, proj.id);
          setLoading(false);
          showNotification("Selected branches deleted successfully", "success");
        },
        error: (error) => {
          setLoading(false);
          setError(
            "Failed to delete selected branches: " +
              (error.message || "Unknown error")
          );
        },
      });
  };

  // 分頁切換
  const handleBranchPageChange = (newPage) => {
    setBranchPage(newPage);
  };

  // 搜尋欄變更
  const handleBranchSearchChange = (e) => {
    setBranchSearch(e.target.value);
    setBranchPage(1);
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
            branches={getPagedFilteredBranches()}
            selectedProject={selectedProject}
            selectedRepository={selectedRepository}
            loading={loading}
            error={error}
            onBackToRepositories={handleBackToRepositories}
            onDeleteBranch={handleDeleteBranch}
            branchSearch={branchSearch}
            onBranchSearchChange={handleBranchSearchChange}
            branchPage={branchPage}
            onBranchPageChange={handleBranchPageChange}
            totalBranches={getFilteredBranchesCount()}
            branchesPerPage={BRANCHES_PER_PAGE}
            selectedBranches={selectedBranches}
            onToggleBranch={handleToggleBranch}
            onToggleAllBranches={handleToggleAllBranches}
            onDeleteSelectedBranches={handleDeleteSelectedBranches}
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
