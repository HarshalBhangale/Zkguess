const { ethers } = require('ethers');
require('dotenv').config();

// Import contract ABI
const contractABI = require('./abi/ZkGuessSaga.json').abi;

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, contractABI, wallet);

async function startGame(commitment) {
    try {
        console.log('Starting game with commitment:', commitment);
        const tx = await contract.startGame(commitment);
        await tx.wait();
        return { success: true, txHash: tx.hash };
    } catch (error) {
        console.error('Error starting game:', error);
        return { success: false, error: error.message };
    }
}

async function submitGuess(proof, guess, isCorrect) {
    try {
        console.log('Submitting guess:', {
            guess,
            isCorrect,
            proof: {
                a: proof.a,
                b: proof.b,
                c: proof.c,
                input: proof.input
            }
        });

        const tx = await contract.submitGuess(
            proof.a,
            proof.b,
            proof.c,
            guess,
            isCorrect
        );
        await tx.wait();
        return { success: true, txHash: tx.hash };
    } catch (error) {
        console.error('Error submitting guess:', error);
        return { success: false, error: error.message };
    }
}

async function getGameState() {
    try {
        const [isActive, commitment] = await contract.getGameState();
        return { success: true, isActive, commitment };
    } catch (error) {
        console.error('Error getting game state:', error);
        return { success: false, error: error.message };
    }
}

module.exports = {
    startGame,
    submitGuess,
    getGameState
}; 