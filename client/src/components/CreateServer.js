import React, { Component } from 'react';

import './css/CreateServer.css';

import { Modal, Grid, Input, Image, Menu, Header, Dropdown, Divider, Button, Tab, Dimmer, Loader } from 'semantic-ui-react';

import db from './utils/db.js';

import gcp from './resources/images/gcp.svg';
import azure from './resources/images/azure.svg';
import aws from './resources/images/aws.svg';

import gcpRegions from './resources/gcpRegions.json';

class CreateServer extends Component {
    state = {
        serverName: '',
        platform: '',
        mongoVersion: '3.6',
        serverType: '',
        rootUser: '',
        rootPass: '',
        singleNode: {
          diskSize: 10,
          servers: [{
              serverName: 'Node',
              region: 'us3',
              machineType: 'micro'
          }]
        },
        replicaSet: {
            diskSize: 10,
            servers: [
                {
                    serverName: 'Primary',
                    region: 'us3',
                    machineType: 'micro'
                },
                {
                    serverName: 'Secondary',
                    region: 'us3',
                    machineType: 'micro'
                },
                {
                    serverName: 'Secondary',
                    region: 'us3',
                    machineType: 'micro'
                }]
        },
        shardedCluster: {
            config: {
                diskSize: 10,
                servers: [
                    {
                        serverName: 'Primary',
                        region: 'us3',
                        machineType: 'micro'
                    },
                    {
                        serverName: 'Secondary',
                        region: 'us3',
                        machineType: 'micro'
                    },
                    {
                        serverName: 'Secondary',
                        region: 'us3',
                        machineType: 'micro'
                    }]
            },
            replicas: [{
                diskSize: 10,
                servers: [
                    {
                        serverName: 'Primary',
                        region: 'us3',
                        machineType: 'micro'
                    },
                    {
                        serverName: 'Secondary',
                        region: 'us3',
                        machineType: 'micro'
                    },
                    {
                        serverName: 'Secondary',
                        region: 'us3',
                        machineType: 'micro'
                    }]
            },
            {
                diskSize: 10,
                servers: [
                    {
                        serverName: 'Primary',
                        region: 'us3',
                        machineType: 'micro'
                    },
                    {
                        serverName: 'Secondary',
                        region: 'us3',
                        machineType: 'micro'
                    },
                    {
                        serverName: 'Secondary',
                        region: 'us3',
                        machineType: 'micro'
                    }]
            }],
            router: {
                diskSize: 10,
                servers: [{
                    serverName: 'Node',
                    region: 'us3',
                    machineType: 'micro'
                }]
            }
        },
        disableCreate: true,
        loading: false
    };

    handleChange = (event) => {
        this.setState({ [event.target.name]: event.target.value });
    };

    handleMenuChange = (event, comp) => {
        this.setState({ [comp.name]: comp.value });
    };

    handleSingleNode = (event, comp) => {
        let singleNode = this.state.singleNode;

        if (comp.name === 'diskSize') {
            singleNode['diskSize'] = comp.value;
        }
        else {
            const id = comp.id;
            const field = comp.name;
            const value = comp.value;

            let servers = singleNode.servers;
            servers[id][field] = value;
            singleNode.servers = servers;
        }

        this.setState({ singleNode: singleNode });
    };

    handleReplicaSet = (event, comp) => {
        let replicaSet = this.state.replicaSet;

        if (comp.name === 'diskSize') {
            replicaSet['diskSize'] = comp.value;
        }
        else {
            const id = comp.id;
            const field = comp.name;
            const value = comp.value;

            let servers = replicaSet.servers;
            servers[id][field] = value;
            replicaSet.servers = servers;
        }

        this.setState({ replicaSet: replicaSet });
    };

