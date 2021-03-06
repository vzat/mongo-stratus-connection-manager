import React, { Component } from 'react';

import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

import './css/App.css';

import MainPage from './MainPage';
import InstancePage from './InstancePage';

class App extends Component {
    state = {
        openModal: false,
        creatingDB: false,
        db: '',
        refreshServerList: false
    };

    componentDidMount = async () => {
        document.title = 'MongoStratus';

        const res = await fetch('/api/v1/internal/get/username', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const json = await res.json();

        if (!json.ok || json.ok === 0) {
            window.location = 'http://localhost:3001/login';
        }

        this.setState({username: json.username});

        // this.setState({username: 'jsmith'});
    };

    setModalState = (value) => {
        this.setState({openModal: value});
    };

    setCreatingDB = (value) => {
        this.setState({creatingDB: value});
    };

    setRefreshServerList = (value) => {
        this.setState({refreshServerList: value});
    };

    setDB = (value) => {
        this.setState({db: value});
    };

    render() {
        return (
            <Router>
                <div className="App">
                    <Switch>
                        <Route
                            exact path = '/'
                            render = {props =>
                                <MainPage
                                    {...props}
                                    username = {this.state.username}
                                    creatingDB = {this.state.creatingDB}
                                    db = {this.state.db}
                                    setCreatingDB = {this.setCreatingDB}
                                    setModalState = {this.setModalState}
                                    openModal = {this.state.openModal}
                                    setDB = {this.setDB}
                                    setRefreshServerList = {this.setRefreshServerList}
                                    refreshServerList = {this.state.refreshServerList}
                                />
                            }
                        />
                        <Route
                            path = '/instance/:database'
                            render = {props =>
                                <InstancePage
                                    {...props}
                                    username = {this.state.username}
                                    creatingDB = {this.state.creatingDB}
                                    db = {this.state.db}
                                    setCreatingDB = {this.setCreatingDB}
                                />
                            }
                        />
                    </Switch>
                </div>
            </Router>
        );
    }
}

// <div className="App">
//       <Header
//           username = {this.state.username}
//           notification = {this.state.creatingDB}
//           db = {this.state.db}
//           setCreatingDB = {this.setCreatingDB}
//       />
//       <ServerList
//           username = {this.state.username}
//           setModalState = {this.setModalState}
//       />
//       <CreateServer
//           username = {this.state.username}
//           open = { openModal }
//           setModalState = {this.setModalState}
//           setCreatingDB = {this.setCreatingDB}
//           setDB = {this.setDB}
//       />
// </div>

export default App;
