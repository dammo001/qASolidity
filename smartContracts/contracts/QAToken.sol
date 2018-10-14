pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/token/ERC20/StandardToken.sol";

contract QAToken is StandardToken {
  string public name = "QAToken";
  string public symbol = "QAT";
  uint public decimals = 0;
  uint public INITIAL_SUPPLY = 10000 * (10 ** decimals);

  /* event Transfer(address qAddr, address aAddr, uint256 amount); */

  constructor() public {
    totalSupply_ = INITIAL_SUPPLY;
    balances[msg.sender] = INITIAL_SUPPLY;
  }

  /* function transferFrom(address qAddr, address aAddr, uint256 amount) {
    emit Transfer(qAddr, aAddr, amount);
  } */
}
