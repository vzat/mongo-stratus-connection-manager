import React, { Component } from 'react';

import { Modal, Button, Icon, Header, Table, Dropdown, Checkbox, Divider, Tab } from 'semantic-ui-react';

class EditSchema extends Component {
    state = {
        databaseName: 'dbName',
        disableAppy: false,
        collections: [{
            name: 'Accounts',
            fields: [{
                name: '_id',
                type: 'ID',
                array: false
            },
            {
                name: 'databases',
                type: 'Database',
                array: true
            }]
        }],
        customObjects: [{
            name: 'Database',
            fields: [{
                name: 'serverName',
                type: 'String',
                array: false
            },
            {
                name: 'ip',
                type: 'String',
                array: true
            }]
        }],
        primitives: [{
            text: 'ID',
            value: 'ID'
        },
        {
            text: 'String',
            value: 'String'
        },
        {
            text: 'Int',
            value: 'Int'
        },
        {
            text: 'Float',
            value: 'Float'
        },
        {
            text: 'Boolean',
            value: 'Boolean'
        },
        {
            text: 'Database',
            value: 'Database'
        }]
    };

    render() {
        const { database } = this.props;
        const { open } = this.props;
        const { collections } = this.state;

        const collectionList = collections.map((collection, collectionIndex) => (
            <div>
                <Header as = 'h3'> {collection.name} </Header>
                <Table singleLine unstackable selectable>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell> Field </Table.HeaderCell>
                            <Table.HeaderCell> Type </Table.HeaderCell>
                            <Table.HeaderCell> Array </Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>

                    {
                        collection.fields.map((field, fieldIndex) => (
                            <Table.Row>
                                <Table.Cell>
                                    { field.name }
                                </Table.Cell>
                                <Table.Cell>
                                    <Dropdown selection
                                        name = 'types'
                                        options = {this.state.primitives}
                                        value = {this.state.collections[collectionIndex].fields[fieldIndex].type}
                                    />
                                </Table.Cell>
                                <Table.Cell collapsing>
                                    <Checkbox />
                                </Table.Cell>
                            </Table.Row>
                        ))
                    }

                    </Table.Body>

                </Table>
            </div>
        ));

        const panes = [{
            menuItem: 'Collections', pane: (
                <Tab.Pane key = 'collection'>
                    <Button icon color = 'green' labelPosition = 'left' onClick = {this.newCollection} >
                        <Icon name = 'plus' />
                        New Collection
                    </Button>

                    <Divider hidden />
                    
                    { collectionList }
                </Tab.Pane>
            )
        },
        {
            menuItem: 'Custom Types', pane: { key: 'custom', content: 'Create Objects' }
        }];

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
                          <Tab panes = {panes} renderActiveOnly={false} />
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
