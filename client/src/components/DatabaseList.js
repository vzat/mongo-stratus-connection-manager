import React, { Component } from 'react';

import './css/DatabaseList.css';

import { List, Button, Icon, Container, Grid, Header, Segment, Table, Divider } from 'semantic-ui-react';

import db from './utils/db';

class DatabaseList extends Component {
    state = {
        serverName: '',
        type: '',
        ips: '',
        ports: '',
        databases: [
            '__________',
            '__________',
            '__________'
        ]
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
        if (nextProps.username !== this.props.username) {
            await this.getDatabases(nextProps.username);
        }
    };

    sizeOnDiskToString = (sizeOnDisk) => {
        let size = sizeOnDisk ? sizeOnDisk : 0;
        let power = 0;
        while (size > 1024) {
            size /= 1024.0;
            power ++;
        }

        // Add decimal if int or round to 2 decimals
        let sizeString = '' + size;
        if (sizeString.indexOf('.') === -1) {
            sizeString += '.0';
        }
        else {
            sizeString = sizeString.substring(0, sizeString.indexOf('.') + 3);
        }

        if (size >= 1000) {
            sizeString = sizeString[0] + ',' + sizeString.substring(1);
        }

        switch (power) {
            case 0:
                sizeString += ' bytes';
                break;
            case 1:
                sizeString += ' KB';
                break;
            case 2:
                sizeString += ' MB';
                break;
            case 3:
                sizeString += ' GB';
                break;
            default:
                break;
        }

        return sizeString;
    };

    render() {
        const databases = this.state.databases;
        const items = databases.map((database, index) => (
            <Table.Row>
                <Table.Cell>
                    <Header as = 'h4'>
                        <Icon name = 'database' />
                        { database.name }
                    </Header>
                </Table.Cell>
                <Table.Cell>
                    {this.sizeOnDiskToString(database.sizeOnDisk)}
                </Table.Cell>
                <Table.Cell collapsing>
                    <Button icon = 'edit' compact />
                    <Button icon = 'trash' color = 'red' compact/>
                </Table.Cell>
            </Table.Row>
        ));

        return (
          <div className = "DatabaseList">
              <Container>
              <Table singleLine unstackable selectable>
                  <Table.Header>
                      <Table.Row>
                          <Table.HeaderCell>
                              Database Name
                          </Table.HeaderCell>
                          <Table.HeaderCell colSpan = '2'>
                              Size on Disk
                          </Table.HeaderCell>
                      </Table.Row>
                  </Table.Header>
                  <Table.Body>
                      { items }
                  </Table.Body>
                  <Table.Footer>
                      <Table.Row>
                          <Table.HeaderCell colSpan = '3'>
                              <Button icon color = 'green' labelPosition = 'left' icon = 'plus' >
                                  <Icon name = 'plus' />
                                  Create Database
                              </Button>
                          </Table.HeaderCell>
                      </Table.Row>
                  </Table.Footer>
              </Table>
              </Container>
          </div>
        );
    }
}

export default DatabaseList;

// <Button circular icon = 'eye' />

// <List.Content floated = 'right'>
//     <Button icon = 'edit' compact />
//     <Button icon = 'trash' color = 'red' compact/>
// </List.Content>
//
// <List.Icon name = 'database' size = 'large' vericalAlign = 'middle' />
// <List.Content>
//     <List.Header> { database.name } </List.Header>
// </List.Content>

// <Container>
//     <List divided relaxed size = 'large'>
//         { items }
//         <List.Item>
//             <List.Content>
//                 <Button fluid basic color = 'green' icon = 'plus' />
//             </List.Content>
//         </List.Item>
//     </List>
// </Container>

// <List.Item>
//     <List.Content floated = 'right'>
//         <Button icon = 'edit' compact />
//         <Button icon = 'trash' color = 'red' compact/>
//     </List.Content>
//
//     <Grid fluid>
//         <Grid.Row>
//             <Grid.Column width = '1'>
//                 <Icon name = 'database' size = 'large' vericalAlign = 'middle' />
//             </Grid.Column>
//             <Grid.Column width = '5'>
//                 <Header as = 'h3'> { database.name } </Header>
//             </Grid.Column>
//             <Grid.Column width = '10'>
//                 100 Kb
//             </Grid.Column>
//         </Grid.Row>
//   </Grid>
// </List.Item>

// <Container>
//     <Segment>
//         <List divided relaxed size = 'large'>
//             { items }
//             <List.Item>
//                 <List.Content>
//                     <Button fluid basic color = 'green' icon = 'plus' />
//                 </List.Content>
//             </List.Item>
//         </List>
//     </Segment>
// </Container>
