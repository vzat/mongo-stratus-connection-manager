import React, { Component } from 'react';

import { Table, Label, Icon, Flag, Popup } from 'semantic-ui-react';

import db from './utils/db';

import gcpRegions from './resources/gcpRegions.json';
import gcpMachineTypes from './resources/gcpMachineTypes.json';

class InstanceOverviewSingleNode extends Component {
    state = {
        running: true,
        name: '_________.mongostratus.me:27017',
        vcpu: 'x',
        ram: 'x',
        disk: 'x',
        region: '_____',
        flag: 'us',
        ip: 'x.x.x.x'
    };

    componentDidMount = async () => {
        await this.fetchServerData();
        // console.log('singlenode', this.props);
    }

    fetchServerData = async () => {
        // Get machine type and convert to vcpu and ram
        // Get disk size
        // Get region and convert to city and flag
        // Get ip from vm

        const { username } = this.props;
        const { instanceInfo } = this.props;
        const res = await db.getServerDetails(username, instanceInfo.instanceName);

        // res.data.machineType
        // res.data.diskSize
        // res.data.region
        // res.data.ip
        // res.data.running

        if (res.ok && res.ok === 1) {
              const data = res.data[0];

              let regionValue;
              let flagValue;
              let vcpu;
              let ram;

              let regions;
              let machineTypes;
              if (instanceInfo.platform === 'Google Cloud Platform') {
                  regions = gcpRegions;
                  machineTypes = gcpMachineTypes;
              }

              // Get region name and flag
              for (let regionNo = 0 ; regionNo < regions.length ; regionNo ++) {
                  const region = regions[regionNo];
                  if (region.value === data.region) {
                      regionValue = region.text;
                      flagValue = region.flag;
                  }
              }

              // Get virtual cpu and memory
              for (let machineTypeNo = 0 ; machineTypeNo < machineTypes.length ; machineTypeNo ++) {
                  const machineType = machineTypes[machineTypeNo];
                  if (machineType.name === data.machineType) {
                      vcpu = machineType.vcpu;
                      ram = machineType.ram;
                  }
              }

              const newState = {
                  running: data.running,
                  name: username + '-' + instanceInfo.instanceName + '.mongostratus.me:27017',
                  vcpu: vcpu,
                  ram: ram,
                  disk: data.diskSize,
                  region: regionValue,
                  flag: flagValue,
                  ip: data.ip
              }
              this.setState(newState);
        }

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
                                Virtual CPUs
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
