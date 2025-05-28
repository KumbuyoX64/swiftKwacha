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
  useTheme,
  useMediaQuery,
  Fade,
} from '@mui/material';
import { authApi, RegisterData } from '../services/api';
import LoadingOverlay from '../components/LoadingOverlay';

const validationSchema = yup.object({
  username: yup
    .string()
    .required('Username is required')
    .min(3, 'Username should be at least 3 characters')
    .max(30, 'Username cannot exceed 30 characters')
    .matches(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens'),
  email: yup
    .string()
    .email('Please enter a valid email address')
    .required('Email is required')
    .max(100, 'Email cannot exceed 100 characters'),
  password: yup
    .string()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  confirmPassword: yup
    .string()
    .required('Please confirm your password')
    .oneOf([yup.ref('password')], 'Passwords must match'),
});

const Register: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const formik = useFormik({
    initialValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setError(null);
        setLoading(true);
        const registerData: RegisterData = {
          username: values.username,
          email: values.email,
          password: values.password,
        };
        await authApi.register(registerData);
        navigate('/');
      } catch (err: any) {
        const errorMessage = err.response?.data?.message;
        if (errorMessage?.includes('username')) {
          setError('This username is already taken. Please choose another one.');
        } else if (errorMessage?.includes('email')) {
          setError('This email is already registered. Please use a different email or try logging in.');
        } else {
          setError(
            'Registration failed. Please check your internet connection and try again. If the problem persists, contact support.'
          );
        }
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <Container component="main" maxWidth="xs">
      <LoadingOverlay open={loading} message="Creating your account..." />
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
              Create Account
            </Typography>

            {error && (
              <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
                {error}
              </Alert>
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
              />
              <TextField
                fullWidth
                margin="normal"
                name="email"
                label="Email Address"
                value={formik.values.email}
                onChange={formik.handleChange}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
                autoComplete="email"
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
                autoComplete="new-password"
              />
              <TextField
                fullWidth
                margin="normal"
                name="confirmPassword"
                label="Confirm Password"
                type="password"
                value={formik.values.confirmPassword}
                onChange={formik.handleChange}
                error={
                  formik.touched.confirmPassword &&
                  Boolean(formik.errors.confirmPassword)
                }
                helperText={
                  formik.touched.confirmPassword && formik.errors.confirmPassword
                }
                autoComplete="new-password"
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={formik.isSubmitting}
              >
                Register
              </Button>
              <Box sx={{ textAlign: 'center' }}>
                <Link component={RouterLink} to="/login" variant="body2">
                  Already have an account? Sign in
                </Link>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Fade>
    </Container>
  );
};

export default Register;
