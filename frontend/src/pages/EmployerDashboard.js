import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Switch,
  IconButton,
  Chip,
  Avatar,
  Snackbar,
  Alert,
  List,
  ListItem,
  ListItemText,
  TextField,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { motion, AnimatePresence } from 'framer-motion';
import WorkIcon from '@mui/icons-material/Work';
import DeleteIcon from '@mui/icons-material/Delete';
import ChatIcon from '@mui/icons-material/Chat';
import SendIcon from '@mui/icons-material/Send';
import PaymentIcon from '@mui/icons-material/Payment';
import StarIcon from '@mui/icons-material/Star';
import axios from 'axios';
import io from 'socket.io-client';
import PostProject from '../components/PostProject';
import SearchFreelancers from '../components/SearchFreelancers';

const socket = io('http://localhost:5000');

const ChatWindow = ({ user, project, acceptedApplications, onProjectChange }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!project?._id || !user?._id) return;

    socket.emit('join_project', project._id);

    const fetchMessages = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/projects/messages/${project._id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setMessages(res.data.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)));
      } catch (err) {
        console.error('Messages fetch error:', err.response?.data || err.message);
      }
    };

    fetchMessages();

    socket.on('receive_message', (newMessage) => {
      if (newMessage.project === project._id) {
        setMessages((prev) => {
          if (prev.some((msg) => msg._id === newMessage._id)) return prev;
          return [...prev, newMessage].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        });
      }
    });

    return () => {
      socket.off('receive_message');
    };
  }, [project?._id, user?._id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (message.trim() && project?._id && user?._id) {
      socket.emit('send_message', {
        projectId: project._id,
        senderId: user._id,
        message,
      });
      setMessage('');
    }
  };

  if (!project || !user) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={{
            hidden: { x: '100%' },
            visible: { x: 0, transition: { type: 'spring', stiffness: 100, damping: 20 } },
          }}
          initial="hidden"
          animate="visible"
          exit={{ x: '100%' }}
          style={{ position: 'fixed', bottom: 16, right: 16, width: 350, maxHeight: '70vh', zIndex: 1000 }}
        >
          <Paper elevation={6} sx={{ borderRadius: 3, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ bgcolor: 'primary.main', color: 'white', p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel sx={{ color: 'white' }}>Project</InputLabel>
                <Select
                  value={project._id}
                  onChange={(e) => {
                    const selectedApp = acceptedApplications.find((app) => app.project._id === e.target.value);
                    onProjectChange(selectedApp?.project || null);
                  }}
                  sx={{ color: 'white', '& .MuiSvgIcon-root': { color: 'white' } }}
                  label="Project"
                >
                  {acceptedApplications.map((app) => (
                    <MenuItem key={app.project._id} value={app.project._id}>
                      {app.project.title} - {app.freelancer.username}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button color="inherit" onClick={() => setIsOpen(false)}>Minimize</Button>
            </Box>
            <List sx={{ flexGrow: 1, overflowY: 'auto', maxHeight: '50vh', p: 2 }}>
              {messages.map((msg) => (
                <ListItem
                  key={msg._id}
                  sx={{
                    flexDirection: msg.sender._id === user._id ? 'row-reverse' : 'row',
                    bgcolor: msg.sender._id === user._id ? 'primary.light' : 'grey.200',
                    borderRadius: 2,
                    mb: 1,
                    p: 1,
                  }}
                >
                  <ListItemText
                    primary={msg.content}
                    secondary={`${msg.sender.username} • ${new Date(msg.createdAt).toLocaleTimeString()}`}
                    sx={{ textAlign: msg.sender._id === user._id ? 'right' : 'left' }}
                  />
                </ListItem>
              ))}
              <div ref={messagesEndRef} />
            </List>
            <Box sx={{ p: 2, bgcolor: 'background.paper' }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Type a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                sx={{ mb: 1 }}
              />
              <Button
                variant="contained"
                startIcon={<SendIcon />}
                onClick={handleSend}
                size="small"
                sx={{ width: '100%' }}
              >
                Send
              </Button>
            </Box>
          </Paper>
        </motion.div>
      )}
      {!isOpen && (
        <motion.div
          variants={{ hidden: { scale: 0 }, visible: { scale: 1, transition: { duration: 0.3 } } }}
          initial="hidden"
          animate="visible"
          style={{ position: 'fixed', bottom: 16, right: 16, zIndex: 1000 }}
        >
          <Button
            variant="contained"
            onClick={() => setIsOpen(true)}
            sx={{ borderRadius: '50%', width: 56, height: 56, minWidth: 0 }}
          >
            <ChatIcon />
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const EmployerDashboard = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [applications, setApplications] = useState([]);
  const [error, setError] = useState('');
  const [severity, setSeverity] = useState('error');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [openProjectDialog, setOpenProjectDialog] = useState(false);
  const [selectedChatProject, setSelectedChatProject] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [ratings, setRatings] = useState({});
  const [feedback, setFeedback] = useState({});
  const navigate = useNavigate();

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: { main: darkMode ? '#bb86fc' : '#6200ea' },
      secondary: { main: darkMode ? '#03dac6' : '#018786' },
      background: { default: darkMode ? '#121212' : '#f5f5f5', paper: darkMode ? '#1e1e1e' : '#ffffff' },
    },
    typography: {
      h1: { fontWeight: 700, fontSize: '3rem', lineHeight: 1.2 },
      h2: { fontWeight: 600, fontSize: '2.2rem', lineHeight: 1.3 },
      h3: { fontWeight: 600, fontSize: '1.8rem' },
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
            boxShadow: darkMode
              ? '0 4px 20px rgba(187, 134, 252, 0.1)'
              : '0 4px 20px rgba(0, 0, 0, 0.1)',
            transition: 'transform 0.3s ease',
            '&:hover': {
              transform: 'scale(1.02)',
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            fontWeight: 500,
            background: darkMode
              ? 'linear-gradient(45deg, #bb86fc33, #03dac633)'
              : 'linear-gradient(45deg, #6200ea33, #01878633)',
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

  const fetchUser = useCallback(async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get('http://localhost:5000/api/projects/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data);
    } catch (err) {
      console.error('Fetch user error:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Failed to fetch user data');
      setSeverity('error');
      setOpenSnackbar(true);
      setTimeout(() => navigate('/login'), 2000);
    }
  }, [navigate]);

  const fetchProjects = useCallback(async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get('http://localhost:5000/api/projects/my-projects', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProjects(res.data);
    } catch (err) {
      console.error('Fetch projects error:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Failed to fetch projects');
      setSeverity('error');
      setOpenSnackbar(true);
    }
  }, []);

  const fetchApplications = useCallback(async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get('http://localhost:5000/api/projects/applications', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setApplications(res.data);
    } catch (err) {
      console.error('Fetch applications error:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Failed to fetch applications');
      setSeverity('error');
      setOpenSnackbar(true);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userType = localStorage.getItem('userType');

    if (!token || userType !== 'employer') {
      setError('Unauthorized access. Redirecting to login.');
      setSeverity('error');
      setOpenSnackbar(true);
      setTimeout(() => navigate('/login'), 2000);
      return;
    }

    fetchUser();
    fetchProjects();
    fetchApplications();

    socket.on('payment_updated', ({ project }) => {
      console.log('Received payment_updated event:', project);
      setProjects((prev) => prev.map((p) => (p._id === project._id ? { ...p, paymentStatus: project.paymentStatus } : p)));
      setApplications((prev) => prev.map((app) => (app.project._id === project._id ? { ...app, paymentStatus: project.paymentStatus } : app)));
      fetchApplications(); // Ensure state sync
    });

    socket.on('rating_updated', ({ applicationId, rating }) => {
      console.log('Received rating_updated event:', { applicationId, rating });
      setApplications((prev) => prev.map((app) => (app._id === applicationId ? { ...app, rating } : app)));
      fetchApplications(); // Ensure state sync
    });

    socket.on('feedback_updated', ({ applicationId, feedback }) => {
      console.log('Received feedback_updated event:', { applicationId, feedback });
      setApplications((prev) => prev.map((app) => (app._id === applicationId ? { ...app, feedback } : app)));
      fetchApplications(); // Ensure state sync
    });

    return () => {
      socket.off('payment_updated');
      socket.off('rating_updated');
      socket.off('feedback_updated');
    };
  }, [navigate, fetchUser, fetchProjects, fetchApplications]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    navigate('/login');
  }, [navigate]);

  const handleProjectCreated = useCallback((newProject) => {
    setProjects((prev) => [...prev, newProject]);
    setError('Project posted successfully!');
    setSeverity('success');
    setOpenSnackbar(true);
    setOpenProjectDialog(false);
  }, []);

  const handleDeleteProject = useCallback(async (projectId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/projects/delete/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProjects((prev) => prev.filter((p) => p._id !== projectId));
      setApplications((prev) => prev.filter((app) => app.project._id !== projectId));
      setError('Project deleted successfully!');
      setSeverity('success');
      setOpenSnackbar(true);
      if (selectedChatProject?._id === projectId) setSelectedChatProject(null);
    } catch (err) {
      console.error('Delete project error:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Failed to delete project');
      setSeverity('error');
      setOpenSnackbar(true);
    }
  }, [selectedChatProject]);

  const handleAssign = useCallback(async (projectId, freelancerId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5000/api/projects/assign-project',
        { projectId, freelancerId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProjects((prev) =>
        prev.map((p) =>
          p._id === projectId ? { ...p, status: 'assigned', assignedTo: { _id: freelancerId } } : p
        )
      );
      setApplications((prev) =>
        prev.map((app) =>
          app.project._id === projectId
            ? { ...app, status: app.freelancer._id === freelancerId ? 'accepted' : 'rejected' }
            : app
        )
      );
      setUser((prev) => ({
        ...prev,
        totalSpent: (prev.totalSpent || 0) + response.data.project.budget,
      }));
      setError('Project assigned successfully!');
      setSeverity('success');
      setOpenSnackbar(true);
    } catch (err) {
      console.error('Assign project error:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Failed to assign project');
      setSeverity('error');
      setOpenSnackbar(true);
    }
  }, []);

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
      console.error('Reject application error:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Failed to reject application');
      setSeverity('error');
      setOpenSnackbar(true);
    }
  }, []);

  const handlePay = useCallback(async (applicationId, freelancerId, amount) => {
    if (!window.confirm(`Confirm payment of $${amount} to freelancer?`)) return;
    try {
      const token = localStorage.getItem('token');
      const application = applications.find((app) => app._id === applicationId);
      if (!application?.project?._id) {
        throw new Error('Invalid application or project');
      }
      const projectId = application.project._id;
      const response = await axios.post(
        'http://localhost:5000/api/projects/payment/pay',
        { projectId, freelancerId, amount },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('Payment response:', response.data);
      if (response.data.project.paymentStatus !== 'paid') {
        throw new Error('Payment not marked as paid in response');
      }
      // Update state only after confirming paymentStatus
      setApplications((prev) =>
        prev.map((app) =>
          app._id === applicationId ? { ...app, paymentStatus: 'paid' } : app
        )
      );
      setProjects((prev) =>
        prev.map((p) =>
          p._id === projectId ? { ...p, paymentStatus: 'paid' } : p
        )
      );
      setUser((prev) => ({
        ...prev,
        totalSpent: (prev.totalSpent || 0) + amount,
      }));
      setError('Payment sent successfully!');
      setSeverity('success');
      setOpenSnackbar(true);
      socket.emit('payment_updated', { project: { _id: projectId, paymentStatus: 'paid' } });
    } catch (err) {
      console.error('Payment error:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Failed to process payment');
      setSeverity('error');
      setOpenSnackbar(true);
    }
  }, [applications]);

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
        console.error('Rating error:', err.response?.data || err.message);
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
        console.error('Feedback error:', err.response?.data || err.message);
        setError(err.response?.data?.message || 'Failed to submit feedback');
        setSeverity('error');
        setOpenSnackbar(true);
      });
  }, []);

  const handleSnackbarClose = useCallback(() => {
    setOpenSnackbar(false);
  }, []);

  const acceptedApplications = applications.filter((app) => app.status === 'accepted');

  const filteredApplications = applications.filter((app) => {
    if (!app.freelancer || !app.project) return false;
    return (
      app.freelancer.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.project.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.status?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  if (!user) {
    return (
      <Container sx={{ textAlign: 'center', mt: 4 }}>
        <Typography variant="h5">Loading...</Typography>
      </Container>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="static" color="transparent" elevation={0} sx={{ py: 2 }}>
        <Toolbar>
          <Button variant="outlined" color="primary" onClick={() => navigate('/')} sx={{ borderRadius: 8 }}>
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

      <Container maxWidth={false} sx={{ py: 6, px: { xs: 2, sm: 4, md: 6 } }}>
        <motion.div variants={fadeIn} initial="hidden" animate="visible">
          <Box
            sx={{
              minHeight: '40vh',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              background: darkMode
                ? 'linear-gradient(180deg, #1e1e1e, #121212)'
                : 'linear-gradient(180deg, #ffffff, #f5f5f5)',
              borderRadius: 4,
              py: 6,
              px: 4,
            }}
          >
            <Avatar
              sx={{
                width: { xs: 120, sm: 160, md: 200 },
                height: { xs: 120, sm: 160, md: 200 },
                mb: 3,
                bgcolor: theme.palette.primary.main,
                fontSize: '4rem',
              }}
            >
              {user.username?.[0] || 'E'}
            </Avatar>
            <Typography
              variant="h1"
              sx={{ color: theme.palette.text.primary, mb: 2, fontSize: { xs: '2.2rem', sm: '2.5rem', md: '3rem' } }}
            >
              {user.username || 'Employer'}
            </Typography>
            <Typography
              variant="h4"
              sx={{ color: theme.palette.text.secondary, mb: 3, maxWidth: '600px', fontSize: { xs: '1.2rem', sm: '1.5rem' } }}
            >
              {user.bio || 'No bio yet'}
            </Typography>
            <Typography
              variant="h4"
              sx={{ color: theme.palette.text.secondary, mb: 3, fontSize: { xs: '1.2rem', sm: '1.5rem' } }}
            >
              Company: {user.company || 'Not specified'}
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/edit-employer-profile')}
              sx={{
                mt: 2,
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                px: 4,
                py: 1.5,
              }}
            >
              Edit Profile
            </Button>
          </Box>
        </motion.div>

        <motion.div variants={fadeIn} initial="hidden" animate="visible">
          <Typography
            variant="h2"
            sx={{ fontWeight: 600, mb: 4, color: theme.palette.text.primary, textAlign: 'center', mt: 8 }}
          >
            Stats Overview
          </Typography>
          <Card>
            <CardContent>
              <Grid container spacing={4}>
                <Grid item xs={12} sm={4}>
                  <Typography variant="h3">{projects.length}</Typography>
                  <Typography color="text.secondary">Total Projects</Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="h3">
                    {projects.filter((p) => p.status === 'open' || p.status === 'in-progress').length}
                  </Typography>
                  <Typography color="text.secondary">Active Projects</Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="h3">${user.totalSpent || 0}</Typography>
                  <Typography color="text.secondary">Total Spent</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </motion.div>

        <SearchFreelancers darkMode={darkMode} />

        <motion.div variants={fadeIn} initial="hidden" animate="visible">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, mt: 8 }}>
            <Typography variant="h2" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
              My Projects
            </Typography>
            <Button
              variant="contained"
              onClick={() => setOpenProjectDialog(true)}
              sx={{ background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})` }}
            >
              Post New Project
            </Button>
          </Box>
          {projects.length === 0 ? (
            <Typography color="text.secondary" sx={{ textAlign: 'center' }}>
              No projects posted yet.
            </Typography>
          ) : (
            <Grid container spacing={3}>
              {projects.map((project) => (
                <Grid item xs={12} sm={6} md={4} key={project._id}>
                  <Card>
                    <CardContent>
                      <Typography variant="h4" sx={{ fontWeight: 600 }}>
                        {project.title || 'Untitled Project'}
                      </Typography>
                      <Typography color="text.secondary" sx={{ mb: 1 }}>
                        Budget: ${project.budget || 0}
                      </Typography>
                      <Typography color="text.secondary" sx={{ mb: 2 }}>
                        Status: {project.status || 'N/A'}
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                        {project.skillsRequired?.length ? (
                          project.skillsRequired.map((skill, index) => (
                            <Chip key={index} label={skill} color="primary" variant="outlined" />
                          ))
                        ) : (
                          <Chip label="No skills specified" variant="outlined" />
                        )}
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          variant="outlined"
                          fullWidth
                          onClick={() => navigate(`/project/${project._id}/applications`)}
                        >
                          View Applications
                        </Button>
                        <IconButton color="error" onClick={() => handleDeleteProject(project._id)}>
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </motion.div>

        <motion.div variants={fadeIn} initial="hidden" animate="visible">
          <Typography
            variant="h2"
            sx={{ fontWeight: 600, mb: 2, color: theme.palette.text.primary, textAlign: 'center', mt: 8 }}
          >
            Applications
          </Typography>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
            <TextField
              size="small"
              placeholder="Search applications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ width: '100%', maxWidth: 400 }}
            />
          </Box>
          <Card>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Freelancer</TableCell>
                  <TableCell>Project</TableCell>
                  <TableCell>Skills</TableCell>
                  <TableCell>Rating</TableCell>
                  <TableCell>Feedback</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredApplications.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} sx={{ textAlign: 'center' }}>
                      No applications found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredApplications.map((app) => (
                    <TableRow key={app._id}>
                      <TableCell>{app.freelancer?.username || 'Unknown'}</TableCell>
                      <TableCell>{app.project?.title || 'Unknown'}</TableCell>
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
                                onClick={() => handleAssign(app.project._id, app.freelancer._id)}
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
                              onClick={() => handlePay(app._id, app.freelancer._id, app.project.budget)}
                              size="small"
                              disabled={app.paymentStatus === 'paid'}
                              sx={{ background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})` }}
                            >
                              {app.paymentStatus === 'paid' ? 'Paid' : 'Pay'}
                            </Button>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </motion.div>

        <PostProject
          open={openProjectDialog}
          onClose={() => setOpenProjectDialog(false)}
          onProjectCreated={handleProjectCreated}
        />

        {user && acceptedApplications.length > 0 && (
          <motion.div
            variants={{ hidden: { scale: 0 }, visible: { scale: 1, transition: { duration: 0.3 } } }}
            initial="hidden"
            animate="visible"
            style={{ position: 'fixed', bottom: 16, right: 16, zIndex: 1000 }}
          >
            {acceptedApplications.map((app) => (
              <Button
                key={app.project._id}
                variant="contained"
                onClick={() => setSelectedChatProject(app.project)}
                sx={{ mb: 1, borderRadius: 8, display: 'block', textAlign: 'left' }}
              >
                <ChatIcon sx={{ mr: 1 }} />
                {app.project.title} - {app.freelancer.username}
              </Button>
            ))}
            {selectedChatProject && (
              <ChatWindow
                user={user}
                project={selectedChatProject}
                acceptedApplications={acceptedApplications}
                onProjectChange={setSelectedChatProject}
              />
            )}
          </motion.div>
        )}

        <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleSnackbarClose}>
          <Alert onClose={handleSnackbarClose} severity={severity} sx={{ width: '100%' }}>
            {error}
          </Alert>
        </Snackbar>
      </Container>
    </ThemeProvider>
  );
};

export default EmployerDashboard;