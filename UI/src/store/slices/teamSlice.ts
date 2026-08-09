import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import type { TeamMember, TeamState, TeamRole } from '../../types/team';

import { API_BASE_URL } from '../../utils/config';

const API_URL = `${API_BASE_URL}/team`;

const initialState: TeamState = {
  members: [],
  isLoading: false,
  error: null,
};

export const fetchTeam = createAsyncThunk(
  'team/fetchTeam',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch team');
    }
  }
);

export const fetchTeamMembers = fetchTeam;

export const inviteMember = createAsyncThunk(
  'team/inviteMember',
  async ({ email, role }: { email: string; role: TeamRole }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/invite`, { email, role }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to invite member');
    }
  }
);

export const updateMemberRole = createAsyncThunk(
  'team/updateMemberRole',
  async ({ id, role }: { id: number; role: TeamRole }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`${API_URL}/${id}`, { role }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update role');
    }
  }
);

export const removeMember = createAsyncThunk(
  'team/removeMember',
  async (id: number, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to remove member');
    }
  }
);

const teamSlice = createSlice({
  name: 'team',
  initialState,
  reducers: {
    clearTeam: (state) => {
      state.members = [];
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTeam.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTeam.fulfilled, (state, action: PayloadAction<TeamMember[]>) => {
        state.isLoading = false;
        state.members = action.payload;
      })
      .addCase(fetchTeam.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(inviteMember.fulfilled, (state, action: PayloadAction<TeamMember>) => {
        state.members.unshift(action.payload);
      })
      .addCase(updateMemberRole.fulfilled, (state, action: PayloadAction<{ id: number; role: TeamRole }>) => {
        const member = state.members.find(m => m.id === action.payload.id);
        if (member) {
          member.role = action.payload.role;
        }
      })
      .addCase(removeMember.fulfilled, (state, action: PayloadAction<number>) => {
        state.members = state.members.filter(m => m.id !== action.payload);
      });
  },
});

export const { clearTeam } = teamSlice.actions;
export default teamSlice.reducer;
