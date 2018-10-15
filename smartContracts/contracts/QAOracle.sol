pragma solidity ^0.4.24;

import './QAToken.sol';

//TODO seperate token logic into its own contract
contract QAOracle is QAToken {
  address public owner;
  uint256 private _questionId;
  mapping (uint256 => Question) public questions;

  event QuestionUpdated(
    uint qId,
    address askerAddress,
    string qText,
    string answer,
    address requestedResponder
  );

  struct Question {
    address qAddress;
    string qText;
    string answer;
    address requestedResponder;
  }

  constructor () public {
    owner = msg.sender;
    _questionId = 0;
  }

  modifier isOwner() {
    require(msg.sender == owner);
    _;
  }

  function askQuestion(string question) public payable {
    require(balanceOf(msg.sender) >= 1);
    require(approve(owner, 1));
    _questionId++;
    questions[_questionId] = Question(msg.sender, question, '', address(0));
    emit QuestionUpdated(
      _questionId,
      questions[_questionId].qAddress,
      questions[_questionId].qText,
      questions[_questionId].answer,
      questions[_questionId].requestedResponder
    );
  }

  function answerQuestion(uint256 qId, string answer) public {
    Question storage question = questions[qId];
    require(bytes(question.answer).length == 0);
    require(bytes(answer).length > 0);

    if (question.requestedResponder != address(0)) {
      require(msg.sender == question.requestedResponder);
    }
    //TODO create oracle?
    /* require(transferFrom(question.qAddress, owner, 1)); */
    mint(msg.sender, 1);
    question.answer = answer;

    emit QuestionUpdated(
      qId,
      question.qAddress,
      question.qText,
      question.answer,
      question.requestedResponder
    );
  }

  function assignQuestion(uint qId, address to) public {
    Question storage question = questions[qId];
    require(msg.sender == question.qAddress);
    question.requestedResponder = to;

    emit QuestionUpdated(
      qId,
      question.qAddress,
      question.qText,
      question.answer,
      question.requestedResponder
    );
  }

  function getQuestion(uint256 qId) public view returns (string, address, string, string, address) {
    return (
        _uint2str(qId),
        questions[qId].qAddress,
        questions[qId].qText,
        questions[qId].answer,
        questions[qId].requestedResponder
      );
  }

  //TODO is this helper function necessary for returning uint?
  function getQuestionsTotal() public view returns(string) {
    return _uint2str(_questionId);
  }
}
