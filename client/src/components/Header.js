import React, { Component } from 'react';

import './css/Header.css';

import { Segment, Image, Dropdown, Loader, Transition } from 'semantic-ui-react';

import logo from './resources/images/MongoStratusLogo.svg';

class ServerList extends Component {
  state = {
      username: 'jsmith',
      notification: false,
      notificationText: 'Your server is being created...'
  };

  handleNotification = (visible, text) => {
      this.setState({
          notification: visible,
          notificationText: text
      });
  };

  render() {
      const username = this.state.username;
      const { notification, notificationText } = this.state;

      return (
        <div className = "Header">
            <Segment attached = 'top'>
                <Image
                    src = {logo}
                    size = 'small'
                    href = '/'
                    verticalAlign = 'middle'
                />

                <div className = 'username-dropdown'>
                    <Dropdown text = {username} direction = 'left' inline compact>
                        <Dropdown.Menu>
                            <Dropdown.Item text = 'Account Details' />
                            <Dropdown.Item text = 'Logout' />
                        </Dropdown.Menu>
                    </Dropdown>
                </div>
            </Segment>
            <Transition.Group animation = 'fade down' duration = {500} >
                { notification &&
                    <Segment attached = 'bottom' color = 'green' inverted textAlign = 'center' size = 'small' >
                        <Loader active inline indeterminate inverted size = 'small' />
                        <div className = 'notification-text'>
                            { notificationText }
                        </div>
                    </Segment>
                }
            </Transition.Group>
        </div>
      );
    }
}

export default ServerList;
