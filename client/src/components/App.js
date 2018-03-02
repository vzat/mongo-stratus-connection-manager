import React, { Component } from 'react';

import './css/App.css';

import Header from './Header';
import ServerList from './ServersList';

class App extends Component {
  render() {
    return (
      <div className="App">
            <Header />
            <ServerList />
      </div>
    );
  }
}

export default App;
