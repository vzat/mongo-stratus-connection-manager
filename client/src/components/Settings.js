import React, { Component } from 'react';

import './css/Settings.css'

import { Button, Confirm, Icon } from 'semantic-ui-react';

import db from './utils/db';

class Settings extends Component {
    state = {
        deleteInstanceConfirm: false
    }

    deleteInstance = async () => {
        const res = await db.deleteInstance(this.props.username, this.props.instance);

        if (res.ok && res.ok === 1) {
            window.location = '/';
        }
    };

    showDeleteInstanceConfirm = () => {
        this.setState({deleteInstanceConfirm: true});
    }

    hideDeleteInstanceConfirm = () => {
        this.setState({deleteInstanceConfirm: false});
    }

    render() {
        return (
          <div className="Settings">
              <Button icon color = 'red' labelPosition = 'left' onClick = { this.showDeleteInstanceConfirm }>
                  <Icon name = 'trash' />
                  Delete Instance
              </Button>
              <Confirm
                  open = {this.state.deleteInstanceConfirm}
                  onCancel = {this.hideDeleteInstanceConfirm}
                  onConfirm = {this.deleteInstance}
                  header = 'Are you sure you want to delete this instance?'
                  content = 'All data will be permanently deleted. You cannot undo this action.'
                  confirmButton = 'Delete Instance'
                  size = 'fullscreen'
                  style = {{
                      marginTop: 0,
                      maxWidth: 800
                  }}
              />
          </div>
        );
    }
}

export default Settings;
