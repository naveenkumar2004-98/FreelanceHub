import React from 'react';
import { Box, Typography, Card, CardContent, Button } from '@mui/material';

const Jobs = () => {
  // In a real app, this would come from an API
  const jobs = [
    { id: 1, title: 'Website Development', description: 'Need a website for my business', budget: '$500' },
    { id: 2, title: 'Mobile App Design', description: 'Looking for UI/UX designer', budget: '$300' },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4">Available Jobs</Typography>
      <Box sx={{ mt: 3 }}>
        {jobs.map(job => (
          <Card key={job.id} sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6">{job.title}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {job.description}
              </Typography>
              <Typography variant="subtitle1" sx={{ mt: 1 }}>
                Budget: {job.budget}
              </Typography>
              <Button variant="contained" sx={{ mt: 2 }}>
                Apply
              </Button>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
};

export default Jobs;