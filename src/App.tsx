import React from 'react';
import "./App.css"
import Header from "./Header";
import Tiles from "./Tiles";
import Keyboard from "./Keyboard";
import Snackbar from './Snackbar';

function App() {
    return (
        <div id="App">
            <Header/>
            <Tiles/>
            <Snackbar />
            <Keyboard/>
        </div>
    );
}


export default App;
