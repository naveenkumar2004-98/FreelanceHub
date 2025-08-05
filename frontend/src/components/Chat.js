import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
} from '@mui/material';
import axios from 'axios';
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

const Chat = ({ projectId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchMessages = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');
      const res = await axios.get(`http://localhost:5000/api/projects/messages/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages(res.data);
      setLoading(false);
      socket.emit('join_project', projectId);
    } catch (err) {
      console.error('Fetch messages error:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Failed to fetch messages');
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchMessages();

    socket.on('receive_message', (message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socket.off('receive_message');
    };
  }, [fetchMessages]);

  const handleSendMessage = useCallback(async () => {
    if (!newMessage.trim()) return;
    try {
      const token = localStorage.getItem('token');
      const senderId = JSON.parse(atob(token.split('.')[1])).id; // Extract user ID from JWT
      socket.emit('send_message', {
        projectId,
        senderId,
        message: newMessage,
      });
      setNewMessage('');
    } catch (err) {
      setError('Failed to send message');
    }
  }, [newMessage, projectId]);

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Box sx={{ maxHeight: 400, overflowY: 'auto', p: 2 }}>
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}
      <List>
        {messages.map((msg, index) => (
          <ListItem key={index}>
            <ListItemText
              primary={`${msg.sender.username}: ${msg.content}`}
              secondary={new Date(msg.createdAt).toLocaleTimeString()}
            />
          </ListItem>
        ))}
      </List>
      <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
        />
        <Button
          variant="contained"
          onClick={handleSendMessage}
          disabled={!newMessage.trim()}
        >
          Send
        </Button>
      </Box>
    </Box>
  );
};

export default Chat;