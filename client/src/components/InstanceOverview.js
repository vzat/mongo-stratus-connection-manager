import React, { Component } from 'react';

import './css/InstanceOverview.css';

import { Segment, Table, Grid, Statistic, Divider } from 'semantic-ui-react';

class InstanceOverview extends Component {
    render() {
        const { instanceInfo } = this.props;

        const table = (
            <div className = 'server-table'>
                <Table celled singleLine collapsing className = 'server-table'>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell colSpan = '2'>
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
                                N. Virginia
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

        return (
          <div className="InstanceOverview">
              <Grid columns = 'equal' stackable doubling centered padded>
                  <Grid.Row>
                      <Grid.Column verticalAlign = 'middle'>
                          <Statistic size = 'mini'>
                              <Statistic.Label> Database Type </Statistic.Label>
                              <Statistic.Value> { instanceInfo.type } </Statistic.Value>
                          </Statistic>
                      </Grid.Column>

                      <Grid.Column verticalAlign = 'middle'>
                          <Statistic size = 'mini'>
                              <Statistic.Label> Cloud Platform </Statistic.Label>
                              <Statistic.Value> { instanceInfo.platform } </Statistic.Value>
                          </Statistic>
                    </Grid.Column>

                    <Grid.Column verticalAlign = 'middle'>
                        <Statistic size = 'mini'>
                            <Statistic.Label> MongoDB Version </Statistic.Label>
                            <Statistic.Value> { instanceInfo.version } </Statistic.Value>
                        </Statistic>
                    </Grid.Column>
                </Grid.Row>
            </Grid>

            <Divider />

            <div className = 'servers'>

                { table } { table } { table } { table } { table }

            </div>
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
