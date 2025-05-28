import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { walletApi, TransactionResponse, TransactionData } from '../services/api';

enum TransactionType {
  Deposit = 0,
  Withdrawal = 1,
  Transfer = 2
}

interface FormValues {
  amount: string;
  type: TransactionType;
  recipientUsername: string;
  description: string;
}

const Dashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<TransactionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const username = localStorage.getItem('username') || 'User';

  const fetchData = async () => {
    try {
      setLoading(true);
      const [balanceData, transactionsData] = await Promise.all([
        walletApi.getBalance(),
        walletApi.getTransactions()
      ]);
      setBalance(balanceData);
      setTransactions(transactionsData);
    } catch (err) {
      setError('Failed to fetch wallet data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const validationSchema = Yup.object().shape({
    amount: Yup.number()
      .required('Amount is required')
      .positive('Amount must be positive')
      .max(1000000, 'Amount cannot exceed 1,000,000 ZMW'),
    type: Yup.number()
      .required('Transaction type is required'),
    recipientUsername: Yup.string().when('type', {
      is: TransactionType.Transfer,
      then: (schema) => schema.required('Recipient username is required'),
      otherwise: (schema) => schema.optional()
    }),
    description: Yup.string()
      .required('Description is required')
      .max(255, 'Description cannot exceed 255 characters'),
  });

  const formik = useFormik<FormValues>({
    initialValues: {
      amount: '',
      type: TransactionType.Deposit,
      recipientUsername: '',
      description: '',
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        setError('');
        setSuccess('');
        const transactionData: TransactionData = {
          amount: Number(values.amount),
          type: values.type,
          description: values.description || 'Deposit',
          ...(values.type === TransactionType.Transfer && { recipientUsername: values.recipientUsername }),
        };
        await walletApi.createTransaction(transactionData);
        setSuccess('Transaction completed successfully!');
        resetForm();
        fetchData(); // Refresh data
      } catch (err: any) {
        setError(err.response?.data?.message || 'Transaction failed');
      }
    },
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZM', {
      style: 'currency',
      currency: 'ZMW',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-ZM', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 4 } }}>
      {/* Welcome Message */}
      <Typography 
        variant={isMobile ? "h5" : "h4"} 
        component="h1" 
        gutterBottom
        sx={{ 
          textAlign: { xs: 'center', sm: 'left' },
          mb: { xs: 2, sm: 3 }
        }}
      >
        Welcome back, {username}! 👋
      </Typography>

      {/* Balance Card */}
      <Card 
        sx={{ 
          mb: { xs: 2, sm: 4 }, 
          bgcolor: 'success.main', 
          color: 'white',
          borderRadius: 2,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            width: '30%',
            background: 'linear-gradient(to right, transparent, rgba(230, 108, 35, 0.2))',
            transform: 'skewX(-15deg)',
            transformOrigin: 'top right',
          }
        }}
      >
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Typography variant={isMobile ? "subtitle1" : "h6"}>Current Balance</Typography>
          <Typography variant={isMobile ? "h4" : "h3"}>{formatCurrency(balance)}</Typography>
        </CardContent>
      </Card>

      {/* Transaction Form and History */}
      <Grid container spacing={{ xs: 2, sm: 4 }}>
        {/* Transaction Form */}
        <Grid item xs={12} md={6}>
          <Paper 
            sx={{ 
              p: { xs: 2, sm: 3 }, 
              mb: { xs: 2, sm: 4 },
              background: 'linear-gradient(to bottom right, #ffffff, #f8f8f8)',
              borderTop: '4px solid',
              borderColor: 'primary.main',
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                right: 0,
                width: '100px',
                height: '100px',
                background: 'radial-gradient(circle at top right, rgba(230, 108, 35, 0.05), transparent 70%)',
              }
            }}
          >
            <Typography variant="h6" gutterBottom>
              New Transaction
            </Typography>
            <form onSubmit={formik.handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Transaction Type</InputLabel>
                    <Select
                      name="type"
                      value={formik.values.type}
                      onChange={formik.handleChange}
                      error={formik.touched.type && Boolean(formik.errors.type)}
                      label="Transaction Type"
                    >
                      <MenuItem value={TransactionType.Deposit}>Deposit</MenuItem>
                      <MenuItem value={TransactionType.Withdrawal}>Withdrawal</MenuItem>
                      <MenuItem value={TransactionType.Transfer}>Transfer</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    name="amount"
                    label="Amount (ZMW)"
                    type="number"
                    value={formik.values.amount}
                    onChange={formik.handleChange}
                    error={formik.touched.amount && Boolean(formik.errors.amount)}
                    helperText={formik.touched.amount && formik.errors.amount}
                    InputProps={{
                      startAdornment: <Box component="span" sx={{ color: 'text.secondary', mr: 1 }}>K</Box>,
                    }}
                  />
                </Grid>
                {formik.values.type === TransactionType.Transfer && (
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      name="recipientUsername"
                      label="Recipient Username"
                      value={formik.values.recipientUsername}
                      onChange={formik.handleChange}
                      error={formik.touched.recipientUsername && Boolean(formik.errors.recipientUsername)}
                      helperText={formik.touched.recipientUsername && formik.errors.recipientUsername}
                    />
                  </Grid>
                )}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    name="description"
                    label="Description"
                    value={formik.values.description}
                    onChange={formik.handleChange}
                    error={formik.touched.description && Boolean(formik.errors.description)}
                    helperText={formik.touched.description && formik.errors.description}
                  />
                </Grid>
                <Grid item xs={12}>
                  {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                      {error}
                    </Alert>
                  )}
                  {success && (
                    <Alert severity="success" sx={{ mb: 2 }}>
                      {success}
                    </Alert>
                  )}
                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    size="large"
                    sx={{
                      bgcolor: 'success.main',
                      '&:hover': {
                        bgcolor: 'success.dark',
                      },
                    }}
                  >
                    Submit Transaction
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Paper>
        </Grid>

        {/* Recent Transactions */}
        <Grid item xs={12} md={6}>
          <Paper 
            sx={{ 
              p: { xs: 2, sm: 3 },
              background: 'linear-gradient(to bottom right, #ffffff, #f8f8f8)',
              borderTop: '4px solid',
              borderColor: 'secondary.main',
            }}
          >
            <Typography variant="h6" gutterBottom>
              Recent Transactions
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Type</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {transactions.slice(0, 5).map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{transaction.type}</TableCell>
                      <TableCell>{formatCurrency(transaction.amount)}</TableCell>
                      <TableCell>{formatDate(transaction.createdAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
