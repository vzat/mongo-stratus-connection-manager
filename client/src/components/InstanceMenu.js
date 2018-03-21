import React, { Component } from 'react';

import './css/InstanceMenu.css';

import { Menu, Divider, Header, List } from 'semantic-ui-react';

class InstanceMenu extends Component {
    state = {
        menuActive: 'overview',
        instanceType: 'Single Node',
        instancePlatform: 'Google Cloud Platform',
        instanceVersion: '3.6'
    };

    handleMenuClick = (event, component) => {
        this.setState({menuActive: component.name});
    };

    componentDidMount = () => {
        // Get Info from DB
    };

    render() {
        return (
          <div className="InstanceMenu">
                <Menu vertical tabular color = 'green' size = 'small' className = 'navMenu'>
                    <Menu.Item>
                        <Header as = 'h3' > { this.props.instance } </Header>
                        <List>
                            <List.Item>
                                { this.state.instanceType }
                            </List.Item>
                            <List.Item>
                                { this.state.instancePlatform }
                            </List.Item>
                            <List.Item>
                                Version: { this.state.instanceVersion }
                            </List.Item>
                        </List>
                        <Divider fitted />
                    </Menu.Item>
                    <Menu.Item name = 'overview' active = {this.state.menuActive === 'overview'} onClick = {this.handleMenuClick}>
                        Overview
                    </Menu.Item>
                    <Menu.Item name = 'databases' active = {this.state.menuActive === 'databases'} onClick = {this.handleMenuClick}>
                        Databases
                    </Menu.Item>
                    <Menu.Item name = 'users' active = {this.state.menuActive === 'users'} onClick = {this.handleMenuClick}>
                        Users
                    </Menu.Item>
                    <Menu.Item name = 'settings' active = {this.state.menuActive === 'settings'} onClick = {this.handleMenuClick}>
                        Settings
                    </Menu.Item>
                </Menu>
          </div>
        );
    }
}

export default InstanceMenu;
