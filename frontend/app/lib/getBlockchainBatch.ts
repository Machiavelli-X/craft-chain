import { Batch, TimelineEvent } from "../data/mockBatch";
import { getMetadata } from "./ipfsStorage";

type ApiCheckpoint = {
  blockNumber: number;
  actor: string;
  metadataUri: string;
  dataHash: string;
  timestamp: number | string;
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
  metadataUri?: string;
};

export async function getBlockchainBatch(
  tokenId: number
): Promise<VerificationBatch | null> {
  if (!Number.isInteger(tokenId) || tokenId <= 0) return null;

  const appUrl =
    process.env.CRAFTCHAIN_APP_URL ||
    "http://127.0.0.1:3000";

  try {
    const response = await fetch(
      `${appUrl.replace(/\/$/, "")}/api/verify?tokenId=${tokenId}&mode=checkpoints`,
      { cache: "no-store" }
    );

    if (!response.ok) {
      console.error(`Verification API returned ${response.status}`);
      return null;
    }

    const data: VerifyResponse = await response.json();

    if (!data.exists) return null;

    let productName = `Craft-Chain Batch #${tokenId}`;
    let description = `On-chain verification: ${data.verificationStatus}`;
    const artisan = data.owner;

    // Attempt to load rich metadata if IPFS metadataUri is present
    if (data.metadataUri && data.metadataUri.startsWith("ipfs://")) {
      const cid = data.metadataUri.replace("ipfs://", "").split("/")[0];
      try {
        const meta = await getMetadata(cid);
        if (meta) {
          if (typeof meta.name === "string") productName = meta.name;
          if (typeof meta.description === "string") description = meta.description;
        }
      } catch {
        // Fallback to default
      }
    }

    const checkpoints = data.checkpoints ?? [];

    const timeline: TimelineEvent[] = await Promise.all(
      checkpoints.map(async (step, index) => {
        let stepTitle = `Checkpoint ${index + 1}`;
        let stepDesc = `Metadata: ${step.metadataUri} | Verification: ${step.status}`;
        let stepType: "CREATED" | "STEP" | "TRANSFER" = "STEP";

        if (step.metadataUri && step.metadataUri.startsWith("ipfs://")) {
          const stepCid = step.metadataUri.replace("ipfs://", "").split("/")[0];
          try {
            const stepJson = await getMetadata(stepCid);
            if (stepJson) {
              const sType = typeof stepJson.type === "string" ? stepJson.type : "";
              const sLoc = typeof stepJson.location === "string" ? stepJson.location : "";
              const sDesc = typeof stepJson.description === "string" ? stepJson.description : "";
              if (sType) {
                stepTitle = `${sType}${sLoc ? ` - ${sLoc}` : ""}`;
                const lowerType = sType.toLowerCase();
                if (
                  lowerType.includes("transfer") ||
                  lowerType.includes("received") ||
                  lowerType.includes("delivered")
                ) {
                  stepType = "TRANSFER";
                }
              }
              if (sDesc) {
                stepDesc = `${sDesc} (Verification: ${step.status})`;
              }
            }
          } catch {
            // Keep default description
          }
        }

        const rawTimestamp = Number(step.timestamp);
        const formattedDate =
          !isNaN(rawTimestamp) && rawTimestamp > 0
            ? new Date(rawTimestamp * 1000).toISOString().split("T")[0]
            : "Unknown Date";

        return {
          id: `checkpoint-${index}`,
          type: stepType,
          title: stepTitle,
          actor: step.actor,
          timestamp: formattedDate,
          description: stepDesc,
          transactionHash: step.transactionHash,
          blockNumber: step.blockNumber,
          explorerUrl: `https://sepolia.etherscan.io/tx/${step.transactionHash}`,
          source: "BLOCKCHAIN_STEP" as const,
        };
      })
    );

    return {
      tokenId,
      productName,
      artisan,
      status: "VERIFIED",
      description,
      timeline,
      verified: data.verified,
      checkpoints,
      history: data.history,
      verificationStatus: data.verificationStatus,
      metadataUri: data.metadataUri,
    };
  } catch (error) {
    console.error("Error fetching blockchain batch:", error);
    return null;
  }
}
