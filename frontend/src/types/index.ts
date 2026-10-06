export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Array<{ message: string }>;
}

export interface User {
  id: string;
  username: string;
  name?: string;
  email: string;
}

export interface CreateUserRequest {
  username: string;
  email: string;
}

export interface Board {
  id: string;
  title: string;
  description?: string;
  userId?: string;
}

export interface CreateBoardRequest {
  name: string;
  description?: string;
  userId: string;
}

export interface UpdateBoardRequest {
  name?: string;
  description?: string;
  userId?: string;
}

export interface List {
  id: string;
  name: string;
  boardId: string;
  position?: number;
}

export interface CreateListRequest {
  name: string;
  boardId: string;
  position?: number;
}

export interface UpdateListRequest {
  name?: string;
  boardId?: string;
  position?: number;
}

export interface Card {
  id: string;
  title: string;
  description?: string;
  listId: string;
  position?: number;
  priority?: 1 | 2 | 3;
  dueDate?: string;
  isCompleted?: boolean;
}

export interface CreateCardRequest {
  title: string;
  description?: string;
  listId: string;
  position?: number;
  priority?: 1 | 2 | 3;
  dueDate?: string;
  isCompleted?: boolean;
}

export interface UpdateCardRequest {
  title?: string;
  description?: string;
  listId?: string;
  position?: number;
  priority?: 1 | 2 | 3;
  dueDate?: string;
  isCompleted?: boolean;
}

