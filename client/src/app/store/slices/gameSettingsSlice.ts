import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface GameSettingsState {
  category: string;
  difficulty: string;
}

const initialState: GameSettingsState = {
  category: '',
  difficulty: '',
};

const gameSettingsSlice = createSlice({
  name: 'gameSettings',
  initialState,
  reducers: {
    setCategory: (state, action: PayloadAction<string>) => {
      state.category = action.payload;
    },
    setDifficulty: (state, action: PayloadAction<string>) => {
      state.difficulty = action.payload;
    },
  },
});

export const { setCategory, setDifficulty } = gameSettingsSlice.actions;
export default gameSettingsSlice.reducer;
