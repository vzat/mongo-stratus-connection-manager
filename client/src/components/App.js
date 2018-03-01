import React, { Component } from 'react';

import './css/App.css';

import ServerList from './ServersList';

import { Button } from 'semantic-ui-react';

class App extends Component {
  render() {
    return (
      <div className="App">
            <ServerList/>
      </div>
    );
  }
}

export default App;
