import React, { Component } from 'react';

import './css/Settings.css'

import { Button, Confirm, Icon, Header, Divider, Input, Popup, Container } from 'semantic-ui-react';

import db from './utils/db';

class Settings extends Component {
    state = {
        deleteInstanceConfirm: false,
        token: 'dsad5dsa546',
        tokenCopied: false
    }

    getToken = async (username) => {
        const res = await db.getToken(username);

        if (res.ok && res.ok === 1) {
            const token = res.data;

            this.setState({token});
        }
    };

    refreshToken = async (event, comp) => {
        if (this.props.username) {
            const res = await db.refreshToken(this.props.username);

            if (res.ok && res.ok === 1) {
                const token = res.data;

                this.setState({token});
            }
        }
    };

    componentDidMount = async () => {
        if (this.props.username) {
            await this.getToken(this.props.username);
        }
    };

    componentWillReceiveProps = async (nextProps) => {
        if (nextProps.username !== this.props.username) {
            await this.getToken(this.props.username);
        }
    };

    deleteInstance = async () => {
        const res = await db.deleteInstance(this.props.username, this.props.instance);

        if (res.ok && res.ok === 1) {
            window.location = '/';
        }
    };

    showDeleteInstanceConfirm = () => {
        this.setState({deleteInstanceConfirm: true});
    };

    hideDeleteInstanceConfirm = () => {
        this.setState({deleteInstanceConfirm: false});
    };

    copyToken = (event, comp) => {
        // Reference https://stackoverflow.com/questions/400212/how-do-i-copy-to-the-clipboard-in-javascript
        document.getElementById('token').select();
        const success = document.execCommand('copy');
        if (success) {
            this.setState({tokenCopied: true});
        }

        setTimeout(() => { this.setState({tokenCopied: false}) }, 1000);
    };

    selectToken = (event, comp) => {
        document.getElementById('token').select();
    };

    render() {
        return (
          <div className="Settings">
              <Container>
              <Header dividing> API </Header>

              <Input id = 'token' value = {this.state.token} label = 'Token' attached = 'left' onClick = {this.selectToken} style = {{width: '350px'}} readOnly />
              <Popup inverted trigger = { <Button icon = 'copy' attached = 'right' onClick = {this.copyToken} /> } >
                  { this.state.tokenCopied === true &&
                    <div> Copied to Clipboard </div>
                  }
                  { this.state.tokenCopied === false &&
                    <div> Copy Token </div>
                  }
              </Popup>

              <Divider hidden />

              <Button primary icon labelPosition = 'left' onClick = {this.refreshToken}>
                  <Icon name = 'refresh' />
                  Regenerate Token
              </Button>

              <Divider hidden />

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
                      marginTop: '40vh',
                      maxWidth: 800
                  }}
              />
              </Container>
          </div>
        );
    }
}

export default Settings;
