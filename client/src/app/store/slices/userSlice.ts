import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  playerName: string;
  authToken: string;
}

const initialState: UserState = {
  playerName: '',
  authToken: '',
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setPlayerName: (state, action: PayloadAction<string>) => {
      state.playerName = action.payload;
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('playerName', JSON.stringify(action.payload));
      }
    },
    setAuthToken: (state, action: PayloadAction<string>) => {
      state.authToken = action.payload;
    },
  },
});

export const { setPlayerName, setAuthToken } = userSlice.actions;
export default userSlice.reducer;
