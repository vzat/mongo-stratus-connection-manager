import React, { Component } from 'react';

import './css/InstancePage.css';

import Header from './Header';
import InstanceMenu from './InstanceMenu';
import InstanceOverview from './InstanceOverview';

import db from './utils/db';

import { Grid, Segment, Sidebar, Menu, List, Divider } from 'semantic-ui-react';

class InstancePage extends Component {
    state = {
        instanceInfo: {
            instanceName: '',
            ips: [],
            ports: [],
            platform: '__________',
            type: '__________',
            version: '3.x',
            dbs: []
        },
        currentPage: 'overview'
    };

    getInstanceData = async (username, instanceName) => {
        const res = await db.getInstanceData(username, instanceName);

        if (res.ok && res.ok === 1 && res.data && res.data.length > 0) {
            const instanceData = res.data[0];

            let instanceInfo = this.state.instanceInfo;
            instanceInfo.ips = instanceData.ip;
            instanceInfo.ports = instanceData.port;
            instanceInfo.instanceName = instanceData.serverName;

            switch (instanceData.platform) {
                case 'gcp':
                    instanceInfo.platform = 'Google Cloud Platform';
                    break;
                case 'aws':
                    instanceInfo.platform = 'Amazon Web Services';
                    break;
                case 'azure':
                    instanceInfo.platform = 'Microsoft Azure';
                    break;
                default:
                    break;
            }

            switch (instanceData.type) {
                case 'single-node':
                    instanceInfo.type = 'Single Node';
                    break;
                case 'replica-set':
                    instanceInfo.type = 'Replica Set';
                    break;
                case 'sharded-cluster':
                    instanceInfo.type = 'Sharded Cluster';
                    break;
                default:
                    break;
            }

            instanceInfo.version = instanceData.version;

            for (let dbNo = 0 ; dbNo < res.data.length ; dbNo ++) {
                const name = res.data[dbNo].name;
                const schema = res.data[dbNo].schema;

                // Ignore dbs with no schema
                if (schema && schema !== null) {
                    const db = {
                        name: name,
                        schema: schema
                    };
                    instanceInfo.dbs.push(db);
                }
            }

            this.setState({instanceInfo: instanceInfo});
        }
    };

    componentDidMount = async () => {
        if (this.props.username && this.props.match.params.database) {
            this.getInstanceData(this.props.username, this.props.match.params.database);
        }

    };

    componentWillReceiveProps = (nextProps) => {
        if (nextProps.username !== this.props.username) {
            this.getInstanceData(nextProps.username, this.props.match.params.database);
        }
    };

    setCurrentPage = (page) => {
        this.setState({currentPage: page});
    }

    render() {
        return (
          <div className="InstancePage">
                <Header
                    username = {this.props.username}
                    notification = {this.props.creatingDB}
                    db = {this.props.db}
                    setCreatingDB = {this.props.setCreatingDB}
                    setRefreshServerList = {this.props.setRefreshServerList}
                    instanceName = {this.state.instanceInfo.instanceName}
                />
                <InstanceMenu
                    instanceInfo = {this.state.instanceInfo}
                    setCurrentPage = {this.setCurrentPage}
                />
                {
                    this.state.currentPage === 'overview' &&
                    <InstanceOverview
                        instanceInfo = {this.state.instanceInfo}
                    />
                }
          </div>
        );
    }
}

export default InstancePage;

// <Grid stackable divided className = 'instance-grid'>
//     <Grid.Row streched className = 'instance-row'>
//         <Grid.Column className = 'menu-column'>
//             <InstanceMenu
//                 instanceInfo = {this.state.instanceInfo}
//                 setCurrentPage = {this.setCurrentPage}
//             />
//         </Grid.Column>
//
//         <Grid.Column>
//             {
//                 this.state.currentPage === 'overview' && <InstanceOverview />
//             }
//         </Grid.Column>
//     </Grid.Row>
// </Grid>

// <Sidebar.Pushable as = {Segment}>
//     <Sidebar as = {Menu} animation = 'push' width = 'thin' visible = {true} vertical>
//         <Menu.Item name = 'overview' active = { true } onClick = {this.handleMenuClick}>
//             Overview
//         </Menu.Item>
//         <Menu.Item name = 'databases' active = { false } onClick = {this.handleMenuClick}>
//             Databases
//         </Menu.Item>
//         <Menu.Item name = 'users' active = { false } onClick = {this.handleMenuClick}>
//             Users
//         </Menu.Item>
//         <Menu.Item name = 'settings' active = { false } onClick = {this.handleMenuClick}>
//             Settings
//         </Menu.Item>
//     </Sidebar>
//     <Sidebar.Pusher>
//         <InstanceOverview />
//     </Sidebar.Pusher>
// </Sidebar.Pushable>
