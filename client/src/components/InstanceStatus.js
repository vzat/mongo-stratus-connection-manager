import React, { Component } from 'react';

import './css/InstanceStatus.css';

import { List, Segment, Sticky, Header, Button, Icon, Responsive, Container, Confirm } from 'semantic-ui-react';

import db from './utils/db';

class InstanceStatus extends Component {
    state = {
        deleteInstanceConfirm: false,
        instanceType: 'singleNode',
        instancePlatform: 'gcp',
        servers: {
            node: {
                ip: '123.123.123',
                region: 'us1',
                machineType: 'micro',
                status: 'green'
            }
        }
    }

    // Replica Set
    // servers: {
    //     primary: [{
    //
    //     }],
    //     secondary: [{
    //
    //     }]
    // }

    // Sharded Cluster
    // servers: {
    //     config: [{
    //         primary: [{
    //
    //         }]
    //     }],
    //     shards: [{
    //         shard1: [{
    //             primary
    //         }]
    //     }]
    // }

    deleteInstance = async () => {
        const res = await db.deleteInstance(this.props.username, this.props.instance);

        if (res.ok && res.ok === 1) {
            window.location = '/';
        }
    };

    showDeleteInstanceConfirm = () => {
        this.setState({deleteInstanceConfirm: true});
    }

    hideDeleteInstanceConfirm = () => {
        this.setState({deleteInstanceConfirm: false});
    }

    render() {
        const { instanceType } = this.state;

        // const items = (
        //     <div>
        //         { instanceType === 'singleNode' &&
        //             <List.Item>
        //                 <List.Icon name = 'server' color = 'green' />
        //                 <List.Content>
        //                     48.165.147.789
        //                 </List.Content>
        //             </List.Item>
        //         }
        //     </div>
        // );

        // Maybe use accordion
        const segment = (
            <Segment color = 'blue'>
                <Header as = 'h4'> Servers </Header>
                <List divided relaxed size = 'large'>
                    <List.Item>
                        <List.Icon name = 'server' color = 'green' />
                        <List.Content>
                            247.164.478.476
                        </List.Content>
                    </List.Item>
                    <List.Item>
                        <List.Icon name = 'server' color = 'red' />
                        <List.Content>
                            48.165.147.789
                        </List.Content>
                    </List.Item>
                </List>
                <Button icon fluid color = 'red' labelPosition = 'left' onClick = { this.showDeleteInstanceConfirm }>
                    <Icon name = 'trash' />
                    Delete Instance
                </Button>
                <Confirm
                    open = {this.state.deleteInstanceConfirm}
                    onCancel = {this.hideDeleteInstanceConfirm}
                    onConfirm = {this.deleteInstance}
                    header = 'Are you sure you want to delete this instance?'
                    content = 'All data will be permanently deleted. You cannot undo this action.'
                    confirmButton = 'Delete Instance'
                    size = 'fullscreen'
                    style = {{
                        marginTop: 0,
                        maxWidth: 800
                    }}
                />
            </Segment>
        );

        return (
          <div className = "InstanceStatus">
              <Responsive as = { Sticky } minWidth = {768} offset = { 25 } >
                  { segment }
              </Responsive>

              <Responsive as = { Container } {...Responsive.onlyMobile} >
                  { segment }
              </Responsive>
          </div>
        );
    }
}

export default InstanceStatus;
