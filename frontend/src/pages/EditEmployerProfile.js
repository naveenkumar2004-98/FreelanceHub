
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TextField,
  Button,
  Container,
  Typography,
  Box,
  Switch,
  Fade,
  Paper,
  Snackbar,
  Alert,
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import axios from 'axios';
import { motion } from 'framer-motion';

const EditEmployerProfile = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    bio: '',
    company: '',
  });
  const [error, setError] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
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
        styleOverrides: {
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
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 8,
              transition: 'all 0.3s ease',
              '&:hover fieldset': {
                borderColor: darkMode ? '#bb86fc' : '#6200ea',
              },
            },
          },
        },
      },
    },
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userType = localStorage.getItem('userType');

    if (!token || userType !== 'employer') {
      navigate('/login');
      return;
    }

    axios
      .get('http://localhost:5000/api/projects/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setUser(res.data);
        setFormData({
          bio: res.data.bio || '',
          company: res.data.company || '',
        });
      })
      .catch((err) => {
        setError(err.response?.data?.message || 'Failed to fetch user data');
        setOpenSnackbar(true);
        navigate('/login');
      });
  }, [navigate]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        'http://localhost:5000/api/projects/update-profile',
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOpenSnackbar(true);
      setError('Profile updated successfully!');
      setTimeout(() => navigate('/employer-dashboard'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
      setOpenSnackbar(true);
    }
  };

  const handleSnackbarClose = () => {
    setOpenSnackbar(false);
  };

  if (!user) {
    return null;
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container
        maxWidth="sm"
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Paper
            elevation={6}
            sx={{
              p: 4,
              borderRadius: 3,
              background: theme.palette.background.paper,
              boxShadow: darkMode
                ? '0 8px 32px rgba(187, 134, 252, 0.2)'
                : '0 8px 32px rgba(98, 0, 234, 0.1)',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
                Edit Employer Profile
              </Typography>
              <Switch
                checked={darkMode}
                onChange={() => setDarkMode(!darkMode)}
                inputProps={{ 'aria-label': 'toggle dark mode' }}
              />
            </Box>
            <form onSubmit={handleSubmit}>
              <Fade in={true} timeout={500}>
                <TextField
                  label="Bio"
                  name="bio"
                  fullWidth
                  margin="normal"
                  value={formData.bio}
                  onChange={handleInputChange}
                  variant="outlined"
                  multiline
                  rows={4}
                />
              </Fade>
              <Fade in={true} timeout={700}>
                <TextField
                  label="Company"
                  name="company"
                  fullWidth
                  margin="normal"
                  value={formData.company}
                  onChange={handleInputChange}
                  variant="outlined"
                />
              </Fade>
              <motion.div
                initial={{ scale: 0.9 }}
                whileHover={{ scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  sx={{
                    mt: 3,
                    py: 1.5,
                    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  }}
                >
                  Save Profile
                </Button>
              </motion.div>
              <Button
                fullWidth
                sx={{ mt: 2, color: theme.palette.primary.main }}
                onClick={() => navigate('/employer-dashboard')}
              >
                Cancel
              </Button>
            </form>
            <Snackbar
              open={openSnackbar}
              autoHideDuration={6000}
              onClose={handleSnackbarClose}
            >
              <Alert
                onClose={handleSnackbarClose}
                severity={error.includes('successfully') ? 'success' : 'error'}
                sx={{ width: '100%' }}
              >
                {error}
              </Alert>
            </Snackbar>
          </Paper>
        </motion.div>
      </Container>
    </ThemeProvider>
  );
};

export default EditEmployerProfile;