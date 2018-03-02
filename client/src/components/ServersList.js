import React, { Component } from 'react';

import './css/ServerList.css';

import { Grid, Card, Icon, Segment, Image } from 'semantic-ui-react';

import logo from './resources/images/MongoStratusLogo.svg';
import gcp from './resources/images/gcp.svg';
import azure from './resources/images/azure.svg';
import aws from './resources/images/aws.svg';

class ServerList extends Component {
  render() {
    const items = [
        {
            image: <Image src = {gcp} />,
            header: 'ServerName',
            description: 'Single Node',
            color: 'green'
        },
        {
            image: <Image src = {azure} />,
            header: 'ServerName',
            description: 'Single Node',
            color: 'green'
        },
        {
            image: <Image src = {aws} />,
            header: 'ServerName',
            description: 'Single Node',
            color: 'green'
        },
        {
            header: 'ServerName',
            description: 'Single Node',
            color: 'green'
        },
        {
            header: 'ServerName',
            description: 'Single Node',
            color: 'green'
        },
        {
            header: 'ServerName',
            description: 'Single Node',
            color: 'green'
        },
        {
            header: 'ServerName',
            description: 'Single Node',
            color: 'green'
        },
        {
            header: 'ServerName',
            description: 'Single Node',
        },
        {
            image: <Icon name = 'plus' size = 'massive' color = 'grey' />,
            href: '#asd'
        }
    ];

    const items2 = [
      "asdadas",
      "dsadsadas"
    ];

    return (
      <div className = "ServerList">
          <Image src = {logo} />
          <Grid centered>
              <Grid.Column>
                  <Card.Group doubling stackable itemsPerRow = {5} items = {items} />
              </Grid.Column>
          </Grid>
      </div>
    );
  }
}

export default ServerList;
