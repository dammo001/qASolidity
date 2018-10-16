import React from "react";
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
    if (this.props.drizzleState.accounts[0] === this.props.askerAddress) return null;
    return (
      <div className="col-sm-12">
        <input className="col-sm-8" type="text" onChange={this.onChange} value={this.state.value} />
        <button className="col-sm-4 btn btn-primary response-button" onClick={this._answerQuestion}>Respond</button>
      </div>
    );
  }

  _renderAnswer = (answer) => {
    if (!answer) return null;
    return (
      <div className="answer">
        Answer: {answer}
      </div>
    );
  }

  _renderSpecifyAnswer() {
    if (this.props.drizzleState.accounts[0] !== this.props.askerAddress) return null;
    return (
      <button className="btn btn-secondary" onClick={() =>
        this.setState({ showSpecifyAnswer: !this.state.showSpecifyAnswer })
      }>
        Assign
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
    const parentClass = answer ? "answered" : "";

    return (
      <div className={`individual-question ${parentClass}`}>
        <div className="question">
          <span className="asked-question-text">{this.props.questionText}</span>
          <div className="buttons-holder">
            {!answer && this._showAnswerInput()}
            {this._renderSpecifyAnswer()}
          </div>
        </div>

        {this._renderAnswer(answer)}
        {this._showSpecifyInput()}
      </div>
    );
  }
}

export default IndividualQuestion;
