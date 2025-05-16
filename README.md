# ZK Guess Saga 🎮

A zero-knowledge proof-based number guessing game where players can prove they know the secret number without revealing it. Built with Solidity, Circom, and Node.js.

## 🚀 Features

- Zero-knowledge proof verification for number guessing
- Smart contract-based game state management
- RESTful API backend
- Secure commitment scheme
- Real-time game state updates

## 📋 Prerequisites

- Node.js (v16 or higher)
- Foundry (for smart contract development)
- Anvil (local Ethereum node)
- snarkjs (for zero-knowledge proofs)

## 🛠️ Setup

1. Clone the repository:
```bash
git clone https://github.com/HarshalBhangale/Zkguess
cd Zkguess
```

2. Install dependencies:
```bash
# Install Foundry dependencies
forge install

# Install backend dependencies
cd backend
npm install
```

3. Set up environment variables:
Create a `.env` file in the `backend` directory:
```env
PRIVATE_KEY=your_private_key_here
RPC_URL=http://localhost:8545
CONTRACT_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
VERIFIER_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
```

## 🎮 How to Play

1. Start the local Ethereum node (Anvil):
```bash
anvil
```

2. Deploy the smart contracts:
```bash
forge script script/DeployGuessSaga.s.sol:DeployGuessSaga --rpc-url http://localhost:8545 --broadcast
```

3. Start the backend server:
```bash
cd backend
npm run dev
```

4. Play the game using the API endpoints:

### Start a New Game
```bash
curl -X POST http://localhost:3000/api/game/start \
  -H "Content-Type: application/json" \
  -d '{"secretNumber": 5}'
```
Response:
```json
{
  "success": true,
  "commitment": "5603",
  "txHash": "0x..."
}
```

### Submit a Guess
```bash
curl -X POST http://localhost:3000/api/game/guess \
  -H "Content-Type: application/json" \
  -d '{"commitment": "5603", "guess": 5}'
```
Response:
```json
{
  "success": true,
  "isCorrect": true,
  "txHash": "0x..."
}
```

### Check Game State
```bash
curl http://localhost:3000/api/game/state/5603
```
Response:
```json
{
  "isActive": true,
  "commitment": "5603"
}
```

### Debug Active Games
```bash
curl http://localhost:3000/api/game/debug
```
Response:
```json
{
  "activeGames": [
    {
      "commitment": "5603",
      "secretNumber": 5,
      "isActive": true,
      "createdAt": "2024-02-15T20:05:04.455Z"
    }
  ]
}
```

## 🎯 Game Rules

1. The game starts when a player submits a secret number (1-10)
2. The secret number is committed to the blockchain
3. Players can submit guesses with zero-knowledge proofs
4. A guess is correct if it matches the secret number
5. The game ends when a correct guess is submitted
6. Only one game can be active at a time

## 🔍 Technical Details

### Smart Contracts
- `ZkGuessSaga.sol`: Main game contract
- `Groth16Verifier.sol`: Zero-knowledge proof verifier

### Backend
- Express.js server
- snarkjs for proof generation
- ethers.js for blockchain interaction

### Circuit
- Written in Circom
- Proves knowledge of the secret number
- Verifies guess correctness

## 🧪 Testing

Run the test suite:
```bash
forge test
```

## 🌳 Merkle Tree Implementation

The game uses Merkle trees to efficiently verify the validity of guesses without revealing the secret number. Here's how it works:

### Structure
- Each leaf in the tree represents a possible guess (numbers 1-10)
- The tree is constructed using keccak256 hashing function
- The root of the tree is stored on-chain in the smart contract

### Components

1. **Smart Contract (`GuessSaga.sol`)**
   ```solidity
   // Stores the Merkle root
   bytes32 public merkleRoot;
   
   // Verifies Merkle proofs using OpenZeppelin's library
   require(
       MerkleProof.verify(merkleProof, merkleRoot, leaf),
       "Invalid Merkle proof"
   );
   ```

2. **Backend (`merkleTree.js`)**
   ```javascript
   class MerkleTree {
       // Constructs the tree from possible guesses
       constructor(leaves = [])
       
       // Generates proof for a specific guess
       getProof(index)
       
       // Verifies if a guess is valid
       verify(proof, leaf, root)
   }
   ```

### How It Works

1. **Tree Construction**
   - When a game starts, a Merkle tree is constructed with all possible valid guesses
   - Each leaf is a hash of a possible guess number
   - The root of this tree is stored in the smart contract

2. **Proof Generation**
   - When a player makes a guess, the backend generates a Merkle proof
   - The proof contains the minimum number of hashes needed to verify the guess
   - This proof is submitted along with the guess to the smart contract

3. **Verification**
   - The smart contract verifies the proof against the stored root
   - If the proof is valid, the guess is considered legitimate
   - This ensures the guess is one of the pre-approved valid guesses

### Merkle Tree Structure
```
                                    Root (H1-10)
                                    /           \
                                   /             \
                                  /               \
                                 /                 \
                        H1-5                      H6-10
                        /   \                     /   \
                       /     \                   /     \
                      /       \                 /       \
                     /         \               /         \
                H1-3           H4-5        H6-8          H9-10
                /  \           /  \         /  \         /  \
               /    \         /    \       /    \       /    \
              /      \       /      \     /      \     /      \
           H1-2      H3    H4      H5   H6-7    H8   H9      H10
           /  \      |     |       |    /  \     |    |       |
          /    \     |     |       |   /    \    |    |       |
         /      \    |     |       |  /      \   |    |       |
        H1      H2  H3    H4      H5 H6      H7 H8   H9      H10
        |       |    |     |       |  |       |  |    |       |
        1       2    3     4       5  6       7  8    9       10
```

### Verification Process
For example, to verify number 5 is in the tree:
1. Start with H5 (hash of 5)
2. Hash H5 with H4 to get H4-5
3. Hash H4-5 with H1-3 to get H1-5
4. Hash H1-5 with H6-10 to get Root
5. Compare with stored root

### Few Points to Highlight about the tree.
- The tree is balanced and complete
- Each level halves the number of nodes
- Proof size is logarithmic (O(log n))
- Only the root needs to be stored on-chain
