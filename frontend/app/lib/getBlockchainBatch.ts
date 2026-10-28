
import {
  Interface,
  JsonRpcProvider,
  id,
  zeroPadValue,
  toBeHex,
} from "ethers";
import type { Batch, TimelineEvent } from "../data/mockBatch";

const CONTRACT_ADDRESS =
  "0x8F629d8F10a01091E363C561a8416E7489738f43";

const RPC_URL = "https://ethereum-sepolia-rpc.publicnode.com";

const contractInterface = new Interface([
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function tokenURI(uint256 tokenId) view returns (string)",
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
  "event StepRecorded(uint256 indexed tokenId, address indexed actor, string metadataURI, bytes32 dataHash, uint256 timestamp)",
]);

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const ZERO_ADDRESS_TOPIC = "0x" + "0".repeat(64);

function ipfsUrl(uri: string): string {
  if (uri.startsWith("ipfs://")) {
    return `https://gateway.pinata.cloud/ipfs/${uri
      .slice(7)
      .replace(/^ipfs\//, "")}`;
  }

  return uri;
}

async function readMetadata(
  uri: string
): Promise<Record<string, unknown>> {
  try {
    const response = await fetch(ipfsUrl(uri), {
      signal: AbortSignal.timeout(8000),
      cache: "no-store",
    });

    if (!response.ok) return {};

    const data: unknown = await response.json();

    if (
      typeof data === "object" &&
      data !== null &&
      !Array.isArray(data)
    ) {
      return data as Record<string, unknown>;
    }
  } catch {
    // Verification can continue if the metadata gateway is unavailable.
  }

  return {};
}

function textValue(value: unknown): string | undefined {
  return typeof value === "string" && value.trim()
    ? value.trim()
    : undefined;
}

