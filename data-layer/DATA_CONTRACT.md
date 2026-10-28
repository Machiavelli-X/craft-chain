
# Craft-Chain Data Contract

## 1. Overview

The Craft-Chain data layer stores batch and supply-chain step metadata on IPFS using Pinata.

The data layer provides:
- Batch metadata creation and upload.
- Supply-chain step metadata creation and upload.
- CID and `ipfs://` URI generation.
- Keccak-256 hashing of step metadata.
- Metadata retrieval from IPFS.
- Integrity verification by comparing hashes.
- Required-field validation.

The smart contract stores the batch metadata URI when a token is minted. Supply-chain steps are recorded through the `recordStep()` function, which emits a `StepRecorded` event.

## 2. Batch Metadata

### 2.1 Schema

Batch metadata is created by `createBatchMetadata()`.

Required input fields:

| Field | Description |
|---|---|
| `name` | Name of the craft batch or product |
| `description` | Description of the batch |
| `image` | Image URL or IPFS URI |
| `material` | Material used |
| `origin` | Place of origin |
| `productionDate` | Production date |

The generated metadata contains `name`, `description`, `image`, and an `attributes` array.

### 2.2 Example

```json
{
  "name": "Craft Batch #1",
  "description": "Handcrafted cotton textile batch",
  "image": "ipfs://IMAGE_CID",
  "attributes": [
    {
      "trait_type": "Material",
      "value": "Cotton"
    },
    {
      "trait_type": "Origin",
      "value": "Odisha"
    },
    {
      "trait_type": "Production Date",
      "value": "2026-09-29"
    }
  ]
}
```

### 2.3 Processing a batch

```javascript
import { processBatch } from "./index.js";

const result = await processBatch({
  name: "Craft Batch #1",
  description: "Handcrafted cotton textile batch",
  image: "ipfs://IMAGE_CID",
  material: "Cotton",
  origin: "Odisha",
  productionDate: "2026-09-29"
});

console.log(result.metadata);
console.log(result.cid);
console.log(result.uri);
```

The result contains:

- `metadata`: generated batch metadata.
- `cid`: IPFS content identifier.
- `uri`: metadata URI in the form `ipfs://<CID>`.

### 2.4 Minting a batch

Pass the returned URI to the smart contract:

```javascript
const result = await processBatch(batchInput);

const tx = await craftChain.mint(
  recipientAddress,
  result.uri
);

await tx.wait();
```

The caller must have the required `MINTER_ROLE`. The transaction example assumes `craftChain` is an initialized contract instance.

## 3. Supply-Chain Step Metadata

### 3.1 Schema

Step metadata is created by `createStepMetadata()`.

Required input fields:

| Field | Description |
|---|---|
| `type` | Type of supply-chain activity |
| `description` | Description of the activity |
| `location` | Location where the activity occurred |
| `timestamp` | Timestamp associated with the activity |

### 3.2 Example

```json
{
  "type": "processing",
  "description": "Cotton processed",
  "location": "Sambalpur, Odisha",
  "timestamp": "2026-09-29T10:30:00Z"
}
```

### 3.3 Processing a step

```javascript
import { processStep } from "./index.js";

const result = await processStep({
  type: "processing",
  description: "Cotton processed",
  location: "Sambalpur, Odisha",
  timestamp: "2026-09-29T10:30:00Z"
});

console.log(result.metadata);
console.log(result.canonicalJSON);
console.log(result.cid);
console.log(result.uri);
console.log(result.hash);
```

The result contains:

- `metadata`: generated step metadata.
- `canonicalJSON`: JSON string used for hashing.
- `cid`: IPFS content identifier.
- `uri`: IPFS metadata URI.
- `hash`: Keccak-256 hash represented as a `bytes32`-compatible hexadecimal string.

### 3.4 Recording a step on-chain

```javascript
const result = await processStep(stepInput);

const tx = await craftChain.recordStep(
  tokenId,
  result.uri,
  result.hash
);

await tx.wait();
```

The caller must own the specified token because the current contract checks `ownerOf(tokenId) == msg.sender`.

The transaction emits a `StepRecorded` event containing:

- `tokenId`
- `actor`
- `metadataURI`
- `dataHash`
- `timestamp`

**Important:** The current contract emits an event for each step. It does not store a step-history array in contract storage. The frontend should read `StepRecorded` events to display the recorded history.

## 4. Canonical JSON and Hashing

Step metadata is hashed using the `hashStepMetadata()` function.

The current implementation:

1. Serializes the metadata with `JSON.stringify()`.
2. Converts the resulting JSON string to UTF-8 bytes.
3. Calculates the Keccak-256 hash using `ethers`.

