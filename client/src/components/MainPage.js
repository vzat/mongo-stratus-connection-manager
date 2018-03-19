import React, { Component } from 'react';

import Header from './Header';
import ServerList from './ServersList';
import CreateServer from './CreateServer';

class MainPage extends Component {

    render() {
        return (
          <div className="MainPage">
                <Header
                    username = {this.props.username}
                    notification = {this.props.creatingDB}
                    db = {this.props.db}
                    setCreatingDB = {this.props.setCreatingDB}
                    setRefreshServerList = {this.props.setRefreshServerList}
                />
                <ServerList
                    username = {this.props.username}
                    setModalState = {this.props.setModalState}
                    setRefreshServerList = {this.props.setRefreshServerList}
                    refreshServerList = {this.props.refreshServerList}
                />
                <CreateServer
                    username = {this.props.username}
                    open = { this.props.openModal }
                    setModalState = {this.props.setModalState}
                    setCreatingDB = {this.props.setCreatingDB}
                    setDB = {this.props.setDB}
                />
          </div>
        );
    }
}

export default MainPage;
