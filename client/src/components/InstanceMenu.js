import React, { Component } from 'react';

import './css/InstanceMenu.css';

import { Menu, Divider, Header, List, Statistic } from 'semantic-ui-react';

class InstanceMenu extends Component {
    state = {
        menuActive: 'overview',
        instanceType: 'Single Node',
        instancePlatform: 'Google Cloud Platform',
        instanceVersion: '3.6'
    };

    handleMenuClick = (event, component) => {
        this.setState({menuActive: component.name});
        this.props.setCurrentPage(component.name);
    };

    render() {
        const { instanceInfo } = this.props;

        return (
          <div className="InstanceMenu">
                <Menu secondary pointing stackable color = 'green' className = 'nav-menu'>
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

// <Menu vertical secondary color = 'green' size = 'small' className = 'nav-menu'>

// <Menu.Item>
//     <Header as = 'h3' > { instanceInfo.instanceName } </Header>
//     <List>
//         <List.Item>
//             { instanceInfo.type }
//         </List.Item>
//         <List.Item>
//             { instanceInfo.platform }
//         </List.Item>
//         <List.Item>
//             Version: { instanceInfo.version }
//         </List.Item>
//     </List>
//     <Divider fitted />
// </Menu.Item>
