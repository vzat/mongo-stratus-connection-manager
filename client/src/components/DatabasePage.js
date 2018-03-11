import React, { Component } from 'react';

import Header from './Header'
import DatabaseList from './DatabaseList'
import InstanceStatus from './InstanceStatus'

import { Grid, Rail, Segment } from 'semantic-ui-react';

class DatabasePage extends Component {

    render() {
        return (
          <div className="DatabasePage">
              <Header
                  username = {this.props.username}
                  notification = {this.props.creatingDB}
                  db = {this.props.db}
                  setCreatingDB = {this.props.setCreatingDB}
              />
              <Grid>
                  <Grid.Row>
                      <Grid.Column width = '12'>
                          <DatabaseList
                              instance = {this.props.match.params.database}
                          />
                      </Grid.Column>
                      <Grid.Column width = '4'>
                          <InstanceStatus />
                      </Grid.Column>
                  </Grid.Row>
              </Grid>
          </div>
        );
    }
}

export default DatabasePage;