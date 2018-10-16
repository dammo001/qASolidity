import React from "react";
import IndividualQuestion from './IndividualQuestion';

class Questions extends React.Component {
  state = { qKey: null, dataKeys: [], questions: null, updating: false };

  componentDidMount() {
    const { contract } = this._getContractProps();
    const qKey = contract.methods.getQuestionsTotal.cacheCall();
    this.setState({ qKey });
  }

  componentDidUpdate() {
    this._updateQuestions();
  }

  _getContractProps() {
    const contract = this.props.drizzle.contracts.QAOracle;
    const store = this.props.drizzleState.contracts.QAOracle;
    return { contract, store };
  }

  //TODO clean this up. The dynamic contract call creates a weird loop. Probably
  //needs to just not get this data from the chain.
  _updateQuestions () {
    if (this.state.updating) return;
    const { contract, store } = this._getContractProps();
    let changed = false;
    let total = store.getQuestionsTotal[this.state.qKey];
    total = total && total.value && Number(total.value);
    contract.methods.getQuestionsTotal().call().then(res => {
      if ((res > total) || (total && !this.state.dataKeys.length)) {
        this.setState({ updating: true });
        changed = true;
        total = res;
        //not necessary, update store state w. result directly
        contract.methods.getQuestionsTotal.cacheCall();
      }
    }).then(() => {
      if (!changed) return;
      let dataKeys = [];

      //reload the whole thing in case one was updated
      for (let i = 1; i <= total; i++) {
        //each of these is going to cause a rerender... data should be pulled from
        //an oracle service w. cache/rdbms for more efficient data retrieval. Even
        //if I batch the props update to a single render, it'll still be a bunch of
        //separate calls since there's no good way to return objects from blockchain
        let nextKey = contract.methods.getQuestion.cacheCall(i);
        dataKeys.push(nextKey);
      }
      this.setState({ dataKeys, updating: false });
    });
  }

  _renderQuestions() {
    if (!this.state.dataKeys.length) return;
    const { store } = this._getContractProps();
    let questions = [];

    this.state.dataKeys.forEach(key => {
      let nextQuestion = store.getQuestion[key];
      nextQuestion && questions.push(nextQuestion);
    });

    return questions.map((question) => {
      let values = question.value;
      //question has form [questionId, askerAddress, questionText, questionAnswer, requestedResponder]
      return (
        <IndividualQuestion
          key={values[0]}
          askerAddress={values[1]}
          questionText={values[2]}
          answer={values[3]}
          requestedResponder={values[4]}
          questionId={values[0]}
          {...this.props}
        />
      );
    });
  }

  render() {
    const questions = this._renderQuestions();
    if (!questions || !questions.length) return null;
    return (
      <div className="Show-questions row">
        <h2>Asked Questions: </h2>
        <div className="disclaimer col-sm-12">note: you cannot answer questions that you asked or that were assigned to someone else</div>
        <div className="col-sm-12">
          {questions}
        </div>
      </div>
    );
  }
}

export default Questions;
