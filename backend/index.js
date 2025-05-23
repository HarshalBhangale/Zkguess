const express = require('express');
const cors = require('cors');
const { generateProof } = require('./utils/proofGenerator');
const { startGame, submitGuess, getGameState } = require('./utils/contract');
const MerkleTree = require('./utils/merkleTree');

const app = express();
app.use(cors());
app.use(express.json());

const games = new Map();

// Debug endpoint to see all active games
app.get('/api/game/debug', (req, res) => {
    const activeGames = Array.from(games.entries()).map(([commitment, game]) => ({
        commitment,
        isActive: game.isActive,
        createdAt: game.createdAt,
        hasMerkleTree: !!game.merkleTree
    }));
    res.json({ activeGames });
});

// Start a new game
app.post('/api/game/start', async (req, res) => {
    try {
        const { secretNumber } = req.body;
        if (!secretNumber || secretNumber < 1 || secretNumber > 10) {
            return res.status(400).json({ error: 'Secret number must be between 1 and 10' });
        }

        // Check contract state
        const chainState = await getGameState();
        if (!chainState.success) {
            return res.status(500).json({ error: chainState.error });
        }
        if (chainState.isActive) {
            return res.status(400).json({ error: 'Game already in progress on chain' });
        }

        // Create Merkle tree with all possible numbers (1-10)
        const possibleNumbers = Array.from({ length: 10 }, (_, i) => i + 1);
        const merkleTree = new MerkleTree(possibleNumbers);
        
        // Generate commitment
        const commitment = secretNumber * 1000 + Math.floor(Math.random() * 1000);
        
        // Start game on chain
        const result = await startGame(commitment, merkleTree.getRoot());
        if (!result.success) {
            return res.status(500).json({ error: result.error });
        }

        // Store game state
        games.set(commitment.toString(), {
            secretNumber,
            isActive: true,
            createdAt: new Date().toISOString(),
            merkleTree
        });

        console.log('Game started:', {
            commitment,
            secretNumber,
            merkleRoot: merkleTree.getRoot(),
            txHash: result.txHash
        });

        res.json({ 
            success: true, 
            commitment,
            merkleRoot: merkleTree.getRoot(),
            txHash: result.txHash
        });
    } catch (error) {
        console.error('Error starting game:', error);
        res.status(500).json({ error: error.message });
    }
});

// Submit a guess
app.post('/api/game/guess', async (req, res) => {
    try {
        const { commitment, guess } = req.body;
        
        // Validate inputs
        if (!commitment || !guess || guess < 1 || guess > 10) {
            return res.status(400).json({ error: 'Invalid inputs' });
        }

        console.log('Attempting guess:', {
            commitment,
            guess,
            activeGames: Array.from(games.keys())
        });

        // Get game state
        const game = games.get(commitment.toString());
        if (!game) {
            return res.status(400).json({ 
                error: 'Game not found',
                activeGames: Array.from(games.keys())
            });
        }
        if (!game.isActive) {
            return res.status(400).json({ error: 'Game is not active' });
        }
        if (!game.merkleTree) {
            return res.status(500).json({ error: 'Game state is corrupted - missing Merkle tree' });
        }

        // Generate Merkle proof
        const merkleProof = game.merkleTree.getProof(guess - 1);
        
        // Generate zero-knowledge proof
        const { proof, publicSignals } = await generateProof(game.secretNumber, guess);
        
        // Submit guess to contract
        const result = await submitGuess(proof, guess, publicSignals[0], merkleProof);
        if (!result.success) {
            return res.status(500).json({ error: result.error });
        }

        // Update game state if guess is correct
        if (publicSignals[0] === 1) {
            game.isActive = false;
            console.log('Game won:', {
                commitment,
                guess,
                secretNumber: game.secretNumber
            });
        }

        res.json({
            success: true,
            isCorrect: publicSignals[0] === 1,
            txHash: result.txHash,
            merkleProof
        });
    } catch (error) {
        console.error('Error submitting guess:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get game state
app.get('/api/game/state/:commitment', async (req, res) => {
    try {
        const { commitment } = req.params;
        const game = games.get(commitment.toString());
        
        if (!game) {
            return res.status(404).json({ 
                error: 'Game not found',
                activeGames: Array.from(games.keys())
            });
        }

        const chainState = await getGameState();
        if (!chainState.success) {
            return res.status(500).json({ error: chainState.error });
        }

        res.json({
            isActive: game.isActive && chainState.isActive,
            commitment: chainState.commitment,
            merkleRoot: chainState.merkleRoot,
            secretNumber: game.secretNumber // For debugging
        });
    } catch (error) {
        console.error('Error getting game state:', error);
        res.status(500).json({ error: error.message });
    }
});

// Reset game state (for development/testing)
app.post('/api/game/reset', async (req, res) => {
    try {
        games.clear();
        res.json({ success: true, message: 'Game state reset' });
    } catch (error) {
        console.error('Error resetting game state:', error);
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('Available endpoints:');
    console.log('- POST /api/game/start');
    console.log('- POST /api/game/guess');
    console.log('- GET /api/game/state/:commitment');
    console.log('- GET /api/game/debug');
    console.log('- POST /api/game/reset');
}); 
