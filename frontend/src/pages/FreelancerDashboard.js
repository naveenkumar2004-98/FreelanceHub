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
  TextField,
  Paper,
  List,
  ListItem,
  ListItemText,
  Rating,
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { motion, AnimatePresence } from 'framer-motion';
import WorkIcon from '@mui/icons-material/Work';
import SendIcon from '@mui/icons-material/Send';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import ChatIcon from '@mui/icons-material/Chat';
import StarIcon from '@mui/icons-material/Star';
import axios from 'axios';
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

const ChatWindow = ({ user, project }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!project?._id || !user?._id) return;

    socket.emit('join_project', project._id);

    axios
      .get(`http://localhost:5000/api/projects/messages/${project._id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })
      .then((res) => {
        console.log('Fetched messages:', res.data);
        setMessages(res.data.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)));
      })
      .catch((err) => {
        console.error('Messages fetch error:', err.response?.data);
      });

    socket.on('receive_message', (newMessage) => {
      setMessages((prev) => {
        if (prev.some((msg) => msg._id === newMessage._id)) return prev;
        return [...prev, newMessage].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      });
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

  const handleRequest = () => {
    if (!project?._id || !user?._id) return;

    axios
      .post(
        'http://localhost:5000/api/projects/payment/request',
        { projectId: project._id, amount: project.budget },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      )
      .then((res) => {
        console.log('Payment requested:', res.data);
        socket.emit('send_message', {
          projectId: project._id,
          senderId: user._id,
          message: `Payment request: $${project.budget}`,
        });
      })
      .catch((err) => {
        console.error('Payment request error:', err.response?.data);
      });
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
          style={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            width: 350,
            maxHeight: '70vh',
            zIndex: 1000,
          }}
        >
          <Paper elevation={6} sx={{ borderRadius: 3, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <Box
              sx={{
                bgcolor: 'primary.main',
                color: 'white',
                p: 2,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Typography variant="h6">{project.title}</Typography>
              <Button color="inherit" onClick={() => setIsOpen(false)}>
                Minimize
              </Button>
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
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="contained"
                  startIcon={<RequestQuoteIcon />}
                  onClick={handleRequest}
                  size="small"
                  sx={{ flex: 1 }}
                >
                  Request
                </Button>
                <Button
                  variant="contained"
                  startIcon={<SendIcon />}
                  onClick={handleSend}
                  size="small"
                  sx={{ flex: 1 }}
                >
                  Send
                </Button>
              </Box>
            </Box>
          </Paper>
        </motion.div>
      )}
      {!isOpen && (
        <motion.div
          variants={{
            hidden: { scale: 0 },
            visible: { scale: 1, transition: { duration: 0.3 } },
          }}
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

const FreelancerDashboard = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [applications, setApplications] = useState([]);
  const [error, setError] = useState(null);
  const [loadingProjects, setLoadingProjects] = useState(true);
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
      console.log('Fetched user:', res.data);
      setUser(res.data);
      setError(null);
    } catch (err) {
      console.error('User fetch error:', err.response?.data);
      setError(err.response?.data?.message || 'Failed to fetch user data');
      navigate('/login');
    }
  }, [navigate]);

  const fetchProjects = useCallback(async () => {
    const token = localStorage.getItem('token');
    setLoadingProjects(true);
    try {
      const res = await axios.get('http://localhost:5000/api/projects/open', {
        headers: { Authorization: `Bearer ${token}`, 'Cache-Control': 'no-cache' },
      });
      console.log('Fetched open projects:', res.data);
      setProjects(res.data);
      setLoadingProjects(false);
      setError(null);
    } catch (err) {
      console.error('Projects fetch error:', err.response?.data);
      setError(err.response?.data?.message || 'Failed to fetch projects');
      setLoadingProjects(false);
    }
  }, []);

  const fetchApplications = useCallback(async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get('http://localhost:5000/api/projects/applications', {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Fetched applications:', res.data);
      setApplications(res.data);
      setError(null);
    } catch (err) {
      console.error('Applications fetch error:', err.response?.data);
      setError(err.response?.data?.message || 'Failed to fetch applications');
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userType = localStorage.getItem('userType');

    if (!token || userType !== 'freelancer') {
      setError('Unauthorized access. Redirecting to login.');
      navigate('/login');
      return;
    }

    fetchUser();
    fetchProjects();
    fetchApplications();

    socket.on('payment_updated', ({ project }) => {
      setProjects((prev) => prev.map((p) => (p._id === project._id ? { ...p, paymentStatus: project.paymentStatus } : p)));
      fetchUser(); // Update totalEarned and pendingPayments
    });

    socket.on('rating_updated', ({ applicationId, rating }) => {
      setApplications((prev) => prev.map((a) => (a._id === applicationId ? { ...a, rating } : a)));
      fetchUser(); // Update feedback
    });

    socket.on('feedback_updated', ({ applicationId, feedback }) => {
      setApplications((prev) => prev.map((a) => (a._id === applicationId ? { ...a, feedback } : a)));
      fetchUser(); // Update feedback
    });

    return () => {
      socket.off('payment_updated');
      socket.off('rating_updated');
      socket.off('feedback_updated');
    };
  }, [navigate, fetchUser, fetchProjects, fetchApplications]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    navigate('/login');
  };

  const handleApply = (projectId) => {
    if (!user?._id) {
      setError('User not loaded. Please try again.');
      alert('Error: User not loaded');
      return;
    }
    const token = localStorage.getItem('token');
    axios
      .post(
        'http://localhost:5000/api/projects/apply',
        { projectId, coverLetter: 'Applied from dashboard' },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((res) => {
        console.log('Application sent:', res.data);
        alert('Application sent!');
        fetchApplications();
      })
      .catch((err) => {
        console.error('Apply error:', err.response?.data);
        alert('Error: ' + (err.response?.data?.message || 'Failed to apply'));
      });
  };

  if (error) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Typography color="error" variant="h6">
            {error}
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/login')}
            sx={{ mt: 2 }}
          >
            Go to Login
          </Button>
        </Container>
      </ThemeProvider>
    );
  }

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

      <Container maxWidth={false} sx={{ py: 6, px: { xs: 2, sm: 4, md: 6 } }}>
        <motion.div variants={fadeIn} initial="hidden" animate="visible">
          <Box
            sx={{
              minHeight: '60vh',
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              alignItems: { xs: 'center', md: 'flex-start' },
              background: darkMode
                ? 'linear-gradient(180deg, #1e1e1e, #121212)'
                : 'linear-gradient(180deg, #ffffff, #f5f5f5)',
              borderRadius: 4,
              py: 6,
              px: 4,
            }}
          >
            <Box sx={{ flexShrink: 0, textAlign: 'center', mb: { xs: 4, md: 0 }, mr: { md: 6 } }}>
              {user?.photo ? (
                <Avatar
                  src={user.photo}
                  alt="Profile"
                  sx={{
                    width: { xs: 160, sm: 200, md: 240 },
                    height: { xs: 160, sm: 200, md: 240 },
                    border: `4px solid ${theme.palette.primary.main}`,
                    boxShadow: darkMode
                      ? '0 4px 20px rgba(187, 134, 252, 0.3)'
                      : '0 4px 20px rgba(98, 0, 234, 0.3)',
                  }}
                />
              ) : (
                <Avatar
                  sx={{
                    width: { xs: 160, sm: 200, md: 240 },
                    height: { xs: 160, sm: 200, md: 240 },
                    bgcolor: theme.palette.secondary.main,
                    fontSize: '4rem',
                  }}
                >
                  {user?.username?.[0] || 'F'}
                </Avatar>
              )}
            </Box>
            <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Typography
                variant="h1"
                sx={{
                  color: theme.palette.text.primary,
                  fontSize: { xs: '2.2rem', sm: '2.5rem', md: '3rem' },
                }}
              >
                {user?.username || 'Freelancer'}
              </Typography>
              <Box>
                <Typography variant="h4" sx={{ color: theme.palette.text.primary, mb: 1 }}>
                  Bio
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: theme.palette.text.secondary,
                    maxWidth: '600px',
                    fontSize: { xs: '1rem', sm: '1.1rem' },
                  }}
                >
                  {user?.bio || 'No bio yet'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="h4" sx={{ color: theme.palette.text.primary, mb: 1 }}>
                  Skills
                </Typography>
                {user?.skills?.length ? (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {user.skills.map((skill, index) => (
                      <Chip key={index} label={skill} color="primary" variant="outlined" />
                    ))}
                  </Box>
                ) : (
                  <Typography color="text.secondary">No skills added</Typography>
                )}
              </Box>
              <Box>
                <Typography variant="h4" sx={{ color: theme.palette.text.primary, mb: 1 }}>
                  Schooling
                </Typography>
                <Typography variant="body1" sx={{ color: theme.palette.text.secondary }}>
                  {user?.schooling || 'Not specified'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="h4" sx={{ color: theme.palette.text.primary, mb: 1 }}>
                  Degree
                </Typography>
                <Typography variant="body1" sx={{ color: theme.palette.text.secondary }}>
                  {user?.degree || 'Not specified'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="h4" sx={{ color: theme.palette.text.primary, mb: 1 }}>
                  Certification
                </Typography>
                <Typography variant="body1" sx={{ color: theme.palette.text.secondary }}>
                  {user?.certification || 'Not specified'}
                </Typography>
              </Box>
              <Button
                variant="contained"
                onClick={() => navigate('/edit-freelancer-profile')}
                sx={{
                  mt: 2,
                  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                }}
              >
                Edit Profile
              </Button>
            </Box>
          </Box>
        </motion.div>

        <motion.div variants={fadeIn} initial="hidden" animate="visible">
          <Typography
            variant="h2"
            sx={{ fontWeight: 600, mb: 4, color: theme.palette.text.primary, textAlign: 'center', mt: 8 }}
          >
            Earnings Overview
          </Typography>
          <Card>
            <CardContent>
              <Grid container spacing={4}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="h3">${user?.totalEarned || 0}</Typography>
                  <Typography color="text.secondary">Total Earned</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="h3">${Math.max(0, user?.pendingPayments || 0)}</Typography>
                  <Typography color="text.secondary">Pending Payments</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={fadeIn} initial="hidden" animate="visible">
          <Typography
            variant="h2"
            sx={{ fontWeight: 600, mb: 2, color: theme.palette.text.primary, textAlign: 'center', mt: 8 }}
          >
            Available Projects
          </Typography>
          <Button
            variant="outlined"
            onClick={fetchProjects}
            sx={{ mb: 2, borderRadius: 8 }}
          >
            Refresh Projects
          </Button>
          {loadingProjects ? (
            <Typography color="text.secondary" sx={{ textAlign: 'center' }}>
              Loading projects...
            </Typography>
          ) : projects.length === 0 ? (
            <Typography color="text.secondary" sx={{ textAlign: 'center' }}>
              No open projects available.
            </Typography>
          ) : (
            <Grid container spacing={3}>
              {projects.map((project) => (
                <Grid item xs={12} sm={6} md={4} key={project._id}>
                  <Card>
                    <CardContent>
                      <Typography variant="h4" sx={{ fontWeight: 600 }}>
                        {project.title}
                      </Typography>
                      <Typography color="text.secondary" sx={{ mb: 1 }}>
                        Budget: ${project.budget}
                      </Typography>
                      <Typography color="text.secondary" sx={{ mb: 2 }}>
                        Status: {project.status}
                      </Typography>
                      <Button
                        variant="contained"
                        fullWidth
                        sx={{
                          background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        }}
                        onClick={() => handleApply(project._id)}
                      >
                        Apply
                      </Button>
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
            sx={{ fontWeight: 600, mb: 4, color: theme.palette.text.primary, textAlign: 'center', mt: 8 }}
          >
            Your Applications
          </Typography>
          <Card>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Project</TableCell>
                  <TableCell>Budget</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {applications.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} sx={{ textAlign: 'center' }}>
                      No applications submitted yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  applications.map((app) => (
                    <TableRow key={app._id}>
                      <TableCell>{app.project?.title || 'Unknown'}</TableCell>
                      <TableCell>${app.project?.budget || 0}</TableCell>
                      <TableCell>{app.status}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </motion.div>

        <motion.div variants={fadeIn} initial="hidden" animate="visible">
          <Typography
            variant="h2"
            sx={{ fontWeight: 600, mb: 4, color: theme.palette.text.primary, textAlign: 'center', mt: 8 }}
          >
            Ratings & Feedback
          </Typography>
          <Card>
            <CardContent>
              {applications.some((app) => app.rating || app.feedback) ? (
                applications.map((app) =>
                  (app.rating || app.feedback) && (
                    <Box
                      key={app._id}
                      sx={{
                        mb: 2,
                        p: 2,
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: 2,
                      }}
                    >
                      <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
                        {app.project?.title || 'Unknown Project'}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Typography variant="body1" sx={{ mr: 1 }}>
                          Rating:
                        </Typography>
                        <Rating
                          value={app.rating || 0}
                          readOnly
                          precision={0.1}
                          icon={<StarIcon fontSize="inherit" />}
                        />
                        <Typography variant="body2" sx={{ ml: 1 }}>
                          ({app.rating || 0})
                        </Typography>
                      </Box>
                      <Typography variant="body1" sx={{ mb: 1 }}>
                        Feedback:
                      </Typography>
                      <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                        {app.feedback || 'No feedback yet'}
                      </Typography>
                    </Box>
                  )
                )
              ) : (
                <Typography color="text.secondary" sx={{ textAlign: 'center' }}>
                  No ratings or feedback received yet.
                </Typography>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {user && applications.some((app) => app.status === 'accepted') && (
          <ChatWindow user={user} project={applications.find((app) => app.status === 'accepted').project} />
        )}
      </Container>
    </ThemeProvider>
  );
};

export default FreelancerDashboard;