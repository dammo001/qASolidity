import React from "react";

class AskQuestion extends React.Component {
  state = { stackId: null, value: '', txStatus: ''};

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
    this.setState({ stackId });
  };

  getTxStatus = () => {
    // get the transaction states from the drizzle state
    const { transactions, transactionStack } = this.props.drizzleState;

    // get the transaction hash using our saved `stackId`
    const txHash = transactionStack[this.state.stackId];

    // if transaction hash does not exist, don't display anything
    if (!txHash) return null;
    // otherwise, return the transaction status
    return `Question add has status: ${transactions[txHash].status}`;
  };

  render() {
    return (
      <div className="Ask-question row">
        <h2>Ask a question:</h2>
        <label className="col-sm-12 control-label question-label">Get tokens first if you don't have any.</label>
        <input className="col sm-9" id="ask-question" type="text" onChange={this.onChange} value={this.state.value}/>
        <button className="btn btn-success" onClick={this.handleClick}>Submit your question</button>
        <div>{this.getTxStatus()}</div>
      </div>
    );
  }
}

export default AskQuestion;
