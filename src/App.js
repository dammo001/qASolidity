import React, { Component } from 'react';
import './App.css';
import Questions from "./Questions";
import AskQuestion from './AskQuestion';
import Tokens from './Tokens';

class App extends Component {
  state = { loading: true, drizzleState: null };

  componentDidMount() {
    const { drizzle } = this.props;

     // subscribe to changes in the store
    this.unsubscribe = drizzle.store.subscribe(() => {

       // every time the store updates, grab the state from drizzle
      const drizzleState = drizzle.store.getState();

       // check to see if it's ready, if so, update local component state
      if (drizzleState.drizzleStatus.initialized) {
        this.setState({ loading: false, drizzleState });
      }
    });
  }

  compomentWillUnmount() {
    this.unsubscribe();
  }

  render() {
    if (this.state.loading) return "Loading App...";
    return (
      <div className="App">
        <Tokens
          drizzle={this.props.drizzle}
          drizzleState={this.state.drizzleState}
        />
        <Questions
          drizzle={this.props.drizzle}
          drizzleState={this.state.drizzleState}
        />
        <AskQuestion
          drizzle={this.props.drizzle}
          drizzleState={this.state.drizzleState}
        />
      </div>
    );
  }
}

export default App;
