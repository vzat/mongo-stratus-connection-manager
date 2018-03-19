import React, { Component } from 'react';

import './css/ServerList.css';

import { Card, Divider, Button, Grid } from 'semantic-ui-react';

import db from './utils/db.js';

import gcp from './resources/images/gcp.svg';
import azure from './resources/images/azure.svg';
import aws from './resources/images/aws.svg';

class ServerList extends Component {
    state = {
        items: [],
        username: ''
    }

    getInstances = async (username) => {
        // Get Instances
        const res = await db.getInstances(username);

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

    componentWillReceiveProps = async (nextProps) => {
        if (nextProps.username != this.props.username) {
            await this.getInstances(nextProps.username);
        }
        if (nextProps.refreshServerList && nextProps.refreshServerList === true) {
            this.props.setRefreshServerList(false);
            await this.getInstances(nextProps.username);
        }
    };

    componentDidMount = async () => {
        await this.getInstances(this.props.username);
    }

    render() {
        const items = this.state.items;

        return (
          <div className = "ServerList">
              <Button color = "green" onClick = {() => this.props.setModalState(true) }> New Instance </Button>
              <Divider hidden />

              {
                  items.length === 0
                  ?
                  <Grid centered verticalAlign = 'middle'>
                      <Grid.Column>
                          <h1 className = 'no-instances'> No Instances </h1>
                      </Grid.Column>
                  </Grid>
                  :
                  <Card.Group doubling stackable items = {items} />
              }
          </div>
        );
    }
}

export default ServerList;
