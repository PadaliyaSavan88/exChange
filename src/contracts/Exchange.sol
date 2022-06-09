pragma solidity >=0.5.0;

import './Token.sol';
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

contract Exchange {
    using SafeMath for uint;

    // Variables
    address public feeAccount; // account to receive fees
    uint256 public feePercent; // fee percentage
    mapping(address => mapping(address => uint256)) public tokens;

    // Events
    event Deposit(address token, address user, uint256 amount, uint256 balance);

    constructor (address _feeAccount, uint256 _feePercentage) public {
        feeAccount = _feeAccount;
        feePercent = _feePercentage;
    }

    function depositeToken(address _token, uint _amount) public {
        require(Token(_token).transferFrom(msg.sender, address(this), _amount));
        tokens[_token][msg.sender] = tokens[_token][msg.sender].add(_amount);
        emit Deposit(_token, msg.sender, _amount, tokens[_token][msg.sender]);
    }

}