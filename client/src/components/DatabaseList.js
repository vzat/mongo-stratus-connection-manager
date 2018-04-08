import React, { Component } from 'react';

import './css/DatabaseList.css';

import EditSchema from './EditSchema';

import { Button, Icon, Container, Header, Table, Modal, Input, Dimmer, Loader, Confirm } from 'semantic-ui-react';

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
        ],
        inputDatabaseName: '',
        modalCreateDatabase: false,
        loadingCreateDatabase: false,
        confirmDeleteDatabase: false,
        loadingDeleteDatabase: false,
        deleteDatabase: undefined,
        modalEditSchema: false,
        editSchemaDatabase: undefined
    };

    handleChange = (event) => {
        this.setState({ [event.target.name]: event.target.value });
    };

    openModal = (name) => {
        this.setState({[name]: true});
    };

    closeModal = (name) => {
        this.setState({[name]: false});
    };

    confirmDelete = (modalName, dbIndex) => {
        this.setState({deleteDatabase: dbIndex});
        this.openModal(modalName);
    }

    openEditSchema = (event, comp) => {
        if (comp.id !== undefined && this.state.databases[comp.id].name !== undefined) {
            this.setState({editSchemaDatabase: this.state.databases[comp.id].name});
            this.openModal('modalEditSchema');
        }
    }

    closeEditSchema = () => {
        this.closeModal('modalEditSchema');
        this.setState({editSchemaDatabase: undefined});
    }

    getDatabases = async (username) => {
        const res = await db.getDatabases(username, this.props.instance);
        if (res && res.ok && res.ok === 1) {
            const databases = res.data;
            this.setState({databases: databases});
        }
    };

    createDatabase = async () => {
        this.setState({loadingCreateDatabase: true});
        const databaseName = this.state.inputDatabaseName;
        await db.createDatabase(this.props.username, this.props.instance, databaseName);

        // Close modal, remove data from input, and close loading dimmer
        this.setState({loadingCreateDatabase: false});
        this.closeModal('modalCreateDatabase');
        this.setState({inputDatabaseName: ''});

        // Refresh database list
        if (this.props.username) {
            this.getDatabases(this.props.username);
        }
    };

    deleteDatabase = async () => {
        if (this.state.deleteDatabase === undefined || this.state.deleteDatabase < 0)
            return;

        this.setState({loadingDeleteDatabase: true});
        const dbToDelete = this.state.databases[this.state.deleteDatabase];
        const databaseName = dbToDelete.name;
        await db.deleteDatabase(this.props.username, this.props.instance, databaseName);

        // Close confirm, deselect db to delete, and close loading dimmer
        this.closeModal('confirmDeleteDatabase');
        this.setState({deleteDatabase: undefined});
        this.setState({loadingDeleteDatabase: false});

        // Refresh database list
        if (this.props.username) {
            this.getDatabases(this.props.username);
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
                <Table.Cell singleLine>
                    <Header as = 'h4'>
                        <Icon name = 'database' />
                        <Header.Content>
                            <a href = {'/data/' + this.props.instance + '/' +   database.name }> { database.name } </a>
                        </Header.Content>
                    </Header>
                </Table.Cell>
                <Table.Cell>
                    {this.sizeOnDiskToString(database.sizeOnDisk)}
                </Table.Cell>
                <Table.Cell collapsing>
                    <Button compact
                        id = {index}
                        name = 'editSchema'
                        icon = 'edit'
                        onClick = {this.openEditSchema}
                    />
                    <Button compact
                        id = {index}
                        name = 'deleteDatabase'
                        icon = 'trash'
                        color = 'red'
                        onClick = {() => this.confirmDelete('confirmDeleteDatabase', index)}
                    />
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
                              <Button icon
                                  color = 'green'
                                  labelPosition = 'left'
                                  onClick = {() => this.openModal('modalCreateDatabase')} >
                                      <Icon name = 'plus' />
                                      Create Database
                              </Button>

                              <Modal closeIcon
                                  size = 'fullscreen'
                                  name = 'modalCreateDatabase'
                                  open = {this.state.modalCreateDatabase}
                                  closeOnEscape = {true}
                                  closeOnRootNodeClick = {true}
                                  onClose = {() => this.closeModal('modalCreateDatabase')}
                                  style = {{
                                      marginTop: '40vh',
                                      maxWidth: 400
                                  }} >
                                      <Modal.Header>
                                          Create a new Database
                                      </Modal.Header>
                                      <Modal.Content>
                                          <Input fluid
                                              name = 'inputDatabaseName'
                                              placeholder = 'Database Name'
                                              value = {this.state.inputDatabaseName}
                                              onChange = {this.handleChange}
                                          />

                                          <Dimmer active = { this.state.loadingCreateDatabase } >
                                              <Loader content = 'Loading' />
                                          </Dimmer>
                                      </Modal.Content>
                                      <Modal.Actions>
                                          <Button onClick = {() => this.closeModal('modalCreateDatabase')} > Cancel </Button>
                                          <Button color = 'green' onClick = {this.createDatabase} > Create Database </Button>
                                      </Modal.Actions>
                              </Modal>
                          </Table.HeaderCell>
                      </Table.Row>
                  </Table.Footer>
              </Table>
              </Container>

              <Confirm
                  open = {this.state.confirmDeleteDatabase}
                  onCancel = {() => this.closeModal('confirmDeleteDatabase')}
                  onConfirm = {() => this.deleteDatabase()}
                  header = {
                      this.state.deleteDatabase >= 0 &&
                      <Header>
                          Are you sure you want to drop the database "{this.state.databases[this.state.deleteDatabase].name}"?
                      </Header>
                  }
                  content = {
                    <Modal.Content>
                        All data will be permanently deleted. You cannot undo this action.
                        <Dimmer active = { this.state.loadingDeleteDatabase } >
                            <Loader content = 'Loading' />
                        </Dimmer>
                    </Modal.Content>
                  }
                  confirmButton = 'Drop Database'
                  size = 'fullscreen'
                  style = {{
                      marginTop: '40vh',
                      maxWidth: 800
                  }}
              />

              <EditSchema
                  username = {this.props.username}
                  instance = {this.props.instance}
                  database = {this.state.editSchemaDatabase}
                  closeEditSchema = {this.closeEditSchema}
                  open = {this.state.modalEditSchema}
              />
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
