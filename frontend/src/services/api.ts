import axios from 'axios';

const API_URL = 'http://localhost:5001/api';

// Configuration axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token aux requêtes
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

// Services d'authentification
export const authService = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.success && response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  register: async (email: string, password: string, name: string) => {
    const response = await api.post('/auth/register', { email, password, name });
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  }
};

// Services pour les élèves
export const studentsService = {
  getAll: async () => {
    const response = await api.get('/students');
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/students/${id}`);
    return response.data;
  },

  create: async (studentData: any) => {
    const response = await api.post('/students', studentData);
    return response.data;
  },

  update: async (id: string, studentData: any) => {
    const response = await api.put(`/students/${id}`, studentData);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/students/${id}`);
    return response.data;
  }
};

// Services pour les séances
export const sessionsService = {
  getAll: async () => {
    const response = await api.get('/sessions');
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/sessions/${id}`);
    return response.data;
  },

  getByStudent: async (studentId: string) => {
    const response = await api.get(`/sessions/student/${studentId}`);
    return response.data;
  },

  create: async (sessionData: any) => {
    const response = await api.post('/sessions', sessionData);
    return response.data;
  },

  update: async (id: string, sessionData: any) => {
    const response = await api.put(`/sessions/${id}`, sessionData);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/sessions/${id}`);
    return response.data;
  }
};

// Services pour les paiements
export const paymentsService = {
  getAll: async () => {
    const response = await api.get('/payments');
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/payments/${id}`);
    return response.data;
  },

  getByStudent: async (studentId: string) => {
    const response = await api.get(`/payments/student/${studentId}`);
    return response.data;
  },

  create: async (paymentData: any) => {
    const response = await api.post('/payments', paymentData);
    return response.data;
  },

  update: async (id: string, paymentData: any) => {
    const response = await api.put(`/payments/${id}`, paymentData);
    return response.data;
  },

  markAsPaid: async (id: string, paymentMethod: string) => {
    const response = await api.post(`/payments/${id}/mark-paid`, { paymentMethod });
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/payments/${id}`);
    return response.data;
  }
};

export default api;
