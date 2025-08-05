import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
  Chip,
  CircularProgress,
  Snackbar,
  Alert,
  IconButton,
  TextField,
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { motion } from 'framer-motion';
import PaymentIcon from '@mui/icons-material/Payment';
import StarIcon from '@mui/icons-material/Star';
import axios from 'axios';
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

const ProjectApplications = () => {
  const [project, setProject] = useState(null);
  const [applications, setApplications] = useState([]);
  const [error, setError] = useState('');
  const [severity, setSeverity] = useState('error');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [loading, setLoading] = useState(true);
  const [ratings, setRatings] = useState({});
  const [feedback, setFeedback] = useState({});
  const { projectId } = useParams();
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
          root: {
            borderRadius: 16,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
            transition: 'transform 0.3s ease',
            '&:hover': { transform: 'scale(1.02)' },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            fontWeight: 500,
            background: 'linear-gradient(45deg, #6200ea33, #01878633)',
            margin: '4px',
          },
        },
      },
    },
  });

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const fetchData = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');
      const res = await axios.get(`http://localhost:5000/api/projects/${projectId}/applications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProject(res.data.project);
      setApplications(res.data.applications);
      setLoading(false);
    } catch (err) {
      console.error('Fetch error:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Failed to fetch project applications');
      setSeverity('error');
      setOpenSnackbar(true);
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchData();

    socket.on('payment_updated', ({ project: updatedProject }) => {
      if (updatedProject._id === projectId) {
        setProject((prev) => ({ ...prev, paymentStatus: updatedProject.paymentStatus }));
        setApplications((prev) =>
          prev.map((app) =>
            app.project._id === updatedProject._id ? { ...app, paymentStatus: updatedProject.paymentStatus } : app
          )
        );
        fetchData(); // Re-fetch to ensure state sync
      }
    });

    socket.on('rating_updated', ({ applicationId, rating }) => {
      setApplications((prev) =>
        prev.map((app) => (app._id === applicationId ? { ...app, rating } : app))
      );
      fetchData(); // Re-fetch to ensure state sync
    });

    socket.on('feedback_updated', ({ applicationId, feedback }) => {
      setApplications((prev) =>
        prev.map((app) => (app._id === applicationId ? { ...app, feedback } : app))
      );
      fetchData(); // Re-fetch to ensure state sync
    });

    return () => {
      socket.off('payment_updated');
      socket.off('rating_updated');
      socket.off('feedback_updated');
    };
  }, [fetchData, projectId]);

  const handleAssign = useCallback(async (freelancerId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:5000/api/projects/assign-project',
        { projectId, freelancerId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProject((prev) => ({
        ...prev,
        status: 'assigned',
        assignedTo: freelancerId,
      }));
      setApplications((prev) =>
        prev.map((app) =>
          app.project._id === projectId
            ? { ...app, status: app.freelancer._id === freelancerId ? 'accepted' : 'rejected' }
            : app
        )
      );
      setError('Project assigned successfully!');
      setSeverity('success');
      setOpenSnackbar(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign project');
      setSeverity('error');
      setOpenSnackbar(true);
    }
  }, [projectId]);

  const handleRejectApplication = useCallback(async (applicationId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:5000/api/projects/applications/${applicationId}/reject`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setApplications((prev) =>
        prev.map((app) => (app._id === applicationId ? { ...app, status: 'rejected' } : app))
      );
      setError('Application rejected successfully!');
      setSeverity('success');
      setOpenSnackbar(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reject application');
      setSeverity('error');
      setOpenSnackbar(true);
    }
  }, []);

  const handlePay = useCallback(async (applicationId, freelancerId, amount) => {
    if (!window.confirm(`Confirm payment of $${amount} to freelancer?`)) return;
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:5000/api/projects/payment/pay',
        { projectId, freelancerId, amount },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setApplications((prev) =>
        prev.map((app) =>
          app._id === applicationId ? { ...app, paymentStatus: 'paid' } : app
        )
      );
      setProject((prev) => ({ ...prev, paymentStatus: 'paid' }));
      setError('Payment sent successfully!');
      setSeverity('success');
      setOpenSnackbar(true);
      socket.emit('payment_updated', { project: { _id: projectId, paymentStatus: 'paid' } });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to process payment');
      setSeverity('error');
      setOpenSnackbar(true);
    }
  }, [projectId]);

  const handleRating = useCallback((applicationId, rating) => {
    setRatings((prev) => ({ ...prev, [applicationId]: rating }));
    const token = localStorage.getItem('token');
    axios
      .post(
        `http://localhost:5000/api/projects/applications/${applicationId}/rate`,
        { rating },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(() => {
        setError('Rating submitted successfully!');
        setSeverity('success');
        setOpenSnackbar(true);
        setApplications((prev) =>
          prev.map((app) =>
            app._id === applicationId ? { ...app, rating } : app
          )
        );
        socket.emit('rating_updated', { applicationId, rating });
      })
      .catch((err) => {
        setError(err.response?.data?.message || 'Failed to submit rating');
        setSeverity('error');
        setOpenSnackbar(true);
      });
  }, []);

  const handleFeedback = useCallback((applicationId, text) => {
    setFeedback((prev) => ({ ...prev, [applicationId]: text }));
    const token = localStorage.getItem('token');
    axios
      .post(
        `http://localhost:5000/api/projects/applications/${applicationId}/feedback`,
        { feedback: text },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(() => {
        setError('Feedback submitted successfully!');
        setSeverity('success');
        setOpenSnackbar(true);
        setApplications((prev) =>
          prev.map((app) =>
            app._id === applicationId ? { ...app, feedback: text } : app
          )
        );
        socket.emit('feedback_updated', { applicationId, feedback: text });
      })
      .catch((err) => {
        setError(err.response?.data?.message || 'Failed to submit feedback');
        setSeverity('error');
        setOpenSnackbar(true);
      });
  }, []);

  const handleSnackbarClose = useCallback(() => {
    setOpenSnackbar(false);
  }, []);

  if (loading) {
    return (
      <Container sx={{ textAlign: 'center', mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error && !project) {
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
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <motion.div variants={fadeIn} initial="hidden" animate="visible">
          <Typography variant="h2" sx={{ mb: 4, textAlign: 'center' }}>
            Applications for {project?.title || 'Project'}
          </Typography>
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h4" sx={{ mb: 2 }}>
                Project Details
              </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Title:</strong> {project?.title || 'N/A'}
              </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Description:</strong> {project?.description || 'No description provided'}
              </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Budget:</strong> ${project?.budget || 0}
              </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Status:</strong> {project?.status || 'N/A'}
              </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Skills Required:</strong>
                {project?.skillsRequired?.length ? (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                    {project.skillsRequired.map((skill, index) => (
                      <Chip key={index} label={skill} color="primary" variant="outlined" />
                    ))}
                  </Box>
                ) : (
                  ' None'
                )}
              </Typography>
            </CardContent>
          </Card>
          <Card>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Freelancer</TableCell>
                  <TableCell>Skills</TableCell>
                  <TableCell>Rating</TableCell>
                  <TableCell>Feedback</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {applications.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} sx={{ textAlign: 'center' }}>
                      No applications found.
                    </TableCell>
                  </TableRow>
                ) : (
                  applications.map((app) => (
                    <TableRow key={app._id}>
                      <TableCell>{app.freelancer?.username || 'Unknown'}</TableCell>
                      <TableCell>
                        {app.freelancer?.skills?.length ? (
                          app.freelancer.skills.map((skill, index) => (
                            <Chip key={index} label={skill} size="small" variant="outlined" sx={{ mr: 0.5, mb: 0.5 }} />
                          ))
                        ) : (
                          'None'
                        )}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <IconButton
                              key={star}
                              size="small"
                              onClick={() => handleRating(app._id, star)}
                              sx={{ color: (ratings[app._id] || app.rating) >= star ? 'gold' : 'gray' }}
                              disabled={app.paymentStatus !== 'paid' || app.rating}
                            >
                              <StarIcon fontSize="small" />
                            </IconButton>
                          ))}
                          <Typography variant="body2" sx={{ ml: 1 }}>
                            ({(ratings[app._id] || app.rating || 0)}/5)
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <TextField
                          fullWidth
                          size="small"
                          placeholder="Leave feedback..."
                          value={feedback[app._id] || app.feedback || ''}
                          onChange={(e) => setFeedback((prev) => ({ ...prev, [app._id]: e.target.value }))}
                          onBlur={(e) => handleFeedback(app._id, e.target.value)}
                          multiline
                          rows={2}
                          disabled={app.paymentStatus !== 'paid' || app.feedback}
                        />
                      </TableCell>
                      <TableCell>{app.status || 'N/A'}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          {app.status === 'pending' && (
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Button
                                variant="contained"
                                size="small"
                                sx={{ background: theme.palette.secondary.main }}
                                onClick={() => handleAssign(app.freelancer._id)}
                              >
                                Assign
                              </Button>
                              <Button
                                variant="outlined"
                                size="small"
                                color="error"
                                onClick={() => handleRejectApplication(app._id)}
                              >
                                Reject
                              </Button>
                            </Box>
                          )}
                          {app.status === 'accepted' && (
                            <Button
                              variant="contained"
                              startIcon={<PaymentIcon />}
                              onClick={() => handlePay(app._id, app.freelancer._id, project.budget)}
                              size="small"
                              disabled={app.paymentStatus === 'paid'}
                              sx={{ background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})` }}
                            >
                              {app.paymentStatus === 'paid' ? 'Paid' : 'Pay'}
                            </Button>
                          )}
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => navigate(`/application/${app._id}`)}
                          >
                            View Application
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
          <Button
            variant="contained"
            onClick={() => navigate('/employer-dashboard')}
            sx={{ mt: 4, display: 'block', mx: 'auto' }}
          >
            Back to Dashboard
          </Button>
        </motion.div>
        <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleSnackbarClose}>
          <Alert onClose={handleSnackbarClose} severity={severity} sx={{ width: '100%' }}>
            {error}
          </Alert>
        </Snackbar>
      </Container>
    </ThemeProvider>
  );
};

export default ProjectApplications;