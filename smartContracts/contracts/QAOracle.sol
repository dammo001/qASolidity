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
  }

  constructor () public {
    owner = msg.sender;
    _questionId = 0;
  }

  modifier isOwner() {
    require(msg.sender == owner);
    _;
  }

  function uint2str(uint i) internal pure returns (string){
    if (i == 0) return "0";
    uint j = i;
    uint length;
    while (j != 0){
        length++;
        j /= 10;
    }
    bytes memory bstr = new bytes(length);
    uint k = length - 1;
    while (i != 0){
        bstr[k--] = byte(48 + i % 10);
        i /= 10;
    }
    return string(bstr);
  }
  //TODO figure out correct return type for frontend, bignum causes error
  function getQuestionsTotal() public view returns(string) {
    return uint2str(_questionId);
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

  function transferTo(address addr) public {
    transferFrom(msg.sender, addr, 1);
  }

  function getQuestionText(uint256 qId) public view returns (string) {
    return questions[qId].qText;
  }

  function getQuestionAnswer(uint256 qId) public view returns (string) {
    return questions[qId].answer;
  }

  function getAcctBalance(address addr) public view returns (uint256) {
    return balanceOf(addr);
  }

  function answerQuestion(uint256 qId, address aAddr, string answer) public isOwner {
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
