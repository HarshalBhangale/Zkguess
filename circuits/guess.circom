pragma circom 2.0.0;

include "../node_modules/circomlib/circuits/comparators.circom";

template GuessCheck() {
    signal input secretNumber; // The secret number, known to the prover
    signal input userGuess;    // The user's guess
    signal output isCorrect;   // 1 if correct, 0 if not
    
    // Check if the guess matches the secret number
    component eq = IsEqual();
    eq.in[0] <== secretNumber;
    eq.in[1] <== userGuess;
    
    // Output the result
    isCorrect <== eq.out;
}

component main = GuessCheck();