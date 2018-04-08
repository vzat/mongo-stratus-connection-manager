import React, { Component } from 'react';

import './css/Backup.css';

import { Container, Table, Button, Icon, Confirm, Header, Dropdown } from 'semantic-ui-react';

import db from './utils/db';

class Backup extends Component {
    state = {
        backups: [],
        timestamp: '',
        confirmRestore: false,
        backupOptions: [{
            text: 'None',
            value: 'None'
        },
        {
            text: 'Daily',
            value: 'Daily'
        },
        {
            text: 'Weekly',
            value: 'Weekly'
        },
        {
            text: 'Monthly',
            value: 'Monthly'
        }],
        backupOption: 'None',
        dateOptions: [],
        dateOption: 1,
        dayOptions: [],
        dayOption: 1,
        hourOptions: [],
        hourOption: 0
    };

    openModal = (name) => {
        this.setState({[name]: true});
    };

    closeModal = (name) => {
        this.setState({[name]: false});
    };

    handleDropdown = (event, comp) => {
        this.setState({[comp.name]: comp.value});
    };

    getBackups = async (username, instance) => {
        if (username === undefined && instance === undefined && this.props.username === undefined && this.props.instance === undefined) {
            return;
        }
        if (username === undefined && instance === undefined && this.props.username !== undefined && this.props.instance !== undefined) {
            username = this.props.username;
            instance = this.props.instance;
        }

        const res = await db.getBackups(username, instance);

        if (res.ok && res.ok === 1) {
            const backups = res.data;

            this.setState({backups: backups});
        }

        setTimeout(this.getBackups, 10000);
    };

    getScheduledBackup = async (username, instance) => {
        const res = await db.getScheduledBackup(username, instance);

        if (res.ok && res.ok === 1) {
            const data = res.data;

            const comp = data.split(' ');
            if (comp.length !== 5) {
              return;
            }

            const { state } = this;

            if (comp[2] !== '*') {
                state.dateOption = parseInt(comp[2]);
                state.backupOption = 'Monthly';
            }
            else if (comp[4] !== '*') {
                state.dayOption = parseInt(comp[4]);
                state.backupOption = 'Weekly';
            }
            else {
                state.backupOption = 'Daily';
            }

            if (comp[1] !== '*') {
                state.hourOption = parseInt(comp[1]);
            }
            else {
                state.backupOption = 'None';
            }

            this.setState(state);
        }
    };

    setScheduledBackup = async (event, comp) => {
        if (this.props.username !== undefined && this.props.instance !== undefined) {
            let timeString = '';

            const { state } = this;
            switch (state.backupOption) {
                case 'Daily':
                    timeString = '0 ' + state.hourOption + ' * * *';
                    break;
                case 'Weekly':
                    timeString = '0 ' + state.hourOption + ' * * ' + state.dayOption;
                    break;
                case 'Monthly':
                    timeString = '0 ' + state.hourOption + ' ' + state.dateOption + ' * *';
                    break;
                default:
                    timeString = '* * * * *';
                    break;
            }

            await db.setScheduledBackup(this.props.username, this.props.instance, JSON.stringify({time: timeString}));
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
            this.getScheduledBackup(this.props.username, this.props.instance);
        }

        // Set dateOptions
        let dateOptions = [];
        for (let day = 1; day <= 28 ; day ++) {
            let dayString = '';
            switch (day) {
                case 1:
                    dayString = '1st';
                    break;
                case 2:
                    dayString = '2nd';
                    break;
                case 3:
                    dayString = '3rd';
                    break;
                default:
                    dayString = day + 'th';
            }
            const dateOption = {
                text: dayString,
                value: day
            };
            dateOptions.push(dateOption);
        }
        this.setState({dateOptions});

        // Set dayOptions
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        let dayOptions = [];
        for (const dayNo in days) {
            dayOptions.push({
                text: days[dayNo],
                value: parseInt(dayNo)
            });
        }
        this.setState({dayOptions});

        // Set hourOptions
        let hourOptions = [];
        for (let hour = 0; hour <= 23 ; hour ++) {
            let hourString = '';
            if (hour < 10) {
                hourString = '0' + hour + ':00';
            }
            else {
                hourString = hour + ':00';
            }
            hourOptions.push({
                text: hourString,
                value: hour
            });
        }
        this.setState({hourOptions});
    };

    componentWillReceiveProps = async (nextProps) => {
        if (nextProps.username !== this.props.username) {
            await this.getBackups(nextProps.username, this.props.instance);
            await this.getScheduledBackup(this.props.username, this.props.instance);
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
                  <Header dividing> Manual Backup </Header>
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
                      <Button icon
                          color = 'green'
                          labelPosition = 'left'
                          onClick = { () => this.backup() } >
                              <Icon name = 'download' />
                              Backup
                      </Button>
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

                  <Header dividing> Scheduled Backup </Header>
                  <Dropdown selection compact
                      name = 'backupOption'
                      options = {this.state.backupOptions}
                      value = {this.state.backupOption}
                      onChange = {this.handleDropdown} />
                  {' '}
                  {
                      this.state.backupOption === 'Monthly' &&
                      <Dropdown selection compact
                          name = 'dateOption'
                          options = {this.state.dateOptions}
                          value = {this.state.dateOption}
                          onChange = {this.handleDropdown}
                      />
                  }
                  {' '}
                  {
                      this.state.backupOption === 'Weekly' &&
                      <Dropdown selection compact
                          name = 'dayOption'
                          options = {this.state.dayOptions}
                          value = {this.state.dayOption}
                          onChange = {this.handleDropdown}
                      />
                  }
                  {' '}
                  {
                      this.state.backupOption !== 'None' &&
                      <Dropdown selection compact
                          name = 'hourOption'
                          options = {this.state.hourOptions}
                          value = {this.state.hourOption}
                          onChange = {this.handleDropdown}
                      />
                  }
                  {' '}
                  <Button
                      color = 'green'
                      onClick = {this.setScheduledBackup} >
                          Apply
                  </Button>
              </Container>
          </div>
        );
    }
}

export default Backup;
