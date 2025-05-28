import axios from 'axios';

const API_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:7000/api'
  : 'https://localhost:7001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false
});

// Add a request interceptor to add the JWT token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error('Response Error:', error.response.data);
    } else if (error.request) {
      console.error('Request Error:', error.request);
    } else {
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export interface LoginData {
  username: string;
  password: string;
}

export interface TransactionData {
  amount: number;
  type: number;
  description: string;
  recipientUsername?: string;
}

export interface UserResponse {
  id: number;
  username: string;
  email: string;
  walletBalance: number;
}

export interface TransactionResponse {
  id: number;
  amount: number;
  type: string;
  description: string;
  createdAt: string;
  username: string;
  newBalance: number;
}

const authApi = {
  async register(data: RegisterData): Promise<UserResponse> {
    const response = await api.post('/auth/register', data);
    const token = response.headers.authorization?.replace('Bearer ', '');
    if (token) {
      localStorage.setItem('token', token);
      localStorage.setItem('username', data.username); // Store username for welcome message
    }
    return response.data;
  },

  async login(data: LoginData): Promise<UserResponse> {
    const response = await api.post('/auth/login', data);
    const token = response.headers.authorization?.replace('Bearer ', '');
    if (token) {
      localStorage.setItem('token', token);
      localStorage.setItem('username', data.username); // Store username for welcome message
    }
    return response.data;
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
  }
};

const walletApi = {
  async getBalance(): Promise<number> {
    const response = await api.get('/wallet/balance');
    return response.data;
  },

  async createTransaction(data: TransactionData): Promise<TransactionResponse> {
    const response = await api.post('/wallet/transaction', data);
    return response.data;
  },

  async getTransactions(): Promise<TransactionResponse[]> {
    const response = await api.get('/wallet/transactions');
    return response.data;
  }
};

export { authApi, walletApi };
