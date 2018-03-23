import React, { Component } from 'react';

import './css/InstanceOverview.css';

import { Segment, Table, Grid } from 'semantic-ui-react';

class InstanceOverview extends Component {
    render() {
        return (
          <div className="InstanceOverview">
              <Table celled singleLine>
                  <Table.Header>
                      <Table.Row>
                          <Table.HeaderCell colSpan = '3'>
                              lee2-instance1.mongostratus.me:27017
                          </Table.HeaderCell>
                      </Table.Row>
                  </Table.Header>
                  <Table.Body>
                      <Table.Row>
                          <Table.Cell>
                              Virtual CPU
                          </Table.Cell>
                          <Table.Cell>
                              0.2
                          </Table.Cell>
                      </Table.Row>
                      <Table.Row>
                          <Table.Cell>
                              Memory (GB)
                          </Table.Cell>
                          <Table.Cell>
                              0.60
                          </Table.Cell>
                      </Table.Row>
                      <Table.Row>
                          <Table.Cell>
                              Disk Space (GB)
                          </Table.Cell>
                          <Table.Cell>
                              10
                          </Table.Cell>
                      </Table.Row>
                      <Table.Row>
                          <Table.Cell>
                              Region
                          </Table.Cell>
                          <Table.Cell>
                              N.Virginia
                          </Table.Cell>
                      </Table.Row>
                      <Table.Row>
                          <Table.Cell>
                              IP Address
                          </Table.Cell>
                          <Table.Cell>
                              78.106.68.1
                          </Table.Cell>
                      </Table.Row>
                  </Table.Body>
              </Table>
          </div>
        );
    }
}

export default InstanceOverview;

// <Segment.Group stackable doubling>
//     <Segment raised vertical>
//         lee2-instance1.mongostratus.me:27017
//         <Grid celled container>
//             <Grid.Row>
//                 <Grid.Column>
//                     Virtual CPU
//                 </Grid.Column>
//                 <Grid.Column>
//                     0.2
//                 </Grid.Column>
//             </Grid.Row>
//         </Grid>
//     </Segment>
// </Segment.Group>
