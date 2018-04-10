import React, { Component } from 'react';

import './css/UserList.css';

import { Button, Icon, Container, Header, Table, Modal, Input, Dimmer, Loader, Confirm, Divider, Label, Dropdown, Segment } from 'semantic-ui-react';

import db from './utils/db';

import userRoles from './resources/userRoles.json';

class UserList extends Component {
    state = {
        users: [{
            user: '_____',
            roles: [{
                role: '_____',
                database: '_____'
            }]
        }],
        modalAddUser: false,
        inputUsername: '',
        inputPassword: '',
        inputDatabase: 'admin',
        createUser: {
            roles: [{
                  database: 'admin',
                  roles: ['readWrite']
            }]
        },
        loadingAddUser: false
    };

    handleChange = (event) => {
        this.setState({ [event.target.name]: event.target.value });
    };

    handleRolesChange = (event, comp) => {
        const { createUser } = this.state;

        createUser.roles[comp.id].roles = comp.value;

        this.setState({createUser: createUser});
    };

    handleDatabaseChange = (event, comp) => {
        const { createUser } = this.state;

        createUser.roles[comp.id].database = comp.value;

        this.setState({createUser: createUser});
    };

    addRole = () => {
        const { createUser } = this.state;

        const role = {
            database: '',
            roles: []
        };

        createUser.roles.push(role);

        this.setState({createUser: createUser});
    };

    removeRole = (event, comp) => {
        const { createUser } = this.state;

        createUser.roles.splice(comp.id, 1);

        this.setState({createUser: createUser});
    };

    openModal = (name) => {
        this.setState({[name]: true});
    };

    closeModal = (name) => {
        this.setState({[name]: false});
    };

    getUsers = async (username, instance) => {
        const res = await db.getUsers(username, instance);
        if (res && res.ok && res.ok === 1) {
            const users = res.data;
            this.setState({users: users});
        }
    };

    addUser = async () => {
        if (this.props.username && this.props.instance) {
            this.setState({loadingAddUser: true});
            const state = this.state;

            let data = {
                user: this.state.inputUsername,
                pass: this.state.inputPassword,
                db: this.state.inputDatabase,
                roles: []
            };

            const roles = state.createUser.roles;
            for (const dbRoleNo in roles) {
                const dbRole = roles[dbRoleNo];

                for (const roleNo in dbRole.roles) {
                    const role = dbRole.roles[roleNo];
                    const newRole = {
                        db: dbRole.database,
                        role: role
                    };
                    data.roles.push(newRole);
                }
            }

            await db.addUser(this.props.username, this.props.instance, JSON.stringify({data: data}));

            state.modalAddUser = false;
            state.loadingAddUser = false;
            state.inputUsername = '';
            state.inputPassword = '';
            state.createUser.roles = [{
                  database: 'admin',
                  roles: ['readWrite']
            }]
            this.setState(state);

            // Refresh user list
            if (this.props.username && this.props.instance) {
                this.getUsers(this.props.username, this.props.instance);
            }
        }
    };

    removeUser = async (event, comp) => {
        await db.removeUser(this.props.username, this.props.instance, comp.username);

        // Refresh user list
        if (this.props.username && this.props.instance) {
            this.getUsers(this.props.username, this.props.instance);
        }
    };

    componentDidMount = async () => {
        if (this.props.username !== undefined && this.props.instance !== undefined) {
            this.getUsers(this.props.username, this.props.instance);
        }
    };

    componentWillReceiveProps = async (nextProps) => {
        if (nextProps.username !== this.props.username) {
            await this.getUsers(nextProps.username, this.props.instance);
        }
    };