    handleShardedCluster = (event, comp) => {
        const type = comp.type;
        let shardedCluster = this.state.shardedCluster;

        switch (type) {
            case 'config':
                if (comp.name === 'diskSize') {
                    shardedCluster.config['diskSize'] = comp.value;
                }
                else {
                    const id = comp.id;
                    const field = comp.name;
                    const value = comp.value;

                    let servers = shardedCluster.config.servers;
                    servers[id][field] = value;
                    shardedCluster.config.servers = servers;
                }
                break;
            case 'replica':
                const index = comp.replicaid;
                if (comp.name === 'diskSize') {
                    shardedCluster.replicas[index]['diskSize'] = comp.value;
                }
                else {
                    const id = comp.id;
                    const field = comp.name;
                    const value = comp.value;

                    let servers = shardedCluster.replicas[index].servers;
                    servers[id][field] = value;
                    shardedCluster.replicas[index].servers = servers;
                }
                break;
            default:
                // Router
                if (comp.name === 'diskSize') {
                    shardedCluster.router['diskSize'] = comp.value;
                }
                else {
                    const id = comp.id;
                    const field = comp.name;
                    const value = comp.value;

                    let servers = shardedCluster.router.servers;
                    servers[id][field] = value;
                    shardedCluster.servers = servers;
                }
                break;
        }

        this.setState({ shardedCluster: shardedCluster });
    };

    componentDidUpdate = () => {
        const state = this.state;
        if (state.serverName &&
            state.platform &&
            state.serverType &&
            state.rootUser &&
            state.rootPass) {
                if (state.disableCreate) {
                    this.setState({ disableCreate: false });
                }
        }
        else if (!state.disableCreate) {
            this.setState({ disableCreate: true });
        }
    };

    addReplica = () => {
        let replicaSet = this.state.replicaSet;

        const newServer = {
            serverName: 'Secondary',
            region: 'us3',
            machineType: 'micro'
        };
        replicaSet.servers.push(newServer);

        this.setState({ replicaSet: replicaSet });
    };

    addShardedReplica = (event, comp) => {
        let shardedCluster = this.state.shardedCluster;

        const newServer = {
            serverName: 'Secondary',
            region: 'us3',
            machineType: 'micro'
        };

        if (comp.type === 'config') {
            shardedCluster.config.servers.push(newServer);
        }
        else if (comp.type === 'replica') {
            const index = comp.id;

            shardedCluster.replicas[index].servers.push(newServer);
        }

        this.setState({ shardedCluster: shardedCluster });
    };

    removeReplica = (event, comp) => {
        let replicaSet = this.state.replicaSet;

        replicaSet.servers.splice(comp.id, 1)

        this.setState({ replicaSet: replicaSet });
    };

    removeShardedReplica = (event, comp) => {
        let shardedCluster = this.state.shardedCluster;

        if (comp.type === 'config') {
            shardedCluster.config.servers.splice(comp.id, 1);
        }
        else if (comp.type === 'replica') {
            const replicaIndex = comp.replicaid;

            shardedCluster.replicas[replicaIndex].servers.splice(comp.id, 1);
        }

        this.setState({ shardedCluster: shardedCluster });
    };

    addShard = (event, comp) => {
        let shardedCluster = this.state.shardedCluster;

        const newShard = {
            diskSize: 10,
            servers: [
                {
                    serverName: 'Primary',
                    region: 'us3',
                    machineType: 'micro'
                },
                {
                    serverName: 'Secondary',
                    region: 'us3',
                    machineType: 'micro'
                },
                {
                    serverName: 'Secondary',
                    region: 'us3',
                    machineType: 'micro'
                }]
        };

        shardedCluster.replicas.push(newShard);

        this.setState({ shardedCluster: shardedCluster });
    };

    removeShard = (event, comp) => {
        let shardedCluster = this.state.shardedCluster;

        shardedCluster.replicas.splice(comp.id, 1);

        this.setState({ shardedCluster: shardedCluster });
    };

    createDB = async () => {
        this.setState({ loading: true });
        this.props.setDB(this.state.serverName);

        switch(this.state.serverType) {
            case 'singleNode':
                return this.createSingleNode();
            case 'replicaSet':
                return this.createReplicaSet();
            default:
                this.setState({ loading: false });
                break;
        }
    }

