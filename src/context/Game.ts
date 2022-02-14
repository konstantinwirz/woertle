import {gameField, GameField, GameFieldState} from "./GameField";
import {char} from "./Char";
import {err, Result} from "neverthrow";
import {TileState} from "./Tile";


/**
 * Represents the WORDLE game
 */
export interface Game {
    readonly field: GameField

    deletePossible(): boolean
    acceptPossible(): boolean
    inputPossible(): boolean
    handleInput(input: UserInput): Result<Game, Error>

    inputAvailability(input: string): InputAvailability
}

/**
 * Creates a game with given solution and number of possible tries
 */
export function game(): Game {
    return new DefaultGame(gameField());
}

export enum InputAvailability {
    UNKNOWN = "UNKNOWN", MISSING = "MISSING", AVAILABLE = "AVAILABLE", SOLVED = "SOLVED"
}

export enum UserInputType {
    CHAR = "CHAR",
    DEL = "DEL",
    ENTER = "ENTER"
}

export type UserInput = { type: UserInputType.ENTER } | { type: UserInputType.DEL } | {
    type: UserInputType.CHAR
    value: string
}

class DefaultGame implements Game {
    constructor(readonly field: GameField) {
    }

    acceptPossible(): boolean {
        return this.field.currentWordDone();
    }

    deletePossible(): boolean {
        return this.field.state === GameFieldState.IN_PROGRESS && this.field.currentColumn > 0;
    }

    handleInput(input: UserInput): Result<Game, Error> {
        // Handle DEL
        if (input.type === UserInputType.DEL) {
            if (!this.deletePossible()) {
                return err(new Error("delete no possible"));
            }

            return this.field.remove().map(field => new DefaultGame(field));
        }

        // Handle ENTER
        if (input.type === UserInputType.ENTER) {
            if (!this.acceptPossible()) {
                return err(new Error("accept not possible"));
            }

            return this.field.acceptCurrentWord().map(field => new DefaultGame(field));
        }

        // Handle CHAR
        return char(input.value)
            .andThen(ch => this.field.insert(ch))
            .map(field => new DefaultGame(field));
    }

    inputPossible(): boolean {
        return this.field.state === GameFieldState.IN_PROGRESS && !this.field.currentWordDone();
    }

    inputAvailability(input: string): InputAvailability {
        const tileStates = this.field.tiles.map((tiles) => {
            return tiles.filter((tile) => {
                return tile.value.toUpperCase() === input.toUpperCase()
            }).map(({state}) => state);
        }).flat();

        if (tileStates.includes(TileState.SOLVED)) {
            return InputAvailability.SOLVED;
        }

        if (tileStates.includes(TileState.AVAILABLE)) {
            return InputAvailability.AVAILABLE;
        }

        if (tileStates.includes(TileState.MISSING)) {
            return InputAvailability.MISSING;
        }

        return InputAvailability.UNKNOWN;
    }
}
