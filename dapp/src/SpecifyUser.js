import React, { Fragment } from "react";

const NULL_VALUE = '0x0000000000000000000000000000000000000000';

class SpecifyUser extends React.Component {
  state = { stackId: null, value: '', txStatus: ''};

  handleClick = () => {
    const { contract } = this._getContractProps();
    contract.methods.assignQuestion.cacheSend(this.props.questionId, this.state.value);
  }

  onChange = e => {
    this.setState({ value: e.target.value });
  }

  _getContractProps() {
    const contract = this.props.drizzle.contracts.QAOracle;
    const store = this.props.drizzleState.contracts.QAOracle;
    return { contract, store };
  }

  render() {
    if (this.props.requestedResponder && this.props.requestedResponder !== NULL_VALUE) {
      return (
        <div className="assigned">
          Your question has been assigned to {this.props.requestedResponder}.
        </div>
      )
    }
    return (
      <Fragment>
        <input  type="text" onChange={this.onChange} value={this.state.value} />
        <button className="btn btn-success" onClick={this.handleClick}>
          Request response
        </button>
      </Fragment>

    );
  }
}

export default SpecifyUser;
