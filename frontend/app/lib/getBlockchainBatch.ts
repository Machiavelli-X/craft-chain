
import { Batch } from "../data/mockBatch";

type ApiCheckpoint = {
  blockNumber: number;
  actor: string;
  metadataUri: string;
  dataHash: string;
  timestamp: number;
  transactionHash: string;
  status: "MATCH" | "MISMATCH" | "UNVERIFIABLE";
};

type VerifyResponse = {
  tokenId: number;
  exists: boolean;
  owner: string;
  metadataUri: string;
  verified: boolean;
  verificationStatus: string;
  history?: {
    fromBlock: number;
    toBlock: number;
    completeLifetimeHistory: boolean;
  };
  checkpoints: ApiCheckpoint[];
};

export type VerificationBatch = Batch & {
  verified: boolean;
  checkpoints: ApiCheckpoint[];
  history?: VerifyResponse["history"];
  verificationStatus: string;
};

export async function getBlockchainBatch(
  tokenId: number
): Promise<VerificationBatch | null> {
  if (!Number.isInteger(tokenId) || tokenId <= 0) return null;

  const appUrl = process.env.CRAFTCHAIN_APP_URL;

  if (!appUrl) {
    throw new Error("CRAFTCHAIN_APP_URL is not configured");
  }

  const response = await fetch(
    `${appUrl.replace(/\/$/, "")}/api/verify?tokenId=${tokenId}&mode=checkpoints&fromBlock=12011868&toBlock=12012020`,
    { cache: "no-store" }
  );

  if (!response.ok) {
    throw new Error(`Verification API failed: ${response.status}`);
  }

  const data: VerifyResponse = await response.json();

  if (!data.exists) return null;

  const checkpoints = data.checkpoints ?? [];

  const timeline = checkpoints.map((step, index) => ({
    id: `checkpoint-${index}`,
    type: "STEP" as const,
    title: `Checkpoint ${index + 1}`,
    actor: step.actor,
    timestamp: new Date(step.timestamp * 1000).toISOString(),
    description: `Metadata: ${step.metadataUri} | Verification: ${step.status}`,
    transactionHash: step.transactionHash,
    blockNumber: step.blockNumber,
    explorerUrl: `https://sepolia.etherscan.io/tx/${step.transactionHash}`,
    source: "BLOCKCHAIN_STEP" as const,
  }));

  return {
    tokenId,
    productName: "Craft-Chain Batch",
    artisan: data.owner,
    status: "VERIFIED",
    description: `On-chain verification: ${data.verificationStatus}`,
    timeline,
    verified: data.verified,
    checkpoints,
    history: data.history,
    verificationStatus: data.verificationStatus,
  };
}
