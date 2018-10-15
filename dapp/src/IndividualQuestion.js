import React, { Fragment } from "react";
import SpecifyUser from './SpecifyUser';

class IndividualQuestion extends React.Component {
  state = { qKey: null, value: '', showSpecifyAnswer: false };

  componentDidMount() {
    const { contract } = this._getContractProps();
    const qKey = contract.methods.getQuestion.cacheCall(this.props.questionId);
    this.setState({ qKey });
    //Drizzle polling doesn't seem to work for events, add them manually...
    contract.events.QuestionUpdated({}, (err, event) => {
      //TODO should filter this so it only makes a call if it was w. this ID
      contract.methods.getQuestion.cacheCall(this.props.questionId);
    });
  }

  onChange = (e) => {
    this.setState({ value: e.target.value });
  }

  _getContractProps() {
    const contract = this.props.drizzle.contracts.QAOracle;
    const store = this.props.drizzleState.contracts.QAOracle;
    return { contract, store };
  }

  _answerQuestion = () => {
    const { contract } = this._getContractProps();
    contract.methods.answerQuestion.cacheSend(this.props.questionId, this.state.value)
  }

  _showAnswerInput = () => {
    console.log("wtf ", this.props.drizzleState.accounts[0])
    if (this.props.drizzleState.accounts[0] === this.props.askerAddress) return null;
    return (
      <Fragment>
        <input type="text" onChange={this.onChange} value={this.state.value} />
        <button className="btn btn-primary" onClick={this._answerQuestion}>Answer this question</button>
      </Fragment>
    );
  }

  _renderAnswer = (answer) => {
    if (!answer) return null;
    return (
      <div className="answer">
        {answer}
      </div>
    );
  }

  _renderSpecifyAnswer() {
    if (this.props.drizzleState.accounts[0] !== this.props.askerAddress) return null;
    return (
      <button className="btn btn-secondary" onClick={() =>
        this.setState({ showSpecifyAnswer: !this.state.showSpecifyAnswer })
      }>
        Request a response from a specific user
      </button>
    );
  }

  _showSpecifyInput() {
    if (!this.state.showSpecifyAnswer) return null;
    return (
      <SpecifyUser
        {...this.props}
      />
    );
  }

  render() {
    const { store } = this._getContractProps();
    let answer = store.getQuestion[this.state.qKey];
    answer = answer && answer.value && answer.value[3];

    return (
      <div className="individual-question">
        {this.props.questionText}
        {this._renderAnswer(answer)}
        {!answer && this._showAnswerInput()}
        {this._renderSpecifyAnswer()}
        {this._showSpecifyInput()}
      </div>
    );
  }
}

export default IndividualQuestion;
