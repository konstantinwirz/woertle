import React from "react";
import {useGameContext} from "./context/GameContext";
import {TileState} from "./context/Tile";


const Tiles = () => {
    const {game} = useGameContext();

    const tileClassName = (state: TileState): string => {
        switch (state) {
            case TileState.EMPTY:
                return "tile tile-empty";
            case TileState.UNKNOWN:
                return "tile tile-unknown";
            case TileState.MISSING:
                return "tile tile-missing";
            case TileState.AVAILABLE:
                return "tile tile-available";
            case TileState.SOLVED:
                return "tile tile-solved";
        }

        return "tile";
    }


    return (
        <main className="tiles">
            {
                game.field.tiles.map((tiles) => {
                    return tiles.map((tile, n) => {
                        return (<div key={n} className={tileClassName(tile.state)}>{tile.value}</div>);
                    })
                })
            }
        </main>
    );
}

export default Tiles;