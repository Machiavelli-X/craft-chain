export type TimelineEvent = {
  id: string;
  type: "CREATED" | "STEP" | "TRANSFER";
  title: string;
  actor: string;
  timestamp: string;
  description: string;
  transactionHash: string;
blockNumber?: number;
explorerUrl?: string;
source:
  | "BLOCKCHAIN_CREATED"
  | "BLOCKCHAIN_TRANSFER"
  | "BLOCKCHAIN_STEP";
};

export type BlockchainBatchData = {
  tokenId: number;
  productName: string;
  artisan: string;
  description: string;
  metadataUri?: string;
};

export type Batch = {
  tokenId: number;
  productName: string;
  artisan: string;
  status: "VERIFIED" | "NOT_FOUND";
  description: string;
  timeline: TimelineEvent[];
};

export const mockBatch: Batch = {
  tokenId: 1,

  productName: "Handwoven Sambalpuri Saree",

  artisan: "Artisan A",

  status: "VERIFIED",

  description:
    "A traditional handwoven craft product with a recorded journey from artisan to buyer.",

  timeline: [
    {
      id: "event-1",
      type: "CREATED",
      title: "Batch Created",
      actor: "Artisan A",
      timestamp: "2026-09-12",
      description: "The craft batch was registered on Craft Chain.",
      transactionHash: "0xexample001",
      source: "BLOCKCHAIN_STEP",
    },

    {
      id: "event-2",
      type: "STEP",
      title: "Production Completed",
      actor: "Artisan A",
      timestamp: "2026-09-13",
      description: "The weaving process was completed.",
      transactionHash: "0xexample002",
      source: "BLOCKCHAIN_STEP",
    },

    {
      id: "event-3",
      type: "TRANSFER",
      title: "Transferred to Cooperative",
      actor: "Cooperative",
      timestamp: "2026-09-14",
      description: "Custody of the batch was transferred to the cooperative.",
      transactionHash: "0xexample003",
      source: "BLOCKCHAIN_STEP",
    },

    {
      id: "event-4",
      type: "TRANSFER",
      title: "Transferred to Retailer",
      actor: "Retailer",
      timestamp: "2026-09-18",
      description: "The cooperative transferred the batch to the retailer.",
      transactionHash: "0xexample004",
      source: "BLOCKCHAIN_STEP",
    },

    {
      id: "event-5",
      type: "TRANSFER",
      title: "Purchased by Buyer",
      actor: "Buyer",
      timestamp: "2026-09-25",
      description: "The final buyer received the craft product.",
      transactionHash: "0xexample005",
      source: "BLOCKCHAIN_STEP",
    },
  ],
};