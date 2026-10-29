import { NextResponse } from "next/server";
import { Contract, JsonRpcProvider, Wallet, keccak256, toUtf8Bytes } from "ethers";
import { storeMetadata } from "../../lib/ipfsStorage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ABI = [
  "function recordStep(uint256 tokenId, string calldata metadataURI, bytes32 dataHash) external",
  "function ownerOf(uint256 tokenId) view returns (address)",
];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tokenId, stepType, description, location, stepDate } = body;

    if (!tokenId || !stepType || !description || !location || !stepDate) {
      return NextResponse.json(
        { error: "Please complete all fields before recording." },
        { status: 400 }
      );
    }

    const rpcUrl = process.env.SEPOLIA_RPC_URL;
    const privKey = process.env.SEPOLIA_PRIVATE_KEY;
    const contractAddress = process.env.CRAFTCHAIN_CONTRACT_ADDRESS;

    if (!rpcUrl || !privKey || !contractAddress) {
      return NextResponse.json(
        { error: "Server blockchain credentials are not configured in .env.local" },
        { status: 500 }
      );
    }

    // 1. Format metadata matching Person 2 specification
    const stepMetadata = {
      type: stepType,
      description: description.trim(),
      location: location.trim(),
      timestamp: stepDate.includes("T") ? stepDate : `${stepDate}T12:00:00Z`,
    };

    // 2. Compute canonical JSON and Keccak-256 hash
    const canonicalJSON = JSON.stringify(stepMetadata);
    const dataHash = keccak256(toUtf8Bytes(canonicalJSON));

    // 3. Store step metadata in IPFS
    const uploadResult = await storeMetadata(
      stepMetadata,
      `step-${Date.now()}.json`
    );

    // 4. Check token ownership
    const provider = new JsonRpcProvider(rpcUrl);
    const wallet = new Wallet(privKey, provider);
    const contract = new Contract(contractAddress, ABI, wallet);

    let currentOwner = "";
    try {
      currentOwner = await contract.ownerOf(BigInt(tokenId));
    } catch {
      return NextResponse.json(
        { error: `Batch #${tokenId} does not exist on-chain.` },
        { status: 404 }
      );
    }

    const isServerOwner = currentOwner.toLowerCase() === wallet.address.toLowerCase();

    // 5. If server wallet is the current owner, execute directly on-chain
    if (isServerOwner) {
      const tx = await contract.recordStep(BigInt(tokenId), uploadResult.uri, dataHash);
      const receipt = await tx.wait(1);

      return NextResponse.json({
        success: true,
        executedOnChain: true,
        transactionHash: receipt?.hash,
        blockNumber: receipt?.blockNumber,
        tokenId,
        actor: wallet.address,
        metadataUri: uploadResult.uri,
        dataHash,
        explorerUrl: `https://sepolia.etherscan.io/tx/${receipt?.hash}`,
      });
    }

    // 6. Otherwise return prepared IPFS proof and hash for user's wallet (MetaMask)
    return NextResponse.json({
      success: true,
      readyForWallet: true,
      tokenId,
      currentOwner,
      contractAddress,
      metadataUri: uploadResult.uri,
      dataHash,
      message: "Metadata and cryptographic proof generated. Ready to submit via connected wallet.",
    });
  } catch (error) {
    console.error("Record step API error:", error);
    const msg = error instanceof Error ? error.message : "Failed to record supply chain step.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
