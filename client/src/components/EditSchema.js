import React, { Component } from 'react';

import { Modal, Button, Icon, Table, Dropdown, Checkbox, Divider, Tab, Input, Dimmer, Loader } from 'semantic-ui-react';

import db from './utils/db';
import utils from './utils/utils';

class EditSchema extends Component {
    state = {
        databaseName: 'dbName',
        disableAppy: false,
        collections: [],
        customObjects: [],
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
        }],
        loading: false
    };

    getSchema = async (username, instance, database) => {
        const res = await db.getSchema(username, instance, database);

        if (res && res.ok && res.ok === 1) {
            let schema = await JSON.parse(res.schema);

            // Get list of collections without square brackets
            let collections = schema.Query;
            let collectionsList = [];
            for (const collectionName in collections) {
                let newCollectionName = utils.removeSquareBrackets(collections[collectionName]);
                collectionsList.push(newCollectionName);
            }

            delete schema.Query;

            let state = this.state;
            state.collections = [];
            state.customObjects = [];

            for (const object in schema) {

                const item = {
                    name: object,
                    fields: []
                };

                for (const fieldName in schema[object]) {
                    let fieldType = schema[object][fieldName];

                    if (fieldType.indexOf('[') !== -1 && fieldType.indexOf(']') !== -1) {
                        // Array
                        const field = {
                            name: fieldName,
                            type: utils.removeSquareBrackets(fieldType),
                            array: true
                        };
                        item.fields.push(field);
                    }
                    else {
                        const field = {
                            name: fieldName,
                            type: fieldType,
                            array: false
                        };
                        item.fields.push(field);
                    }
                }

                if (collectionsList.indexOf(object) !== -1) {
                    if (item.name.lastIndexOf('_Documents') !== -1) {
                        item.name = item.name.substring(0, item.name.indexOf('_Documents'));
                    }

                    // Add to collections
                    state.collections.push(item);
                }
                else {
                    // Add to custom objects
                    state.customObjects.push(item);
                    state.primitives.push({
                        text: item.name,
                        value: item.name
                    });
                }
            }

            this.setState({state: state});
        }
    };

    componentDidMount = async () => {
        if (this.props.username && this.props.instance && this.props.database) {
            this.getSchema(this.props.username, this.props.instance, this.props.database);
        }
    };

    componentWillReceiveProps = (nextProps) => {
        if (nextProps.username !== undefined &&
            nextProps.instance !== undefined &&
            nextProps.database !== undefined &&
            this.state.collections.length === 0 &&
            this.state.customObjects.length === 0) {
                this.getSchema(nextProps.username, nextProps.instance, nextProps.database);
        }
    };

    handleFieldChange = (event, comp) => {
        let { collections } = this.state;

        if (comp.name === 'collection-name') {
             collections[comp.collectionid].fields[comp.fieldid].name = comp.value;
         }

         if (comp.name === 'collection-field') {
            collections[comp.collectionid].fields[comp.fieldid].type = comp.value;
         }

         if (comp.name === 'collection-array') {
             collections[comp.collectionid].fields[comp.fieldid].array = !collections[comp.collectionid].fields[comp.fieldid].array;
         }

         this.setState({collection: collections});
    };

    handleObjectFieldChange = (event, comp) => {
        let { customObjects } = this.state;

        if (comp.name === 'object-name') {
             customObjects[comp.customobjectid].fields[comp.fieldid].name = comp.value;
         }

         if (comp.name === 'object-field') {
            customObjects[comp.customobjectid].fields[comp.fieldid].type = comp.value;
         }

         if (comp.name === 'object-array') {
             customObjects[comp.customobjectid].fields[comp.fieldid].array = !customObjects[comp.customobjectid].fields[comp.fieldid].array;
         }

         this.setState({customObjects: customObjects});
    };

    newField = (event, comp) => {
        let { collections } = this.state;

        let field = {
            name: '',
            type: 'String',
            array: false
        };

        collections[comp.collectionid].fields.push(field);

        this.setState({collection: collections});
    };

    newObjectField = (event, comp) => {
        let { customObjects } = this.state;

        let field = {
            name: '',
            type: 'String',
            array: false
        };

        customObjects[comp.customobjectid].fields.push(field);

        this.setState({customObjects: customObjects});
    };

    removeField = (event, comp) => {
        let { collections } = this.state;

        collections[comp.collectionid].fields.splice(comp.fieldid, 1);

        this.setState({collection: collections});
    };

    removeObjectField = (event, comp) => {
        let { customObjects } = this.state;

        customObjects[comp.customobjectid].fields.splice(comp.fieldid, 1);

        this.setState({customObjects: customObjects});
    };

    handleCollectionChange = (event, comp) => {
        let { collections } = this.state;

        collections[comp.collectionid].name = comp.value;

        this.setState({collection: collections});
    };

    handleObjectChange = (event, comp) => {
        let { customObjects } = this.state;
        const modifiedCustomObject = customObjects[comp.customobjectid].name;

        customObjects[comp.customobjectid].name = comp.value;

        // Remove previous primitive
        let { primitives } = this.state;
        for (let primitiveIndex = 0 ; primitiveIndex < primitives.length ; primitiveIndex ++) {
            if (primitives[primitiveIndex].text === modifiedCustomObject) {
                primitives.splice(primitiveIndex, 1);
                break;
            }
        }

        // Add new primitive
        if (comp.value !== '') {
            const primitive = {
                text: comp.value,
                value: comp.value
            };
            primitives.push(primitive);
        }

        this.setState({customObjects: customObjects});
        this.setState({primitives: primitives});
    };

    newCollection = (event, comp) => {
        let { collections } = this.state;

        let collection = {
            name: '',
            fields: [{
                name: '_id',
                type: 'ID',
                array: false
            }]
        };

        collections.push(collection);

        this.setState({collection: collections});
    };

    newObject = (event, comp) => {
        let { customObjects } = this.state;

        let object = {
            name: '',
            fields: [{
                name: '',
                type: 'String',
                array: false
            }]
        };
        customObjects.push(object);

        this.setState({customObjects: customObjects});
    };

    removeCollection = (event, comp) => {
        let { collections } = this.state;

        collections.splice(comp.collectionid, 1);

        this.setState({collection: collections});
    };

    removeObject = (event, comp) => {
        let { customObjects } = this.state;
        const removedCustomObject = customObjects[comp.customobjectid].name;

        customObjects.splice(comp.customobjectid, 1);

        // Remove object from the primitives dropdown
        let { primitives } = this.state;
        for (let primitiveIndex = 0 ; primitiveIndex < primitives.length ; primitiveIndex ++) {
            if (primitives[primitiveIndex].text === removedCustomObject) {
                primitives.splice(primitiveIndex, 1);
                break;
            }
        }

        this.setState({customObjects: customObjects});
        this.setState({primitives: primitives});
    };

    handleChange = (event) => {
        this.setState({ [event.target.name]: event.target.value });
    };

    editSchema = async () => {
        this.setState({loading: true});

        let schema = {
            Query: {}
        };

        const { collections } = this.state;
        const { customObjects } = this.state;

        for (let collectionIndex = 0 ; collectionIndex < collections.length ; collectionIndex ++) {
            const collection = collections[collectionIndex];

            // Ignore collections without a name
            if (collection.name !== '') {
                let collectionSchema = {};
                for (let fieldIndex = 0 ; fieldIndex < collection.fields.length ; fieldIndex ++) {
                    const field = collection.fields[fieldIndex];

                    // Ignore fields without a name or type
                    if (field.name !== '' && field.type !== '') {
                        if (field.array === true) {
                            collectionSchema[field.name] = '[' + field.type + ']';
                        }
                        else {
                            collectionSchema[field.name] = field.type;
                        }
                    }
                }

                let collectionName = utils.toProperCase(collection.name);
                schema.Query[collection.name] = '[' + collectionName + '_Documents' + ']';
                schema[collectionName + '_Documents'] = collectionSchema;
            }
        }

        for (let customObjectIndex = 0 ; customObjectIndex < customObjects.length ; customObjectIndex ++) {
            const customObject = customObjects[customObjectIndex];

            // Ignore objects without a name
            if (customObject.name !== '') {
                let customObjectSchema = {};
                for (let fieldIndex = 0 ; fieldIndex < customObject.fields.length ; fieldIndex ++) {
                    const field = customObject.fields[fieldIndex];

                    // Ignore fields without a name or type
                    if (field.name !== '' && field.type !== '') {
                        if (field.array === true) {
                            customObjectSchema[field.name] = '[' + field.type + ']';
                        }
                        else {
                            customObjectSchema[field.name] = field.type;
                        }
                    }
                }

                let customObjectName = utils.toProperCase(customObject.name);
                schema[customObjectName] = customObjectSchema;
            }
        }

        const schemaJSON = JSON.stringify({
            schema: schema
        });

        const res = await db.editSchema(this.props.username, this.props.instance, this.props.database, schemaJSON);

        this.setState({collections: []});
        this.setState({customObjects: []});
        this.setState({
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
            }]
        });
        this.setState({loading: false});
        this.props.closeEditSchema();
    };

    render() {
        const { database } = this.props;
        const { open } = this.props;
        const { collections } = this.state;
        const { customObjects } = this.state;

        const collectionList = collections.map((collection, collectionIndex) => (
            <div>
                <Input
                    label = 'Collection Name'
                    attached = 'left'
                    collectionid = {collectionIndex}
                    value = {collection.name}
                    error = {this.state.collections[collectionIndex].name === ''}
                    onChange = {this.handleCollectionChange}
                />

                <Button basic attached = 'right'
                    collectionid = {collectionIndex}
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
                                        collectionid = {collectionIndex}
                                        fieldid = {fieldIndex}
                                        name = 'collection-name'
                                        placeholder = 'Field Name'
                                        value = {field.name}
                                        error = {this.state.collections[collectionIndex].fields[fieldIndex].name === ''}
                                        onChange = {this.handleFieldChange}
                                    />
                                </Table.Cell>
                                <Table.Cell width = '5'>
                                    <Dropdown selection
                                        collectionid = {collectionIndex}
                                        fieldid = {fieldIndex}
                                        name = 'collection-field'
                                        options = {this.state.primitives}
                                        value = {this.state.collections[collectionIndex].fields[fieldIndex].type}
                                        onChange = {this.handleFieldChange}
                                    />
                                </Table.Cell>
                                <Table.Cell>
                                    <Checkbox
                                        collectionid = {collectionIndex}
                                        fieldid = {fieldIndex}
                                        name = 'collection-array'
                                        checked = {this.state.collections[collectionIndex].fields[fieldIndex].array}
                                        onChange = {this.handleFieldChange}
                                    />
                                </Table.Cell>
                                <Table.Cell collapsing>
                                    <Button basic
                                        collectionid = {collectionIndex}
                                        fieldid = {fieldIndex}
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
                                    collectionid = {collectionIndex}
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

        const objectsList = customObjects.map((customObject, customObjectIndex) => (
            <div>
                <Input
                    label = 'Object Name'
                    attached = 'left'
                    customobjectid = {customObjectIndex}
                    value = {customObject.name}
                    error = {this.state.customObjects[customObjectIndex].name === ''}
                    onChange = {this.handleObjectChange}
                />

                <Button basic attached = 'right'
                    customobjectid = {customObjectIndex}
                    icon = 'remove'
                    color = 'red'
                    onClick = {this.removeObject}
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
                        customObject.fields.map((field, fieldIndex) => (
                            <Table.Row>
                                <Table.Cell width = '5'>
                                    <Input fluid
                                        customobjectid = {customObjectIndex}
                                        fieldid = {fieldIndex}
                                        name = 'object-name'
                                        placeholder = 'Field Name'
                                        value = {field.name}
                                        error = {this.state.customObjects[customObjectIndex].fields[fieldIndex].name === ''}
                                        onChange = {this.handleObjectFieldChange}
                                    />
                                </Table.Cell>
                                <Table.Cell width = '5'>
                                    <Dropdown selection
                                        customobjectid = {customObjectIndex}
                                        fieldid = {fieldIndex}
                                        name = 'object-field'
                                        options = {this.state.primitives}
                                        value = {this.state.customObjects[customObjectIndex].fields[fieldIndex].type}
                                        onChange = {this.handleObjectFieldChange}
                                    />
                                </Table.Cell>
                                <Table.Cell>
                                    <Checkbox
                                        customobjectid = {customObjectIndex}
                                        fieldid = {fieldIndex}
                                        name = 'object-array'
                                        checked = {this.state.customObjects[customObjectIndex].fields[fieldIndex].array}
                                        onChange = {this.handleObjectFieldChange}
                                    />
                                </Table.Cell>
                                <Table.Cell collapsing>
                                    <Button basic
                                        customobjectid = {customObjectIndex}
                                        fieldid = {fieldIndex}
                                        icon = 'remove'
                                        color = 'red'
                                        size = 'mini'
                                        onClick = {this.removeObjectField}
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
                                    customobjectid = {customObjectIndex}
                                    color = 'green'
                                    labelPosition = 'left'
                                    onClick = {this.newObjectField} >
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
            menuItem: 'Custom Object Types', pane: (
                <Tab.Pane key = 'custom'>
                    { objectsList }

                    <Button icon fluid
                        color = 'green'
                        labelPosition = 'left'
                        onClick = {this.newObject} >
                            <Icon name = 'plus' />
                            New Object Type
                    </Button>
                </Tab.Pane>
            )
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
                          <Dimmer active = { this.state.loading } >
                              <Loader content = 'Loading' />
                          </Dimmer>
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
