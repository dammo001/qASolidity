pragma solidity ^0.4.24;

import './QAToken.sol';

//TODO seperate token logic into its own contract
contract QAOracle is QAToken {
  address public owner;
  uint256 private _questionId;
  mapping (uint256 => Question) public questions;

  event QuestionAdded( address askerAddress, uint qId, string qText );
  event QuestionAnswered( uint qId , string aText );

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
    emit QuestionAdded( msg.sender, _questionId, question );
    questions[_questionId] = Question(msg.sender, question, '', address(0));
  }

  function answerQuestion(uint256 qId, string answer) public {
    Question storage question = questions[qId];
    require(bytes(question.answer).length == 0);
    require(bytes(answer).length > 0);
    //TODO create oracle?
    /* require(transferFrom(question.qAddress, owner, 1)); */
    mint(msg.sender, 1);
    question.answer = answer;
    emit QuestionAnswered( qId, answer );
  }

  //Getters
  function getQuestionText(uint256 qId) public view returns (string) {
    return questions[qId].qText;
  }

  function getQuestionAsker(uint qId) public view returns (address) {
    return questions[qId].qAddress;
  }

  function getQuestionAnswer(uint256 qId) public view returns (string) {
    return questions[qId].answer;
  }

  function getQuestion(uint256 qId) public view returns (address, string, string, address) {
    return (
      questions[qId].qAddress,
      questions[qId].qText,
      questions[qId].answer,
      questions[qId].requestedResponder
    );
  }

  //TODO figure out correct return type for frontend, bignum causes error
  function getQuestionsTotal() public view returns(string) {
    return _uint2str(_questionId);
  }

  /* function getTokenReward(uint qId) public {
    Question storage question = questions[qId];
    require (msg.sender == question.answerer);
    require (transferFrom(owner, msg.sender, 1));
  } */
}