Example:

```javascript
import { hashStepMetadata } from "./utils/hashing.js";

const { canonicalJSON, hash } = hashStepMetadata(stepMetadata);

console.log(canonicalJSON);
console.log(hash);
```

The hash is calculated over the serialized metadata, not the IPFS CID or URI.

**Serialization requirement:** The metadata must be serialized consistently when generating and verifying the hash. The current implementation uses `JSON.stringify()`; it does not implement a general-purpose canonical JSON standard.

## 5. IPFS Upload and Retrieval

### 5.1 Upload

`uploadJSON(data, filename)` uploads a JSON object through Pinata.

The result contains:

```javascript
{
  cid: "<IPFS_CID>",
  uri: "ipfs://<IPFS_CID>",
  jsonString: "<serialized JSON>"
}
```

The upload function requires an object and a filename.

### 5.2 Retrieval

`getJSON(cid)` retrieves metadata from the configured Pinata gateway.

```javascript
import { getJSON } from "./index.js";

const metadata = await getJSON(
  "YOUR_IPFS_CID"
);

console.log(metadata);
```

The current retrieval function expects a CID, not an `ipfs://` URI. If the caller has a URI, it should extract the CID before calling `getJSON()`.

## 6. Integrity Verification

The public `verifyStep(cid, expectedHash)` function retrieves the metadata from IPFS, recalculates its hash, and compares it with the expected hash.

```javascript
import { verifyStep } from "./index.js";

const result = await verifyStep(
  "YOUR_STEP_CID",
  "0xYOUR_EXPECTED_HASH"
);

if (result.verified) {
  console.log("Metadata verified");
} else {
  console.log("Metadata integrity check failed");
}
```

The result contains:

- `verified`: whether the hashes match.
- `metadata`: retrieved metadata.
- `calculatedHash`: hash calculated from retrieved metadata.
- `expectedHash`: hash supplied for comparison.

A mismatch indicates that the retrieved metadata does not produce the expected hash. Verification errors, such as an unavailable CID or gateway failure, should be handled separately from a hash mismatch.

## 7. Validation and Errors

`validateRequiredFields(data, fields)` checks whether required fields are missing, null, or empty strings.

The step and batch processors validate their required input fields before creating and uploading metadata.

Examples of errors include:

- `Missing required fields: description`
- `PINATA_JWT is not configured in .env`
- `PINATA_GATEWAY is not configured in .env`
- `IPFS upload failed: ...`
- `IPFS retrieval failed: ...`

Callers should handle rejected promises and display suitable errors to users.

## 8. Public API Reference

The public exports in `index.js` are:

| Function | Purpose | Main return values |
|---|---|---|
| `processBatch(input)` | Validate, create, and upload batch metadata | `metadata`, `cid`, `uri` |
| `processStep(input)` | Validate, create, upload, and hash step metadata | `metadata`, `canonicalJSON`, `cid`, `uri`, `hash` |
| `verifyStep(cid, expectedHash)` | Retrieve step metadata and verify its hash | `verified`, `metadata`, `calculatedHash`, `expectedHash` |
| `getJSON(cid)` | Retrieve JSON from IPFS | Parsed JSON object |

These functions are asynchronous where they perform network operations. Call them with `await` and handle errors.

## 9. Environment Configuration

The data layer uses these environment variables:

```dotenv
PINATA_JWT=your_pinata_jwt
PINATA_GATEWAY=your_pinata_gateway
```

Store real values in `data-layer/.env`. Never commit this file or expose the JWT in frontend code.

The repository's `data-layer/.gitignore` excludes `.env` and `node_modules/`.

## 10. Integration Responsibilities

### Person 2 — Off-chain data layer

- Create and validate metadata.
- Upload metadata to IPFS.
- Return CIDs and URIs.
- Generate step hashes.
- Retrieve metadata and verify its integrity.

### Person 1 — Smart contract

- Mint batch tokens using metadata URIs.
- Accept step metadata URIs and hashes through `recordStep()`.
- Emit `StepRecorded` events.

### Person 3 — Frontend and Web3 integration

- Call `processBatch()` before minting a batch.
- Pass the returned URI to `mint()`.
- Call `processStep()` before recording a supply-chain step.
- Pass the returned URI and hash to `recordStep()`.
- Wait for transaction confirmation.
- Read `StepRecorded` events to display step history.
- Use `getJSON()` and `verifyStep()` to retrieve and verify metadata.

The data-layer functions are Node.js ES modules. Because the IPFS client uses a Pinata JWT, frontend applications should invoke these operations through a trusted backend rather than expose the JWT in browser code.
