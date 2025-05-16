const { ethers } = require('ethers');

class MerkleTree {
    constructor(leaves = []) {
        this.leaves = leaves.map(leaf => this.hashLeaf(leaf));
        this.layers = [this.leaves];
        this.buildTree();
    }

    // Hash a single leaf
    hashLeaf(leaf) {
        return ethers.keccak256(
            ethers.AbiCoder.defaultAbiCoder().encode(['uint256'], [leaf])
        );
    }

    // Hash a pair of nodes
    hashPair(a, b) {
        // Sort the pair to ensure consistent ordering
        const sorted = [a, b].sort();
        return ethers.keccak256(
            ethers.AbiCoder.defaultAbiCoder().encode(['bytes32', 'bytes32'], sorted)
        );
    }

    // Build the tree from leaves
    buildTree() {
        let layer = this.leaves;
        while (layer.length > 1) {
            const newLayer = [];
            for (let i = 0; i < layer.length; i += 2) {
                if (i + 1 === layer.length) {
                    // If there's an odd number of nodes, duplicate the last one
                    newLayer.push(layer[i]);
                } else {
                    newLayer.push(this.hashPair(layer[i], layer[i + 1]));
                }
            }
            this.layers.push(newLayer);
            layer = newLayer;
        }
    }

    // Get the root hash
    getRoot() {
        return this.layers[this.layers.length - 1][0];
    }

    // Get the proof for a specific leaf
    getProof(index) {
        const proof = [];
        for (let i = 0; i < this.layers.length - 1; i++) {
            const layer = this.layers[i];
            const isRightNode = index % 2 === 1;
            const pairIndex = isRightNode ? index - 1 : index + 1;
            
            if (pairIndex < layer.length) {
                proof.push(layer[pairIndex]);
            }
            
            index = Math.floor(index / 2);
        }
        return proof;
    }

    // Verify a proof
    verify(proof, leaf, root) {
        let computedHash = this.hashLeaf(leaf);
        for (let i = 0; i < proof.length; i++) {
            const proofElement = proof[i];
            computedHash = this.hashPair(computedHash, proofElement);
        }
        return computedHash === root;
    }
}

module.exports = MerkleTree; 