import React, { Component } from 'react';

import Header from './Header';
import InstanceMenu from './InstanceMenu';

import db from './utils/db';

class InstancePage extends Component {
    state = {
        instanceInfo: {
            instanceName: '',
            ips: [],
            ports: [],
            platform: '',
            type: '',
            version: '',
            dbs: []
        }
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
                    instanceInfo = {this.state.instanceInfo}
                />
          </div>
        );
    }
}

export default InstancePage;
