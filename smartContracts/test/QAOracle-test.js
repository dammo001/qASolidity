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
  const res = await _getEvent(contract.QuestionUpdated());
  return res.args.qId.toString();
}

/*
* GetQuestion returns in the format

* _uint2str(qId),
* questions[qId].qAddress,
* questions[qId].qText,
* questions[qId].answer,
* questions[qId].requestedResponder
*/

const _id = (q) => q[0];
const _qAddr = (q) => q[1];
const _qText = (q) => q[2];
const _answer = (q) => q[3];
const _req = (q) => q[4];

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
    contract.mint(asker, 10);
  });

  it('should create a contract', async() => {
    contract.should.exist;
  });

  describe('asking a question', () => {
    it('should add a question and emit the correct data', async() => {
      const check = await contract.askQuestion(q1, { from: asker });
      await helpers.assertEvent(
        contract.QuestionUpdated(),
        { askerAddress: asker, qId: '1', qText: q1 },
      );

      const res = await contract.getQuestion('1');
      _qText(res).should.equal(q1);
    });

    it('should increment a question ID when multiple questions are added', async() => {
      await contract.askQuestion(q1, { from: asker });
      await helpers.assertEvent(
        contract.QuestionUpdated(),
        { askerAddress: asker, qId: '1', qText: q1  },
      );

      await contract.askQuestion(q2, { from: asker });
      await helpers.assertEvent(
        contract.QuestionUpdated(),
        { askerAddress: asker, qId: '2', qText: q2 },
      );
    });

    it('should return an empty string if there is no question for that questionId', async() => {
      await contract.askQuestion(q1);
      const qId = await _getIdFromQuestionCreate(contract);
      const res = await contract.getQuestion('2');
      qId.should.not.equal('2');
      _qText(res).should.not.equal(q1);
      _qText(res).should.equal('');
    });

    it('should return the correct total number of questions', async() => {
      let totalQuestions;
      totalQuestions = await contract.getQuestionsTotal();
      totalQuestions.should.equal('0');
      await contract.askQuestion(q1, { from: asker });
      await helpers.assertEvent(
        contract.QuestionUpdated(),
        { askerAddress: asker, qId: '1', qText: q1  },
      );

      totalQuestions = await contract.getQuestionsTotal();
      totalQuestions.should.equal('1');

      await contract.askQuestion(q2, { from: asker });
      await helpers.assertEvent(
        contract.QuestionUpdated(),
        { askerAddress: asker, qId: '2', qText: q2 },
      );

      totalQuestions = await contract.getQuestionsTotal();
      totalQuestions.should.equal('2');
    });

    it("should not allow a question to be added if the asker does not have tokens", async() => {
      await helpers.expectThrow(contract.askQuestion(q1, { from: qAddress2 }));
    });

    it('should create an allowance of 1 for the owner from the asker', async() => {
      const initialAllowance = await contract.allowance(asker, owner);
      initialAllowance.toString().should.equal('0');
      const check = await contract.askQuestion(q1, { from: asker });
      await helpers.assertEvent(
        contract.QuestionUpdated(),
        { askerAddress: asker, qId: '1', qText: q1 },
      );
      const finalAllowance = await contract.allowance(asker, owner);
      finalAllowance.toString().should.equal('1');
    });

  });

  describe('answering a question', () => {
    it('should allow an asked question to be answered', async() => {
      await contract.askQuestion(q1, { from: asker });
      const qId = await _getIdFromQuestionCreate(contract);
      await contract.answerQuestion(qId, a1);
      const res = await contract.getQuestion(qId);
      _answer(res).should.equal(a1);
    });

    it('should emit an "answerQuestion" event when a question is answered', async() => {
      await contract.askQuestion(q1, { from: asker });
      const qId = await _getIdFromQuestionCreate(contract);
      await contract.answerQuestion(qId, a1);
      await helpers.assertEvent(
        contract.QuestionUpdated(),
        { qId: qId, answer: a1},
      );
    });

    it('should not allow a question to be answered with a blank response', async() => {
      await contract.askQuestion(q1, { from: asker });
      const qId = await _getIdFromQuestionCreate(contract);
      await contract.assignQuestion(qId, qAddress2, { from: asker });
      await helpers.expectThrow(contract.answerQuestion(qId, '', { from: qAddress2 }));
    });

    it('should increase the answerer"s token count by 1', async() => {
      const startingAmount = await contract.getAcctBalance(qAddress2);
      await contract.askQuestion(q1, { from: asker });
      const qId = await _getIdFromQuestionCreate(contract);
      await contract.answerQuestion(qId, a1, { from: qAddress2 });
      const finalAmount = await contract.getAcctBalance(qAddress2);
      (Number(finalAmount)-Number(startingAmount)).should.equal(1);
    });
  });

  describe('assigning a question', () => {
    it('should only allow the question asker to set a "requestedResponder"', async() => {
      await contract.askQuestion(q1, { from: asker });
      const qId = await _getIdFromQuestionCreate(contract);
      await helpers.expectThrow(contract.assignQuestion(qId, qAddress2));
    });

    it('should allow a "requestedResponder" to be set', async() => {
      await contract.askQuestion(q1, { from: asker });
      const qId = await _getIdFromQuestionCreate(contract);
      await contract.assignQuestion(qId, qAddress2, { from: asker });
      const res = await contract.getQuestion(qId);
      _req(res).should.equal(qAddress2);
    });

    it('should emit the correct event when a "requestedResponder" is assigned', async() => {
      await contract.askQuestion(q1, { from: asker });
      const qId = await _getIdFromQuestionCreate(contract);
      await contract.assignQuestion(qId, qAddress2, { from: asker });
      await helpers.assertEvent(
        contract.QuestionUpdated(),
        { qId: qId, requestedResponder: qAddress2},
      );
    });

    it('should not allow someone other than a requestedResponder to answer a question if it"s set', async() => {
      await contract.askQuestion(q1, { from: asker });
      const qId = await _getIdFromQuestionCreate(contract);
      await contract.assignQuestion(qId, qAddress2, { from: asker });
      await helpers.expectThrow(contract.answerQuestion(qId, a1, { from: aAddress1 }));
    });

    it('should allow a requestedResponder to answer a question if it"s set', async() => {
      await contract.askQuestion(q1, { from: asker });
      const qId = await _getIdFromQuestionCreate(contract);
      await contract.assignQuestion(qId, qAddress2, { from: asker });
      await contract.answerQuestion(qId, a1, { from: qAddress2 });
      const res = await contract.getQuestion(qId);
      _answer(res).should.equal(a1);
    });
  });

});
