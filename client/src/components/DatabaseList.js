import React, { Component } from 'react';

import './css/DatabaseList.css';

import { List, Button, Icon } from 'semantic-ui-react';

import db from './utils/db';

class DatabaseList extends Component {
    state = {
        serverName: '',
        type: '',
        ips: '',
        ports: '',
        databases: []
    };

    getDatabases = async (username) => {
        const res = await db.getDatabases(username, this.props.instance);
        if (res && res.ok && res.ok === 1) {
            const databases = res.data;
            this.setState({databases: databases});
        }
    };

    componentDidMount = async () => {
        if (this.props.username !== undefined) {
            this.getDatabases(this.props.username);
        }
    };

    componentWillReceiveProps = async (nextProps) => {
        if (nextProps.username != this.props.username) {
            await this.getDatabases(nextProps.username);
        }
    };

    render() {
        const databases = this.state.databases;
        const items = databases.map((database, index) => (
            <List.Item>
                <List.Content floated = 'right'>
                    <Button circular icon = 'eye' />
                    <Button> Edit Schema </Button>
                    <Button icon = 'trash' color = 'red' compact/>
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
