const { ethers } = require('ethers');
require('dotenv').config();

// Import contract ABI
const contractABI = require('./abi/GuessSaga.json').abi;

// Initialize provider and wallet
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// Initialize contract
const contract = new ethers.Contract(
    process.env.CONTRACT_ADDRESS,
    contractABI,
    wallet
);

async function startGame(commitment, merkleRoot) {
    try {
        console.log('Starting game with:', { commitment, merkleRoot });
        const tx = await contract.startGame(commitment, merkleRoot);
        const receipt = await tx.wait();
        console.log('Game started successfully:', receipt.hash);
        return { success: true, txHash: receipt.hash };
    } catch (error) {
        console.error('Error starting game:', error);
        return { 
            success: false, 
            error: error.reason || error.message 
        };
    }
}

async function submitGuess(proof, guess, isCorrect, merkleProof) {
    try {
        console.log('Submitting guess:', {
            guess,
            isCorrect,
            proof: {
                a: proof.a,
                b: proof.b,
                c: proof.c
            },
            merkleProof
        });

        const tx = await contract.submitGuess(
            proof.a,
            proof.b,
            proof.c,
            guess,
            isCorrect,
            merkleProof
        );
        const receipt = await tx.wait();
        console.log('Guess submitted successfully:', receipt.hash);
        return { success: true, txHash: receipt.hash };
    } catch (error) {
        console.error('Error submitting guess:', error);
        return { 
            success: false, 
            error: error.reason || error.message 
        };
    }
}

async function getGameState() {
    try {
        const [isActive, commitment, merkleRoot] = await contract.getGameState();
        console.log('Game state retrieved:', { isActive, commitment, merkleRoot });
        return { 
            success: true, 
            isActive, 
            commitment,
            merkleRoot
        };
    } catch (error) {
        console.error('Error getting game state:', error);
        return { 
            success: false, 
            error: error.reason || error.message 
        };
    }
}

module.exports = {
    startGame,
    submitGuess,
    getGameState
}; 