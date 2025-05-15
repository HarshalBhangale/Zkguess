const snarkjs = require("snarkjs");
const fs = require("fs");
const path = require("path");

/**
 * Generate a zero-knowledge proof for the guess
 * @param {number} secretNumber - The secret number known to the prover
 * @param {number} userGuess - The user's guess
 * @returns {Promise<Object>} - The proof data and public signals
 */
async function generateProof(secretNumber, userGuess) {
    try {
        // Path to the circuit wasm file
        const wasmPath = path.join(__dirname, "../../build/circuits/guess_js/guess.wasm");
        
        // Path to the zkey file
        const zkeyPath = path.join(__dirname, "../../build/circuits/guess_0001.zkey");
        
        // Calculate isCorrect (1 if guess matches secret, 0 otherwise)
        const isCorrect = secretNumber === userGuess ? 1 : 0;
        
        // Prepare input for the circuit
        const input = {
            secretNumber: secretNumber,
            userGuess: userGuess
        };
        
        console.log('Generating proof with input:', input);
        
        // Generate the proof
        const { proof, publicSignals } = await snarkjs.groth16.fullProve(input, wasmPath, zkeyPath);
        
        console.log('Generated proof:', {
            publicSignals,
            isCorrect
        });
        
        // Format proof for solidity verifier
        const solidityProof = {
            a: [proof.pi_a[0], proof.pi_a[1]],
            b: [[proof.pi_b[0][1], proof.pi_b[0][0]], [proof.pi_b[1][1], proof.pi_b[1][0]]],
            c: [proof.pi_c[0], proof.pi_c[1]],
            input: [isCorrect] // Only pass isCorrect as public input
        };
        
        return {
            proof: solidityProof,
            publicSignals: [isCorrect]
        };
    } catch (error) {
        console.error('Error generating proof:', error);
        throw error;
    }
}

module.exports = { generateProof }; 