import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Box,
  TextField,
  Rating,
  Snackbar,
  Alert,
} from '@mui/material';
import PaymentIcon from '@mui/icons-material/Payment';
import StarIcon from '@mui/icons-material/Star';
import axios from 'axios';

const PaymentPage = () => {
  const { projectId, applicationId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [application, setApplication] = useState(null);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || localStorage.getItem('userType') !== 'employer') {
      navigate('/');
      return;
    }
    axios.get(`http://localhost:5000/api/projects/${projectId}`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(res => setProject(res.data)).catch(() => setSnackbar({ open: true, message: 'Failed to fetch project', severity: 'error' }));
    axios.get(`http://localhost:5000/api/projects/applications/${applicationId}`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(res => {
      setApplication(res.data);
      setPaymentStatus(res.data.project.paymentStatus);
      setRating(res.data.rating || 0);
      setFeedback(res.data.feedback || '');
    }).catch(() => setSnackbar({ open: true, message: 'Failed to fetch application', severity: 'error' }));
  }, [projectId, applicationId, navigate]);

  const handlePayment = () => {
    const token = localStorage.getItem('token');
    axios.post('http://localhost:5000/api/projects/payment/pay', {
      applicationId,
      freelancerId: application.freelancer._id,
      amount: project.budget,
    }, { headers: { Authorization: `Bearer ${token}` } })
      .then(() => {
        setPaymentStatus('paid');
        setSnackbar({ open: true, message: 'Payment successful!', severity: 'success' });
      })
      .catch(err => setSnackbar({ open: true, message: err.response?.data?.message || 'Payment failed', severity: 'error' }));
  };

  const handleRating = () => {
    const token = localStorage.getItem('token');
    axios.post('http://localhost:5000/api/projects/rate', { applicationId, rating }, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(() => setSnackbar({ open: true, message: 'Rating submitted!', severity: 'success' }))
      .catch(err => setSnackbar({ open: true, message: err.response?.data?.message || 'Rating failed', severity: 'error' }));
  };

  const handleFeedback = () => {
    const token = localStorage.getItem('token');
    axios.post('http://localhost:5000/api/projects/feedback', { applicationId, feedback }, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(() => setSnackbar({ open: true, message: 'Feedback submitted!', severity: 'success' }))
      .catch(err => setSnackbar({ open: true, message: err.response?.data?.message || 'Feedback failed', severity: 'error' }));
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 600 }}>Payment & Review</Typography>
      {project && application ? (
        <Card sx={{ borderRadius: 4, boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)' }}>
          <CardContent>
            <Typography variant="h5" sx={{ mb: 2 }}>Project: {project.title}</Typography>
            <Typography color="text.secondary" sx={{ mb: 2 }}>Freelancer: {application.freelancer.username}</Typography>
            <Typography color="text.secondary" sx={{ mb: 2 }}>Budget: ${project.budget}</Typography>
            <Typography color="text.secondary" sx={{ mb: 2 }}>Payment Status: {paymentStatus === 'paid' ? 'Paid' : 'Pending'}</Typography>
            <Button
              variant="contained"
              startIcon={<PaymentIcon />}
              onClick={handlePayment}
              disabled={paymentStatus === 'paid'}
              sx={{ mb: 4, background: 'linear-gradient(45deg, #6200ea, #018786)' }}
            >
              {paymentStatus === 'paid' ? 'Paid' : 'Make Payment'}
            </Button>
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>Rate Freelancer</Typography>
              <Rating
                value={rating}
                onChange={(e, newValue) => setRating(newValue)}
                precision={0.5}
                disabled={paymentStatus !== 'paid' || application.rating}
                icon={<StarIcon fontSize="inherit" />}
              />
              {paymentStatus !== 'paid' && <Typography color="text.secondary" sx={{ mt: 1 }}>Pay first to rate</Typography>}
              {rating > 0 && !application.rating && (
                <Button variant="outlined" onClick={handleRating} sx={{ mt: 2 }}>Submit Rating</Button>
              )}
            </Box>
            <Box>
              <Typography variant="h6" sx={{ mb: 1 }}>Feedback</Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Enter your feedback"
                disabled={paymentStatus !== 'paid' || application.feedback}
              />
              {paymentStatus !== 'paid' && <Typography color="text.secondary" sx={{ mt: 1 }}>Pay first to provide feedback</Typography>}
              {feedback && !application.feedback && (
                <Button variant="outlined" onClick={handleFeedback} sx={{ mt: 2 }}>Submit Feedback</Button>
              )}
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Typography>Loading...</Typography>
      )}
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Container>
  );
};

export default PaymentPage;