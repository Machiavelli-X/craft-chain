import { NextResponse } from "next/server";
import { Contract, JsonRpcProvider, Wallet, id } from "ethers";
import { storeMetadata } from "../../lib/ipfsStorage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ABI = [
  "function mint(address to, string calldata metadataURI) external returns (uint256)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productName, description, origin, material, productionDate, recipientAddress } = body;

    if (!productName || !description || !origin || !material || !productionDate) {
      return NextResponse.json(
        { error: "Please fill in all required batch fields." },
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

    // 1. Prepare and store batch metadata to IPFS
    const batchMetadata = {
      name: productName.trim(),
      description: description.trim(),
      image: "ipfs://bafkreih4s5p6v3z74ekqvd2q2c2h3w4mhyfcfh2y7b22w55jdfcwh3hyze",
      attributes: [
        { trait_type: "Material", value: material.trim() },
        { trait_type: "Origin", value: origin.trim() },
        { trait_type: "Production Date", value: productionDate },
      ],
    };

    const uploadResult = await storeMetadata(
      batchMetadata,
      `batch-${Date.now()}.json`
    );

    // 2. Initialize provider and admin wallet
    const provider = new JsonRpcProvider(rpcUrl);
    const wallet = new Wallet(privKey, provider);

    const targetRecipient =
      recipientAddress && /^0x[a-fA-F0-9]{40}$/.test(recipientAddress)
        ? recipientAddress
        : wallet.address;

    // 3. Call mint on CraftChain contract
    const contract = new Contract(contractAddress, ABI, wallet);
    const tx = await contract.mint(targetRecipient, uploadResult.uri);
    const receipt = await tx.wait(1);

    if (!receipt) {
      throw new Error("Transaction was mined but no receipt was received.");
    }

    // 4. Extract minted tokenId from Transfer event
    const transferTopic = id("Transfer(address,address,uint256)");
    let tokenId = "";

    for (const log of receipt.logs) {
      if (log.topics[0] === transferTopic && log.topics[3]) {
        tokenId = BigInt(log.topics[3]).toString();
        break;
      }
    }

    return NextResponse.json({
      success: true,
      tokenId: tokenId || "1",
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      metadataUri: uploadResult.uri,
      cid: uploadResult.cid,
      recipient: targetRecipient,
      explorerUrl: `https://sepolia.etherscan.io/tx/${receipt.hash}`,
    });
  } catch (error) {
    console.error("Mint API failed:", error);
    const msg = error instanceof Error ? error.message : "Mint transaction failed.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
