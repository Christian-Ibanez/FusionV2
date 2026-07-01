import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface User {
  id?: number;
  nombreCompleto: string;
  correoElectronico: string;
  telefono: string;
  rol: string;
}

export interface AuthResponse {
  token: string;
}

export const authApi = {
  login: async (correo: string, contrasena: string) => {
    const res = await api.post<AuthResponse>('/auth/login', { correo, contrasena });
    const token = res.data.token;
    sessionStorage.setItem('token', token);
    
    // Fetch user profile
    const userRes = await api.get<User>(`/usuarios/correo/${correo}`);
    return { token, user: userRes.data };
  },
  
  register: async (data: any) => {
    await api.post('/auth/registro', data);
  },
  
  logout: () => {
    sessionStorage.removeItem('token');
  }
};

export const userApi = {
  updateProfile: async (id: number, data: { nombreCompleto: string; telefono: string }) => {
    const res = await api.put<User>(`/usuarios/${id}/perfil`, data);
    return res.data;
  },
  getAllUsers: async () => {
    const res = await api.get<User[]>('/usuarios/todos');
    return res.data;
  },
  updateRole: async (id: number, nuevoRol: string) => {
    const res = await api.put<User>(`/usuarios/${id}/rol`, null, { params: { nuevoRol } });
    return res.data;
  },
  deleteUser: async (id: number) => {
    await api.delete(`/usuarios/${id}`);
  }
};

export const reportesApi = {
  getActivos: async () => {
    const res = await axios.get('http://localhost:8081/api/reportes/activos');
    return res.data;
  },
  getTodos: async () => {
    const res = await axios.get('http://localhost:8081/api/reportes/todos');
    return res.data;
  },
  crear: async (data: any) => {
    const res = await axios.post('http://localhost:8081/api/reportes/crearReporte', data);
    return res.data;
  }
};

export const notificacionesApi = {
  getHistorial: async (correo: string) => {
    const res = await api.get(`/notificaciones/${correo}`);
    return res.data;
  }
};

export const coincidenciasApi = {
  getByReporte: async (reporteId: number) => {
    const res = await api.get(`/coincidencias/reporte/${reporteId}`);
    return res.data;
  }
};
