import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import type { Task, TaskState, TaskStatus, TaskComment } from '../../types/task';

import { API_BASE_URL } from '../../utils/config';

const API_URL = `${API_BASE_URL}/tasks`;
const AI_URL = `${API_BASE_URL}/ai`;

const initialState: TaskState = {
  tasks: [],
  activeTaskComments: [],
  isLoading: false,
  isCommentsLoading: false,
  error: null,
};

export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async (projectId: string, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch tasks');
    }
  }
);

export const fetchUserAllTasks = createAsyncThunk(
  'tasks/fetchUserAllTasks',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user tasks');
    }
  }
);

export const createTask = createAsyncThunk(
  'tasks/createTask',
  async ({ projectId, taskData }: { projectId: string; taskData: Partial<Task> }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/${projectId}`, taskData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create task');
    }
  }
);

export const updateTaskDetail = createAsyncThunk(
  'tasks/updateTaskDetail',
  async ({ taskId, updates }: { taskId: number; updates: Partial<Task> }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`${API_URL}/detail/${taskId}`, updates, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update task');
    }
  }
);

export const deleteTask = createAsyncThunk(
  'tasks/deleteTask',
  async (taskId: number, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return taskId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete task');
    }
  }
);

export const updateTaskPositions = createAsyncThunk(
  'tasks/updateTaskPositions',
  async ({ projectId, tasks }: { projectId: string; tasks: { id: number; status: TaskStatus; position: number }[] }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/${projectId}/positions`, { tasks }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return tasks;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update positions');
    }
  }
);

export const fetchTaskComments = createAsyncThunk(
  'tasks/fetchTaskComments',
  async (taskId: number, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/comments/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch comments');
    }
  }
);

export const addTaskComment = createAsyncThunk(
  'tasks/addTaskComment',
  async ({ taskId, comment }: { taskId: number; comment: string }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/comments/${taskId}`, { comment }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to post comment');
    }
  }
);

export const deleteTaskComment = createAsyncThunk(
  'tasks/deleteTaskComment',
  async (commentId: number, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/comments/${commentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return commentId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete comment');
    }
  }
);

export const smartPrioritizeTasks = createAsyncThunk(
  'tasks/smartPrioritizeTasks',
  async (projectId: number, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${AI_URL}/smart-prioritize`, { projectId }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.tasks;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to auto-prioritize tasks');
    }
  }
);

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    optimisticUpdatePositions: (state, action: PayloadAction<{ id: number; status: TaskStatus; position: number }[]>) => {
      const updates = action.payload;
      updates.forEach(update => {
        const task = state.tasks.find(t => t.id === update.id);
        if (task) {
          task.status = update.status;
          task.position = update.position;
        }
      });
      state.tasks.sort((a, b) => a.position - b.position);
    },
    clearTasks: (state) => {
      state.tasks = [];
      state.activeTaskComments = [];
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action: PayloadAction<Task[]>) => {
        state.isLoading = false;
        state.tasks = action.payload;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchUserAllTasks.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserAllTasks.fulfilled, (state, action: PayloadAction<Task[]>) => {
        state.isLoading = false;
        state.tasks = action.payload;
      })
      .addCase(fetchUserAllTasks.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(createTask.fulfilled, (state, action: PayloadAction<Task>) => {
        state.tasks.push(action.payload);
      })
      .addCase(updateTaskDetail.fulfilled, (state, action: PayloadAction<Task>) => {
        const index = state.tasks.findIndex(t => t.id === action.payload.id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
      })
      .addCase(deleteTask.fulfilled, (state, action: PayloadAction<number>) => {
        state.tasks = state.tasks.filter(t => t.id !== action.payload);
      })
      .addCase(fetchTaskComments.pending, (state) => {
        state.isCommentsLoading = true;
      })
      .addCase(fetchTaskComments.fulfilled, (state, action: PayloadAction<TaskComment[]>) => {
        state.isCommentsLoading = false;
        state.activeTaskComments = action.payload;
      })
      .addCase(addTaskComment.fulfilled, (state, action: PayloadAction<TaskComment>) => {
        state.activeTaskComments.push(action.payload);
      })
      .addCase(deleteTaskComment.fulfilled, (state, action: PayloadAction<number>) => {
        state.activeTaskComments = state.activeTaskComments.filter(c => c.id !== action.payload);
      })
      .addCase(smartPrioritizeTasks.fulfilled, (state, action: PayloadAction<Task[]>) => {
        state.tasks = action.payload;
      });
  },
});

export const { optimisticUpdatePositions, clearTasks } = taskSlice.actions;
export default taskSlice.reducer;
