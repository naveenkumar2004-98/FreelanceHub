import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Box, Typography, Paper, CssBaseline } from '@mui/material';
import axios from 'axios';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true); // Removed userType state
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = isLogin ? '/login' : '/register';
      const { data } = await axios.post(`http://localhost:5000/api/auth${endpoint}`, {
        username,
        password,
      });

      localStorage.setItem('token', data.token);

      // After successful login/registration, navigate to the respective page
      if (data.userType === 'freelancer') {
        navigate('/freelancer-form');
      } else {
        navigate('/employer-dashboard');
      }
    } catch (error) {
      alert(error.response?.data?.message || error.message);
    }
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <CssBaseline />
      <Paper sx={{ padding: 3 }}>
        <Typography variant="h5">{isLogin ? 'Login' : 'Register'}</Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Username"
            fullWidth
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button type="submit" variant="contained">{isLogin ? 'Login' : 'Register'}</Button>
        </form>
        <Button onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? 'Need an account? Register' : 'Already have an account? Login'}
        </Button>
      </Paper>
    </Box>
  );
};

export default Login;
