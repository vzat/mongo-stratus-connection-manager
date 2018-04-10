import React, { Component } from 'react';

import { Table, Icon, Flag, Popup, Grid, Header } from 'semantic-ui-react';

import db from './utils/db';

import gcpRegions from './resources/gcpRegions.json';
import gcpMachineTypes from './resources/gcpMachineTypes.json';

class InstanceOverviewShardedCluster extends Component {
    state = {
        config: [{
            running: true,
            primary: true,
            name: '_________',
            vcpu: 'x',
            ram: 'x',
            disk: 'x',
            region: '_____',
            flag: 'us',
            ip: 'x.x.x.x'
        }],
        shards: {
            shard1: [{
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
        },
        router: [{
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

        // res.data.machineType
        // res.data.diskSize
        // res.data.region
        // res.data.ip
        // res.data.running

        if (res.ok && res.ok === 1) {
              let { state } = this;
              state.config = [];
              state.shards = [];
              state.router = [];

              const data = res.data;
              let servers = [];

              let regions;
              let machineTypes;

              if (instanceInfo.platform === 'Google Cloud Platform') {
                  regions = gcpRegions;
                  machineTypes = gcpMachineTypes;
              }

              for (const serverNo in data) {
                  const server = data[serverNo];

                  let regionValue;
                  let flagValue;
                  let vcpu;
                  let ram;

                  // Get region name and flag
                  for (let regionNo = 0 ; regionNo < regions.length ; regionNo ++) {
                      const region = regions[regionNo];
                      if (region.value === server.region) {
                          regionValue = region.text;
                          flagValue = region.flag;
                      }
                  }

                  // Get virtual cpu and memory
                  for (let machineTypeNo = 0 ; machineTypeNo < machineTypes.length ; machineTypeNo ++) {
                      const machineType = machineTypes[machineTypeNo];
                      if (machineType.name === server.machineType) {
                          vcpu = machineType.vcpu;
                          ram = machineType.ram;
                      }
                  }

                  const serverDetails = {
                      running: server.running,
                      name: server.name,
                      vcpu: vcpu,
                      ram: ram,
                      disk: server.diskSize,
                      region: regionValue,
                      flag: flagValue,
                      ip: server.ip
                  }

                  const comp = server.name.split('-');
                  if (comp.length > 2) {
                      const type = comp[comp.length - 2];

                      // Config Replica
                      if (type.includes('config')) {
                          state.config.push(serverDetails);
                      }

                      // Shards
                      if (type.includes('shard')) {
                          if (state.shards[type] === undefined) {
                              state.shards[type] = [];
                          }
                          state.shards[type].push(serverDetails);
                      }

                      // Mongos
                      if (type.includes('mongos')) {
                          state.router.push(serverDetails);
                      }
                  }
              }
              this.setState(state);
        }

    };

    render() {
        const { router } = this.state;
        const routerTable = (
            <div className = 'server-table'>
                <Table celled singleLine collapsing unstackable className = 'server-table'>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell colSpan = '2'>
                                {
                                    router[0].running &&
                                    <Popup inverted
                                        trigger = { <Icon name = 'check circle' color = 'green' /> }
                                        content = 'This server is running'
                                        position = 'left center' />

                                }
                                {
                                    !router[0].running &&
                                    <Popup inverted
                                        trigger = { <Icon name = 'exclamation circle' color = 'red'/> }
                                        content = 'This server cannot be reached'
                                        position = 'left center' />
                                }
                               { router[0].name }
                            </Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        <Table.Row>
                            <Table.Cell>
                                Server Type
                            </Table.Cell>
                            <Table.Cell>
                                Router
                            </Table.Cell>
                        </Table.Row>
                        <Table.Row>
                            <Table.Cell>
                                Virtual CPUs
                            </Table.Cell>
                            <Table.Cell>
                                { router[0].vcpu }
                            </Table.Cell>
                        </Table.Row>
                        <Table.Row>
                            <Table.Cell>
                                Memory (GB)
                            </Table.Cell>
                            <Table.Cell>
                                { router[0].ram }
                            </Table.Cell>
                        </Table.Row>
                        <Table.Row>
                            <Table.Cell>
                                Disk Space (GB)
                            </Table.Cell>
                            <Table.Cell>
                                { router[0].disk }
                            </Table.Cell>
                        </Table.Row>
                        <Table.Row>
                            <Table.Cell>
                                Region
                            </Table.Cell>
                            <Table.Cell>
                                <Flag name = { router[0].flag } /> { router[0].region }
                            </Table.Cell>
                        </Table.Row>
                        <Table.Row>
                            <Table.Cell>
                                IP Address
                            </Table.Cell>
                            <Table.Cell>
                                { router[0].ip }
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
        );

        const { config } = this.state;
        const configTables = config.map((server, index) => (
            <div className = 'server-table'>
                <Table celled singleLine collapsing unstackable className = 'server-table'>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell colSpan = '2'>
                                {
                                    server.running &&
                                    <Popup inverted
                                        trigger = { <Icon name = 'check circle' color = 'green' /> }
                                        content = 'This server is running'
                                        position = 'left center' />

                                }
                                {
                                    !server.running &&
                                    <Popup inverted
                                        trigger = { <Icon name = 'exclamation circle' color = 'red'/> }
                                        content = 'This server cannot be reached'
                                        position = 'left center' />
                                }
                               { server.name }
                            </Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        <Table.Row>
                            <Table.Cell>
                                Server Type
                            </Table.Cell>
                            <Table.Cell>
                                Config
                            </Table.Cell>
                        </Table.Row>
                        <Table.Row>
                            <Table.Cell>
                                Virtual CPUs
                            </Table.Cell>
                            <Table.Cell>
                                { server.vcpu }
                            </Table.Cell>
                        </Table.Row>
                        <Table.Row>
                            <Table.Cell>
                                Memory (GB)
                            </Table.Cell>
                            <Table.Cell>
                                { server.ram }
                            </Table.Cell>
                        </Table.Row>
                        <Table.Row>
                            <Table.Cell>
                                Disk Space (GB)
                            </Table.Cell>
                            <Table.Cell>
                                { server.disk }
                            </Table.Cell>
                        </Table.Row>
                        <Table.Row>
                            <Table.Cell>
                                Region
                            </Table.Cell>
                            <Table.Cell>
                                <Flag name = { server.flag } /> { server.region }
                            </Table.Cell>
                        </Table.Row>
                        <Table.Row>
                            <Table.Cell>
                                IP Address
                            </Table.Cell>
                            <Table.Cell>
                                { server.ip }
                            </Table.Cell>
                        </Table.Row>
                    </Table.Body>
                </Table>
            </div>
        ));

        const { shards } = this.state;
        const shardsTables = Object.keys(shards).map((shard, shardIndex) => (
            <Grid.Row className = 'sharded-cluster-component' style = {{ borderColor: "LightGreen"}}>
                <Grid.Column>
                    <div className='servers'>
                    {
                        shards[shard].map((server, serverIndex) => (
                            <div className = 'server-table'>
                                <Table celled singleLine collapsing unstackable className = 'server-table'>
                                    <Table.Header>
                                        <Table.Row>
                                            <Table.HeaderCell colSpan = '2'>
                                                {
                                                    server.running &&
                                                    <Popup inverted
                                                        trigger = { <Icon name = 'check circle' color = 'green' /> }
                                                        content = 'This server is running'
                                                        position = 'left center' />

                                                }
                                                {
                                                    !server.running &&
                                                    <Popup inverted
                                                        trigger = { <Icon name = 'exclamation circle' color = 'red'/> }
                                                        content = 'This server cannot be reached'
                                                        position = 'left center' />
                                                }
                                               { server.name }
                                            </Table.HeaderCell>
                                        </Table.Row>
                                    </Table.Header>
                                    <Table.Body>
                                        <Table.Row>
                                            <Table.Cell>
                                                Server Type
                                            </Table.Cell>
                                            <Table.Cell>
                                                Shard
                                            </Table.Cell>
                                        </Table.Row>
                                        <Table.Row>
                                            <Table.Cell>
                                                Shard Name
                                            </Table.Cell>
                                            <Table.Cell>
                                                { shard }
                                            </Table.Cell>
                                        </Table.Row>
                                        <Table.Row>
                                            <Table.Cell>
                                                Virtual CPUs
                                            </Table.Cell>
                                            <Table.Cell>
                                                { server.vcpu }
                                            </Table.Cell>
                                        </Table.Row>
                                        <Table.Row>
                                            <Table.Cell>
                                                Memory (GB)
                                            </Table.Cell>
                                            <Table.Cell>
                                                { server.ram }
                                            </Table.Cell>
                                        </Table.Row>
                                        <Table.Row>
                                            <Table.Cell>
                                                Disk Space (GB)
                                            </Table.Cell>
                                            <Table.Cell>
                                                { server.disk }
                                            </Table.Cell>
                                        </Table.Row>
                                        <Table.Row>
                                            <Table.Cell>
                                                Region
                                            </Table.Cell>
                                            <Table.Cell>
                                                <Flag name = { server.flag } /> { server.region }
                                            </Table.Cell>
                                        </Table.Row>
                                        <Table.Row>
                                            <Table.Cell>
                                                IP Address
                                            </Table.Cell>
                                            <Table.Cell>
                                                { server.ip }
                                            </Table.Cell>
                                        </Table.Row>
                                    </Table.Body>
                                </Table>
                            </div>
                        ))
                    }
                    </div>
                </Grid.Column>
            </Grid.Row>


        ));

        return (
            <Grid>
                <Grid.Row className = 'sharded-cluster-component' style = {{ borderColor: 'LightBlue' }}>
                    <Grid.Column>
                        <div className='servers'>
                            { routerTable }
                        </div>
                    </Grid.Column>
                </Grid.Row>

                <Grid.Row className = 'sharded-cluster-component' style = {{ borderColor: 'Khaki'}}>
                    <Grid.Column>
                        <div className='servers'>
                            { configTables }
                        </div>
                    </Grid.Column>
                </Grid.Row>

                { shardsTables }
            </Grid>
        );
    }
}

export default InstanceOverviewShardedCluster;
