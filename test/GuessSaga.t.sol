// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "../src/GuessVerifier.sol";
import "../src/GuessSaga.sol";

contract ZkGuessSagaTest is Test {
    Groth16Verifier verifier;
    ZkGuessSaga game;
    
    function setUp() public {
        verifier = new Groth16Verifier();
        game = new ZkGuessSaga(address(verifier));
    }
    
    function testDeployment() public {
        assertTrue(address(game.verifier()) == address(verifier));
        assertFalse(game.isGameActive());
        assertEq(game.secretCommitment(), 0);
    }

    function testStartGame() public {
        uint256 commitment = 12345;
        game.startGame(commitment);
        assertTrue(game.isGameActive());
        assertEq(game.secretCommitment(), commitment);
    }

    function testCannotStartGameWhileActive() public {
        game.startGame(12345);
        vm.expectRevert("Game already in progress");
        game.startGame(67890);
    }

    function testCannotSubmitGuessWithoutActiveGame() public {
        uint256[2] memory a;
        uint256[2][2] memory b;
        uint256[2] memory c;
        vm.expectRevert("No active game");
        game.submitGuess(a, b, c, 1, 1);
    }
    
    // Note: Full proof testing would require generating proofs with snarkjs in JS
    // This is typically done in the client-side application
}