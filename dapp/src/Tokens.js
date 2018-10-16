import React from "react";

class Tokens extends React.Component {
  state = { totalsKey: null, dataKeys: [], questions: null, updating: false};

  componentDidMount() {
    const { contract } = this._getContractProps();
    const acctAddress = this.props.drizzleState.accounts[0];
    const totalsKey = contract.methods.getAcctBalance.cacheCall(acctAddress);
    this.setState({ totalsKey });
    contract.events.TokensUpdated({}, (err, event) => {
      contract.methods.getAcctBalance.cacheCall(acctAddress);
    });
  }

  _getContractProps() {
    const contract = this.props.drizzle.contracts.QAOracle;
    const store = this.props.drizzleState.contracts.QAOracle;
    return { contract, store };
  }

  _addTokensButton(currentTokens) {
    if (!currentTokens || currentTokens < 1) {
      return (
        <button className="btn btn-info" onClick={this._getTokens}>Get Tokens!</button>
      );
    }
  }

  _getTokens = () => {
    const { contract } = this._getContractProps();
    const acctAddress = this.props.drizzleState.accounts[0];
    contract.methods.mint.cacheSend(acctAddress, 10);
  }

  render() {
    const { store } = this._getContractProps();
    const currentTokens = store.getAcctBalance[this.state.totalsKey];

    return (
      <div className="row Tokens">
        <div className="col-md-12">You currently have <b>{currentTokens && currentTokens.value}</b> tokens with which to ask a question.</div>
        <div className="col-md-12">{currentTokens && this._addTokensButton(currentTokens.value)}</div>
      </div>
    );
  }
}

export default Tokens;
