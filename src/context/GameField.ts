import {Char} from "./Char";
import {emptyTile, nonEmptyTile, Tile, TileState} from './Tile';
import Dict, {germanDict, randomGermanNoun} from "./Dict";
import {err, ok, Result} from "neverthrow";


/**
 * State of the game
 */
export enum GameFieldState {
    IN_PROGRESS = 'IN_PROGRESS', WON = 'WON', LOST = 'LOST'
}

/**
 * Represents WORDLE game field, it's a field of size columns x rows
 *
 * supposed to be an immutable type
 */
export interface GameField {
    readonly state: GameFieldState
    readonly rows: number;
    readonly columns: number;
    readonly currentRow: number;
    readonly currentColumn: number;
    readonly tiles: ReadonlyArray<Tile[]>;

    insert(ch: Char): Result<GameField, GameFieldDone | CurrentWordDone>

    currentWordDone(): boolean

    acceptCurrentWord(): Result<GameField, GameFieldDone | CurrentWordDone | WordNotInDict>

    remove(): Result<GameField, GameFieldDone | CurrentWordNotInProgress>

}

type GameFieldData = {
    readonly state: GameFieldState
    readonly solution: string
    readonly rows: number;
    readonly columns: number;
    readonly currentRow: number;
    readonly currentColumn: number;
    readonly tiles: ReadonlyArray<Tile[]>;
    readonly dict: Dict;
}

class DefaultGameField implements GameField {
    readonly columns: number = this.data.columns;
    readonly currentColumn: number = this.data.currentColumn;
    readonly currentRow: number = this.data.currentRow;
    readonly rows: number = this.data.rows;
    readonly state: GameFieldState = this.data.state;
    readonly tiles: ReadonlyArray<Tile[]> = this.data.tiles;

    constructor(private readonly data: GameFieldData) {
    }

    acceptCurrentWord(): Result<GameField, GameFieldDone | CurrentWordDone | WordNotInDict> {
        if (this.done()) {
            return err(new GameFieldDone());
        }

        if (!this.currentWordDone()) {
            return err(new CurrentWordInProgress());
        }

        const word = this.currentWord()
        if (!this.data.dict(word)) {
            return err(new WordNotInDict(word));
        }

        const row = this.data.tiles[this.data.currentRow].map((tile, i) => {
            const index = this.data.solution.indexOf(tile.value);
            if (index < 0) {
                return {
                    ...tile,
                    state: TileState.MISSING
                };
            }

            if (this.data.solution[i] === tile.value) {
                return {
                    ...tile,
                    state: TileState.SOLVED
                };
            }

            return {
                ...tile,
                state: TileState.AVAILABLE
            };
        });

        const tiles = [
            ...this.data.tiles.slice(0, this.data.currentRow),
            row,
            ...this.data.tiles.slice(this.data.currentRow + 1)
        ]

        return ok(
            new DefaultGameField({
                ...this.data,
                tiles,
                currentRow: this.data.currentRow + 1,
                currentColumn: ((this.data.currentRow + 1) >= this.data.rows) ? this.data.currentColumn : 0
            }).fixState()
        );
    }


    insert(ch: Char): Result<GameField, GameFieldDone | CurrentWordDone> {
        if (this.done()) {
            return err(new GameFieldDone());
        }

        if (this.currentWordDone()) {
            return err(new CurrentWordDone());
        }

        const tiles = [
            ...this.data.tiles.slice(0, this.data.currentRow),
            [...this.data.tiles[this.data.currentRow].slice(0, this.data.currentColumn), nonEmptyTile(ch.value), ...this.data.tiles[this.data.currentRow].slice(this.data.currentColumn + 1)],
            ...this.data.tiles.slice(this.data.currentRow + 1)
        ]

        return ok(
            new DefaultGameField(
                {
                    ...this.data,
                    currentColumn: this.data.currentColumn + 1,
                    tiles
                }
            )
        );
    }

    remove(): Result<GameField, GameFieldDone | CurrentWordNotInProgress> {
        if (this.done()) {
            return err(new GameFieldDone())
        }

        if (this.data.currentColumn === 0) {
            return err(new CurrentWordNotInProgress())
        }

        const tiles = [
            ...this.data.tiles.slice(0, this.data.currentRow),
            [...this.data.tiles[this.data.currentRow].slice(0, this.data.currentColumn - 1), emptyTile(), ...this.data.tiles[this.data.currentRow].slice(this.data.currentColumn)],
            ...this.data.tiles.slice(this.data.currentRow + 1)
        ]

        return ok(
            new DefaultGameField({
                ...this.data,
                tiles,
                currentColumn: this.data.currentColumn - 1,
            })
        );
    }


    /**
     * Returns true if given field is done
     */
    private done(): boolean {
        return this.currentWordDone() && this.currentRow >= this.rows;
    }

    /**
     * Returns true if current word is done, no further character can be inserted,
     * we can either accept current word or remove a character
     */
    currentWordDone(): boolean {
        return this.currentColumn > (this.columns - 1);
    }

    private currentWord(): string {
        return this.tiles[this.currentRow]
            .map((tile) => tile.value).join("");
    }

    private fixState(): GameField {
        const state = this.determineState()
        return new DefaultGameField({
            ...this.data,
            state
        })
    }

    private determineState(): GameFieldState {
        if (this.solved()) {
            return GameFieldState.WON
        }

        if (this.done() && !this.solved()) {
            return GameFieldState.LOST
        }

        return GameFieldState.IN_PROGRESS
    }

    /**
     * Returns true if the word is solved
     */
    private solved(): boolean {
        for (const row of this.data.tiles) {
            const word = row.map((tile) => tile.value).join("");

            if (word.toUpperCase() === this.data.solution.toUpperCase()) {
                return true;
            }
        }

        return false;
    }


}

/**
 * Creates and returns a game field of size rows x columns
 */
export function gameField(solution: string = randomGermanNoun(), attempts: number = 6, dict: Dict = germanDict): GameField {
    const columns = solution.length
    const rows = attempts
    const tiles: ReadonlyArray<Tile[]> = [...new Array(rows).keys()]
        .map(() => [...new Array(columns).keys()].map(() => emptyTile()));

    return new DefaultGameField({
        state: GameFieldState.IN_PROGRESS,
        solution: solution.toUpperCase(),
        rows,
        columns,
        currentRow: 0,
        currentColumn: 0,
        tiles,
        dict
    })
}

export class GameFieldDone extends Error {
    constructor() {
        super("game field is done, no further processing possible");
    }
}

export class CurrentWordDone extends Error {
    constructor() {
        super("current word is done, only removing or accepting possible");
    }
}

export class CurrentWordInProgress extends Error {
    constructor() {
        super("current word isn't done yet");
    }
}

export class CurrentWordNotInProgress extends Error {
    constructor() {
        super("there is not current word");
    }
}

/**
 * Signals that given word isn't in the dictionary
 */
export class WordNotInDict extends Error {
    constructor(word: string) {
        super(`${word} is not in dictionary`);
    }
}
