import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { RootState } from '../index';

export interface GeneratedTask {
  title: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High';
  labels: string[];
}

export interface ProjectAIInsight {
  projectId: number;
  projectName: string;
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  healthScore: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  statusSummary: string;
  keyRisks: string[];
  recommendedActions: string[];
}

interface AIState {
  generatedTasks: GeneratedTask[];
  currentInsight: ProjectAIInsight | null;
  isGeneratingTasks: boolean;
  isFetchingInsight: boolean;
  taskSource: 'ai' | 'smart-rules' | null;
  error: string | null;
}

const initialState: AIState = {
  generatedTasks: [],
  currentInsight: null,
  isGeneratingTasks: false,
  isFetchingInsight: false,
  taskSource: null,
  error: null,
};

// Async thunk: Generate AI Tasks Preview
export const generateAITasks = createAsyncThunk(
  'ai/generateTasks',
  async (
    payload: { projectId?: number; projectName?: string; projectDescription?: string; customPrompt?: string; count?: number; autoInsert?: boolean },
    { getState, rejectWithValue }
  ) => {
    try {
      const state = getState() as RootState;
      const token = state.auth.token;

      const response = await fetch('/api/ai/generate-tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to generate tasks');
      }

      return data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Network error');
    }
  }
);

// Async thunk: Fetch AI Project Insight
export const fetchAIProjectInsight = createAsyncThunk(
  'ai/fetchProjectInsight',
  async (projectId: number, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const token = state.auth.token;

      const response = await fetch('/api/ai/project-summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ projectId }),
      });

      const data = await response.json();
      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to fetch AI summary');
      }

      return data as ProjectAIInsight;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Network error');
    }
  }
);

const aiSlice = createSlice({
  name: 'ai',
  initialState,
  reducers: {
    clearGeneratedTasks: (state) => {
      state.generatedTasks = [];
      state.taskSource = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Generate Tasks
      .addCase(generateAITasks.pending, (state) => {
        state.isGeneratingTasks = true;
        state.error = null;
      })
      .addCase(generateAITasks.fulfilled, (state, action) => {
        state.isGeneratingTasks = false;
        state.generatedTasks = action.payload.tasks || [];
        state.taskSource = action.payload.source || 'ai';
      })
      .addCase(generateAITasks.rejected, (state, action) => {
        state.isGeneratingTasks = false;
        state.error = action.payload as string;
      })
      // Project Insight
      .addCase(fetchAIProjectInsight.pending, (state) => {
        state.isFetchingInsight = true;
        state.error = null;
      })
      .addCase(fetchAIProjectInsight.fulfilled, (state, action) => {
        state.isFetchingInsight = false;
        state.currentInsight = action.payload;
      })
      .addCase(fetchAIProjectInsight.rejected, (state, action) => {
        state.isFetchingInsight = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearGeneratedTasks } = aiSlice.actions;
export default aiSlice.reducer;
