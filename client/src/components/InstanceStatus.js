import React, { Component } from 'react';

import './css/InstanceStatus.css';

import { List, Segment, Sticky, Header } from 'semantic-ui-react';

class InstanceStatus extends Component {
    render() {
        return (
          <div className = "InstanceStatus">
              <Sticky offset = { 25 }>
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
                  </Segment>
              </Sticky>
          </div>
        );
    }
}

export default InstanceStatus;
