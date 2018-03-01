import React, { Component } from 'react';

import './css/ServerList.css';

import { Card, Icon, Segment, Image } from 'semantic-ui-react';

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
          <Card.Group doubling stackable itemsPerRow = {5} maxWidth = {10} items = {items} />
          <Segment.Group items = {items} />
      </div>
    );
  }
}

export default ServerList;
