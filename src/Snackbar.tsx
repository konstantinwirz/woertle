import React from 'react';
import {useSnackbarContext} from "./context/SnackbarContext";

const Snackbar = () => {
    const {message} = useSnackbarContext();

    const className = (): string => {
        if (message.length > 0) {
            return "visible"
        }
        return "";
    }

    return (
        <div id="snackbar" className={className()}>{message}</div>
    );
};


export default Snackbar;