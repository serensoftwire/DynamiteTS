import {Bot} from "./types/bot";
import {GameState} from "./types/gameState";
import {Move} from "./types/move";
import {Round} from "./types/round";

interface MoveTracker {
    'R': number,
    'P': number,
    'S': number,
    'D': number,
    'W': number
}

interface Adjudicator {
    'R': Move[],
    'P': Move[],
    'S': Move[],
    'D': Move[],
    'W': Move[]
}


class ScoreKeeper {
    private ownScore: number;
    private enemyScore: number;

    private static readonly victoryTable: Adjudicator = {
        'R': ['S'],
        'P': ['R'],
        'S': ['P'],
        'D': ['R', 'P', 'S'],
        'W': ['D']
    }

    constructor() {
        this.ownScore = 0;
        this.enemyScore = 0;
    }

    private incrementOwnScore() {
        this.ownScore += 1;
    }

    private incrementEnemyScore() {
        this.enemyScore += 1;
    }

    incrementScore(lastRound: Round) {
        const ownMove = lastRound.p1;
        const enemyMove = lastRound.p2;

        if (enemyMove in ScoreKeeper.victoryTable[ownMove]) {
            this.incrementOwnScore();
        } else if (ownMove in ScoreKeeper.victoryTable[enemyMove]) {
            this.incrementEnemyScore();
        }
    }
}

class SerenBot implements Bot {
    private readonly baseDynamiteChance: number = 0.04;
    private dynamiteChance: number;

    private readonly baseWaterChance: number = 0.04;
    private waterChance: number;

    private readonly normalMoves: Move[] = ['R', 'P', 'S'];
    private randomRPSInt: number = Math.floor(Math.random() * 3);

    private ownDynamiteLeft: number;

    private readonly enemyMoves: MoveTracker;
    private noOfTies: number;

    private readonly scores: ScoreKeeper;

    constructor() {
        this.ownDynamiteLeft = 100;
        this.dynamiteChance = this.baseDynamiteChance;
        this.waterChance = this.baseWaterChance;
        this.noOfTies = 0;
        this.enemyMoves = {'R': 0, 'P': 0, 'S': 0, 'D': 0, 'W': 0};
        this.scores = new ScoreKeeper();
    }

    makeMove(gamestate: GameState): Move {
        this.refreshProbabilities(gamestate);
        const playSpecialMove: string = this.chooseTypeOfMove();

        return playSpecialMove !== 'RPS' ? playSpecialMove as Move : this.chooseRPS();
    }

    private trackMoves(lastRound: Round): void {
        this.enemyMoves[lastRound.p2] += 1;

        if (lastRound.p1 === 'D') {
            this.ownDynamiteLeft -= 1;
        }
    }

    private incrementNoOfTies(lastRound: Round): void {
        if (lastRound.p1 === lastRound.p2) {
            this.noOfTies += 1;
        } else {
            this.noOfTies = 0;
        }
    }

    private adjustDynamiteForTies(): void {
        this.dynamiteChance = this.baseDynamiteChance + 0.02 * this.noOfTies;
    }

    private adjustWaterForTies(): void {
        this.waterChance = this.baseWaterChance + 0.02 * this.noOfTies;
    }

    private adjustDynamiteForEnemyWaterPropensity(gamestate: GameState): void {
        const totalRoundsSoFar: number = gamestate.rounds.length;
        const enemyWaterChance: number = this.enemyMoves['W'] / totalRoundsSoFar;

        const differenceFromExpected: number = enemyWaterChance - this.baseDynamiteChance;

        if (totalRoundsSoFar > 10 && totalRoundsSoFar < 100) {
            this.dynamiteChance -= differenceFromExpected * 0.2;
        } else if (totalRoundsSoFar > 100) {
            this.dynamiteChance -= differenceFromExpected * 0.5;
        }
    }

    private adjustWaterForEnemyDynamitePropensity(gamestate: GameState): void {
        const totalRoundsSoFar: number = gamestate.rounds.length;
        const enemyDynamiteChance: number = this.enemyMoves['D'] / totalRoundsSoFar;

        const differenceFromExpected: number = enemyDynamiteChance - this.baseWaterChance;

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

    private logLastRoundInfo(lastRound: Round) {
        this.trackMoves(lastRound);
        this.incrementNoOfTies(lastRound);
        this.scores.incrementScore(lastRound);
    }

    private refreshProbabilities(gamestate: GameState): void {

        if (gamestate.rounds.length) {
            const lastRound = gamestate.rounds[gamestate.rounds.length - 1];
            this.logLastRoundInfo(lastRound);
        }

        this.adjustDynamiteForTies();
        this.adjustWaterForTies();

        this.adjustWaterForEnemyDynamitePropensity(gamestate);
        this.adjustDynamiteForEnemyWaterPropensity(gamestate);

        this.checkForDynamiteDepletion();
    }

    private chooseTypeOfMove(): string {
        const randomProb: number = Math.random();
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

module.exports = new SerenBot();