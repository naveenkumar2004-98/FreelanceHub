import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
  Grid,
  Card,
  CardContent,
  Switch,
  IconButton,
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { motion } from 'framer-motion';
import WorkIcon from '@mui/icons-material/Work'; // Placeholder logo

const Home = () => {
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();

  // Theme matching Login.js
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

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {/* Navbar */}
      <AppBar position="static" color="transparent" elevation={0} sx={{ py: 2 }}>
        <Toolbar>
          {/* Top-Left: Login Button */}
          <Button
            variant="outlined"
            color="primary"
            onClick={() => navigate('/login')}
            sx={{ borderRadius: 8 }}
          >
            Login
          </Button>
          <Box sx={{ flexGrow: 1 }} />
          {/* Top-Right: Logo + Website Name */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton sx={{ mr: 1 }}>
              <WorkIcon sx={{ color: theme.palette.primary.main, fontSize: 32 }} />
            </IconButton>
            <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
              FreelanceHub
            </Typography>
          </Box>
          <Switch
            checked={darkMode}
            onChange={() => setDarkMode(!darkMode)}
            sx={{ ml: 2 }}
            inputProps={{ 'aria-label': 'toggle dark mode' }}
          />
        </Toolbar>
      </AppBar>

      {/* Hero Section */}
      <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
        <motion.div variants={fadeIn} initial="hidden" animate="visible">
          <Typography
            variant="h2"
            sx={{ fontWeight: 800, color: theme.palette.text.primary, mb: 2 }}
          >
            Connect. Create. Succeed.
          </Typography>
          <Typography variant="h5" color="text.secondary" sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
            Join FreelanceHub to find top talent or showcase your skills. Your next big project starts here.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/login')}
              sx={{
                py: 1.5,
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              }}
            >
              Hire a Freelancer
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/login')}
              sx={{ py: 1.5, borderRadius: 12 }}
            >
              Become a Freelancer
            </Button>
          </Box>
        </motion.div>
      </Container>

      {/* Features Section */}
      <Box sx={{ py: 8, background: theme.palette.background.default }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            sx={{ textAlign: 'center', fontWeight: 700, mb: 6, color: theme.palette.text.primary }}
          >
            Why Choose FreelanceHub?
          </Typography>
          <Grid container spacing={4}>
            {[
              {
                title: 'Find Top Talent',
                desc: 'Browse skilled freelancers for any project, from design to development.',
              },
              {
                title: 'Secure Payments',
                desc: 'Escrow protection ensures your funds are safe until work is delivered.',
              },
              {
                title: 'Flexible Work',
                desc: 'Freelancers set your own hours and choose projects that excite you.',
              },
            ].map((feature, index) => (
              <Grid item xs={12} sm={4} key={index}>
                <motion.div variants={fadeIn} initial="hidden" animate="visible" transition={{ delay: index * 0.2 }}>
                  <Card>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                        {feature.title}
                      </Typography>
                      <Typography color="text.secondary">{feature.desc}</Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Testimonials Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography
          variant="h3"
          sx={{ textAlign: 'center', fontWeight: 700, mb: 6, color: theme.palette.text.primary }}
        >
          What Our Users Say
        </Typography>
        <Grid container spacing={4}>
          {[
            {
              name: 'Sarah K.',
              role: 'Employer',
              text: 'Hired an amazing designer in days. FreelanceHub made it so easy!',
            },
            {
              name: 'Mike T.',
              role: 'Freelancer',
              text: 'I love the flexibility and the variety of projects I get to work on.',
            },
          ].map((testimonial, index) => (
            <Grid item xs={12} sm={6} key={index}>
              <motion.div variants={fadeIn} initial="hidden" animate="visible" transition={{ delay: index * 0.3 }}>
                <Card>
                  <CardContent>
                    <Typography variant="body1" sx={{ mb: 2, fontStyle: 'italic' }}>
                      "{testimonial.text}"
                    </Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {testimonial.name}
                    </Typography>
                    <Typography color="text.secondary">{testimonial.role}</Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Footer */}
      <Box sx={{ py: 4, background: theme.palette.primary.main, color: '#fff', textAlign: 'center' }}>
        <Container maxWidth="lg">
          <Typography variant="body2" sx={{ mb: 2 }}>
            © 2025 FreelanceHub. All rights reserved.
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button color="inherit" sx={{ textTransform: 'none' }}>
              About
            </Button>
            <Button color="inherit" sx={{ textTransform: 'none' }}>
              Contact
            </Button>
            <Button color="inherit" sx={{ textTransform: 'none' }}>
              Terms
            </Button>
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default Home;