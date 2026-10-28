import { TimelineEvent } from "../data/mockBatch";

export type BlockchainEvent = {
  id: string;
  type: "CREATED" | "STEP" | "TRANSFER";
  actor: string;
  timestamp: string;
  transactionHash: string;
  blockNumber?: number;
  explorerUrl?: string;
  title?: string;
  description?: string;
  source:
  | "BLOCKCHAIN_CREATED"
  | "BLOCKCHAIN_TRANSFER"
  | "BLOCKCHAIN_STEP";
};

export function normalizeBlockchainEvent(
  event: BlockchainEvent
): TimelineEvent {
  let title = event.title;
  let description = event.description;

  if (!title) {
    switch (event.type) {
      case "CREATED":
        title = "Batch Created";
        break;

      case "STEP":
        title = "Production Step Recorded";
        break;

      case "TRANSFER":
        title = "Batch Transferred";
        break;
    }
  }

  if (!description) {
    switch (event.type) {
      case "CREATED":
        description = "The craft batch was registered on Craft Chain.";
        break;

      case "STEP":
        description = "A production step was recorded on the blockchain.";
        break;

      case "TRANSFER":
        description = "Custody of the craft batch was transferred.";
        break;
    }
  }

  return {
    id: event.id,
    type: event.type,
    title,
    actor: event.actor,
    timestamp: event.timestamp,
    description,
    transactionHash: event.transactionHash,
    blockNumber: event.blockNumber,
    explorerUrl: event.explorerUrl,
    source: event.source,
  };
}

export function normalizeBlockchainEvents(
  events: BlockchainEvent[]
): TimelineEvent[] {
  return events.map(normalizeBlockchainEvent);
}

export function createMockTimeline(): TimelineEvent[] {
  const blockchainEvents: BlockchainEvent[] = [
    {
      id: "blockchain-1",
      type: "CREATED",
      actor: "0xArtisan",
      timestamp: "2026-09-12",
      transactionHash: "0xabc123",
      blockNumber: 1001,
      source: "BLOCKCHAIN_CREATED",
    },
    {
      id: "blockchain-2",
      type: "STEP",
      actor: "0xArtisan",
      timestamp: "2026-09-13",
      transactionHash: "0xdef456",
      blockNumber: 1010,
      title: "Production Completed",
      description: "The weaving process was completed.",
      source: "BLOCKCHAIN_STEP",
    },
    {
      id: "blockchain-3",
      type: "TRANSFER",
      actor: "0xCooperative",
      timestamp: "2026-09-14",
      transactionHash: "0xghi789",
      blockNumber: 1025,
      source: "BLOCKCHAIN_TRANSFER",
    },
  ];

  return sortTimelineEvents(
    normalizeBlockchainEvents(blockchainEvents)
  );
}

export function sortTimelineEvents(
  events: TimelineEvent[]
): TimelineEvent[] {
  return [...events].sort((a, b) => {
    if (
      a.blockNumber !== undefined &&
      b.blockNumber !== undefined
    ) {
      return a.blockNumber - b.blockNumber;
    }

    return (
      new Date(a.timestamp).getTime() -
      new Date(b.timestamp).getTime()
    );
  });
}

export function buildUnifiedTimeline(
  transferEvents: BlockchainEvent[],
  stepEvents: BlockchainEvent[]
): TimelineEvent[] {
  const allEvents = [
    ...transferEvents,
    ...stepEvents,
  ];

  return sortTimelineEvents(
    normalizeBlockchainEvents(allEvents)
  );
}