    createSingleNode = async () => {
        const singleNode = this.state.singleNode;
        const server = this.state.singleNode.servers[0];
        const data = {
            username: this.props.username,
            serverInfo: {
                cloudPlatform: this.state.platform,
                region: server.region,
                machineType: server.machineType,
                diskSize: singleNode.diskSize
            },
            serverData: {
                serverName: this.state.serverName,
                serverPort: 27017,
                rootUser: this.state.rootUser,
                rootPass: this.state.rootPass,
                mongoVersion: this.state.mongoVersion
            }
        };
        const json = await JSON.stringify(data);
        const res = await db.createSingleNode(json);

        if (res.ok && res.ok === 1) {
            this.props.setCreatingDB(true);
            this.props.setModalState(false);
            this.setState({ loading: false });
        }
    };

    createReplicaSet = async () => {
        const replicaSet = this.state.replicaSet;
        const servers = replicaSet.servers;

        let regions = [];
        let machineTypes = [];
        let ports = [];
        for (const serverNo in servers) {
            const server = servers[serverNo];
            regions.push(server.region);
            machineTypes.push(server.machineType);
            ports.push(27017);
        }

        const data = {
            username: this.props.username,
            serverInfo: {
                cloudPlatform: this.state.platform,
                regions: regions,
                machineTypes: machineTypes,
                diskSize: replicaSet.diskSize
            },
            serverData: {
                serverName: this.state.serverName,
                serverPorts: ports,
                rootUser: this.state.rootUser,
                rootPass: this.state.rootPass,
                mongoVersion: this.state.mongoVersion,
                replicaSetName: this.state.serverName
            }
        };
        console.log(data);
        const json = await JSON.stringify(data);
        const res = await db.createReplicaSet(json);

        if (res.ok && res.ok === 1) {
            this.props.setCreatingDB(true);
            this.props.setModalState(false);
            this.setState({ loading: false });
        }
        else {
            this.setState({ loading: false });
        }
    };

