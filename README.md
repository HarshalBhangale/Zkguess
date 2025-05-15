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
git clone <repository-url>
cd <repository-name>
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

## 📝 License

MIT License

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request
