import React from 'react';
import { Box, Typography, TextField, Button } from '@mui/material';

const Profile = () => {
  const userType = localStorage.getItem('userType');
  
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4">My Profile</Typography>
      <Box component="form" sx={{ mt: 3 }}>
        <TextField
          label="Full Name"
          fullWidth
          margin="normal"
        />
        <TextField
          label="Bio"
          fullWidth
          multiline
          rows={4}
          margin="normal"
        />
        {userType === 'freelancer' && (
          <TextField
            label="Skills (comma separated)"
            fullWidth
            margin="normal"
          />
        )}
        <Button variant="contained" sx={{ mt: 2 }}>
          Save Profile
        </Button>
      </Box>
    </Box>
  );
};

export default Profile;