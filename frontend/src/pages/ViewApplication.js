import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Chip,
  CircularProgress,
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { motion } from 'framer-motion';
import axios from 'axios';

const ViewApplication = () => {
  const [application, setApplication] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const navigate = useNavigate();

  const theme = createTheme({
    palette: {
      mode: 'light',
      primary: { main: '#6200ea' },
      secondary: { main: '#018786' },
      background: { default: '#f5f5f5', paper: '#ffffff' },
    },
    typography: {
      h2: { fontWeight: 600, fontSize: '2.2rem' },
      h4: { fontWeight: 500, fontSize: '1.4rem' },
      body1: { fontSize: '1.1rem' },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            textTransform: 'none',
            fontWeight: 600,
            padding: '12px 24px',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: { borderRadius: 16 },
        },
      },
    },
  });

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`http://localhost:5000/api/projects/applications/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setApplication(res.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch application');
        setLoading(false);
      }
    };
    fetchApplication();
  }, [id]);

  if (loading) {
    return (
      <Container sx={{ textAlign: 'center', mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ textAlign: 'center', mt: 4 }}>
        <Typography color="error" variant="h6">{error}</Typography>
        <Button variant="contained" onClick={() => navigate('/employer-dashboard')} sx={{ mt: 2 }}>
          Back to Dashboard
        </Button>
      </Container>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="md" sx={{ py: 6 }}>
        <motion.div variants={fadeIn} initial="hidden" animate="visible">
          <Typography variant="h2" sx={{ mb: 4, textAlign: 'center' }}>
            Application Details
          </Typography>
          <Card>
            <CardContent>
              <Typography variant="h4" sx={{ mb: 2 }}>
                Project: {application.project?.title || 'Unknown'}
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                <strong>Description:</strong> {application.project?.description || 'No description provided'}
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                <strong>Budget:</strong> ${application.project?.budget || 0}
              </Typography>
              <Typography variant="h4" sx={{ mb: 2 }}>
                Freelancer: {application.freelancer?.username || 'Unknown'}
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                <strong>Bio:</strong> {application.freelancer?.bio || 'No bio provided'}
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                <strong>Schooling:</strong> {application.freelancer?.schooling || 'Not specified'}
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                <strong>Degree:</strong> {application.freelancer?.degree || 'Not specified'}
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                <strong>Certification:</strong> {application.freelancer?.certification || 'Not specified'}
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                <strong>Cover Letter:</strong> {application.coverLetter || 'No cover letter provided'}
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                <strong>Status:</strong> {application.status || 'N/A'}
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                <strong>Skills:</strong>
                {application.freelancer?.skills?.length ? (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                    {application.freelancer.skills.map((skill, index) => (
                      <Chip key={index} label={skill} color="primary" variant="outlined" />
                    ))}
                  </Box>
                ) : (
                  ' None'
                )}
              </Typography>
              <Button
                variant="contained"
                onClick={() => navigate('/employer-dashboard')}
                sx={{ mt: 2 }}
              >
                Back to Dashboard
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </Container>
    </ThemeProvider>
  );
};

export default ViewApplication;