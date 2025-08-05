import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Card, CardContent, Button, 
  TextField, Avatar, Chip, Rating, Select, 
  MenuItem, FormControl, InputLabel 
} from '@mui/material';
import axios from 'axios';

const FindFreelancers = () => {
  const [freelancers, setFreelancers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFreelancers = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/freelancers');
        setFreelancers(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching freelancers:', error);
        setLoading(false);
      }
    };
    fetchFreelancers();
  }, []);

  const filteredFreelancers = freelancers.filter(freelancer => {
    const matchesSearch = freelancer.profile.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         freelancer.profile.skills.some(skill => 
                           skill.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = filter === 'all' || 
                         freelancer.profile.skills.some(skill => 
                           skill.toLowerCase().includes(filter.toLowerCase()));
    return matchesSearch && matchesFilter;
  });

  if (loading) return <Typography>Loading freelancers...</Typography>;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Find Freelancers</Typography>
      
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          label="Search Freelancers"
          fullWidth
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Filter by Skill</InputLabel>
          <Select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            label="Filter by Skill"
          >
            <MenuItem value="all">All Skills</MenuItem>
            <MenuItem value="react">React</MenuItem>
            <MenuItem value="node">Node.js</MenuItem>
            <MenuItem value="design">Design</MenuItem>
            <MenuItem value="writing">Writing</MenuItem>
            <MenuItem value="marketing">Marketing</MenuItem>
          </Select>
        </FormControl>
      </Box>
      
      <Box sx={{ mt: 2 }}>
        {filteredFreelancers.length === 0 ? (
          <Typography>No freelancers found matching your criteria</Typography>
        ) : (
          filteredFreelancers.map(freelancer => (
            <Card key={freelancer._id} sx={{ mb: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ width: 56, height: 56 }}>
                    {freelancer.profile.name.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="h5">{freelancer.profile.name}</Typography>
                    <Rating value={freelancer.profile.rating} precision={0.5} readOnly />
                  </Box>
                </Box>
                
                <Typography sx={{ mt: 2 }}>{freelancer.profile.bio}</Typography>
                
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle1">Skills:</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                    {freelancer.profile.skills.map((skill, index) => (
                      <Chip key={index} label={skill} />
                    ))}
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                  <Button 
                    variant="contained"
                    onClick={() => {/* Handle hire action */}}
                  >
                    Hire
                  </Button>
                </Box>
              </CardContent>
            </Card>
          ))
        )}
      </Box>
    </Box>
  );
};

export default FindFreelancers;