import { NextResponse } from "next/server";
import { Contract, JsonRpcProvider, Wallet } from "ethers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ABI = [
  "function safeTransferFrom(address from, address to, uint256 tokenId) external",
  "function ownerOf(uint256 tokenId) view returns (address)",
];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tokenId, recipient } = body;

    if (!tokenId || !recipient) {
      return NextResponse.json(
        { error: "Token ID and recipient address are required." },
        { status: 400 }
      );
    }

    if (!/^0x[a-fA-F0-9]{40}$/.test(recipient.trim())) {
      return NextResponse.json(
        { error: "Invalid Ethereum recipient address." },
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

    if (isServerOwner) {
      const tx = await contract.safeTransferFrom(
        wallet.address,
        recipient.trim(),
        BigInt(tokenId)
      );
      const receipt = await tx.wait(1);

      return NextResponse.json({
        success: true,
        executedOnChain: true,
        transactionHash: receipt?.hash,
        blockNumber: receipt?.blockNumber,
        tokenId,
        from: wallet.address,
        to: recipient.trim(),
        explorerUrl: `https://sepolia.etherscan.io/tx/${receipt?.hash}`,
      });
    }

    return NextResponse.json({
      success: true,
      readyForWallet: true,
      tokenId,
      currentOwner,
      recipient: recipient.trim(),
      contractAddress,
      message: "Ready to transfer via connected wallet.",
    });
  } catch (error) {
    console.error("Transfer API error:", error);
    const msg = error instanceof Error ? error.message : "Failed to transfer batch ownership.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
