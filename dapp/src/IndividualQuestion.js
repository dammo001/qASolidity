import React, { Fragment } from "react";

class IndividualQuestion extends React.Component {
  state = { qKey: null, value: '' };

  componentDidMount() {
    const { contract } = this._getContractProps();
    const qKey = contract.methods.getQuestionAnswer.cacheCall(this.props.questionId);
    this.setState({ qKey });
    //Drizzle polling doesn't seem to work for events, add them manually...
    contract.events.QuestionAnswered({}, (err, event) => {
      contract.methods.getQuestionAnswer.cacheCall(this.props.questionId);
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

  render() {
    const { store } = this._getContractProps();
    let answer = store.getQuestionAnswer[this.state.qKey];
    answer = answer && answer.value;

    return (
      <div className="individual-question">
        {this.props.questionText}
        {this._renderAnswer(answer)}
        {!answer && this._showAnswerInput()}
      </div>
    );
  }
}

export default IndividualQuestion;
