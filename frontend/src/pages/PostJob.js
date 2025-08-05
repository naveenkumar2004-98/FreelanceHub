import React, { useState } from 'react';
import { 
  Box, Typography, TextField, Button, 
  Select, MenuItem, FormControl, InputLabel 
} from '@mui/material';
import axios from 'axios';

const PostJob = () => {
  const [job, setJob] = useState({
    title: '',
    description: '',
    category: 'web',
    budget: '',
    deadline: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/jobs', job, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      alert('Job posted successfully!');
      setJob({
        title: '',
        description: '',
        category: 'web',
        budget: '',
        deadline: ''
      });
    } catch (error) {
      console.error('Error posting job:', error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Post a New Job</Typography>
      
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
        <TextField
          label="Job Title"
          fullWidth
          margin="normal"
          value={job.title}
          onChange={(e) => setJob({ ...job, title: e.target.value })}
          required
        />
        
        <TextField
          label="Description"
          fullWidth
          multiline
          rows={6}
          margin="normal"
          value={job.description}
          onChange={(e) => setJob({ ...job, description: e.target.value })}
          required
        />
        
        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          <FormControl fullWidth>
            <InputLabel>Category</InputLabel>
            <Select
              value={job.category}
              onChange={(e) => setJob({ ...job, category: e.target.value })}
              label="Category"
              required
            >
              <MenuItem value="web">Web Development</MenuItem>
              <MenuItem value="mobile">Mobile Development</MenuItem>
              <MenuItem value="design">Design</MenuItem>
              <MenuItem value="writing">Writing</MenuItem>
              <MenuItem value="marketing">Marketing</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </Select>
          </FormControl>
          
          <TextField
            label="Budget (₹)"
            fullWidth
            margin="normal"
            type="number"
            value={job.budget}
            onChange={(e) => setJob({ ...job, budget: e.target.value })}
            required
          />
        </Box>
        
        <TextField
          label="Deadline"
          fullWidth
          margin="normal"
          type="date"
          InputLabelProps={{ shrink: true }}
          value={job.deadline}
          onChange={(e) => setJob({ ...job, deadline: e.target.value })}
          required
        />
        
        <Button type="submit" variant="contained" sx={{ mt: 3 }}>
          Post Job
        </Button>
      </Box>
    </Box>
  );
};

export default PostJob;