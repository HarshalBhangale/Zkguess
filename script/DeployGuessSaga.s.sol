// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Script.sol";
import "../src/GuessSaga.sol";
import "../src/Groth16Verifier.sol";

contract DeployGuessSaga is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // Deploy verifier first
        Groth16Verifier verifier = new Groth16Verifier();
        
        // Deploy main game contract
        GuessSaga game = new GuessSaga(address(verifier));

        vm.stopBroadcast();

        console.log("Verifier deployed to:", address(verifier));
        console.log("Game contract deployed to:", address(game));
    }
}