import React, { Component } from 'react';

import { Table, Icon, Flag, Popup } from 'semantic-ui-react';

import db from './utils/db';

import gcpRegions from './resources/gcpRegions.json';
import gcpMachineTypes from './resources/gcpMachineTypes.json';

class InstanceOverviewReplicaSet extends Component {
    state = {
        servers: [{
            running: true,
            primary: true,
            name: '_________',
            vcpu: 'x',
            ram: 'x',
            disk: 'x',
            region: '_____',
            flag: 'us',
            ip: 'x.x.x.x'
        },
        {
            running: true,
            primary: true,
            name: '_________',
            vcpu: 'x',
            ram: 'x',
            disk: 'x',
            region: '_____',
            flag: 'us',
            ip: 'x.x.x.x'
        },
        {
            running: true,
            primary: true,
            name: '_________',
            vcpu: 'x',
            ram: 'x',
            disk: 'x',
            region: '_____',
            flag: 'us',
            ip: 'x.x.x.x'
        }]
    };

    componentDidMount = async () => {
        await this.fetchServerData();
    }

    fetchServerData = async () => {
        // Get machine type and convert to vcpu and ram
        // Get disk size
        // Get region and convert to city and flag
        // Get ip from vm
        // Get replica set name and member state

        const { username } = this.props;
        const { instanceInfo } = this.props;
        const res = await db.getServerDetails(username, instanceInfo.instanceName);
        const res2 = await db.getReplicaSetStatus(username, instanceInfo.instanceName);

        // res.data.machineType
        // res.data.diskSize
        // res.data.region
        // res.data.ip
        // res.data.running

        if (res.ok && res.ok === 1 && res2.ok && res2.ok === 1) {
              const data = res.data;
              const data2 = res2.data;
              let servers = [];

              for (const replicaNo in data) {
                  const replica = data[replicaNo];

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
                      if (region.value === replica.region) {
                          regionValue = region.text;
                          flagValue = region.flag;
                      }
                  }

                  // Get virtual cpu and memory
                  for (let machineTypeNo = 0 ; machineTypeNo < machineTypes.length ; machineTypeNo ++) {
                      const machineType = machineTypes[machineTypeNo];
                      if (machineType.name === replica.machineType) {
                          vcpu = machineType.vcpu;
                          ram = machineType.ram;
                      }
                  }

                  const replicaState = {
                      running: replica.running,
                      replicaSetState: data2.members[replicaNo].stateStr,
                      replicaSetName: data2.set,
                      name: username + '-' + instanceInfo.instanceName + '-' + replicaNo,
                      vcpu: vcpu,
                      ram: ram,
                      disk: replica.diskSize,
                      region: regionValue,
                      flag: flagValue,
                      ip: replica.ip
                  }

                  servers.push(replicaState);
              }

              this.setState({servers});
        }

    };

    render() {
        const { servers } = this.state;
        const table = servers.map((replica, index) => (
            <div className = 'server-table'>
                <Table celled singleLine collapsing unstackable className = 'server-table'>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell colSpan = '2' textAlign = 'center'>
                                {
                                    replica.running &&
                                    <Popup inverted
                                        trigger = { <Icon name = 'check circle' color = 'green' /> }
                                        content = 'This server is running'
                                        position = 'left center' />

                                }
                                {
                                    !replica.running &&
                                    <Popup inverted
                                        trigger = { <Icon name = 'exclamation circle' color = 'red'/> }
                                        content = 'This server cannot be reached'
                                        position = 'left center' />
                                }
                               { replica.name }
                            </Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        <Table.Row>
                            <Table.Cell>
                                Replica Set State
                            </Table.Cell>
                            <Table.Cell>
                                { replica.replicaSetState }
                            </Table.Cell>
                        </Table.Row>
                        <Table.Row>
                            <Table.Cell>
                                Replica Set Name
                            </Table.Cell>
                            <Table.Cell>
                                { replica.replicaSetName }
                            </Table.Cell>
                        </Table.Row>
                        <Table.Row>
                            <Table.Cell>
                                Virtual CPUs
                            </Table.Cell>
                            <Table.Cell>
                                { replica.vcpu }
                            </Table.Cell>
                        </Table.Row>
                        <Table.Row>
                            <Table.Cell>
                                Memory (GB)
                            </Table.Cell>
                            <Table.Cell>
                                { replica.ram }
                            </Table.Cell>
                        </Table.Row>
                        <Table.Row>
                            <Table.Cell>
                                Disk Space (GB)
                            </Table.Cell>
                            <Table.Cell>
                                { replica.disk }
                            </Table.Cell>
                        </Table.Row>
                        <Table.Row>
                            <Table.Cell>
                                Region
                            </Table.Cell>
                            <Table.Cell>
                                <Flag name = { replica.flag } /> { replica.region }
                            </Table.Cell>
                        </Table.Row>
                        <Table.Row>
                            <Table.Cell>
                                IP Address
                            </Table.Cell>
                            <Table.Cell>
                                { replica.ip }
                            </Table.Cell>
                        </Table.Row>
                        <Table.Row>
                            <Table.Cell>
                                Port
                            </Table.Cell>
                            <Table.Cell>
                                27017
                            </Table.Cell>
                        </Table.Row>
                    </Table.Body>
                </Table>
            </div>
        ));

        return (
          <div className='servers'>
              { table }
          </div>
        );
    }
}

export default InstanceOverviewReplicaSet;
