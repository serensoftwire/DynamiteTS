import {Bot} from "./types/bot";
import {GameState} from "./types/gameState";
import {Move} from "./types/move";
import {Round} from "./types/round";

interface MoveTracker {
    'R': number;
    'P': number,
    'S': number,
    'D': number,
    'W': number
}

class MyBot implements Bot {
    private readonly baseDynamiteChance: number = 0.04;
    private dynamiteChance: number = 0.04;

    private readonly baseWaterChance: number = 0.04;
    private waterChance: number = 0.04;
    private readonly normalMoves: Move[] = ['R', 'P', 'S'];
    private randomRPSInt: number = Math.floor(Math.random() * 3);

    private ownDynamiteLeft: number = 100;

    private enemyMoves: MoveTracker = {'R': 0, 'P': 0, 'S': 0, 'D': 0, 'W': 0}
    private noOfTies: number = 0;

    makeMove(gamestate: GameState): Move {
        this.refreshProbabilities(gamestate);
        const playSpecialMove: string = this.chooseTypeOfMove();

        console.log(`We have ${this.ownDynamiteLeft} dynamites left`);
        console.log(`Chance of dynamite is ${this.dynamiteChance}`);

        return playSpecialMove !== 'RPS' ? playSpecialMove as Move : this.chooseRPS();
    }

    private trackMoves(gamestate: GameState): void {
        if (gamestate.rounds.length) {
            const lastRound: Round = gamestate.rounds[gamestate.rounds.length - 1];

            console.log(lastRound);

            this.enemyMoves[lastRound.p2] += 1;

            if (lastRound.p1 === 'D') {
                this.ownDynamiteLeft -= 1;
            }
        }
    }

    private incrementNoOfTies(gamestate: GameState): void {
        if (gamestate.rounds.length) {
            const lastRound: Round = gamestate.rounds[gamestate.rounds.length - 1];

            if (lastRound.p1 === lastRound.p2) {
                this.noOfTies += 1;
            } else {
                this.noOfTies = 0;
            }
        }
        console.log(this.noOfTies);
    }

    private adjustDynamiteForTies(): void {
        this.dynamiteChance = this.baseDynamiteChance + 0.02 * this.noOfTies;
    }

    private adjustWaterForTies(): void {
        this.waterChance = this.baseWaterChance + 0.02 * this.noOfTies;
    }

    private adjustWaterForEnemyDynamitePropensity(gamestate: GameState): void {
        const totalRoundsSoFar: number = gamestate.rounds.length;
        const enemyDynamiteChance = this.enemyMoves['D'] / totalRoundsSoFar;

        const differenceFromExpected = enemyDynamiteChance - this.baseWaterChance;

        if (totalRoundsSoFar > 10 && totalRoundsSoFar < 100) {
            this.waterChance += differenceFromExpected * 0.5;
        } else if (totalRoundsSoFar > 100) {
            this.waterChance += differenceFromExpected * 0.8;
        }
    }

    private checkForDynamiteDepletion(): void {
        if (this.enemyMoves['D'] === 100) {
            this.waterChance = 0;
        }
        if (this.ownDynamiteLeft === 0) {
            this.dynamiteChance = 0;
        }
    }

    private refreshProbabilities(gamestate: GameState): void {
        this.trackMoves(gamestate);
        this.incrementNoOfTies(gamestate);

        this.adjustDynamiteForTies();
        this.adjustWaterForTies();

        this.adjustWaterForEnemyDynamitePropensity(gamestate);

        this.checkForDynamiteDepletion();
    }

    private chooseTypeOfMove(): string {
        const randomProb = Math.random();
        if (randomProb < this.dynamiteChance) {
            return 'D';
        } else if (randomProb < this.dynamiteChance + this.waterChance) {
            return 'W';
        } else {
            return 'RPS';
        }
    }

    private rollForRPS(): void {
        this.randomRPSInt = Math.floor(Math.random() * 3);
    }

    private chooseRPS(): Move {
        this.rollForRPS();
        return this.normalMoves[this.randomRPSInt];
    }
}

module.exports = new MyBot();