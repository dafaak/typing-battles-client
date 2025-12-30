import { createSlice } from "@reduxjs/toolkit";
import { GameState } from "../interfaces/GameStatus.ts";

interface PartieState {
  name?: string,
  state?: GameState,
  text?: string
}

const initialState: PartieState = {
  name: undefined,
  state: undefined,
  text: undefined
}

const partieSlice = createSlice(
    {
      name: 'partie',
      initialState,
      reducers: {
        setPartieState(state, action) {
          state.state = action.payload;
        },
        setPartieName(state, action) {
          state.name = action.payload;
        },
        setPartie(state, action) {
          state.name = action.payload.name;
          state.state = action.payload.state;
        },
        setText(state, action) {
          state.text = action.payload;
        }
      },
    }
)

export const {setPartieState, setPartieName, setText, setPartie} = partieSlice.actions;
export default partieSlice.reducer;