    render() {
        const open = this.props.open;

        const mongoVersions = [
            {
                text: '3.0',
                value: '3.0'
            },
            {
                text: '3.2',
                value: '3.2'
            },
            {
                text: '3.4',
                value: '3.4'
            },
            {
                text: '3.6',
                value: '3.6'
            }
        ];

        const tempRegions = [
            {
                text: 'us1',
                value: 'us1',
                flag: 'us'
            },
            {
                text: 'us2',
                value: 'us2',
                flag: 'us'
            },
            {
                text: 'us3',
                value: 'us3',
                flag: 'us'
            },
            {
                text: 'eu1',
                value: 'eu1',
                flag: 'eu'
            },
            {
                text: 'eu2',
                value: 'eu2',
                flag: 'eu'
            },
            {
                text: 'eu3',
                value: 'eu3',
                flag: 'eu'
            }
        ];

        const regions = this.state.platform === 'gcp' ? gcpRegions : tempRegions;

        const machineTypes = [
          {
              text: 'micro',
              value: 'micro'
          },
          {
              text: 'small',
              value: 'small'
          },
          {
              text: 'standard',
              value: 'standard'
          }
        ];

        const diskSizes = [
          {
              text: '10 GB',
              value: 10
          },
          {
              text: '15 GB',
              value: 15
          },
          {
              text: '20 GB',
              value: 20
          },
          {
              text: '25 GB',
              value: 25
          },
          {
              text: '30 GB',
              value: 30
          },
          {
              text: '35 GB',
              value: 35
          },
          {
              text: '40 GB',
              value: 40
          },
          {
              text: '45 GB',
              value: 45
          },
          {
              text: '50 GB',
              value: 50
          },
        ];

        // Single Node
        const singleNodeServers = this.state.singleNode.servers;
        const singleNodeTable = singleNodeServers.map((server, index) => (
            <Grid.Row columns = 'equal' key = { 'singleNode-' + server } >
                <Grid.Column> <b> {server.serverName} </b> </Grid.Column>
                <Grid.Column>
                    <Dropdown selection fluid
                        id = { index }
                        name = 'region'
                        options = { regions }
                        defaultValue = 'us3'
                        onChange = { this.handleSingleNode } />
                </Grid.Column>
                <Grid.Column>
                    <Dropdown selection fluid
                        id = { index }
                        name = 'machineType'
                        options = { machineTypes }
                        defaultValue = 'micro'
                        onChange = { this.handleSingleNode } />
                </Grid.Column>
                <Grid.Column>
                    <Dropdown selection fluid search
                        id = { index }
                        name = 'diskSize'
                        options = { diskSizes }
                        value = { this.state.singleNode.diskSize }
                        onChange = { this.handleSingleNode } />
                </Grid.Column>
            </Grid.Row>
        ));

        // Replica Set
        const replicaSetServers = this.state.replicaSet.servers;
        const replicaSetTable = replicaSetServers.map((server, index) => (
            <Grid.Row columns = 'equal' key = { 'replicaSet-' + server } >
                <Grid.Column>
                    <b> { server.serverName } </b>
                    { index > 2 &&
                        <Button basic negative
                            id = { index }
                            floated = 'right'
                            icon = 'remove'
                            size = 'mini'
                            onClick = { this.removeReplica }
                        />
                    }
                </Grid.Column>
                <Grid.Column>
                    <Dropdown selection fluid
                        id = { index }
                        name = 'region'
                        options = { regions }
                        value = { this.state.replicaSet.servers[index].region }
                        onChange = { this.handleReplicaSet } />
                </Grid.Column>
                <Grid.Column>
                    <Dropdown selection fluid
                        id = { index }
                        name = 'machineType'
                        options = { machineTypes }
                        value = { this.state.replicaSet.servers[index].machineType }
                        onChange = { this.handleReplicaSet } />
                </Grid.Column>
                <Grid.Column>
                    <Dropdown selection fluid search
                        id = { index }
                        name = 'diskSize'
                        options = { diskSizes }
                        value = { this.state.replicaSet.diskSize }
                        disabled = { index !== 0 }
                        onChange = { this.handleReplicaSet } />
                </Grid.Column>
            </Grid.Row>
        ));

        // Sharded Clusters
        const shardedClusterConfigServers = this.state.shardedCluster.config.servers;
        const shardedClusterConfigTable = shardedClusterConfigServers.map((server, index) => (
            <Grid.Row columns = 'equal' key = { 'shardedCluster-config-' + server } >
                <Grid.Column>
                    <b> { server.serverName } </b>
                    { index > 2 &&
                        <Button basic negative
                            id = { index }
                            floated = 'right'
                            icon = 'remove'
                            size = 'mini'
                            type = 'config'
                            onClick = { this.removeShardedReplica }
                        />
                    }
                </Grid.Column>
                <Grid.Column>
                    <Dropdown selection fluid
                        id = { index }
                        name = 'region'
                        type = 'config'
                        options = { regions }
                        value = { this.state.shardedCluster.config.servers[index].region }
                        onChange = { this.handleShardedCluster } />
                </Grid.Column>
                <Grid.Column>
                    <Dropdown selection fluid
                        id = { index }
                        name = 'machineType'
                        type = 'config'
                        options = { machineTypes }
                        value = { this.state.shardedCluster.config.servers[index].machineType }
                        onChange = { this.handleShardedCluster } />
                </Grid.Column>
                <Grid.Column>
                    <Dropdown selection fluid search
                        id = { index }
                        name = 'diskSize'
                        type = 'config'
                        options = { diskSizes }
                        value = { this.state.shardedCluster.config.diskSize }
                        disabled = { index !== 0 }
                        onChange = { this.handleShardedCluster } />
                </Grid.Column>
            </Grid.Row>
        ));

        const shardedClusterReplicas = this.state.shardedCluster.replicas;
        const shardedClusterReplicasTables = shardedClusterReplicas.map((replica, replicaIndex) => (
            <Grid celled verticalAlign = 'middle' stackable doubling >
                <Grid.Row columns = 'equal' key = 'shardedCluster-config-header' >
                    <Grid.Column>
                        <b> Shard { replicaIndex + 1 } </b>
                        { replicaIndex > 1 &&
                            <Button basic negative
                                id = { replicaIndex }
                                floated = 'right'
                                icon = 'remove'
                                size = 'mini'
                                type = 'replica'
                                onClick = { this.removeShard }
                            />
                        }
                    </Grid.Column>
                    <Grid.Column> <b> Region </b> </Grid.Column>
                    <Grid.Column> <b> Machine Type </b> </Grid.Column>
                    <Grid.Column> <b> Disk Size </b> </Grid.Column>
                </Grid.Row>
                {
                    replica.servers.map((server, serverIndex) => (
                        <Grid.Row columns = 'equal' key = { 'shardedCluster-replica-' + replicaIndex + '-' + server } >
                            <Grid.Column>
                                <b> { server.serverName } </b>
                                { serverIndex > 2 &&
                                    <Button basic negative
                                        replicaid = { replicaIndex }
                                        id = { serverIndex }
                                        floated = 'right'
                                        icon = 'remove'
                                        size = 'mini'
                                        type = 'replica'
                                        onClick = { this.removeShardedReplica }
                                    />
                                }
                            </Grid.Column>
                            <Grid.Column>
                                <Dropdown selection fluid
                                    id = { serverIndex }
                                    replicaid = { replicaIndex }
                                    name = 'region'
                                    type = 'replica'
                                    options = { regions }
                                    value = { this.state.shardedCluster.replicas[replicaIndex].servers[serverIndex].region }
                                    onChange = { this.handleShardedCluster } />
                            </Grid.Column>
                            <Grid.Column>
                                <Dropdown selection fluid
                                    id = { serverIndex }
                                    replicaid = { replicaIndex }
                                    name = 'machineType'
                                    type = 'replica'
                                    options = { machineTypes }
                                    value = { this.state.shardedCluster.replicas[replicaIndex].servers[serverIndex].machineType }
                                    onChange = { this.handleShardedCluster } />
                            </Grid.Column>
                            <Grid.Column>
                                <Dropdown selection fluid search
                                    id = { serverIndex }
                                    replicaid = { replicaIndex }
                                    name = 'diskSize'
                                    type = 'replica'
                                    options = { diskSizes }
                                    value = { this.state.shardedCluster.replicas[replicaIndex].diskSize }
                                    disabled = { serverIndex !== 0 }
                                    onChange = { this.handleShardedCluster } />
                            </Grid.Column>
                        </Grid.Row>
                    ))
                }
                <Grid.Row>
                    <Grid.Column>
                        <Button fluid basic
                            icon = 'plus'
                            color = 'green'
                            type = 'replica'
                            id = { replicaIndex }
                            onClick = { this.addShardedReplica }
                        />
                    </Grid.Column>
                </Grid.Row>
            </Grid>
        ));

        const shardedClusterRouterServers = this.state.shardedCluster.router.servers;
        const shardedClusterRouterTable = shardedClusterRouterServers.map((server, index) => (
            <Grid.Row columns = 'equal' key = { 'singleNode-router-' + server } >
                <Grid.Column> <b> {server.serverName} </b> </Grid.Column>
                <Grid.Column>
                    <Dropdown selection fluid
                        id = { index }
                        name = 'region'
                        options = { regions }
                        value = { this.state.shardedCluster.router.servers[index].region }
                        onChange = { this.handleShardedCluster } />
                </Grid.Column>
                <Grid.Column>
                    <Dropdown selection fluid
                        id = { index }
                        name = 'machineType'
                        options = { machineTypes }
                        value = { this.state.shardedCluster.router.servers[index].machineType }
                        onChange = { this.handleShardedCluster } />
                </Grid.Column>
                <Grid.Column>
                    <Dropdown selection fluid search
                        id = { index }
                        name = 'diskSize'
                        options = { diskSizes }
                        value = { this.state.shardedCluster.router.diskSize }
                        onChange = { this.handleShardedCluster } />
                </Grid.Column>
            </Grid.Row>
        ));

        // Sharded Clustered Tabs
        const configServers = (
            <Grid celled verticalAlign = 'middle' stackable doubling >
                <Grid.Row columns = 'equal' key = 'shardedCluster-config-header' >
                    <Grid.Column> <b> Config Servers </b> </Grid.Column>
                    <Grid.Column> <b> Region </b> </Grid.Column>
                    <Grid.Column> <b> Machine Type </b> </Grid.Column>
                    <Grid.Column> <b> Disk Size </b> </Grid.Column>
                </Grid.Row>
                { shardedClusterConfigTable }
                <Grid.Row>
                    <Grid.Column>
                        <Button fluid basic
                            icon = 'plus'
                            color = 'yellow'
                            type = 'config'
                            onClick = { this.addShardedReplica }
                        />
                    </Grid.Column>
                </Grid.Row>
            </Grid>
        );

        const shardsServers = (
            <div>
                { shardedClusterReplicasTables }
                <Button fluid color = 'green' onClick = { this.addShard }>
                    Add Shard
                </Button>
            </div>
        );

        const routerServers = (
            <div>
                <Grid celled verticalAlign = 'middle' stackable doubling >
                    <Grid.Row columns = 'equal' key = 'shardedCluster-router-header' >
                        <Grid.Column> <b> Router </b> </Grid.Column>
                        <Grid.Column> <b> Region </b> </Grid.Column>
                        <Grid.Column> <b> Machine Type </b> </Grid.Column>
                        <Grid.Column> <b> Disk Size </b> </Grid.Column>
                    </Grid.Row>
                    { shardedClusterRouterTable }
                </Grid>
            </div>
        );

        const tabs = [{
            menuItem: 'Config Servers',
            render: () => configServers
        },
        {
            menuItem: 'Shards',
            render: () => shardsServers
        },
        {
            menuItem: 'Router',
            render: () => routerServers
        }];

        return (
          <div className = "CreateServer">
              <Modal
                  open = { open }
                  size = 'fullscreen'
                  closeIcon
                  closeOnEscape = { true }
                  closeOnRootNodeClick = { true }
                  onClose = {() => this.props.setModalState(false)}
                  style = {{
                      marginTop: 0,
                      maxWidth: 800
                  }} >
                      <Modal.Header> Create New Server </Modal.Header>


                      <Modal.Content>
                          <Dimmer active = { this.state.loading } >
                              <Loader content = 'Loading' />
                          </Dimmer>

                          <Grid>
                              <Grid.Row>
                                  <Grid.Column>
                                      <Header dividing> Instance Name </Header>
                                      <Input
                                          fluid
                                          focus
                                          placeholder = 'Instance Name'
                                          name = 'serverName'
                                          value = {this.state.serverName}
                                          onChange = {this.handleChange}
                                      />
                                  </Grid.Column>
                              </Grid.Row>

                              <Grid.Row>
                                  <Grid.Column>
                                      <Header dividing> Cloud Platform </Header>
                                      <Menu fluid stackable widths = '3' >
                                          <Menu.Item
                                              name = 'platform'
                                              value = 'gcp'
                                              active = { this.state.platform === 'gcp' }
                                              onClick = { this.handleMenuChange } >
                                                  <Image src = {gcp} size = 'small'/>
                                          </Menu.Item>
                                          <Menu.Item
                                              name = 'platform'
                                              value = 'aws'
                                              active = { this.state.platform === 'aws' }
                                              onClick = { this.handleMenuChange } >
                                                  <Image src = {aws} size = 'small'/>
                                          </Menu.Item>
                                          <Menu.Item
                                              name = 'platform'
                                              value = 'azure'
                                              active = { this.state.platform === 'azure' }
                                              onClick = { this.handleMenuChange } >
                                                  <Image src = {azure} size = 'small'/>
                                          </Menu.Item>
                                      </Menu>
                                  </Grid.Column>
                              </Grid.Row>

                              <Grid.Row>
                                  <Grid.Column>
                                      <Header dividing> MongoDB Version </Header>
                                      <Dropdown selection fluid
                                          name = 'mongoVersion'
                                          options = { mongoVersions }
                                          defaultValue = '3.6'
                                          onChange = { this.handleMenuChange } />
                                  </Grid.Column>
                              </Grid.Row>
                              <Grid.Row>
                                  <Grid.Column>
                                      <Header dividing> Instance Type </Header>
                                      <Menu fluid stackable widths = '3' >
                                          <Menu.Item
                                              name = 'serverType'
                                              value = 'singleNode'
                                              active = { this.state.serverType === 'singleNode' }
                                              onClick = { this.handleMenuChange } >
                                                  Single Node
                                          </Menu.Item>

                                          <Menu.Item
                                              name = 'serverType'
                                              value = 'replicaSet'
                                              active = { this.state.serverType === 'replicaSet' }
                                              onClick = { this.handleMenuChange } >
                                                  Replica Set
                                          </Menu.Item>
                                          <Menu.Item
                                              name = 'serverType'
                                              value = 'shardedCluster'
                                              active = { this.state.serverType === 'shardedCluster' }
                                              onClick = { this.handleMenuChange } >
                                                  Sharded Cluster
                                          </Menu.Item>
                                      </Menu>
                                  </Grid.Column>
                              </Grid.Row>
                              </Grid>

                              { this.state.platform && this.state.serverType === 'singleNode' &&
                                  <div>
                                      <Divider hidden />
                                      <Header dividing> Single Node </Header>
                                      <Grid celled verticalAlign = 'middle' stackable doubling >
                                          <Grid.Row columns = 'equal' key = 'singleNode-header' >
                                              <Grid.Column/>
                                              <Grid.Column> <b> Region </b> </Grid.Column>
                                              <Grid.Column> <b> Machine Type </b> </Grid.Column>
                                              <Grid.Column> <b> Disk Size </b> </Grid.Column>
                                          </Grid.Row>
                                          { singleNodeTable }
                                      </Grid>
                                  </div>
                              }

                              { this.state.platform && this.state.serverType === 'replicaSet' &&
                                  <div>
                                      <Divider hidden />
                                      <Header dividing> Replica Set </Header>
                                      <Grid celled verticalAlign = 'middle' stackable doubling >
                                          <Grid.Row columns = 'equal' key = 'replicaSet-header' >
                                              <Grid.Column/>
                                              <Grid.Column> <b> Region </b> </Grid.Column>
                                              <Grid.Column> <b> Machine Type </b> </Grid.Column>
                                              <Grid.Column> <b> Disk Size </b> </Grid.Column>
                                          </Grid.Row>
                                          { replicaSetTable }
                                          <Grid.Row>
                                              <Grid.Column>
                                                  <Button fluid basic
                                                      icon = 'plus'
                                                      color = 'green'
                                                      onClick = { this.addReplica }
                                                  />
                                              </Grid.Column>
                                          </Grid.Row>
                                      </Grid>
                                  </div>
                              }

                              { this.state.platform && this.state.serverType === 'shardedCluster' &&
                                  <div>
                                      <Divider hidden />
                                      <Header dividing> Sharded Cluster </Header>
                                      <Tab menu = {{ secondary: true, pointing: true }} panes = { tabs } />
                                  </div>
                              }


                              { this.state.platform && this.state.serverType &&
                                  <div>
                                      <Divider hidden />
                                      <Header dividing> Admin Credentials </Header>
                                      <Grid>
                                          <Grid.Row columns = 'equal'>
                                              <Grid.Column>
                                                  <Input fluid
                                                      placeholder = 'Username'
                                                      name = 'rootUser'
                                                      value = { this.state.rootUser }
                                                      onChange = { this.handleChange }
                                                  />
                                              </Grid.Column>

                                              <Grid.Column>
                                                  <Input fluid
                                                      placeholder = 'Password'
                                                      name = 'rootPass'
                                                      type = 'password'
                                                      value = { this.state.rootPass }
                                                      onChange = { this.handleChange }
                                                  />
                                              </Grid.Column>
                                          </Grid.Row>
                                      </Grid>
                                  </div>
                              }

                      </Modal.Content>


                      <Modal.Actions>
                          <Button
                              color = 'green'
                              disabled = { this.state.disableCreate }
                              onClick = {this.createDB} >
                                  Create Instance
                          </Button>
                      </Modal.Actions>
              </Modal>
          </div>
        );
    }
}

