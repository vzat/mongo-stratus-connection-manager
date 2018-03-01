import React, { Component } from 'react';
import './css/App.css';
import { Button } from 'semantic-ui-react';

class App extends Component {
  render() {
    return (
      <div className="App">
            <h1> Connection Manager </h1>
            <Button color = 'green'> Login </Button>
      </div>
    );
  }
}

export default App;