    render() {
        const { users } = this.state;

        const tables = users.map((user, index) => (
            <Container>
                <Label size = 'large' color = 'blue' >
                    { user.user }
                    <Label.Detail> username </Label.Detail>
                </Label>

                <Label size = 'large' color = 'green' >
                    { user.db }
                    <Label.Detail> database </Label.Detail>
                </Label>

                <Button icon
                    id = {index}
                    username = {user.user}
                    labelPosition = 'left'
                    color = 'red'
                    floated = 'right'
                    size = 'small'
                    onClick = {this.removeUser} >
                        <Icon name = 'remove user' />
                        Remove User
                </Button>

                <Table singleLine unstackable selectable sortable columns = '2'>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell>
                                Role
                            </Table.HeaderCell>
                            <Table.HeaderCell>
                                Database
                            </Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {
                            user.roles.map((role, index) => (
                                <Table.Row>
                                    <Table.Cell>
                                        <Header as = 'h4'>
                                            <Icon name = 'id badge' />
                                            { role.role }
                                        </Header>
                                    </Table.Cell>
                                    <Table.Cell>
                                        <Header as = 'h4'>
                                            <Icon name = 'database' />
                                            { role.db }
                                        </Header>
                                    </Table.Cell>
                                </Table.Row>
                            ))
                        }
                    </Table.Body>
                </Table>
                <Divider hidden />
            </Container>
        ));

        const { roles } = this.state.createUser;
        const createUserRoles = roles.map((role, index) => (
            <Segment raised>
                <Input
                    label = 'Database Name'
                    attached = 'left'
                    id = {index}
                    value = {this.state.createUser.roles[index].database}
                    error = {this.state.createUser.roles[index].database === ''}
                    onChange = {this.handleDatabaseChange}
                />
                <Button basic
                    attached = 'right'
                    id = {index}
                    icon = 'remove'
                    color = 'red'
                    onClick = {this.removeRole}
                />

                <Divider hidden />

                <Dropdown fluid multiple selection
                    id = {index}
                    placeholder = 'Roles'
                    value = {this.state.createUser.roles[index].roles}
                    options = {userRoles}
                    onChange = {this.handleRolesChange} />
            </Segment>
        ));

        return (
          <div className = "UserList">
              { tables }

              <Container>
                  <Button icon
                      labelPosition = 'left'
                      color = 'green'
                      onClick = {() => this.openModal('modalAddUser')} >
                          <Icon name = 'add user' />
                          Add User
                  </Button>
              </Container>

              <Modal closeIcon
                  size = 'fullscreen'
                  name = 'modalAddUser'
                  open = {this.state.modalAddUser}
                  closeOnEscape = {true}
                  closeOnRootNodeClick = {true}
                  onClose = {() => this.closeModal('modalAddUser')}
                  style = {{
                      marginTop: 0,
                      maxWidth: 800
                  }} >
                      <Modal.Header>
                          Add a new User
                      </Modal.Header>
                      <Modal.Content>
                          <Header dividing> Credentials </Header>

                          <Input fluid
                              name = 'inputUsername'
                              placeholder = 'Username'
                              value = {this.state.inputUsername}
                              onChange = {this.handleChange}
                          />

                          <Divider hidden />

                          <Input fluid
                              name = 'inputPassword'
                              placeholder = 'Password'
                              type = 'password'
                              value = {this.state.inputPassword}
                              onChange = {this.handleChange}
                          />

                          <Header dividing> Roles </Header>

                          { createUserRoles }

                          <Divider hidden />

                          <Button fluid icon
                              labelPosition = 'left'
                              color = 'green'
                              onClick = {this.addRole} >
                                  <Icon name = 'id badge' />
                                  Add Role
                          </Button>

                          <Dimmer active = { this.state.loadingAddUser } >
                              <Loader content = 'Loading' />
                          </Dimmer>
                      </Modal.Content>
                      <Modal.Actions>
                          <Button onClick = {() => this.closeModal('modalAddUser')} > Cancel </Button>
                          <Button icon
                              labelPosition = 'left'
                              color = 'green'
                              disabled = {
                                  this.state.inputUsername === '' ||
                                  this.state.inputPassword === '' ||
                                  this.state.inputDatabase === '' ||
                                  this.state.createUser.roles.length === 0
                              }
                              onClick = {this.addUser} >
                                  <Icon name = 'user' />
                                  Add User
                        </Button>
                      </Modal.Actions>
              </Modal>
          </div>
        );
    }
}

export default UserList;