export default CreateServer;

// <Divider hidden />
// <Header dividing> Single Node </Header>
// <Grid celled verticalAlign = 'middle' stackable doubling >
//     { singleNodeTable }
//     <Grid.Row columns = 'equal' >
//         <Grid.Column cols = '2'>
//             <b> Disk Size </b>
//         </Grid.Column>
//
//         <Grid.Column>
//             <Input fluid
//                 type = 'number'
//                 min = '10'
//                 name = 'diskSize'
//                 value = { this.state.singleNode.diskSize }
//                 onChange = { this.handleSingleNode }
//             />
//         </Grid.Column>
//     </Grid.Row>
// </Grid>

// <Table fixed definition >
//     <Table.Header>
//         <Table.Row>
//             <Table.HeaderCell />
//             <Table.HeaderCell> Region </Table.HeaderCell>
//             <Table.HeaderCell> Machine Type </Table.HeaderCell>
//         </Table.Row>
//     </Table.Header>
//
//     { singleNodeTable }
//
// </Table>

// <Table.Footer fullWidth>
//     <Table.Row>
//         <Table.HeaderCell>
//             <b> Disk Size </b>
//         </Table.HeaderCell>
//         <Table.HeaderCell/>
//         <Table.HeaderCell>
//             <Input fluid type = 'number' min = '10' size = 'small' />
//         </Table.HeaderCell>
//     </Table.Row>
// </Table.Footer>

