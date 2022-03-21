// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;
import "@openzeppelin/contracts/access/AccessControl.sol";

contract ETHPool is AccessControl {
    uint256 public totalRewards;
    address[] public users;
    struct DepositDetails {
        uint256 value;
        bool hasDeposited;
    }
    mapping(address => DepositDetails) public depositors;
    bytes32 public constant TEAM_MEMBER_ROLE = keccak256("TEAM_MEMBER_ROLE");

    constructor() {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(TEAM_MEMBER_ROLE, msg.sender);
    }

    event Deposit(address indexed _address, uint256 _value);
    event Withdraw(address indexed _address, uint256 _value);

    function addTeamMember(address _account) public {
        grantRole(TEAM_MEMBER_ROLE, _account);
    }

    function removeTeamMember(address _account) public {
        revokeRole(TEAM_MEMBER_ROLE, _account);
    }

    receive() external payable {
        if (!depositors[msg.sender].hasDeposited) users.push(msg.sender);

        depositors[msg.sender].value += msg.value;
        depositors[msg.sender].hasDeposited = true;

        totalRewards += msg.value;

        emit Deposit(msg.sender, msg.value);
    }

    function distributeRewards() public payable onlyRole(TEAM_MEMBER_ROLE) {
        //checks for total value in contract should be greater then 0 to distribute
        require(totalRewards > 0, "No rewards to distribute");
        for (uint256 i = 0; i < users.length; i++) {
            address user = users[i];
            uint256 reward = ((depositors[user].value * msg.value) /
                totalRewards);
            depositors[user].value += reward;
        }
    }

    function withdraw() public {
        uint256 depositAmount = depositors[msg.sender].value;
        require(depositAmount > 0, "No deposits found for withdraw");
        depositors[msg.sender].value = 0;
        (bool success, ) = msg.sender.call{value: depositAmount}("");
        require(success, "Transfer failed");
        emit Withdraw(msg.sender, depositAmount);
    }
}
