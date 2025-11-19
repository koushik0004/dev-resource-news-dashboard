import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface FilterState {
  searchQuery: string;
  languageFilter: string;
}

const initialState: FilterState = {
  searchQuery: '',
  languageFilter: '',
};

const filterSlice = createSlice({
  name: 'filter',
  initialState,
  reducers: {
    setSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload;
    },
    setLanguageFilter(state, action: PayloadAction<string>) {
      state.languageFilter = action.payload;
    },
  },
});

export const { setSearchQuery, setLanguageFilter } = filterSlice.actions;
export default filterSlice.reducer;
