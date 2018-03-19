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
              <Grid stackable>
                  <Grid.Row reversed = 'computer tablet'>
                      <Grid.Column width = '5'>
                          <InstanceStatus
                              username = {this.props.username}
                              instance = {this.props.match.params.database}
                          />
                      </Grid.Column>
                      <Grid.Column width = '11'>
                          <DatabaseList
                              instance = {this.props.match.params.database}
                          />
                      </Grid.Column>
                  </Grid.Row>
              </Grid>
          </div>
        );
    }
}

export default DatabasePage;
