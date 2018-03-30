import React, { Component } from 'react';

import './css/Backup.css';

import { Container, Table, Button, Icon, Confirm } from 'semantic-ui-react';

import db from './utils/db';

class Backup extends Component {
    state = {
        backups: [],
        timestamp: '',
        confirmRestore: false
    };

    openModal = (name) => {
        this.setState({[name]: true});
    };

    closeModal = (name) => {
        this.setState({[name]: false});
    };

    getBackups = async (username, instance) => {
        const res = await db.getBackups(username, instance);

        if (res.ok && res.ok === 1) {
            const backups = res.data;

            this.setState({backups: backups});
        }
    };

    backup = async () => {
        if (this.props.username && this.props.instance) {
            await db.backup(this.props.username, this.props.instance);
        }
    };

    confirmRestore = (event, comp) => {
        if (this.props.username && this.props.instance && comp.id >= 0 && comp.id < this.state.backups.length) {
            this.setState({timestamp: this.state.backups[comp.id].timestamp});
            this.openModal('confirmRestore');
        }
    };

    restore = async () => {
        if (this.props.username && this.props.instance && this.state.timestamp !== '') {
            await db.restore(this.props.username, this.props.instance, this.state.timestamp);
            this.closeModal('confirmRestore');
        }
    };

    componentDidMount = async () => {
        if (this.props.username !== undefined) {
            this.getBackups(this.props.username, this.props.instance);
        }
    };

    componentWillReceiveProps = async (nextProps) => {
        if (nextProps.username !== this.props.username) {
            await this.getBackups(nextProps.username, this.props.instance);
        }
    };

    timestampToTime = (timestamp) => {
        const sepIndex = timestamp.indexOf('T');

        if (sepIndex !== -1) {
            // Format date
            let date = timestamp.substring(0, sepIndex);
            let comp = date.split('-');
            if (comp.length === 3) {
                date = comp[2] + '/' + comp[1] + '/' + comp[0];

                // Format time
                const timeSepIndex = timestamp.indexOf('.');
                if (timeSepIndex !== -1) {
                    let time = timestamp.substring(sepIndex + 1, timeSepIndex);
                    comp = time.split('-');
                    if (comp.length === 3) {
                        time = comp[0] + ':' + comp[1] + ':' + comp[2];
                        return date + ' ' + time;
                    }
                }
            }
        }

        return timestamp;
    };

    render() {
        const { backups } = this.state;
        const rows = backups.map((backup, index) => (
            <Table.Row>
                <Table.Cell>
                    { index + 1 }
                </Table.Cell>
                <Table.Cell>
                    { this.timestampToTime(backup.timestamp) }
                </Table.Cell>
                <Table.Cell collapsing>
                    <Button
                        id = {index}
                        icon = 'upload'
                        color = 'green'
                        size = 'mini'
                        onClick = {this.confirmRestore} />
                </Table.Cell>
            </Table.Row>
        ));

        return (
          <div className = "Backup">
              <Container>
                  { backups.length !== 0 &&
                      <Table singleLine unstackable selectable>
                          <Table.Header>
                              <Table.Row>
                                  <Table.HeaderCell/>
                                  <Table.HeaderCell>
                                      Backup Time
                                  </Table.HeaderCell>
                                  <Table.HeaderCell>
                                      Restore
                                  </Table.HeaderCell>
                              </Table.Row>
                          </Table.Header>
                          <Table.Body>
                              { rows }
                          </Table.Body>
                          <Table.Footer>
                              <Table.Row>
                                  <Table.HeaderCell colSpan = '3' >
                                      <Button icon
                                          color = 'green'
                                          labelPosition = 'left'
                                          onClick = { () => this.backup() } >
                                              <Icon name = 'download' />
                                              Backup
                                      </Button>
                                  </Table.HeaderCell>
                              </Table.Row>
                          </Table.Footer>
                      </Table>
                  }
                  { backups.length === 0 &&
                      <div>
                          No Backups
                      </div>
                  }
                  <Confirm
                      open = {this.state.confirmRestore}
                      onCancel = {() => this.closeModal('confirmRestore')}
                      onConfirm = {() => this.restore()}
                      header = 'Are you sure you want to restore the database to this state?'
                      content = 'All data will be replaced. You cannot undo this action.'
                      confirmButton = {
                          <Button icon
                              labelPosition = 'left'
                              primary = {false}
                              color = 'green'>
                                  <Icon name = 'upload' />
                                  Restore
                          </Button>
                      }
                      size = 'fullscreen'
                      style = {{
                          marginTop: '40vh',
                          maxWidth: 800
                      }}
                  />
              </Container>
          </div>
        );
    }
}

export default Backup;
