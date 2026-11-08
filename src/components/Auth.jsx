import React, { useState } from 'react';
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut
} from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { Box, TextField, Button, Typography, Alert, Link, Divider, Stack, Avatar } from '@mui/material';

const Auth = ({ user }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLogin, setIsLogin] = useState(true);

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await (isLogin
        ? signInWithEmailAndPassword(auth, email, password)
        : createUserWithEmailAndPassword(auth, email, password));
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        setError('This email address is already in use. Please try logging in.');
      } else {
        setError(err.message);
      }
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    const provider = new GoogleAuthProvider();
    try {
      // The onAuthStateChanged listener in App.jsx will handle the update
      await signInWithPopup(auth, provider);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      setError(err.message);
    }
  };

  if (user) {
    return (
      <Box display="flex" alignItems="center" gap={2}>
        <Avatar
          sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}
          src={user.photoURL || undefined}
        >
          {user.email ? user.email[0].toUpperCase() : '?'}
        </Avatar>
        <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
          {user.displayName || user.email}
        </Typography>
        <Button variant="outlined" size="small" onClick={handleLogout}>
          Logout
        </Button>
      </Box>
    );
  }

  return (
    <Stack spacing={1} sx={{ p: 1, border: '1px solid', borderColor: 'divider', borderRadius: 1, minWidth: 300 }}>
      <Box
        component="form"
        onSubmit={handleAuth}
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: 'center',
          gap: 1,
        }}
      >
        <Typography variant="subtitle2" sx={{ mr: 1, display: { xs: 'none', sm: 'block' } }}>
          {isLogin ? 'Login' : 'Sign Up'}
        </Typography>
        <TextField
          type="email"
          label="Email"
          size="small"
          variant="outlined"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <TextField
          type="password"
          label="Password"
          size="small"
          variant="outlined"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Button type="submit" variant="contained" size="small">
          {isLogin ? 'Login' : 'Sign Up'}
        </Button>
        <Link
          component="button"
          type="button"
          variant="body2"
          onClick={() => setIsLogin(!isLogin)}
          sx={{ ml: 1 }}
        >
          {isLogin ? 'Need an account? Sign Up' : 'Have an account? Login'}
        </Link>
      </Box>
      <Divider>OR</Divider>
      <Button
        onClick={handleGoogleSignIn}
        variant="outlined"
        startIcon={
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google"
            style={{ width: 18, height: 18 }}
          />
        }
      >
        Sign in with Google
      </Button>
      {error && (
        <Alert severity="error" sx={{ mt: 1 }}>
          {error}
        </Alert>
      )}
    </Stack>
  );
};

export default Auth;