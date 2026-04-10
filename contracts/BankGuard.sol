// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract BankGuard {
    uint256 public threshold = 10;
    event TransactionFlagged(address indexed sender, uint256 amount, string status);

    function transferMoney(uint256 _amount) public payable {
        string memory status = _amount > threshold ? "FLAGGED" : "CLEARED";
        emit TransactionFlagged(msg.sender, _amount, status);
    }
}