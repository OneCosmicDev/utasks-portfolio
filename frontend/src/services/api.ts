import axios, { AxiosError } from 'axios';
import type { 
  ApiResponse, 
  User, 
  CreateUserRequest,
  Board, 
  CreateBoardRequest,
  UpdateBoardRequest,
  List,
  CreateListRequest,
  UpdateListRequest,
  Card,
  CreateCardRequest,
  UpdateCardRequest
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const TOKEN_KEY = 'utasks_token';
const USER_KEY = 'utasks_user';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
    return Promise.reject(error);
  }
);

const handleError = (error: AxiosError<ApiResponse<any>>): ApiResponse<any> => {
  if (error.response) {
    return error.response.data || {
      success: false,
      message: `Server error (${error.response.status})`,
    };
  } else if (error.request) {
    return {
      success: false,
      message: 'Network error. Please check your connection.',
    };
  } else {
    return {
      success: false,
      message: error.message || 'An unexpected error occurred',
    };
  }
};

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export const authService = {
  register: async (userData: RegisterRequest): Promise<ApiResponse<AuthResponse>> => {
    try {
      const response = await api.post<ApiResponse<AuthResponse>>('/api/auth/register', userData);
      if (response.data.success && response.data.data) {
        localStorage.setItem(TOKEN_KEY, response.data.data.token);
        localStorage.setItem(USER_KEY, JSON.stringify(response.data.data.user));
      }
      return response.data;
    } catch (error) {
      return handleError(error as AxiosError<ApiResponse<AuthResponse>>);
    }
  },

  login: async (credentials: LoginRequest): Promise<ApiResponse<AuthResponse>> => {
    try {
      const response = await api.post<ApiResponse<AuthResponse>>('/api/auth/login', credentials);
      if (response.data.success && response.data.data) {
        localStorage.setItem(TOKEN_KEY, response.data.data.token);
        localStorage.setItem(USER_KEY, JSON.stringify(response.data.data.user));
      }
      return response.data;
    } catch (error) {
      return handleError(error as AxiosError<ApiResponse<AuthResponse>>);
    }
  },

  logout: async (): Promise<void> => {
    try {
      await api.post('/api/auth/logout');
    } catch {
    } finally {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
  },

  getMe: async (): Promise<ApiResponse<User>> => {
    try {
      const response = await api.get<ApiResponse<User>>('/api/auth/me');
      return response.data;
    } catch (error) {
      return handleError(error as AxiosError<ApiResponse<User>>);
    }
  },

  getToken: (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
  },

  getStoredUser: (): User | null => {
    const userStr = localStorage.getItem(USER_KEY);
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem(TOKEN_KEY);
  },
};

export const userService = {
  register: async (userData: CreateUserRequest): Promise<ApiResponse<User>> => {
    try {
      const response = await api.post<ApiResponse<User>>('/api/users/register', userData);
      return response.data;
    } catch (error) {
      return handleError(error as AxiosError<ApiResponse<User>>);
    }
  },

  getById: async (userId: string): Promise<ApiResponse<User>> => {
    try {
      const response = await api.get<ApiResponse<User>>(`/api/users/${userId}`);
      return response.data;
    } catch (error) {
      return handleError(error as AxiosError<ApiResponse<User>>);
    }
  },

  delete: async (userId: string): Promise<ApiResponse<void>> => {
    try {
      const response = await api.delete<ApiResponse<void>>(`/api/users/${userId}`);
      return response.data;
    } catch (error) {
      return handleError(error as AxiosError<ApiResponse<void>>);
    }
  },
};

const adaptBoardFromAPI = (board: any): Board => ({
  ...board,
  title: board.title || board.name,
});

export const boardService = {
  getByUserId: async (userId: string): Promise<ApiResponse<Board[]>> => {
    try {
      const response = await api.get<ApiResponse<any[]>>(`/api/boards/user/${userId}`);
      
      if (response.data.success && response.data.data) {
        return {
          ...response.data,
          data: response.data.data.map(adaptBoardFromAPI)
        };
      }
      return response.data;
    } catch (error) {
      return handleError(error as AxiosError<ApiResponse<Board[]>>);
    }
  },

  getMyBoards: async (): Promise<ApiResponse<Board[]>> => {
    try {
      const response = await api.get<ApiResponse<any[]>>('/api/boards/my');
      
      if (response.data.success && response.data.data) {
        return {
          ...response.data,
          data: response.data.data.map(adaptBoardFromAPI)
        };
      }
      return response.data;
    } catch (error) {
      return handleError(error as AxiosError<ApiResponse<Board[]>>);
    }
  },

  getById: async (boardId: string): Promise<ApiResponse<Board>> => {
    try {
      const response = await api.get<ApiResponse<any>>(`/api/boards/${boardId}`);
      
      if (response.data.success && response.data.data) {
        return {
          ...response.data,
          data: adaptBoardFromAPI(response.data.data)
        };
      }
      return response.data;
    } catch (error) {
      return handleError(error as AxiosError<ApiResponse<Board>>);
    }
  },

  create: async (boardData: CreateBoardRequest): Promise<ApiResponse<Board>> => {
    try {
      const response = await api.post<ApiResponse<any>>('/api/boards', boardData);
      
      if (response.data.success && response.data.data) {
        return {
          ...response.data,
          data: adaptBoardFromAPI(response.data.data)
        };
      }
      return response.data;
    } catch (error) {
      return handleError(error as AxiosError<ApiResponse<Board>>);
    }
  },

  update: async (boardId: string, boardData: UpdateBoardRequest): Promise<ApiResponse<Board>> => {
    try {
      const response = await api.put<ApiResponse<any>>(`/api/boards/${boardId}`, boardData);
      
      if (response.data.success && response.data.data) {
        return {
          ...response.data,
          data: adaptBoardFromAPI(response.data.data)
        };
      }
      return response.data;
    } catch (error) {
      return handleError(error as AxiosError<ApiResponse<Board>>);
    }
  },

  delete: async (boardId: string): Promise<ApiResponse<void>> => {
    try {
      const response = await api.delete<ApiResponse<void>>(`/api/boards/${boardId}`);
      return response.data;
    } catch (error) {
      return handleError(error as AxiosError<ApiResponse<void>>);
    }
  },
};

export const listService = {
  getByBoardId: async (boardId: string): Promise<ApiResponse<List[]>> => {
    try {
      const response = await api.get<ApiResponse<List[]>>(`/api/lists/board/${boardId}`);
      return response.data;
    } catch (error) {
      return handleError(error as AxiosError<ApiResponse<List[]>>);
    }
  },

  getById: async (listId: string): Promise<ApiResponse<List>> => {
    try {
      const response = await api.get<ApiResponse<List>>(`/api/lists/${listId}`);
      return response.data;
    } catch (error) {
      return handleError(error as AxiosError<ApiResponse<List>>);
    }
  },

  create: async (listData: CreateListRequest): Promise<ApiResponse<List>> => {
    try {
      const response = await api.post<ApiResponse<List>>('/api/lists', listData);
      return response.data;
    } catch (error) {
      return handleError(error as AxiosError<ApiResponse<List>>);
    }
  },

  update: async (listId: string, listData: UpdateListRequest): Promise<ApiResponse<List>> => {
    try {
      const response = await api.put<ApiResponse<List>>(`/api/lists/${listId}`, listData);
      return response.data;
    } catch (error) {
      return handleError(error as AxiosError<ApiResponse<List>>);
    }
  },

  delete: async (listId: string): Promise<ApiResponse<void>> => {
    try {
      const response = await api.delete<ApiResponse<void>>(`/api/lists/${listId}`);
      return response.data;
    } catch (error) {
      return handleError(error as AxiosError<ApiResponse<void>>);
    }
  },
};

export const cardService = {
  getByListId: async (listId: string): Promise<ApiResponse<Card[]>> => {
    try {
      const response = await api.get<ApiResponse<Card[]>>(`/api/cards/list/${listId}`);
      return response.data;
    } catch (error) {
      return handleError(error as AxiosError<ApiResponse<Card[]>>);
    }
  },

  getById: async (cardId: string): Promise<ApiResponse<Card>> => {
    try {
      const response = await api.get<ApiResponse<Card>>(`/api/cards/${cardId}`);
      return response.data;
    } catch (error) {
      return handleError(error as AxiosError<ApiResponse<Card>>);
    }
  },

  create: async (cardData: CreateCardRequest): Promise<ApiResponse<Card>> => {
    try {
      const response = await api.post<ApiResponse<Card>>('/api/cards', cardData);
      return response.data;
    } catch (error) {
      return handleError(error as AxiosError<ApiResponse<Card>>);
    }
  },

  update: async (cardId: string, cardData: UpdateCardRequest): Promise<ApiResponse<Card>> => {
    try {
      const response = await api.put<ApiResponse<Card>>(`/api/cards/${cardId}`, cardData);
      return response.data;
    } catch (error) {
      return handleError(error as AxiosError<ApiResponse<Card>>);
    }
  },

  delete: async (cardId: string): Promise<ApiResponse<void>> => {
    try {
      const response = await api.delete<ApiResponse<void>>(`/api/cards/${cardId}`);
      return response.data;
    } catch (error) {
      return handleError(error as AxiosError<ApiResponse<void>>);
    }
  },
};

export default api;
