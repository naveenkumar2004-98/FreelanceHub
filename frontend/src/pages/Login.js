import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Typography,
  Snackbar,
  Alert,
  Switch,
  Fade,
  Container,
  Paper,
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import axios from 'axios';
import { motion } from 'framer-motion';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('freelancer');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: darkMode ? '#bb86fc' : '#6200ea',
      },
      secondary: {
        main: darkMode ? '#03dac6' : '#018786',
      },
      background: {
        default: darkMode ? '#121212' : '#f5f5f5',
        paper: darkMode ? '#1e1e1e' : '#ffffff',
      },
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
      MuiSelect: {
        styleOverrides: {
          root: {
            borderRadius: 8,
          },
        },
      },
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setOpen(false);
    try {
      const endpoint = isLogin ? '/login' : '/register';
      const { data } = await axios.post(`http://localhost:5000/api/auth${endpoint}`, {
        username,
        password,
        userType,
      });

      localStorage.setItem('token', data.token);
      localStorage.setItem('userType', data.userType);

      if (data.userType === 'freelancer') {
        navigate('/freelancer-dashboard');
      } else if (data.userType === 'employer') {
        navigate('/employer-dashboard');
      } else {
        throw new Error('Invalid user type');
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        (typeof error.response?.data === 'string' ? error.response.data : 'An error occurred');
      setError(errorMessage);
      setOpen(true);
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container
        maxWidth="xs"
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
                {isLogin ? 'Welcome Back' : 'Join Us'}
              </Typography>
              <Switch
                checked={darkMode}
                onChange={() => setDarkMode(!darkMode)}
                inputProps={{ 'aria-label': 'toggle dark mode' }}
              />
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {isLogin ? 'Sign in to your account' : 'Create a new account'}
            </Typography>
            <form onSubmit={handleSubmit}>
              <Fade in={true} timeout={500}>
                <TextField
                  label="Username"
                  fullWidth
                  margin="normal"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  variant="outlined"
                  InputProps={{
                    sx: { background: theme.palette.background.default },
                  }}
                />
              </Fade>
              <Fade in={true} timeout={700}>
                <TextField
                  label="Password"
                  type="password"
                  fullWidth
                  margin="normal"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  variant="outlined"
                  InputProps={{
                    sx: { background: theme.palette.background.default },
                  }}
                />
              </Fade>
              <Fade in={true} timeout={900}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>User Type</InputLabel>
                  <Select
                    value={userType}
                    onChange={(e) => setUserType(e.target.value)}
                    required
                    sx={{ background: theme.palette.background.default }}
                  >
                    <MenuItem value="freelancer">Freelancer</MenuItem>
                    <MenuItem value="employer">Employer</MenuItem>
                  </Select>
                </FormControl>
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
                    color: '#fff',
                  }}
                >
                  {isLogin ? 'Login' : 'Register'}
                </Button>
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <Button
                  fullWidth
                  sx={{ mt: 2, color: theme.palette.primary.main }}
                  onClick={() => setIsLogin(!isLogin)}
                >
                  {isLogin ? 'Need an account? Register' : 'Already have an account? Login'}
                </Button>
              </motion.div>
            </form>
            <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
              <Alert onClose={handleClose} severity="error" sx={{ width: '100%' }}>
                {error}
              </Alert>
            </Snackbar>
          </Paper>
        </motion.div>
      </Container>
    </ThemeProvider>
  );
};

export default Login;