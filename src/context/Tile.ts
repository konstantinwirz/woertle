export type Tile = {
    readonly state: TileState
    readonly value: string
}

export enum TileState {
    EMPTY = 'EMPTY',
    UNKNOWN = 'UNKNOWN',
    MISSING = "MISSING",
    AVAILABLE = "AVAILABLE",
    SOLVED = "SOLVED",
}

const EmptyTile: Tile = {
    state: TileState.EMPTY,
    value: ' '
};

export function emptyTile(): Tile {
    return EmptyTile;
}

export function nonEmptyTile(value: string): Tile {
    return {
        state: TileState.UNKNOWN,
        value: value
    }
}
