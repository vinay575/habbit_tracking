import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { supabase } from '@/integrations/supabase/client';

const initialState = {
  habits: [],
  progress: [],
  loading: false,
  error: null,
  filter: 'all',
  sortBy: 'name',
};

// Async thunks
export const fetchHabits = createAsyncThunk(
  'habits/fetchHabits',
  async (_, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('habits')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createHabit = createAsyncThunk(
  'habits/createHabit',
  async (habitData, { rejectWithValue }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('habits')
        .insert([{ ...habitData, user_id: user.id }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateHabit = createAsyncThunk(
  'habits/updateHabit',
  async ({ id, updates }, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('habits')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteHabit = createAsyncThunk(
  'habits/deleteHabit',
  async (id, { rejectWithValue }) => {
    try {
      const { error } = await supabase
        .from('habits')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchProgress = createAsyncThunk(
  'habits/fetchProgress',
  async (_, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('habit_progress')
        .select('*')
        .order('date', { ascending: false });
      
      if (error) throw error;
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateProgress = createAsyncThunk(
  'habits/updateProgress',
  async ({ habitId, date, completedCount, notes }, { rejectWithValue }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('habit_progress')
        .upsert([{
          habit_id: habitId,
          user_id: user.id,
          date,
          completed_count: completedCount,
          notes: notes || null,
        }], {
          onConflict: 'user_id,habit_id,date',
          ignoreDuplicates: false
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const habitSlice = createSlice({
  name: 'habits',
  initialState,
  reducers: {
    setFilter: (state, action) => {
      state.filter = action.payload;
    },
    setSortBy: (state, action) => {
      state.sortBy = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch habits
      .addCase(fetchHabits.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchHabits.fulfilled, (state, action) => {
        state.loading = false;
        state.habits = action.payload;
      })
      .addCase(fetchHabits.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create habit
      .addCase(createHabit.fulfilled, (state, action) => {
        state.habits.unshift(action.payload);
      })
      .addCase(createHabit.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Update habit
      .addCase(updateHabit.fulfilled, (state, action) => {
        const index = state.habits.findIndex(habit => habit.id === action.payload.id);
        if (index !== -1) {
          state.habits[index] = action.payload;
        }
      })
      .addCase(updateHabit.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Delete habit
      .addCase(deleteHabit.fulfilled, (state, action) => {
        state.habits = state.habits.filter(habit => habit.id !== action.payload);
      })
      .addCase(deleteHabit.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Fetch progress
      .addCase(fetchProgress.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProgress.fulfilled, (state, action) => {
        state.loading = false;
        state.progress = action.payload;
      })
      .addCase(fetchProgress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update progress
      .addCase(updateProgress.fulfilled, (state, action) => {
        const index = state.progress.findIndex(
          p => p.habit_id === action.payload.habit_id && p.date === action.payload.date
        );
        if (index !== -1) {
          state.progress[index] = action.payload;
        } else {
          state.progress.push(action.payload);
        }
      })
      .addCase(updateProgress.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { setFilter, setSortBy, clearError } = habitSlice.actions;
export default habitSlice.reducer;