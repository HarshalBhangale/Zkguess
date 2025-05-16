// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "./Groth16Verifier.sol";

contract GuessSaga {
    // The verifier contract for zero-knowledge proofs
    Groth16Verifier public verifier;

    // Game state
    bool public isGameActive;
    uint256 public secretCommitment;
    bytes32 public merkleRoot;

    // Events
    event GameStarted(uint256 commitment, bytes32 merkleRoot);
    event GuessSubmitted(address player, bool isCorrect);

    constructor(address _verifier) {
        verifier = Groth16Verifier(_verifier);
        isGameActive = false;
    }

    // Start a new game
    function startGame(uint256 _commitment, bytes32 _merkleRoot) external {
        require(!isGameActive, "Game already in progress");
        secretCommitment = _commitment;
        merkleRoot = _merkleRoot;
        isGameActive = true;
        emit GameStarted(_commitment, _merkleRoot);
    }

    // Submit a guess with both zero-knowledge proof and Merkle proof
    function submitGuess(
        uint256[2] calldata a,
        uint256[2][2] calldata b,
        uint256[2] calldata c,
        uint256 guess,
        uint256 isCorrect,
        bytes32[] calldata merkleProof
    ) external {
        require(isGameActive, "No active game");

        // Verify Merkle proof
        bytes32 leaf = keccak256(abi.encode(guess));
        require(
            MerkleProof.verify(merkleProof, merkleRoot, leaf),
            "Invalid Merkle proof"
        );

        // Verify zero-knowledge proof
        uint256[1] memory inputs = [isCorrect];
        bool valid = verifier.verifyProof(a, b, c, inputs);
        require(valid, "Invalid zero-knowledge proof");

        emit GuessSubmitted(msg.sender, isCorrect == 1);

        if (isCorrect == 1) {
            isGameActive = false;
        }
    }

    // Get current game state
    function getGameState() external view returns (
        bool active,
        uint256 commitment,
        bytes32 root
    ) {
        return (isGameActive, secretCommitment, merkleRoot);
    }
} 