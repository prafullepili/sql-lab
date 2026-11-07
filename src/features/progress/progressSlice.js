import { createSlice } from '@reduxjs/toolkit';

const progressSlice = createSlice({
  name: 'progress',
  initialState: { currentLesson: 0, completed: [], tasksCompleted: [], courseOrderVersion: 5 },
  reducers: {
    setCurrentLesson(state, action) { state.currentLesson = action.payload; },
    toggleComplete(state, action) {
      const id = action.payload;
      state.completed = state.completed.includes(id) ? state.completed.filter((item) => item !== id) : [...state.completed, id];
    },
    markTaskComplete(state, action) {
      if (!state.tasksCompleted.includes(action.payload)) state.tasksCompleted.push(action.payload);
    },
    resetProgress(state) { state.completed = []; state.tasksCompleted = []; },
  },
});

export const { setCurrentLesson, toggleComplete, markTaskComplete, resetProgress } = progressSlice.actions;
export default progressSlice.reducer;
