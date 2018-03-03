import React, { Component } from 'react';

import './css/ServerList.css';

import { Card, Image, Divider, Button } from 'semantic-ui-react';

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
            color: 'green',
            href: '#1'
        },
        {
            image: <Image src = {azure} />,
            header: 'ServerName',
            description: 'Single Node',
            color: 'green',
            href: '#2'
        },
        {
            image: <Image src = {aws} />,
            header: 'ServerName',
            description: 'Single Node',
            color: 'green',
            href: '#3'
        },
        {
            image: <Image src = {gcp} />,
            header: 'ServerName',
            description: 'Single Node',
            color: 'green',
            href: '#1'
        },
        {
            image: <Image src = {azure} />,
            header: 'ServerName',
            description: 'Single Node',
            color: 'green',
            href: '#2'
        },
        {
            image: <Image src = {aws} />,
            header: 'ServerName',
            description: 'Single Node',
            color: 'green',
            href: '#3'
        },
        {
            image: <Image src = {aws} />,
            header: 'ServerName',
            description: 'Single Node',
            color: 'green',
            href: '#3'
        }
    ];

    return (
      <div className = "ServerList">
          <Button color = "green" onClick = {() => this.props.setModalState(true) }> New Server </Button>
          <Divider hidden />

          <Card.Group doubling stackable items = {items} />
      </div>
    );
  }
}

export default ServerList;
