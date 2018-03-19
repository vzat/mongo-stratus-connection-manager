import React, { Component } from 'react';

import './css/DatabaseList.css';

import { List, Button, Icon } from 'semantic-ui-react';

class DatabaseList extends Component {
    state = {
        serverName: '',
        type: '',
        ips: '',
        ports: '',
        databases: [
            {name: 'admin'},
            {name: 'local'},
            {name: 'posts'},
            {name: 'admin'},
            {name: 'local'},
            {name: 'posts'},
            {name: 'admin'},
            {name: 'local'},
            {name: 'posts'},
            {name: 'admin'},
            {name: 'local'},
            {name: 'posts'},
            {name: 'admin'},
            {name: 'local'},
            {name: 'posts'},
            {name: 'admin'},
            {name: 'local'},
            {name: 'posts'},
            {name: 'admin'},
            {name: 'local'},
            {name: 'posts'},
            {name: 'admin'},
            {name: 'local'},
            {name: 'posts'}
        ]
    };

    componentWillMount = async () => {

    };

    render() {
        const databases = this.state.databases;
        const items = databases.map((database, index) => (
            <List.Item>
                <List.Content floated = 'right'>
                    <Button circular icon = 'eye' />
                    <Button> Edit Schema </Button>
                    <Button icon = 'remove' color = 'red' basic compact/>
                </List.Content>

                <List.Icon name = 'database' size = 'large' vericalAlign = 'middle' />
                <List.Content>
                    <List.Header> { database.name } </List.Header>
                </List.Content>
            </List.Item>
        ));

        return (
          <div className = "DatabaseList">
              <List divided relaxed size = 'large'>
                  { items }
                  <List.Item>
                      <List.Content>
                          <Button fluid basic color = 'green' icon = 'plus' />
                      </List.Content>
                  </List.Item>
              </List>
          </div>
        );
    }
}

export default DatabaseList;
