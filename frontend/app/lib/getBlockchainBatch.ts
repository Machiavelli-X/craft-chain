import { Batch, mockBatch } from "../data/mockBatch";
import { createMockTimeline } from "./timeline";

export async function getBlockchainBatch(
  tokenId: number
): Promise<Batch | null> {
  // Temporary mock implementation.
  // Later, this function will read the real blockchain contract.

  if (tokenId !== 1) {
    return null;
  }

  return {
    ...mockBatch,
    tokenId,
    timeline: createMockTimeline(),
  };
}