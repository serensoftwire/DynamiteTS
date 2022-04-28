import {Bot} from "./types/bot";
import {GameState} from "./types/gameState";
import {Move} from "./types/move";

class MyBot implements Bot {
    makeMove(gamestate: GameState): Move {
        return 'P';
    }
}

module.exports = new MyBot();