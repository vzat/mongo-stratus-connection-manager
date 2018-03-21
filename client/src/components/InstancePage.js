import React, { Component } from 'react';

import Header from './Header';
import InstanceMenu from './InstanceMenu';

class InstancePage extends Component {

    render() {
        return (
          <div className="InstancePage">
                <Header
                    username = {this.props.username}
                    notification = {this.props.creatingDB}
                    db = {this.props.db}
                    setCreatingDB = {this.props.setCreatingDB}
                    setRefreshServerList = {this.props.setRefreshServerList}
                />
                <InstanceMenu
                    username = {this.props.username}
                    instance = {this.props.match.params.database}
                />
          </div>
        );
    }
}

export default InstancePage;
