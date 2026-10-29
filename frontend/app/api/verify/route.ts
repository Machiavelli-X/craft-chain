
import { NextResponse } from "next/server";
import {
  Contract,
  JsonRpcProvider,
  keccak256,
  toUtf8Bytes,
} from "ethers";
import { getMetadata } from "../../lib/ipfsStorage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ABI = [
  "function tokenURI(uint256 tokenId) view returns (string)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "event StepRecorded(uint256 indexed tokenId, address indexed actor, string metadataURI, bytes32 dataHash, uint256 timestamp)",
];

const SEPOLIA_CHAIN_ID = BigInt(11155111);
const CHUNK_SIZE = 1000;
const MAX_RANGE = 50000;

type CheckpointStatus =
  | "MATCH"
  | "MISMATCH"
  | "UNVERIFIABLE";

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

function extractCid(uri: string): string | null {
  // Support ipfs://CID and ipfs://CID/path
  const match = uri.match(
    /^ipfs:\/\/([^/?#]+)(?:\/[^?#]*)?(?:\?[^#]*)?(?:#.*)?$/i
  );

  if (!match) return null;

  const cid = match[1];

  // Basic defensive validation.
  // Gateway retrieval is still subject to the configured host.
  if (!/^[a-zA-Z0-9]+$/.test(cid)) return null;

  if (cid.length < 20 || cid.length > 100) return null;

  return cid;
}


async function verifyMetadata(
  metadataUri: string,
  expectedHash: string
) {
  const cid = extractCid(metadataUri);

  if (!cid) {
    return {
      status: "UNVERIFIABLE" as CheckpointStatus,
      reason: "Unsupported metadata URI",
    };
  }

  const gateway = process.env.PINATA_GATEWAY;

  try {
    let metadata: unknown = null;

    if (gateway && /^[a-zA-Z0-9.-]+$/.test(gateway)) {
      try {
        const url = `https://${gateway}/ipfs/${cid}`;
        const response = await fetch(url, {
          signal: AbortSignal.timeout(5000),
          cache: "no-store",
        });
        if (response.ok) {
          metadata = await response.json();
        }
      } catch {
        // Gateway failed or timed out, fall back below
      }
    }

    if (!metadata) {
      metadata = await getMetadata(cid);
    }

    if (!metadata) {
      return {
        status: "UNVERIFIABLE" as CheckpointStatus,
        reason: "Metadata could not be retrieved from gateway or storage",
      };
    }

    if (
      typeof metadata !== "object" ||
      Array.isArray(metadata)
    ) {
      return {
        status: "UNVERIFIABLE" as CheckpointStatus,
        reason: "Metadata is not a JSON object",
      };
    }

    // Must match hashing method:
    // JSON.stringify(metadata) -> UTF-8 -> Keccak-256
    const canonicalJSON = JSON.stringify(metadata);

    if (canonicalJSON === undefined) {
      return {
        status: "UNVERIFIABLE" as CheckpointStatus,
        reason: "Metadata serialization failed",
      };
    }

    const calculatedHash = keccak256(
      toUtf8Bytes(canonicalJSON)
    );

    const verified =
      calculatedHash.toLowerCase() ===
      expectedHash.toLowerCase();

    return {
      status: verified
        ? ("MATCH" as const)
        : ("MISMATCH" as const),
      calculatedHash,
    };
  } catch {
    return {
      status: "UNVERIFIABLE" as CheckpointStatus,
      reason: "Metadata retrieval or processing failed",
    };
  }
}

export async function GET(request: Request) {
  try {
    const rpcUrl = process.env.SEPOLIA_RPC_URL;
    const address = process.env.CRAFTCHAIN_CONTRACT_ADDRESS;

    if (!rpcUrl || !address) {
      return jsonError(
        "Server environment is not configured",
        500
      );
    }

    const { searchParams } = new URL(request.url);

    const tokenId = searchParams.get("tokenId");

    if (!tokenId || !/^[1-9]\d*$/.test(tokenId)) {
      return jsonError(
        "Provide a valid positive tokenId",
        400
      );
    }

    const provider = new JsonRpcProvider(rpcUrl);
    const network = await provider.getNetwork();

    if (network.chainId !== SEPOLIA_CHAIN_ID) {
      return jsonError(
        "Configured RPC is not Sepolia",
        503
      );
    }

    const contract = new Contract(
      address,
      ABI,
      provider
    );

    let metadataUri = "";
    let owner = "";

    try {
      [metadataUri, owner] = await Promise.all([
        contract.tokenURI(BigInt(tokenId)),
        contract.ownerOf(BigInt(tokenId)),
      ]);
    } catch (contractErr: unknown) {
      const err = contractErr as {
        code?: string;
        data?: string;
        message?: string;
      };

      if (
        err.code === "CALL_EXCEPTION" ||
        err.data?.startsWith("0x7e273289") ||
        err.message?.includes("nonexistent")
      ) {
        return NextResponse.json({
          tokenId,
          exists: false,
          verified: false,
          verificationStatus: "NOT_FOUND",
          message: "Token does not exist on-chain.",
        });
      }

      throw contractErr;
    }

    const mode = searchParams.get("mode");

    // Preserve existing batch lookup behavior.
    if (mode !== "checkpoints") {
      return NextResponse.json({
        tokenId,
        exists: true,
        owner,
        metadataUri,
        chain: "Sepolia",
        verified: false,
        message:
          "Contract read successful. Metadata integrity has not been checked yet.",
      });
    }

    const configuredStart =
      process.env.CRAFTCHAIN_HISTORY_FROM_BLOCK;

    if (
      !configuredStart ||
      !/^\d+$/.test(configuredStart)
    ) {
      return jsonError(
        "History starting block is not configured",
        500
      );
    }

    const fromBlockParam =
      searchParams.get("fromBlock");

    const toBlockParam =
      searchParams.get("toBlock");

    const fromBlock =
      fromBlockParam === null
        ? Number(configuredStart)
        : Number(fromBlockParam);

    const latestBlock = await provider.getBlockNumber();

    const toBlock =
      toBlockParam === null
        ? latestBlock
        : Number(toBlockParam);

    if (
      !Number.isSafeInteger(fromBlock) ||
      !Number.isSafeInteger(toBlock) ||
      fromBlock < Number(configuredStart) ||
      toBlock < fromBlock ||
      toBlock > latestBlock
    ) {
      return jsonError(
        "Invalid history block range",
        400
      );
    }

    if (toBlock - fromBlock + 1 > MAX_RANGE) {
      return jsonError(
        `Requested range exceeds ${MAX_RANGE} blocks`,
        400
      );
    }

    const filter = contract.filters.StepRecorded(
      BigInt(tokenId)
    );

    const events = [];

    // Keep each eth_getLogs request within provider limit.
    for (
      let start = fromBlock;
      start <= toBlock;
      start += CHUNK_SIZE
    ) {
      const end = Math.min(
        start + CHUNK_SIZE - 1,
        toBlock
      );

      const chunk = await contract.queryFilter(
        filter,
        start,
        end
      );

      events.push(...chunk);
    }

    
const checkpoints = await Promise.all(
  events.map(async (event) => {
    if (!("args" in event)) return null;

    const args = event.args as unknown as {
      tokenId: bigint;
      actor: string;
      metadataURI: string;
      dataHash: string;
      timestamp: bigint;
    };

    const verification = await verifyMetadata(
      args.metadataURI,
      args.dataHash
    );

    return {
      tokenId: args.tokenId.toString(),
      actor: args.actor,
      metadataUri: args.metadataURI,
      dataHash: args.dataHash,
      timestamp: args.timestamp.toString(),
      blockNumber: event.blockNumber,
      transactionHash: event.transactionHash,
      ...verification,
    };
  })
);


    const records = checkpoints.filter(
      (item) => item !== null
    );

    const allMatched =
      records.length > 0 &&
      records.every(
        (item) => item.status === "MATCH"
      );

    return NextResponse.json({
      tokenId,
      exists: true,
      owner,
      metadataUri,
      chain: "Sepolia",
      history: {
        fromBlock,
        toBlock,
        scope: "CONFIGURED_RANGE",
        completeLifetimeHistory: false,
        checkpointCount: records.length,
      },
      checkpoints: records,
      verified: allMatched,
      verificationStatus:
        records.length === 0
          ? "NO_CHECKPOINTS"
          : allMatched
            ? "MATCH"
            : "NOT_FULLY_VERIFIED",
    });
  } catch (error) {
    console.error("Verification API failed:", error);

    return NextResponse.json(
      {
        error: "Unable to retrieve verification data",
        verified: false,
      },
      { status: 503 }
    );
  }
}
