import React from "react";
import {useGameContext} from './context/GameContext';
import {game} from './context/Game';

const Header = () => {
    const {setGame} = useGameContext();

    const newGame = () => {
        setGame(game());
    }

    return (
        <header>
            <h1>Wörtle</h1>
            <button onClick={newGame}>New Game</button>
        </header>
    );
}

export default Header