pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/token/ERC20/StandardToken.sol";

contract QAToken is StandardToken {
  string public name = "QAToken";
  string public symbol = "QAT";
  uint public decimals = 0;
  uint public INITIAL_SUPPLY = 10000 * (10 ** decimals);

  event TokensUpdated( address to, uint amt );
  event Mint(address indexed to, uint256 amount);

  constructor() public {
    totalSupply_ = INITIAL_SUPPLY;
    balances[msg.sender] = INITIAL_SUPPLY;
  }

  function getAcctBalance(address addr) public view returns (string) {
    return _uint2str(balanceOf(addr));
  }

  //Helpers
  function _uint2str(uint i) internal pure returns (string) {
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

  //TODO this should not be callable by anyone... this way now until oracle built
  function mint(address _to, uint amt) public {
    totalSupply_ = totalSupply_.add(amt);
    balances[_to] = balances[_to].add(amt);
    emit TokensUpdated(_to, balances[_to]);
  }

}
