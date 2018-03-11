import React, { Component } from 'react';

import './css/App.css';

import Header from './Header';
import ServerList from './ServersList';
import CreateServer from './CreateServer';

class App extends Component {
    state = {
        openModal: false,
        creatingDB: false,
        db: ''
    };

    componentWillMount = async () => {
        // const res = await fetch('/api/v1/internal/get/username', {
        //     method: 'GET',
        //     credentials: 'include',
        //     headers: {
        //         'Content-Type': 'application/json'
        //     }
        // });
        //
        // const json = await res.json();
        //
        // if (!json.ok || json.ok === 0) {
        //     window.location = 'http://localhost:3001/login';
        // }
        //
        // this.setState({username: json.username});

        this.setState({username: 'jsmith'});
    };

    setModalState = (value) => {
        this.setState({openModal: value});
    };

    setCreatingDB = (value) => {
        this.setState({creatingDB: value});
    };

    setDB = (value) => {
        this.setState({db: value});
    };

    render() {
        const openModal = this.state.openModal;

        return (
          <div className="App">
                <Header
                    username = {this.state.username}
                    notification = {this.state.creatingDB}
                    db = {this.state.db}
                    setCreatingDB = {this.setCreatingDB}
                />
                <ServerList
                    username = {this.state.username}
                    setModalState = {this.setModalState}
                />
                <CreateServer
                    username = {this.state.username}
                    open = { openModal }
                    setModalState = {this.setModalState}
                    setCreatingDB = {this.setCreatingDB}
                    setDB = {this.setDB}
                />
          </div>
        );
    }
}

export default App;