// <Accordion defaultActiveIndex = {0} panels = { panels } fluid styled />

//
// <Form>
//     <Form.Field>
//         <Input
//             fluid
//             focus
//             placeholder = 'Instance Name'
//             name = 'serverName'
//             value = {this.state.serverName}
//             onChange = {this.handleChange}
//         />
//     </Form.Field>
//     <Form.Group widths = 'equal' >
//         <Form.Field>
//             <Label as = 'a' image>
//                 <Image src = {gcp} />
//                 <Form.Radio
//                     name = 'platform'
//                     value = 'gcp'
//                     checked = {this.state.platform === 'gcp'}
//                     onChange = {this.handleRadioChange}
//                 />
//             </Label>
//         </Form.Field>
//         <Form.Field>
//             <Image src = {aws} size = 'small' />
//             <Form.Radio
//                 label = 'Amazon Web Services'
//                 name = 'platform'
//                 value = 'aws'
//                 checked = {this.state.platform === 'aws'}
//                 onChange = {this.handleRadioChange}
//             />
//         </Form.Field>
//         <Form.Field>
//             <Image src = {azure} size = 'small' />
//             <Form.Radio
//                 label = 'Microsoft Azure'
//                 name = 'platform'
//                 value = 'azure'
//                 checked = {this.state.platform === 'azure'}
//                 onChange = {this.handleRadioChange}
//             />
//         </Form.Field>
//     </Form.Group>
// </Form>
