pragma solidity >=0.5.16;

contract Token {
    string public name = "Spik Token";
    string public symbol = "SPIK";
    uint256 public decimals = 18;
    uint256 public totalSupply;

    constructor() public {
        totalSupply = 1000000 * (10 ** decimals);
    }
}