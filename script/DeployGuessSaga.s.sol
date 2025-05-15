// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "forge-std/Script.sol";
import "../src/GuessVerifier.sol";
import "../src/GuessSaga.sol";

contract DeployGuessSaga is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // Deploy the Verifier contract
        Groth16Verifier verifier = new Groth16Verifier();
        
        // Deploy the ZkGuessSaga contract
        ZkGuessSaga game = new ZkGuessSaga(address(verifier));
        
        vm.stopBroadcast();
        
        console.log("Verifier deployed at:", address(verifier));
        console.log("ZkGuessSaga deployed at:", address(game));
    }
}