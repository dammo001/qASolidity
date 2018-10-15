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
      <div className="form-group ask-question">
        <label className="col-sm-2 control-label">Ask a question!</label>
        <input className="form-control" id="ask-question" type="text" onChange={this.onChange} value={this.state.value}/>
        <button className="btn btn-success" onClick={this.handleClick}>Submit your question</button>
        <div>{this.getTxStatus()}</div>
      </div>
    );
  }
}

export default AskQuestion;
