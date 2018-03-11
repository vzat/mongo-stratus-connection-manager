import React, { Component } from 'react';

import './css/DatabaseList.css';

import { List, Button } from 'semantic-ui-react';

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

    render() {
        const databases = this.state.databases;
        const items = databases.map((database, index) => (
            <List.Item>
                <List.Content floated = 'right'>
                    <Button> Edit Schema </Button>
                    <Button circular icon = 'eye' />
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
              </List>
          </div>
        );
    }
}

export default DatabaseList;
