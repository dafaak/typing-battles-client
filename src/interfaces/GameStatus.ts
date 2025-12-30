import { Player } from "./Player.ts";

export interface GameStatus {
  players: Player[],
  name: string,
  state: GameState,
  targetString?: string,
  finished?: boolean,
}

export enum GameState {
  Loby = "loby",
  Running = "running",
  Ending = "ending",
  Preparing = "preparing",
  Ready = "ready",
  Finished = "finished"
}