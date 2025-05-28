import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useFormik } from 'formik';
import * as yup from 'yup';
import {
  Box,
  Button,
  Container,
  Link,
  TextField,
  Typography,
  Alert,
  Paper,
  Fade,
} from '@mui/material';
import { authApi, LoginData } from '../services/api';
import LoadingOverlay from '../components/LoadingOverlay';

const validationSchema = yup.object({
  username: yup
    .string()
    .required('Username is required')
    .min(3, 'Username should be at least 3 characters'),
  password: yup
    .string()
    .required('Password is required')
    .min(6, 'Password should be at least 6 characters'),
});

const Login: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      username: '',
      password: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setError(null);
        setLoading(true);
        const loginData: LoginData = {
          username: values.username,
          password: values.password,
        };
        await authApi.login(loginData);
        navigate('/');
      } catch (err: any) {
        const errorMessage = err.response?.data?.message;
        if (errorMessage?.includes('credentials')) {
          setError('Invalid username or password. Please try again.');
        } else if (errorMessage?.includes('locked')) {
          setError('Your account has been temporarily locked. Please try again in a few minutes.');
        } else {
          setError(
            'Login failed. Please check your internet connection and try again. If the problem persists, contact support.'
          );
        }
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <Container component="main" maxWidth="xs">
      <LoadingOverlay open={loading} message="Signing in..." />
      <Fade in timeout={800}>
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Paper
            elevation={3}
            sx={{
              p: 4,
              width: '100%',
              borderRadius: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              transition: 'transform 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-4px)',
              },
            }}
          >
            <Typography component="h1" variant="h5" gutterBottom>
              Sign In
            </Typography>

            {error && (
              <Fade in>
                <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
                  {error}
                </Alert>
              </Fade>
            )}

            <Box
              component="form"
              onSubmit={formik.handleSubmit}
              sx={{ width: '100%', mt: 1 }}
            >
              <TextField
                fullWidth
                margin="normal"
                name="username"
                label="Username"
                value={formik.values.username}
                onChange={formik.handleChange}
                error={formik.touched.username && Boolean(formik.errors.username)}
                helperText={formik.touched.username && formik.errors.username}
                autoComplete="username"
                disabled={loading}
              />
              <TextField
                fullWidth
                margin="normal"
                name="password"
                label="Password"
                type="password"
                value={formik.values.password}
                onChange={formik.handleChange}
                error={formik.touched.password && Boolean(formik.errors.password)}
                helperText={formik.touched.password && formik.errors.password}
                autoComplete="current-password"
                disabled={loading}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{
                  mt: 3,
                  mb: 2,
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'scale(1.02)',
                  },
                }}
                disabled={loading}
              >
                Sign In
              </Button>
              <Box sx={{ textAlign: 'center' }}>
                <Link
                  component={RouterLink}
                  to="/register"
                  variant="body2"
                  sx={{
                    transition: 'color 0.2s ease-in-out',
                    '&:hover': {
                      color: 'primary.main',
                    },
                  }}
                >
                  Don't have an account? Sign up
                </Link>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Fade>
    </Container>
  );
};

export default Login;
