import React, { Component } from 'react';

import { Table, Label, Icon, Flag, Popup } from 'semantic-ui-react';

class InstanceOverviewSingleNode extends Component {
    state = {
        running: true,
        name: 'lee2-instance1.mongostratus.me:27017',
        vcpu: '0.2',
        ram: '0.60',
        disk: '10',
        region: 'N. Virginia',
        flag: 'us',
        ip: '78.106.68.1'
    };

    render() {
        const table = (
            <div className = 'server-table'>
                <Table celled singleLine collapsing className = 'server-table'>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell colSpan = '2'>
                                {
                                    this.state.running &&
                                    <Popup inverted
                                        trigger = { <Icon name = 'check circle' color = 'green' /> }
                                        content = 'This server is running'
                                        position = 'left center' />

                                }
                                {
                                    !this.state.running &&
                                    <Popup inverted
                                        trigger = { <Icon name = 'exclamation circle' color = 'red'/> }
                                        content = 'This server cannot be reached'
                                        position = 'left center' />
                                }
                               { this.state.name }
                            </Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        <Table.Row>
                            <Table.Cell>
                                Virtual CPU
                            </Table.Cell>
                            <Table.Cell>
                                { this.state.vcpu }
                            </Table.Cell>
                        </Table.Row>
                        <Table.Row>
                            <Table.Cell>
                                Memory (GB)
                            </Table.Cell>
                            <Table.Cell>
                                { this.state.ram }
                            </Table.Cell>
                        </Table.Row>
                        <Table.Row>
                            <Table.Cell>
                                Disk Space (GB)
                            </Table.Cell>
                            <Table.Cell>
                                { this.state.disk }
                            </Table.Cell>
                        </Table.Row>
                        <Table.Row>
                            <Table.Cell>
                                Region
                            </Table.Cell>
                            <Table.Cell>
                                <Flag name = { this.state.flag } /> { this.state.region }
                            </Table.Cell>
                        </Table.Row>
                        <Table.Row>
                            <Table.Cell>
                                IP Address
                            </Table.Cell>
                            <Table.Cell>
                                { this.state.ip }
                            </Table.Cell>
                        </Table.Row>
                    </Table.Body>
                </Table>
            </div>
        );

        return (
          <div className='servers'>
              { table }
          </div>
        );
    }
}

export default InstanceOverviewSingleNode;
