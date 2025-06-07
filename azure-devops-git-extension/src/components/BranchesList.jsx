import React, { useState } from 'react';
import {
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Typography,
  Box,
  CircularProgress,
  Breadcrumbs,
  Link,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Chip,
  Alert
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import DeleteIcon from '@mui/icons-material/Delete';
import CodeIcon from '@mui/icons-material/Code';

/**
 * Branches List Component
 * Displays a list of branches for a selected repository with checkboxes and delete buttons
 */
function BranchesList({ 
  branches, 
  selectedProject, 
  selectedRepository, 
  loading, 
  error, 
  onBackToRepositories,
  onDeleteBranch
}) {
  const [selectedBranches, setSelectedBranches] = useState([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [branchToDelete, setBranchToDelete] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  
  // Toggle branch selection
  const handleToggleBranch = (branch) => {
    setSelectedBranches(prev => {
      // Check if this branch is already selected
      const isSelected = prev.some(b => b.name === branch.name);
      
      if (isSelected) {
        // Remove from selection
        return prev.filter(b => b.name !== branch.name);
      } else {
        // Add to selection
        return [...prev, branch];
      }
    });
  };
  
  // Open delete confirmation dialog
  const handleOpenDeleteDialog = (branch) => {
    setBranchToDelete(branch);
    setIsDeleteDialogOpen(true);
  };
  
  // Close delete dialog
  const handleCloseDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setBranchToDelete(null);
  };
  
  // Confirm branch deletion
  const handleConfirmDelete = () => {
    if (branchToDelete) {
      onDeleteBranch(branchToDelete)
        .then(() => {
          // Clear any previous errors
          setDeleteError(null);
          handleCloseDeleteDialog();
        })
        .catch(error => {
          setDeleteError(error.message || 'Failed to delete branch');
        });
    }
  };
  
  // Normalize branch name for display
  const normalizeBranchName = (name) => {
    return name.replace('refs/heads/', '');
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
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
    <>
      {/* Breadcrumbs navigation */}
      <Breadcrumbs 
        separator={<NavigateNextIcon fontSize="small" />} 
        aria-label="navigation breadcrumb"
        sx={{ mb: 3 }}
      >
        <Link 
          color="inherit" 
          href="#" 
          onClick={(e) => {
            e.preventDefault();
            onBackToRepositories();
          }}
          sx={{ display: 'flex', alignItems: 'center' }}
        >
          {selectedProject.name}
        </Link>
        <Typography color="text.primary">{selectedRepository.name}</Typography>
      </Breadcrumbs>

      <Typography variant="h4" gutterBottom component="h1">
        Branches in {selectedRepository.name}
      </Typography>
      
      {deleteError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {deleteError}
        </Alert>
      )}
      
      {branches.length === 0 ? (
        <Typography sx={{ p: 2 }}>
          No branches found in this repository.
        </Typography>
      ) : (
        <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
          {branches.map((branch) => (
            <ListItem 
              key={branch.name} 
              divider
              secondaryAction={
                <IconButton 
                  edge="end" 
                  aria-label="delete"
                  onClick={() => handleOpenDeleteDialog(branch)}
                  // Disable delete for default branch
                  disabled={branch.name === selectedRepository.defaultBranch}
                >
                  <DeleteIcon />
                </IconButton>
              }
            >
              <ListItemIcon>
                <Checkbox
                  edge="start"
                  checked={selectedBranches.some(b => b.name === branch.name)}
                  onChange={() => handleToggleBranch(branch)}
                  // Disable checkbox for default branch
                  disabled={branch.name === selectedRepository.defaultBranch}
                />
              </ListItemIcon>
              <ListItemIcon>
                <CodeIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {normalizeBranchName(branch.name)}
                    {branch.name === selectedRepository.defaultBranch && (
                      <Chip 
                        label="Default" 
                        size="small" 
                        color="primary" 
                        variant="outlined" 
                        sx={{ ml: 1 }} 
                      />
                    )}
                  </Box>
                }
                secondary={`Last commit: ${branch.creator ? branch.creator.displayName : 'Unknown'}`}
                primaryTypographyProps={{ fontWeight: 'bold' }}
              />
            </ListItem>
          ))}
        </List>
      )}
      
      {/* Delete confirmation dialog */}
      <Dialog
        open={isDeleteDialogOpen}
        onClose={handleCloseDeleteDialog}
      >
        <DialogTitle>Confirm Branch Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the branch "{branchToDelete ? normalizeBranchName(branchToDelete.name) : ''}"? 
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default BranchesList;
