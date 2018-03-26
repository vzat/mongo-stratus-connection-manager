import React, { Component } from 'react';

import { Modal, Button } from 'semantic-ui-react';

class EditSchema extends Component {
    state = {
        databaseName: 'dbName',
        disableAppy: false
    }

    setModalState

    render() {
        const { database } = this.props;
        const { open } = this.props;

        return (
          <div className = "EditSchema">
              <Modal
                  open = { open }
                  size = 'fullscreen'
                  closeIcon
                  closeOnEscape = { true }
                  closeOnRootNodeClick = { true }
                  onClose = {this.props.closeEditSchema}
                  style = {{
                      marginTop: 0,
                      maxWidth: 800
                  }} >
                      <Modal.Header> Edit "{database}" Schema </Modal.Header>

                      <Modal.Content>
                          Edit
                      </Modal.Content>

                      <Modal.Actions>
                          <Button onClick = {this.props.closeEditSchema} >
                              Cancel
                          </Button>

                          <Button
                              color = 'green'
                              disabled = { this.state.disableApply }
                              onClick = {this.editSchema} >
                                  Apply
                          </Button>
                      </Modal.Actions>
              </Modal>
          </div>
        );
    }
}

export default EditSchema;
