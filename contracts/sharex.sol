// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Sharex is Ownable {
    uint256 public fee;
    mapping(bytes32 => string) files;
    mapping(bytes32 => uint256) public expirations;

    constructor() {}

    function uploadFile(
        string memory url,
        string memory secret,
        uint256 expirationTimestamp
    ) external payable {
        require(msg.value >= fee, "Sharex: Insufficient fee");
        bytes32 key = keccak256(abi.encodePacked(url, secret, msg.sender));
        files[key] = url;
        expirations[key] = expirationTimestamp;
    }

    function getFile(bytes32 key) external view returns (string memory) {
        require(
            expirations[key] > block.timestamp,
            "Sharex: Key expired or not found"
        );
        return files[key];
    }

    function claimFee() external onlyOwner {
        bool success = payable(owner()).send(address(this).balance);
        require(success, "Sharex: Failed to claim fee");
    }

    function setFee(uint256 _fee) external onlyOwner {
        fee = _fee;
    }
}
