import React from "react";

class SetString extends React.Component {
  state = { stackId: null, value: '' };

  handleKeyDown = e => {
    // if the enter key is pressed, set the value with the string
    if (e.keyCode === 13) {
      this.setValue(this.state.value);
    }
  };

  handleClick = () => {
    this.setValue(this.state.value);
  }

  onChange = e => {
    this.setState({ value: e.target.value });
  }

  setValue = value => {
    const { drizzle, drizzleState } = this.props;
    const contract = drizzle.contracts.QAOracle;

    // let drizzle know we want to call the `set` method with `value`
    const stackId = contract.methods.askQuestion.cacheSend(value, {
      from: drizzleState.accounts[0]
    });

    // save the `stackId` for later reference
    this.setState({ stackId, value: '' });
  };

  getTxStatus = () => {
    // get the transaction states from the drizzle state
    const { transactions, transactionStack } = this.props.drizzleState;

    // get the transaction hash using our saved `stackId`
    const txHash = transactionStack[this.state.stackId];

    // if transaction hash does not exist, don't display anything
    if (!txHash) return null;

    // otherwise, return the transaction status
    return `Question add was a ${transactions[txHash].status}`;
  };

  render() {
    return (
      <div>
        <label for="ask-question">Ask a question!</label>
        <input id="ask-question" type="text" onChange={this.onChange} onKeyDown={this.handleKeyDown} value={this.state.value}/>
        <button onClick={this.handleClick} >Submit your question</button>
        <div>{this.getTxStatus()}</div>
      </div>
    );
  }
}

export default SetString;
