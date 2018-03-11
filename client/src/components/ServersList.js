import React, { Component } from 'react';

import './css/ServerList.css';

import { Card, Image, Divider, Button } from 'semantic-ui-react';

import db from './utils/db.js';

import gcp from './resources/images/gcp.svg';
import azure from './resources/images/azure.svg';
import aws from './resources/images/aws.svg';

class ServerList extends Component {
    state = {
        items: []
    }

    componentWillMount = async () => {
        // Get Instances
        const res = await db.getInstances(this.props.username);

        if (res && res.ok && res.ok === 1) {
            const instances = res.data;

            let items = [];
            for (const instanceNo in instances) {
                const instance = instances[instanceNo];

                // Common Values
                let item = {
                    header: instance.serverName,
                    color: 'green',
                    href: '/instance/' + instance.serverName
                };

                // Platform
                switch (instance.platform) {
                    case 'gcp':
                        item.image = gcp;
                        break;
                    case 'aws':
                        item.image = aws;
                        break;
                    case 'azure':
                        item.image = azure;
                        break;
                    default:
                        break;
                }

                // Type
                switch (instance.type) {
                    case 'single-node':
                        item.description = 'Single Node';
                        break;
                    case 'replica-set':
                        item.description = 'Replica Set';
                        break;
                    case 'sharded-cluster':
                        item.description = 'Sharded Cluster';
                        break;
                    default:
                        break;
                }

                items.push(item);
            }
            this.setState({ items: items });
        }
    }

    render() {
        const items = this.state.items;

        return (
          <div className = "ServerList">
              <Button color = "green" onClick = {() => this.props.setModalState(true) }> New Server </Button>
              <Divider hidden />

              <Card.Group doubling stackable items = {items} />
          </div>
        );
    }
}

export default ServerList;
