import React, { Component } from 'react';

import { Modal, Button, Icon, Header, Table, Dropdown, Checkbox, Divider, Tab, Input } from 'semantic-ui-react';

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

    handleFieldChange = (event, comp) => {
        let { collections } = this.state;

        if (comp.name === 'collection-name') {
             collections[comp.collectionID].fields[comp.fieldID].name = comp.value;
         }

         if (comp.name === 'collection-field') {
            collections[comp.collectionID].fields[comp.fieldID].type = comp.value;
         }

         if (comp.name === 'collection-array') {
             collections[comp.collectionID].fields[comp.fieldID].array = !collections[comp.collectionID].fields[comp.fieldID].array;
         }

         this.setState({collection: collections});
    };

    newField = (event, comp) => {
        let { collections } = this.state;

        let field = {
            name: 'field_name',
            type: 'String',
            array: false
        };

        collections[comp.collectionID].fields.push(field);

        this.setState({collection: collections});
    };

    removeField = (event, comp) => {
        let { collections } = this.state;

        collections[comp.collectionID].fields.splice(comp.fieldID, 1);

        this.setState({collection: collections});
    };

    handleCollectionChange = (event, comp) => {
        let { collections } = this.state;

        collections[comp.collectionID].name = comp.value;

        this.setState({collection: collections});
    };

    newCollection = (event, comp) => {
        let { collections } = this.state;

        let collection = {
            name: 'collection_name',
            fields: [{
                name: '_id',
                type: 'ID',
                array: false
            }]
        };

        collections.push(collection);

        this.setState({collection: collections});
    };

    removeCollection = (event, comp) => {
        let { collections } = this.state;

        collections.splice(comp.collectionID, 1);

        this.setState({collection: collections});
    };

    handleChange = (event) => {
        this.setState({ [event.target.name]: event.target.value });
    };

    render() {
        const { database } = this.props;
        const { open } = this.props;
        const { collections } = this.state;

        const collectionList = collections.map((collection, collectionIndex) => (
            <div>
                <Input
                    label = 'Collection Name'
                    attached = 'left'
                    collectionID = {collectionIndex}
                    value = {collection.name}
                    error = {this.state.collections[collectionIndex].name === ''}
                    onChange = {this.handleCollectionChange}
                />

                <Button basic attached = 'right'
                    collectionID = {collectionIndex}
                    icon = 'remove'
                    color = 'red'
                    onClick = {this.removeCollection}
                />

                <Table singleLine unstackable selectable>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell> Field </Table.HeaderCell>
                            <Table.HeaderCell> Type </Table.HeaderCell>
                            <Table.HeaderCell> Array </Table.HeaderCell>
                            <Table.HeaderCell />
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>

                    {
                        collection.fields.map((field, fieldIndex) => (
                            <Table.Row>
                                <Table.Cell width = '5'>
                                    <Input fluid
                                        collectionID = {collectionIndex}
                                        fieldID = {fieldIndex}
                                        name = 'collection-name'
                                        value = {field.name}
                                        error = {this.state.collections[collectionIndex].fields[fieldIndex].name === ''}
                                        onChange = {this.handleFieldChange}
                                    />
                                </Table.Cell>
                                <Table.Cell width = '5'>
                                    <Dropdown selection
                                        collectionID = {collectionIndex}
                                        fieldID = {fieldIndex}
                                        name = 'collection-field'
                                        options = {this.state.primitives}
                                        value = {this.state.collections[collectionIndex].fields[fieldIndex].type}
                                        onChange = {this.handleFieldChange}
                                    />
                                </Table.Cell>
                                <Table.Cell>
                                    <Checkbox
                                        collectionID = {collectionIndex}
                                        fieldID = {fieldIndex}
                                        name = 'collection-array'
                                        checked = {this.state.collections[collectionIndex].fields[fieldIndex].array}
                                        onChange = {this.handleFieldChange}
                                    />
                                </Table.Cell>
                                <Table.Cell collapsing>
                                    <Button basic
                                        collectionID = {collectionIndex}
                                        fieldID = {fieldIndex}
                                        icon = 'remove'
                                        color = 'red'
                                        size = 'mini'
                                        onClick = {this.removeField}
                                    />
                                </Table.Cell>
                            </Table.Row>
                        ))
                    }

                    </Table.Body>

                    <Table.Footer>
                        <Table.Row>
                            <Table.HeaderCell colSpan = '4'>
                                <Button icon basic fluid
                                    collectionID = {collectionIndex}
                                    color = 'green'
                                    labelPosition = 'left'
                                    onClick = {this.newField} >
                                        <Icon name = 'plus' />
                                        New Field
                                </Button>
                            </Table.HeaderCell>
                        </Table.Row>
                    </Table.Footer>

                </Table>

                <Divider section />
            </div>
        ));

        const panes = [{
            menuItem: 'Collections', pane: (
                <Tab.Pane key = 'collection'>
                    { collectionList }

                    <Button icon fluid
                        color = 'green'
                        labelPosition = 'left'
                        onClick = {this.newCollection} >
                            <Icon name = 'plus' />
                            New Collection
                    </Button>
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
