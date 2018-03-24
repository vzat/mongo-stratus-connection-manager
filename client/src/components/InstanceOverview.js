import React, { Component } from 'react';

import './css/InstanceOverview.css';

import { Segment, Table, Grid, Statistic, Divider } from 'semantic-ui-react';

import InstanceOverviewSingleNode from './InstanceOverviewSingleNode';

class InstanceOverview extends Component {
    render() {
        const { instanceInfo } = this.props;



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

            <Divider fitted />

            {
                instanceInfo.type === 'Single Node' &&
                <InstanceOverviewSingleNode />
            }

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
