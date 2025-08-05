import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
} from '@mui/material';
import axios from 'axios';

const PostProject = ({ open, onClose, onProjectCreated }) => {
  const [project, setProject] = useState({
    title: '',
    description: '',
    budget: '',
    skillsRequired: '',
  });
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    setProject({ ...project, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Posting project:', project);
      const { data } = await axios.post(
        'http://localhost:5000/api/projects/create',
        project,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('Project created:', data.project);
      onProjectCreated(data.project);
      setProject({ title: '', description: '', budget: '', skillsRequired: '' });
      setError('');
      onClose();
    } catch (err) {
      console.error('Post project error:', err.response?.data);
      setError(err.response?.data?.message || 'Failed to create project');
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Create New Project</DialogTitle>
      <DialogContent>
        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}
        <TextField
          autoFocus
          margin="dense"
          name="title"
          label="Project Title"
          type="text"
          fullWidth
          variant="outlined"
          value={project.title}
          onChange={handleInputChange}
        />
        <TextField
          margin="dense"
          name="description"
          label="Description"
          type="text"
          fullWidth
          variant="outlined"
          multiline
          rows={4}
          value={project.description}
          onChange={handleInputChange}
        />
        <TextField
          margin="dense"
          name="budget"
          label="Budget ($)"
          type="number"
          fullWidth
          variant="outlined"
          value={project.budget}
          onChange={handleInputChange}
        />
        <TextField
          margin="dense"
          name="skillsRequired"
          label="Skills Required (comma-separated)"
          type="text"
          fullWidth
          variant="outlined"
          value={project.skillsRequired}
          onChange={handleInputChange}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          sx={{ background: 'linear-gradient(45deg, #6200ea, #018786)' }}
        >
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PostProject;