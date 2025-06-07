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
  }  if (projects.length === 0) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="body1" gutterBottom>
          No projects found in your Azure DevOps account.
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Please make sure your access token has the appropriate permissions to view projects.
        </Typography>
        <Typography variant="body2" sx={{ mt: 4 }}>
          If you're having trouble with the API, you can use the links in the side menu to navigate between pages.
        </Typography>
      </Box>
    );
  }  return (
    <>
      <Typography variant="h4" gutterBottom component="h1">
        Your Projects
      </Typography>
      
      <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
        {projects
          .filter(project => {
            // 排除 Promise 物件和空值
            if (!project) return false;
            if (project instanceof Promise) return false;
            if (typeof project === 'object' && typeof project.then === 'function') return false;
            
            // 確保有 ID
            return !!project.id;
          })
          .map((project) => (
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
                primary={project.name || 'Unnamed Project'} 
                secondary={project.lastUpdateTime ? 
                  `Last updated: ${new Date(project.lastUpdateTime).toLocaleDateString()}` : 
                  'No update information available'}
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
