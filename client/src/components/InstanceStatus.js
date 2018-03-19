import React, { Component } from 'react';

import './css/InstanceStatus.css';

import { List, Segment, Sticky, Header, Button, Icon, Responsive, Container } from 'semantic-ui-react';

import db from './utils/db';

class InstanceStatus extends Component {
    deleteInstance = async () => {
        const res = await db.deleteInstance(this.props.username, this.props.instance);

        if (res.ok && res.ok === 1) {
            window.location = '/';
        }
    };

    render() {
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
                <Button icon fluid color = 'red' labelPosition = 'left' onClick = { this.deleteInstance }>
                    <Icon name = 'trash' />
                    Delete Instance
                </Button>
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
