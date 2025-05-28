import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  Chip,
  useTheme,
  useMediaQuery,
  CircularProgress,
  TablePagination,
  Alert,
  IconButton,
  Tooltip,
  Card,
  CardContent,
} from '@mui/material';
import { walletApi, TransactionResponse } from '../services/api';
import { FilterList as FilterListIcon } from '@mui/icons-material';

const Transactions = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [transactions, setTransactions] = useState<TransactionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const data = await walletApi.getTransactions();
      setTransactions(data);
    } catch (err) {
      setError('Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };

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

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'Deposit':
        return 'success';
      case 'Withdrawal':
        return 'error';
      case 'Transfer':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
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
      {/* Header */}
      <Box 
        sx={{ 
          mb: { xs: 2, sm: 4 },
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'stretch', sm: 'center' },
          gap: 2
        }}
      >
        <Box flex={1}>
          <Typography 
            variant={isMobile ? "h5" : "h4"} 
            component="h1" 
            sx={{ 
              color: 'primary.main',
              fontWeight: 600,
              mb: 1
            }}
          >
            Transaction History
          </Typography>
          <Typography 
            variant="body1" 
            color="text.secondary"
            sx={{ mb: { xs: 2, sm: 0 } }}
          >
            View and track all your financial activities
          </Typography>
        </Box>

        {/* Summary Cards */}
        <Box 
          sx={{ 
            display: 'flex', 
            gap: 2,
            flexDirection: { xs: 'column', sm: 'row' }
          }}
        >
          <Card 
            sx={{ 
              minWidth: { xs: '100%', sm: 200 },
              background: 'linear-gradient(135deg, #02974b, #34b871)',
              color: 'white'
            }}
          >
            <CardContent>
              <Typography variant="subtitle2" sx={{ opacity: 0.8 }}>
                Total Deposits
              </Typography>
              <Typography variant="h6">
                {formatCurrency(transactions
                  .filter(t => t.type === 'Deposit')
                  .reduce((sum, t) => sum + t.amount, 0)
                )}
              </Typography>
            </CardContent>
          </Card>

          <Card 
            sx={{ 
              minWidth: { xs: '100%', sm: 200 },
              background: 'linear-gradient(135deg, #e66c23, #ff8f4c)',
              color: 'white'
            }}
          >
            <CardContent>
              <Typography variant="subtitle2" sx={{ opacity: 0.8 }}>
                Total Withdrawals
              </Typography>
              <Typography variant="h6">
                {formatCurrency(transactions
                  .filter(t => t.type === 'Withdrawal')
                  .reduce((sum, t) => sum + t.amount, 0)
                )}
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Transactions Table */}
      <Paper 
        sx={{ 
          position: 'relative',
          background: 'linear-gradient(to bottom right, #ffffff, #f8f8f8)',
          borderTop: '4px solid',
          borderColor: 'primary.main',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            right: 0,
            width: '200px',
            height: '200px',
            background: 'radial-gradient(circle at top right, rgba(230, 108, 35, 0.05), transparent 70%)',
            pointerEvents: 'none',
          }
        }}
      >
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              m: 2,
              border: 1,
              borderColor: 'error.light'
            }}
          >
            {error}
          </Alert>
        )}

        <TableContainer>
          <Table size={isMobile ? "small" : "medium"}>
            <TableHead>
              <TableRow>
                <TableCell 
                  sx={{ 
                    fontWeight: 600,
                    color: 'primary.main',
                    borderBottom: 2,
                    borderColor: 'primary.main'
                  }}
                >
                  Date
                </TableCell>
                <TableCell 
                  sx={{ 
                    fontWeight: 600,
                    color: 'primary.main',
                    borderBottom: 2,
                    borderColor: 'primary.main'
                  }}
                >
                  Type
                </TableCell>
                <TableCell 
                  sx={{ 
                    fontWeight: 600,
                    color: 'primary.main',
                    borderBottom: 2,
                    borderColor: 'primary.main'
                  }}
                >
                  Amount
                </TableCell>
                {!isMobile && (
                  <TableCell 
                    sx={{ 
                      fontWeight: 600,
                      color: 'primary.main',
                      borderBottom: 2,
                      borderColor: 'primary.main'
                    }}
                  >
                    Description
                  </TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {transactions.length === 0 ? (
                <TableRow>
                  <TableCell 
                    colSpan={isMobile ? 3 : 4} 
                    align="center"
                    sx={{ py: 8 }}
                  >
                    <Typography variant="body1" color="text.secondary">
                      No transactions yet
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                transactions
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((transaction) => (
                    <TableRow 
                      key={transaction.id}
                      sx={{ 
                        '&:hover': { 
                          bgcolor: 'rgba(2, 151, 75, 0.04)',
                        }
                      }}
                    >
                      <TableCell>{formatDate(transaction.createdAt)}</TableCell>
                      <TableCell>
                        <Chip
                          label={transaction.type}
                          color={getTransactionColor(transaction.type)}
                          size="small"
                          sx={{ 
                            fontWeight: 500,
                            minWidth: 90
                          }}
                        />
                      </TableCell>
                      <TableCell
                        sx={{
                          color:
                            transaction.type === 'Deposit'
                              ? 'success.main'
                              : transaction.type === 'Withdrawal'
                              ? 'error.main'
                              : 'text.primary',
                          fontWeight: 500
                        }}
                      >
                        {formatCurrency(transaction.amount)}
                      </TableCell>
                      {!isMobile && (
                        <TableCell sx={{ color: 'text.secondary' }}>
                          {transaction.description}
                        </TableCell>
                      )}
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={transactions.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{
            borderTop: 1,
            borderColor: 'divider',
            '& .MuiTablePagination-select': {
              color: 'primary.main'
            }
          }}
        />
      </Paper>
    </Container>
  );
};

export default Transactions;
