import { useCallback, useMemo } from "react";
import { formatUnits, type Address } from "viem";
import {
  useAccount,
  useReadContracts,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { addresses, isConfigured, CHAIN_ID } from "./chain";
import { erc20Abi, stakingAbi } from "./staking-abi";

const ZERO: Address = "0x0000000000000000000000000000000000000000";

/**
 * Single hook powering the /staking page: batched reads for pool + user
 * position + token metadata, plus approve / stake / unstake / claim / compound
 * writes with tx-receipt tracking.
 */
export function useStaking() {
  const { address, isConnected } = useAccount();
  const user = (address ?? ZERO) as Address;

  const staking = { address: addresses.staking, abi: stakingAbi, chainId: CHAIN_ID } as const;
  const noviq = { address: addresses.noviq, abi: erc20Abi, chainId: CHAIN_ID } as const;
  const reward = { address: addresses.reward, abi: erc20Abi, chainId: CHAIN_ID } as const;

  const enabled = isConfigured;

  const { data, refetch, isLoading } = useReadContracts({
    query: { enabled, refetchInterval: 15_000 },
    contracts: [
      { ...staking, functionName: "totalStaked" }, // 0
      { ...staking, functionName: "unstakeCooldown" }, // 1
      { ...staking, functionName: "rewardIsStake" }, // 2
      { ...staking, functionName: "totalRewardsFunded" }, // 3
      { ...noviq, functionName: "decimals" }, // 4
      { ...noviq, functionName: "symbol" }, // 5
      { ...reward, functionName: "decimals" }, // 6
      { ...reward, functionName: "symbol" }, // 7
      { ...staking, functionName: "users", args: [user] }, // 8
      { ...staking, functionName: "pendingRewards", args: [user] }, // 9
      { ...staking, functionName: "unlockTime", args: [user] }, // 10
      { ...noviq, functionName: "balanceOf", args: [user] }, // 11
      { ...noviq, functionName: "allowance", args: [user, addresses.staking] }, // 12
    ],
  });

  const r = (i: number) => data?.[i]?.result;

  const stakeDecimals = Number(r(4) ?? 18);
  const rewardDecimals = Number(r(6) ?? 18);
  const usersTuple = r(8) as readonly [bigint, bigint, bigint, bigint] | undefined;

  const parsed = useMemo(() => {
    const staked = usersTuple?.[0] ?? 0n;
    const pending = (r(9) as bigint) ?? 0n;
    const walletBalance = (r(11) as bigint) ?? 0n;
    const allowance = (r(12) as bigint) ?? 0n;
    return {
      stakeSymbol: (r(5) as string) ?? "NOVIQ",
      rewardSymbol: (r(7) as string) ?? "USDC",
      stakeDecimals,
      rewardDecimals,
      rewardIsStake: Boolean(r(2)),
      cooldownSeconds: Number((r(1) as bigint) ?? 0n),
      totalStaked: (r(0) as bigint) ?? 0n,
      totalRewardsFunded: (r(3) as bigint) ?? 0n,
      staked,
      pending,
      walletBalance,
      allowance,
      unlockTime: Number((r(10) as bigint) ?? 0n),
      fmt: {
        totalStaked: formatUnits((r(0) as bigint) ?? 0n, stakeDecimals),
        staked: formatUnits(staked, stakeDecimals),
        walletBalance: formatUnits(walletBalance, stakeDecimals),
        pending: formatUnits(pending, rewardDecimals),
      },
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, stakeDecimals, rewardDecimals]);

  // ---- writes ----
  const { writeContractAsync, data: txHash, isPending, reset } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash: txHash });

  const needsApproval = useCallback(
    (amount: bigint) => parsed.allowance < amount,
    [parsed.allowance],
  );

  const approve = useCallback(
    (amount: bigint) =>
      writeContractAsync({
        address: addresses.noviq,
        abi: erc20Abi,
        functionName: "approve",
        args: [addresses.staking, amount],
        chainId: CHAIN_ID,
      }),
    [writeContractAsync],
  );

  const stake = useCallback(
    (amount: bigint) =>
      writeContractAsync({ ...staking, functionName: "stake", args: [amount] }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [writeContractAsync],
  );

  const unstake = useCallback(
    (amount: bigint) =>
      writeContractAsync({ ...staking, functionName: "unstake", args: [amount] }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [writeContractAsync],
  );

  const claim = useCallback(
    () => writeContractAsync({ ...staking, functionName: "claim" }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [writeContractAsync],
  );

  const compound = useCallback(
    () => writeContractAsync({ ...staking, functionName: "compound" }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [writeContractAsync],
  );

  return {
    isConnected,
    address,
    isConfigured: enabled,
    isLoading,
    data: parsed,
    refetch,
    tx: { hash: txHash, isPending, isConfirming, isConfirmed, reset },
    actions: { needsApproval, approve, stake, unstake, claim, compound },
  };
}
