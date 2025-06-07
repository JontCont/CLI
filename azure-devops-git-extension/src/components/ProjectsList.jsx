import React from 'react';
import {
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
  Box,
  CircularProgress
} from '@mui/material';

/**
 * Projects List Component
 * Displays a list of projects that can be clicked to view their repositories
 */
function ProjectsList({ projects, loading, error, onSelectProject }) {
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

  if (projects.length === 0) {
    return (
      <Typography sx={{ p: 2 }}>
        No projects found.
      </Typography>
    );
  }

  return (
    <>
      <Typography variant="h4" gutterBottom component="h1">
        Your Projects
      </Typography>
      
      <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
        {projects.map((project) => (
          <ListItem 
            key={project.id} 
            divider
            disablePadding
          >
            <ListItemButton 
              onClick={() => onSelectProject(project)}
              sx={{
                transition: 'all 0.2s',
                '&:hover': {
                  backgroundColor: 'rgba(25, 118, 210, 0.08)',
                },
                py: 1.5,
              }}
            >
              <ListItemText 
                primary={project.name} 
                secondary={`Last updated: ${new Date(project.lastUpdateTime).toLocaleDateString()}`}
                primaryTypographyProps={{ fontWeight: 'bold' }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </>
  );
}

export default ProjectsList;
