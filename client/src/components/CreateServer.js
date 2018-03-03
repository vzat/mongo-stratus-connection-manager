import React, { Component } from 'react';

import './css/CreateServer.css';

import { Modal, Grid, Input, Form, Radio, Image, Label, Menu, Header, Dropdown, Accordion, Button } from 'semantic-ui-react';

import gcp from './resources/images/gcp.svg';
import azure from './resources/images/azure.svg';
import aws from './resources/images/aws.svg';

class CreateServer extends Component {
    state = {
        serverName: '',
        platform: '',
        mongoVersion: '3.6',
        serverType: ''
    };

    handleChange = (event) => {
        this.setState({ [event.target.name]: event.target.value });
    };

    handleMenuChange = (event, comp) => {
        this.setState({ [comp.name]: comp.value });
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
        }];

        const panels = [
        {
            title: {
                content: 'Node 1',
                key: 'title'
            },
            content: {
                content: <Input fluid />,
                key: 'content'
            }
        },
        {
            title: {
                content: 'Title',
                key: 'title'
            },
            content: {
                content: <Input fluid />
            }
        },
        {
            title: {
                content: 'Title',
                key: 'title'
            },
            content: {
                content: <Input fluid />
            }
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

                              { this.state.platform && this.state.serverType === 'singleNode' &&
                                  <Grid.Row>
                                      <Grid.Column>
                                          <Header dividing> Single Node </Header>
                                          <Accordion defaultActiveIndex = {0} panels = { panels } fluid styled />
                                      </Grid.Column>
                                  </Grid.Row>
                              }

                              </Grid>

                              { this.state.platform && this.state.serverType &&
                                  <div>
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

                      </Modal.Actions>
              </Modal>
          </div>
        );
    }
}

export default CreateServer;


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
