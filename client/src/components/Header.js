import React, { Component } from 'react';

import './css/Header.css';

import { Segment, Image, Dropdown, Loader, Transition } from 'semantic-ui-react';

import logo from './resources/images/MongoStratusLogo.svg';

class ServerList extends Component {
  state = {
      notificationText: 'Your instance is being created...'
  };

  handleNotification = (visible, text) => {
      this.setState({
          notification: visible,
          notificationText: text
      });
  };

  componentDidMount = () => {
      this.checkDB();
  };

  checkDB = async () => {
      if (this.props.notification) {
          const username = this.props.username;
          const database = this.props.db;

          console.log(username, database);

          const res = await fetch('/api/v1/internal/exists/' + username + '/' + database, {
              method: 'GET',
              headers: {
                  'Content-Type': 'application/json'
              }
          });

          const json = await res.json();

          if (json.ok && json.ok === 1) {
              this.props.setCreatingDB(false);
          }
      }

      setTimeout(this.checkDB, 10000);
  };

  render() {
      const username = this.props.username;
      const { notificationText } = this.state;
      const { notification } = this.props;

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
