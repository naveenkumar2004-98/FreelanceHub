import React, { useState } from 'react';
import {
  TextField,
  Button,
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  Slider,
} from '@mui/material';
import axios from 'axios';

const SearchFreelancers = ({ darkMode }) => {
  const [searchParams, setSearchParams] = useState({
    name: '',
    minRating: 0,
    skills: '',
  });
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    setSearchParams({ ...searchParams, [e.target.name]: e.target.value });
  };

  const handleSliderChange = (event, newValue) => {
    setSearchParams({ ...searchParams, minRating: newValue });
  };

  const handleSearch = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get('http://localhost:5000/api/projects/freelancers/search', {
        headers: { Authorization: `Bearer ${token}` },
        params: searchParams,
      });
      setResults(data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to search freelancers');
      setResults([]);
    }
  };

  return (
    <Box sx={{ mt: 8 }}>
      <Typography
        variant="h2"
        sx={{ fontWeight: 600, mb: 4, textAlign: 'center', color: darkMode ? '#fff' : '#000' }}
      >
        Find Freelancers
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 4, justifyContent: 'center' }}>
        <TextField
          label="Name"
          name="name"
          value={searchParams.name}
          onChange={handleInputChange}
          variant="outlined"
          sx={{ width: { xs: '100%', sm: 200 } }}
        />
        <Box sx={{ width: { xs: '100%', sm: 200 }, px: 2 }}>
          <Typography gutterBottom>Min Rating: {searchParams.minRating}</Typography>
          <Slider
            value={searchParams.minRating}
            onChange={handleSliderChange}
            min={0}
            max={5}
            step={0.5}
            valueLabelDisplay="auto"
          />
        </Box>
        <TextField
          label="Skills (comma-separated)"
          name="skills"
          value={searchParams.skills}
          onChange={handleInputChange}
          variant="outlined"
          sx={{ width: { xs: '100%', sm: 200 } }}
        />
        <Button
          variant="contained"
          onClick={handleSearch}
          sx={{
            height: 'fit-content',
            alignSelf: 'center',
            background: `linear-gradient(45deg, ${darkMode ? '#bb86fc' : '#6200ea'}, ${
              darkMode ? '#03dac6' : '#018786'
            })`,
          }}
        >
          Search
        </Button>
      </Box>
      {error && (
        <Typography color="error" sx={{ textAlign: 'center', mb: 2 }}>
          {error}
        </Typography>
      )}
      <Grid container spacing={3}>
        {results.map((freelancer) => (
          <Grid item xs={12} sm={6} md={4} key={freelancer._id}>
            <Card>
              <CardContent>
                <Typography variant="h4" sx={{ fontWeight: 600 }}>
                  {freelancer.username}
                </Typography>
                <Typography color="text.secondary" sx={{ mb: 1 }}>
                  Rating: {freelancer.ratings || 'N/A'}
                </Typography>
                <Typography color="text.secondary" sx={{ mb: 2 }}>
                  Bio: {freelancer.bio || 'No bio'}
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {freelancer.skills?.map((skill, index) => (
                    <Chip key={index} label={skill} color="primary" variant="outlined" />
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default SearchFreelancers;