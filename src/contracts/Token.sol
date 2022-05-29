pragma solidity >=0.5.16;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";

contract Token {
    using SafeMath for uint;

    string public name = "Spik Token";
    string public symbol = "SPIK";
    uint256 public decimals = 18;
    uint256 public totalSupply;

    //Track Balance
    mapping(address => uint256) public balanceOf;

    constructor() public {
        totalSupply = 1000000 * (10 ** decimals);
        balanceOf[msg.sender] = totalSupply;
    }

    function transfer (address _to, uint256 _value) public returns (bool success){
        balanceOf[msg.sender] = balanceOf[msg.sender].sub(_value);
        balanceOf[_to] = balanceOf[_to].add(_value);
        return true;
    }
}