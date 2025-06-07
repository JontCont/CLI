import React from 'react';
import {
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
  Box,
  CircularProgress,
  Breadcrumbs,
  Link
} from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

/**
 * Repositories List Component
 * Displays a list of repositories for a selected project
 */
function RepositoriesList({ 
  repositories, 
  selectedProject, 
  loading, 
  error, 
  onSelectRepository,
  onBackToProjects 
}) {
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
            onBackToProjects();
          }}
          sx={{ display: 'flex', alignItems: 'center' }}
        >
          Projects
        </Link>
        <Typography color="text.primary">{selectedProject.name}</Typography>
      </Breadcrumbs>

      <Typography variant="h4" gutterBottom component="h1">
        Repositories in {selectedProject.name}
      </Typography>
      
      {repositories.length === 0 ? (
        <Typography sx={{ p: 2 }}>
          No repositories found in this project.
        </Typography>
      ) : (
        <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
          {repositories.map((repo) => (
            <ListItem 
              key={repo.id} 
              divider
              disablePadding
            >
              <ListItemButton 
                onClick={() => onSelectRepository(repo)}
                sx={{
                  transition: 'all 0.2s',
                  '&:hover': {
                    backgroundColor: 'rgba(25, 118, 210, 0.08)',
                  },
                  py: 1.5,
                }}
              >
                <FolderIcon color="primary" sx={{ mr: 2 }} />
                <ListItemText 
                  primary={repo.name} 
                  secondary={`Last updated: ${repo.project ? new Date(repo.project.lastUpdateTime).toLocaleDateString() : 'Unknown'}`}
                  primaryTypographyProps={{ fontWeight: 'bold' }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      )}
    </>
  );
}

export default RepositoriesList;
