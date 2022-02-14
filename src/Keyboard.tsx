import React, {MouseEvent} from "react";
import {useGameContext} from "./context/GameContext";
import {UserInput, UserInputType} from './context/Game';
import {useSnackbarContext} from "./context/SnackbarContext";

const Keyboard = () => {
    const {game, setGame} = useGameContext();
    const {setMessage} = useSnackbarContext();

    const handleKeyClick = (event: MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        const content = (event.target as HTMLButtonElement)?.textContent;
        if (content === null) {
            return;
        }

        game.handleInput(mapToUserInput(content)).match(
            setGame,
            err => setMessage(err.message)
        );
    }

    const mapToUserInput = (key: string): UserInput => {
        if (key.toUpperCase() === UserInputType.DEL.toString()) {
            return {
                type: UserInputType.DEL
            }
        }

        if (key.toUpperCase() === UserInputType.ENTER.toString()) {
            return {
                type: UserInputType.ENTER
            }
        }

        return {
            type: UserInputType.CHAR,
            value: key.toUpperCase()
        }
    }

    const keysDisabled = (): boolean => !game.inputPossible();
    const enterDisabled = (): boolean => !game.acceptPossible();
    const deleteDisabled = (): boolean => !game.deletePossible();
    const keyClassName = (key: string): string => {
        return "key key-" + game.inputAvailability(key).toLowerCase();
    }

    return (
        <div className="keyboard">
            <div className="keyboard-row">
                {
                    Array.of("q", "w", "e", "r", "t", "z", "u", "i", "o", "p", "ü").map((c, n) =>
                        <button disabled={keysDisabled()} key={n} onClick={handleKeyClick} className={keyClassName(c)}>{c}</button>
                    )
                }
            </div>
            <div className="keyboard-row">
                {
                    Array.of("a", "s", "d", "f", "g", "h", "j", "k", "l", "ö", "ä").map((c, n) =>
                        <button disabled={keysDisabled()} key={n} onClick={handleKeyClick} className={keyClassName(c)}>{c}</button>
                    )
                }
            </div>
            <div className="keyboard-row">
                <button disabled={deleteDisabled()} key={0} onClick={handleKeyClick} className="key">DEL</button>
                {
                    Array.of("y", "x", "c", "v", "b", "n", "m").map((c, n) =>
                        <button disabled={keysDisabled()} key={n} onClick={handleKeyClick} className={keyClassName(c)}>{c}</button>
                    )
                }
                <button disabled={enterDisabled()} key={9} onClick={handleKeyClick} className="key">ENTER</button>
            </div>
        </div>
    );
};


export default Keyboard;