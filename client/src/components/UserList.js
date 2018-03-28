import React, { Component } from 'react';

import './css/UserList.css';

import { Button, Icon, Container, Header, Table, Modal, Input, Dimmer, Loader, Confirm, Divider, Label } from 'semantic-ui-react';

import db from './utils/db';

class UserList extends Component {
    state = {
        users: [{
            user: '_____',
            roles: [{
                role: '_____',
                database: '_____'
            }]
        }]
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

    getUsers = async (username, instance) => {
        const res = await db.getUsers(username, instance);
        if (res && res.ok && res.ok === 1) {
            const users = res.data;
            this.setState({users: users});
        }
    };

    addUser = async () => {
        
    };

    removeUser = async () => {

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

                <Button icon labelPosition = 'left' color = 'red' size = 'small' floated = 'right'>
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

        return (
          <div className = "UserList">
              { tables }

              <Container>
                  <Button icon labelPosition = 'left' color = 'green' >
                      <Icon name = 'add user' />
                      Add User
                  </Button>
              </Container>
          </div>
        );
    }
}

export default UserList;
