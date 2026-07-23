// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console2} from "forge-std/Script.sol";
import {NoviqStaking} from "../src/NoviqStaking.sol";

/**
 * Deploy NoviqStaking.
 *
 * Required env:
 *   PRIVATE_KEY       deployer key
 *   STAKE_TOKEN       $NOVIQ ERC-20 address (from the Robinhood launchpad)
 *   REWARD_TOKEN      reward token address (USDC for real yield, or = STAKE_TOKEN)
 *   UNSTAKE_COOLDOWN  seconds (e.g. 0, or 86400 for 1 day)
 *   OWNER             admin address (parameters only; cannot touch user funds)
 *
 * Example:
 *   forge script script/DeployStaking.s.sol:DeployStaking \
 *     --rpc-url robinhood --broadcast --verify
 */
contract DeployStaking is Script {
    function run() external returns (NoviqStaking staking) {
        uint256 pk = vm.envUint("PRIVATE_KEY");
        address stakeToken = vm.envAddress("STAKE_TOKEN");
        address rewardToken = vm.envAddress("REWARD_TOKEN");
        uint256 cooldown = vm.envUint("UNSTAKE_COOLDOWN");
        address owner = vm.envAddress("OWNER");

        vm.startBroadcast(pk);
        staking = new NoviqStaking(stakeToken, rewardToken, cooldown, owner);
        vm.stopBroadcast();

        console2.log("NoviqStaking deployed at:", address(staking));
        console2.log("  stakeToken:", stakeToken);
        console2.log("  rewardToken:", rewardToken);
        console2.log("  cooldown:", cooldown);
        console2.log("  owner:", owner);
    }
}
