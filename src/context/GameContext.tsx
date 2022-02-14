import React, {createContext, Dispatch, FC, SetStateAction, useContext, useState} from "react";
import {Game, game as initGame} from "./Game";


const initialGame = initGame();

type Context = {
    readonly game: Game,
    readonly setGame: Dispatch<SetStateAction<Game>>
}

export const GameContext = createContext({
    game: initialGame,
    setGame: (ignored: Game) => {
    }
} as Context);

export const useGameContext = () => useContext(GameContext);

export const GameContextProvider: FC = ({children}) => {
    const [game, setGame] = useState<Game>(initialGame);

    return (
        <GameContext.Provider value={{game, setGame}}>
            {children}
        </GameContext.Provider>
    );
}
