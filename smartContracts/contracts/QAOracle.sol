pragma solidity ^0.4.24;

import './QAToken.sol';

contract QAOracle is QAToken {
  address public owner;
  uint private _questionId;
  mapping (uint => Question) public questions;

  event QuestionAdded( address askerAddress, uint qId, string qText );
  event QuestionAnswered( uint qId , string aText );

  struct Question {
    address qAddress;
    string qText;
    string answer;
  }

  constructor () public {
    owner = msg.sender;
    _questionId = 0;
  }

  modifier isOwner() {
    require(msg.sender == owner);
    _;
  }

  //TODO investigate just returning the tokenContract instance to work with
  function sendTokens(address to, uint amt) public {
    transfer(to, amt);
  }

  function askQuestion(string question) public payable {
    require(balanceOf(msg.sender) >= 1);
    require(approve(owner, 1));
    _questionId++;
    emit QuestionAdded( msg.sender, _questionId, question );
    questions[_questionId] = Question(msg.sender, question, '');
  }

  function transferTo(address addr) {
    transferFrom(msg.sender, addr, 1);
  }

  function getQuestionText(uint qId) public view returns (string) {
    return questions[qId].qText;
  }

  function getQuestionAnswer(uint qId) public view returns (string) {
    return questions[qId].answer;
  }

  function getAcctBalance(address addr) public view returns (uint256) {
    return balanceOf(addr);
  }

  function answerQuestion(uint qId, address aAddr, string answer) public isOwner {
    Question storage question = questions[qId];
    require(bytes(question.answer).length == 0);
    require(transferFrom(question.qAddress, owner, 1));
    require(approve(aAddr, 1));
    question.answer = answer;
    emit QuestionAnswered( qId, answer );
  }

  /* function getTokenReward(uint qId) public {
    Question storage question = questions[qId];
    require (msg.sender == question.answerer);
    require (transferFrom(owner, msg.sender, 1));
  } */
}