export async function getBlockchainBatch(
  tokenId: number
): Promise<Batch | null> {
  if (!Number.isSafeInteger(tokenId) || tokenId <= 0) {
    return null;
  }

  const provider = new JsonRpcProvider(RPC_URL);

  try {
    const network = await provider.getNetwork();

    if (network.chainId !== BigInt(11155111)) {
      throw new Error("The RPC endpoint is not connected to Sepolia.");
    }

    const latestBlock = await provider.getBlockNumber();

    const ownerData = await provider.call({
      to: CONTRACT_ADDRESS,
      data: contractInterface.encodeFunctionData("ownerOf", [tokenId]),
    });

    const [owner] = contractInterface.decodeFunctionResult(
      "ownerOf",
      ownerData
    );

    if (!owner) return null;

    const tokenUriData = await provider.call({
      to: CONTRACT_ADDRESS,
      data: contractInterface.encodeFunctionData("tokenURI", [tokenId]),
    });

    const [metadataUri] = contractInterface.decodeFunctionResult(
      "tokenURI",
      tokenUriData
    );

    const uri = String(metadataUri);
    const metadata = await readMetadata(uri);
    const tokenTopic = zeroPadValue(toBeHex(tokenId), 32);

    const transferTopics = [
      id("Transfer(address,address,uint256)"),
      null,
      null,
      tokenTopic,
    ];

    const stepTopics = [
      id("StepRecorded(uint256,address,string,bytes32,uint256)"),
      tokenTopic,
    ];

    const transferLogs: Awaited<
      ReturnType<typeof provider.getLogs>
    > = [];

    const stepLogs: Awaited<
      ReturnType<typeof provider.getLogs>
    > = [];

    // Search backward in small chunks to respect RPC block-range limits.
    let endBlock = latestBlock;
    const chunkSize = 10_000;

    while (endBlock >= 0) {
      const startBlock = Math.max(0, endBlock - chunkSize + 1);

      const [chunkTransfers, chunkSteps] = await Promise.all([
        provider.getLogs({
          address: CONTRACT_ADDRESS,
          fromBlock: startBlock,
          toBlock: endBlock,
          topics: transferTopics,
        }),
        provider.getLogs({
          address: CONTRACT_ADDRESS,
          fromBlock: startBlock,
          toBlock: endBlock,
          topics: stepTopics,
        }),
      ]);

      transferLogs.push(...chunkTransfers);
      stepLogs.push(...chunkSteps);

      // A token's mint event identifies when its history begins.
      const mintFound = chunkTransfers.some(
        (log) =>
          log.topics[1]?.toLowerCase() === ZERO_ADDRESS_TOPIC
      );

      if (mintFound) break;

      endBlock = startBlock - 1;
    }

    const allLogs = [
      ...transferLogs.map((log) => ({
        log,
        kind: "transfer" as const,
      })),
      ...stepLogs.map((log) => ({
        log,
        kind: "step" as const,
      })),
    ].sort(
      (a, b) =>
        a.log.blockNumber - b.log.blockNumber ||
        a.log.index - b.log.index
    );

    const blockTimestamps = new Map<number, number>();

    const timeline: TimelineEvent[] = await Promise.all(
      allLogs.map(async ({ log, kind }) => {
        let timestamp = blockTimestamps.get(log.blockNumber);

        if (timestamp === undefined) {
          const block = await provider.getBlock(log.blockNumber);
          timestamp = block?.timestamp ?? 0;
          blockTimestamps.set(log.blockNumber, timestamp);
        }

        const parsed = contractInterface.parseLog({
          topics: [...log.topics],
          data: log.data,
        });

        if (!parsed) {
          throw new Error("Unable to decode a contract event.");
        }

        if (kind === "transfer") {
          const from = String(parsed.args[0]);
          const to = String(parsed.args[1]);

          const minted =
            from.toLowerCase() === ZERO_ADDRESS.toLowerCase();

          return {
            id: log.transactionHash + "-" + log.index,
            type: minted ? "CREATED" : "TRANSFER",
            title: minted ? "NFT Minted" : "Ownership Transferred",
            actor: to,
            timestamp: new Date(timestamp * 1000).toISOString(),
            description: minted
              ? `Token #${tokenId} was minted to ${to}.`
              : `Ownership transferred from ${from} to ${to}.`,
            transactionHash: log.transactionHash,
            blockNumber: log.blockNumber,
            explorerUrl: `https://sepolia.etherscan.io/tx/${log.transactionHash}`,
            source: minted
              ? "BLOCKCHAIN_CREATED"
              : "BLOCKCHAIN_TRANSFER",
          };
        }

        return {
          id: log.transactionHash + "-" + log.index,
          type: "STEP",
          title: "Supply-Chain Step Recorded",
          actor: String(parsed.args[1]),
          timestamp: new Date(timestamp * 1000).toISOString(),
          description:
            `Metadata: ${String(parsed.args[2])} | ` +
            `Data hash: ${String(parsed.args[3])}`,
          transactionHash: log.transactionHash,
          blockNumber: log.blockNumber,
          explorerUrl: `https://sepolia.etherscan.io/tx/${log.transactionHash}`,
          source: "BLOCKCHAIN_STEP",
        };
      })
    );

    const attributes = Array.isArray(metadata.attributes)
      ? (metadata.attributes as Array<Record<string, unknown>>)
      : [];

    const artisanAttribute = attributes.find(
      (attribute) =>
        String(attribute.trait_type ?? "").toLowerCase() === "artisan"
    );

    const productName =
      textValue(metadata.productName) ??
      textValue(metadata.name) ??
      `Craft Product #${tokenId}`;

    const artisan =
      textValue(metadata.artisan) ??
      textValue(artisanAttribute?.value) ??
      "Not specified in NFT metadata";

    const description =
      textValue(metadata.description) ??
      "No description is available in the NFT metadata.";

    return {
      tokenId,
      productName,
      artisan,
      description,
      status: "VERIFIED",
      timeline,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : String(error);

    if (
      /execution reverted|call exception|could not decode result data|BAD_DATA/i.test(
        message
      )
    ) {
      return null;
    }

    console.error("Sepolia verification failed:", message);

    throw new Error(
      "Unable to verify this token on Sepolia right now. Please try again."
    );
  } finally {
    provider.destroy();
  }
}