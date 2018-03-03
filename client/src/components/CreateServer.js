import React, { Component } from 'react';

import './css/CreateServer.css';

import { Modal, Input, Form, Radio, Button } from 'semantic-ui-react';

class CreateServer extends Component {
    state = {
        serverName: '',
        platform: 'gcp'
    };

    handleChange = (event) => {
        this.setState({ [event.target.name]: event.target.value });
        console.log(event.target.name, event.target.value);
    };

    render() {
        const open = this.props.open;
        console.log(this.state.platform);

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
                      marginTop: 0
                  }} >
                      <Modal.Header> Create New Server </Modal.Header>


                      <Modal.Content>
                          <Input
                              fluid
                              focus
                              placeholder = 'Instance Name'
                              name = 'serverName'
                              value = {this.state.serverName}
                              onChange = {this.handleChange}
                          />

                          <Form>
                              <Form.Field>
                                  <Radio
                                      label = 'Google Cloud Platform'
                                      name = 'platform'
                                      value = 'gcp'
                                      checked = {this.state.platform === 'gcp'}
                                      onChange = {this.handleChange}
                                  />
                              </Form.Field>
                              <Form.Field>
                                  <Radio
                                      label = 'Amazon Web Services'
                                      name = 'platform'
                                      value = 'aws'
                                      checked = {this.state.platform === 'aws'}
                                      onChange = {this.handleChange}
                                  />
                              </Form.Field>
                              <Form.Field>
                                  <Radio
                                      label = 'Microsoft Azure'
                                      name = 'platform'
                                      value = 'azure'
                                      checked = {this.state.platform === 'azure'}
                                      onChange = {this.handleChange}
                                  />
                              </Form.Field>
                          </Form>


                      </Modal.Content>


                      <Modal.Actions>

                      </Modal.Actions>
              </Modal>
          </div>
        );
    }
}

export default CreateServer;
