import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
  TextField,
  Card,
  CardContent,
  Switch,
  IconButton,
  Input,
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { motion } from 'framer-motion';
import WorkIcon from '@mui/icons-material/Work';
import axios from 'axios';

const EditProfile = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [skills, setSkills] = useState('');
  const [bio, setBio] = useState('');
  const [photo, setPhoto] = useState('');
  const [schooling, setSchooling] = useState('');
  const [degree, setDegree] = useState('');
  const [certification, setCertification] = useState('');
  const navigate = useNavigate();

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: { main: darkMode ? '#bb86fc' : '#6200ea' },
      secondary: { main: darkMode ? '#03dac6' : '#018786' },
      background: { default: darkMode ? '#121212' : '#f5f5f5', paper: darkMode ? '#1e1e1e' : '#ffffff' },
    },
    components: {
      MuiButton: {
        STYLEOverrides: {
          root: {
            borderRadius: 12,
            textTransform: 'none',
            fontWeight: 600,
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: darkMode
                ? '0 4px 12px rgba(187, 134, 252, 0.4)'
                : '0 4px 12px rgba(98, 0, 234, 0.4)',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            transition: 'transform 0.3s ease',
            '&:hover': {
              transform: 'scale(1.03)',
              boxShadow: darkMode
                ? '0 8px 24px rgba(187, 134, 252, 0.2)'
                : '0 8px 24px rgba(98, 0, 234, 0.2)',
            },
          },
        },
      },
    },
  });

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userType = localStorage.getItem('userType');

    if (!token || userType !== 'freelancer') {
      navigate('/login');
      return;
    }

    axios
      .get('http://localhost:5000/api/projects/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setSkills(res.data.skills?.join(', ') || '');
        setBio(res.data.bio || '');
        setPhoto(res.data.photo || '');
        setSchooling(res.data.schooling || '');
        setDegree(res.data.degree || '');
        setCertification(res.data.certification || '');
      })
      .catch((err) => {
        console.error('Fetch user error:', err.response?.data);
        alert('Error fetching profile: ' + (err.response?.data?.message || 'Server error'));
        navigate('/login');
      });
  }, [navigate]);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1 * 1024 * 1024) {
        alert('Photo must be under 1MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in again');
      navigate('/login');
      return;
    }
    const data = {
      skills: skills,
      bio: bio,
      photo: photo,
      schooling: schooling,
      degree: degree,
      certification: certification,
    };
    axios
      .put(
        'http://localhost:5000/api/projects/update-profile',
        data,
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
      )
      .then((res) => {
        alert('Profile updated successfully!');
        navigate('/freelancer-dashboard');
      })
      .catch((err) => {
        console.error('Update error:', err.response?.data);
        alert('Error: ' + (err.response?.data?.message || 'Failed to update profile'));
      });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    navigate('/login');
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="static" color="transparent" elevation={0} sx={{ py: 2 }}>
        <Toolbar>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => navigate('/')}
            sx={{ borderRadius: 8 }}
          >
            Home
          </Button>
          <Box sx={{ flexGrow: 1 }} />
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton sx={{ mr: 1 }}>
              <WorkIcon sx={{ color: theme.palette.primary.main, fontSize: 32 }} />
            </IconButton>
            <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.primary.main, mr: 2 }}>
              FreelanceHub
            </Typography>
            <Button color="secondary" onClick={handleLogout}>
              Logout
            </Button>
            <Switch
              checked={darkMode}
              onChange={() => setDarkMode(!darkMode)}
              sx={{ ml: 2 }}
              inputProps={{ 'aria-label': 'toggle dark mode' }}
            />
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="sm" sx={{ py: 4 }}>
        <motion.div variants={fadeIn} initial="hidden" animate="visible">
          <Card>
            <CardContent>
              <Typography variant="h4" sx={{ fontWeight: 600, mb: 3, textAlign: 'center' }}>
                Edit Profile
              </Typography>
              <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  sx={{ mb: 2 }}
                />
                {photo && (
                  <Box sx={{ mb: 2, textAlign: 'center' }}>
                    <img src={photo} alt="Preview" style={{ maxWidth: '100px', borderRadius: '8px' }} />
                  </Box>
                )}
                <TextField
                  label="Skills (comma-separated)"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  fullWidth
                  placeholder="e.g., Coding, Design"
                />
                <TextField
                  label="Bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  fullWidth
                  multiline
                  rows={4}
                  placeholder="Tell us about yourself"
                />
                <TextField
                  label="Schooling"
                  value={schooling}
                  onChange={(e) => setSchooling(e.target.value)}
                  fullWidth
                  placeholder="e.g., XYZ High School, 2015-2019"
                />
                <TextField
                  label="Degree"
                  value={degree}
                  onChange={(e) => setDegree(e.target.value)}
                  fullWidth
                  placeholder="e.g., B.Sc. Computer Science"
                />
                <TextField
                  label="Certification"
                  value={certification}
                  onChange={(e) => setCertification(e.target.value)}
                  fullWidth
                  placeholder="e.g., AWS Certified Developer"
                />
                <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={handleSave}
                    sx={{
                      background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    }}
                  >
                    Save
                  </Button>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => navigate('/freelancer-dashboard')}
                  >
                    Cancel
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </motion.div>
      </Container>
    </ThemeProvider>
  );
};

export default EditProfile;