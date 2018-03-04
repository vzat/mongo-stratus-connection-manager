import React, { Component } from 'react';

import './css/CreateServer.css';

import { Modal, Grid, Input, Form, Radio, Image, Label, Menu, Header, Dropdown, Accordion, Table, Divider, Button } from 'semantic-ui-react';

import gcp from './resources/images/gcp.svg';
import azure from './resources/images/azure.svg';
import aws from './resources/images/aws.svg';

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
        disableCreate: true
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

        const regions = [
            {
                text: 'us1',
                value: 'us1'
            },
            {
                text: 'us2',
                value: 'us2'
            },
            {
                text: 'us3',
                value: 'us3'
            },
            {
                text: 'eu1',
                value: 'eu1'
            },
            {
                text: 'eu2',
                value: 'eu2'
            },
            {
                text: 'eu3',
                value: 'eu3'
            }
        ];

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
            </Grid.Row>
        ));

        console.log(this.state.singleNode);

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
                                          { singleNodeTable }
                                          <Grid.Row columns = 'equal' >
                                              <Grid.Column cols = '2'>
                                                  <b> Disk Size </b>
                                              </Grid.Column>

                                              <Grid.Column>
                                                  <Input fluid
                                                      type = 'number'
                                                      min = '10'
                                                      name = 'diskSize'
                                                      value = { this.state.singleNode.diskSize }
                                                      onChange = { this.handleSingleNode }
                                                  />
                                              </Grid.Column>
                                          </Grid.Row>
                                      </Grid>
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
                          <Button color = 'green' disabled = { this.state.disableCreate } > Create Instance </Button>
                      </Modal.Actions>
              </Modal>
          </div>
        );
    }
}

export default CreateServer;

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
