// artifacts & web3 are global variables, injected by Truffle.js
const BigNumber = web3.BigNumber;
const QAOracleContract = artifacts.require('QAOracle');
const QATokenContract = artifacts.require('QAToken');
const helpers = require('./helpers');

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

// TODO refactor this
const _getEvent = (event, timeout = 3000) => {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => {
      reject(new Error('Timeout while waiting for event'));
    }, timeout);

    event.watch((error, response) => {
      try {
        resolve(response);
      } finally {
        clearTimeout(t);
        event.stopWatching();
      }
    });
  });
}

const _getIdFromQuestionCreate = async(contract) => {
  const res = await _getEvent(contract.QuestionAdded());
  return res.args.qId.toString();
}

contract('QAOracle', (walletAddresses) => {
  const owner = walletAddresses[0];
  const asker = walletAddresses[1];
  const q1 = 'What is the meaning of life?';
  const a1 = '42';
  const qAddress2 = walletAddresses[2];
  const q2 = 'Is Facebook evil?';
  const aAddress1 = walletAddresses[3];

  let contract;

  beforeEach(async() => {
    contract = await QAOracleContract.new();
    contract.sendTokens(asker, 10);
  });

  it('should create a contract', async() => {
    contract.should.exist;
  });

  describe('asking a question', () => {
    it('should add a question and emit a question ID', async() => {
      const check = await contract.askQuestion(q1, { from: asker });
      await helpers.assertEvent(
        contract.QuestionAdded(),
        { askerAddress: asker, qId: '1', qText: q1 },
      );

      const res = await contract.getQuestionText('1');
      res.should.equal(q1);
    });

    it('should increment a question ID when multiple questions are added', async() => {
      await contract.askQuestion(q1, { from: asker });
      await helpers.assertEvent(
        contract.QuestionAdded(),
        { askerAddress: asker, qId: '1', qText: q1  },
      );

      await contract.askQuestion(q2, { from: asker });
      await helpers.assertEvent(
        contract.QuestionAdded(),
        { askerAddress: asker, qId: '2', qText: q2 },
      );
    });

    it("should not allow a question to be added if the asker does not have tokens", async() => {
      await helpers.expectThrow(contract.askQuestion(q1, { from: qAddress2 }));
    });

    it('should return an empty string if there is no question for that questionId', async() => {
      await contract.askQuestion(q1);
      const qId = await _getIdFromQuestionCreate(contract);
      const res = await contract.getQuestionText('2');
      qId.should.not.equal('2');
      res.should.not.equal(q1);
      res.should.equal('');
    });

    it('should return the correct total number of questions', async() => {
      let totalQuestions;
      totalQuestions = await contract.getQuestionsTotal();
      totalQuestions.toString().should.equal('0');
      await contract.askQuestion(q1, { from: asker });
      await helpers.assertEvent(
        contract.QuestionAdded(),
        { askerAddress: asker, qId: '1', qText: q1  },
      );

      totalQuestions = await contract.getQuestionsTotal();
      totalQuestions.toString().should.equal('1');

      await contract.askQuestion(q2, { from: asker });
      await helpers.assertEvent(
        contract.QuestionAdded(),
        { askerAddress: asker, qId: '2', qText: q2 },
      );

      totalQuestions = await contract.getQuestionsTotal();
      totalQuestions.toString().should.equal('2');
    });

  });

  describe('answering a question', () => {
    it('should allow an asked question to be answered', async() => {
      await contract.askQuestion(q1, { from: asker });
      const qId = await _getIdFromQuestionCreate(contract);
      await contract.answerQuestion(qId, aAddress1, a1);
      const res = await contract.getQuestionAnswer(qId);
      res.should.equal(a1);
    });

    it('should emit an "answerQuestion" event when a question is answered', async() => {
      await contract.askQuestion(q1, { from: asker });
      const qId = await _getIdFromQuestionCreate(contract);
      await contract.answerQuestion(qId, aAddress1, a1);
      await helpers.assertEvent(
        contract.QuestionAnswered(),
        { qId: qId, aText: a1},
      );
    });



    // it('should pay an answerer a bounty associated with the question', async() => {
    //   const bounty = web3.toWei(.005, 'ether');
    //   const initialBalance = web3.eth.getBalance(aAddress1);
    //   await contract.askQuestion(q1, { value: bounty });
    //   await contract.answerQuestion(asker, aAddress1, a1);
    //   const finalBalance = web3.eth.getBalance(aAddress1);
    //   const balanceDelta = (finalBalance - initialBalance).toString();
    //   balanceDelta.should.equal(bounty);
    // });
  });

});
