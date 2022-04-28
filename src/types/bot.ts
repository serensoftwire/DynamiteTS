import {GameState} from "./gameState";
import {Move} from "./move";

export interface Bot {
    makeMove(gameState: GameState): Move
}