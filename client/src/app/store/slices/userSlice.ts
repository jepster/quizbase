import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const loadState = () => {
  try {
    const serializedState = localStorage.getItem('playerName');
    if (serializedState === null) {
      return '';
    }
    return JSON.parse(serializedState);
  } catch (error) {
    console.error(error);
  }
};

interface UserState {
  playerName: string;
  authToken: string,
}

const initialState: UserState = {
  playerName: loadState(),
  authToken: '',
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setPlayerName: (state, action: PayloadAction<string>) => {
      state.playerName = action.payload;
      localStorage.setItem('playerName', JSON.stringify(action.payload));
    },
    setAuthToken: (state, action: PayloadAction<string>) => {
      state.authToken = action.payload;
    },
  },
});

export const { setPlayerName, setAuthToken } = userSlice.actions;
export default userSlice.reducer;
