import React, { Component } from 'react';

import './css/App.css';

import Header from './Header';
import ServerList from './ServersList';
import CreateServer from './CreateServer';

class App extends Component {
    state = {
        openModal: false
    };

    setModalState = (value) => {
        this.setState({openModal: value});
    };

    render() {
        const openModal = this.state.openModal;

        return (
          <div className="App">
                <Header />
                <ServerList setModalState = {this.setModalState} />
                <CreateServer open = { openModal } setModalState = {this.setModalState} />
          </div>
        );
    }
}

export default App;
