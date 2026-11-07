import { createSlice } from '@reduxjs/toolkit';

const querySlice = createSlice({
  name: 'queries',
  initialState: { byLesson: {} },
  reducers: {
    saveQuery(state, action) { state.byLesson[action.payload.lesson] = action.payload.sql; },
    resetQuery(state, action) { delete state.byLesson[action.payload]; },
  },
});

export const { saveQuery, resetQuery } = querySlice.actions;
export default querySlice.reducer;
