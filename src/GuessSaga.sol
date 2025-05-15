// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./GuessVerifier.sol";

contract ZkGuessSaga {
    // The verifier contract that will verify our zero-knowledge proofs
    Groth16Verifier public verifier;

    // Store the secret number commitment
    uint256 public secretCommitment;

    // Track if game is active
    bool public isGameActive;

    // Events
    event GameStarted(uint256 commitment);
    event GuessSubmitted(address player, bool isCorrect);

    constructor(address _verifier) {
        verifier = Groth16Verifier(_verifier);
        isGameActive = false;
    }

    // Start a new game by committing to a secret number
    function startGame(uint256 commitment) external {
        require(!isGameActive, "Game already in progress");
        secretCommitment = commitment;
        isGameActive = true;
        emit GameStarted(commitment);
    }

    // Submit a guess with zero-knowledge proof
    function submitGuess(
        uint256[2] calldata a,
        uint256[2][2] calldata b,
        uint256[2] calldata c,
        uint256 guess,
        uint256 isCorrect // This should be the public output from the circuit
    ) external {
        require(isGameActive, "No active game");

        // Prepare inputs for verification
        // The circuit expects [isCorrect] as public input
        uint256[1] memory inputs = [isCorrect];

        // Verify the zero-knowledge proof
        bool valid = verifier.verifyProof(a, b, c, inputs);
        require(valid, "Invalid proof");

        emit GuessSubmitted(msg.sender, isCorrect == 1);

        if (isCorrect == 1) {
            isGameActive = false;
        }
    }

    // Get current game state
    function getGameState() external view returns (bool active, uint256 commitment) {
        return (isGameActive, secretCommitment);
    }
}