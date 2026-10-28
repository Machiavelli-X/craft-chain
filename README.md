# CraftChain Traceability (ERC-721 Supply Chain Provenance)

**CraftChain** is an Ethereum-based traceability solution designed to track artisanal craft products and production batches across their entire supply chain lifecycle. Each product or batch is minted as a distinct ERC-721 Non-Fungible Token (NFT), recording milestone hand-offs and provenance checkpoints from artisan to final consumer.

---

## 📌 Deployed Contract Details (Ethereum Sepolia)

- **Network:** Ethereum Sepolia Testnet
- **Contract Address:** [`0x900AC68efbE62a47bc40c4A0256fEB6175c77d3a`](https://sepolia.etherscan.io/address/0x900AC68efbE62a47bc40c4A0256fEB6175c77d3a)
- **Etherscan Verification:** [Verified on Sepolia Etherscan](https://sepolia.etherscan.io/address/0x900AC68efbE62a47bc40c4A0256fEB6175c77d3a#code)
- **Standard:** ERC-721 + AccessControl (OpenZeppelin v5)

---

## 🏗️ Architecture & Core Functionality

### 1. Off-Chain / On-Chain Separation
- **Data Privacy & Gas Efficiency:** Large payloads, certifications, raw production metadata, and media remain stored off-chain (e.g., IPFS or Arweave).
- **On-Chain Anchor:** Only metadata URIs (`ipfs://...`) and cryptographic integrity fingerprints (`bytes32 dataHash` such as SHA-256 or Keccak-256) are committed to the blockchain.

### 2. Role-Based Access Control
- **`DEFAULT_ADMIN_ROLE`:** Manages administrative privileges and role assignments.
- **`MINTER_ROLE`:** Authorizes trusted entities (e.g., platform admin or verified co-op leaders) to mint new batch tokens into circulation.

### 3. Key Functions
- **`mint(address to, string calldata metadataURI)`**:
  - Callable exclusively by accounts with `MINTER_ROLE`.
  - Assigns an incremental `tokenId`, safely mints the NFT to the initial recipient (e.g., artisan), and links initial metadata.
- **`recordStep(uint256 tokenId, string calldata metadataURI, bytes32 dataHash)`**:
  - Restricts execution strictly to the **current token owner** (`require(ownerOf(tokenId) == msg.sender, "Not token owner")`).
  - **Event-Driven Provenance Logging:** `recordStep()` intentionally **emits a `StepRecorded` event** rather than storing an append-only array in expensive smart contract storage:
    ```solidity
    event StepRecorded(
        uint256 indexed tokenId,
        address indexed actor,
        string metadataURI,
        bytes32 dataHash,
        uint256 timestamp
    );
    ```
    > **Note on Provenance Timeline Reconstruction:**
    > To conserve contract storage and gas, the full batch provenance timeline is reconstructed by querying and filtering indexed `StepRecorded` events emitted on-chain (`tokenId`, `actor`, `metadataURI`, `dataHash`, and `timestamp`).
- **`safeTransferFrom(address from, address to, uint256 tokenId)`**:
  - Standard ERC-721 transfer enabling physical and digital custody transfer along the supply chain:
    $$\text{Artisan} \longrightarrow \text{Co-operative} \longrightarrow \text{Retailer} \longrightarrow \text{Buyer}$$
  - Upon transfer, only the **new owner** gains permissions to log subsequent production or distribution steps.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm or pnpm

### Installation
Clone the repository and install dependencies:
```bash
git clone https://github.com/Machiavelli-X/craft-chain.git
cd craft-chain/craft_client
npm install
```

### Environment Configuration
Copy `.env.example` to create your local `.env`:
```bash
cp .env.example .env
```
Populate `.env` with your Sepolia RPC endpoint and deployer private key:
```env
SEPOLIA_RPC_URL="https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID"
SEPOLIA_PRIVATE_KEY="YOUR_SEPOLIA_ACCOUNT_PRIVATE_KEY"
```

---

## 🧪 Testing

The repository includes a comprehensive Hardhat and Mocha integration test suite validating role permissions, minting, authorization boundaries, step recording, and custody hand-offs.

Run all tests:
```bash
npx hardhat test
```

### Verified Test Cases (9 passing)
- ✅ Contract deployment & ERC-721 metadata (`Craft Chain` / `CRAFT`)
- ✅ Admin and Minter role initialization
- ✅ Role-restricted batch minting
- ✅ Non-minter minting rejection (`AccessControlUnauthorizedAccount`)
- ✅ Sequential multi-batch minting with isolated metadata
- ✅ Owner step recording authorization & event emission
- ✅ Non-owner step recording rejection (`"Not token owner"`)
- ✅ Dynamic custody transfer: previous owner recording revoked, new owner empowered
- ✅ Full 4-tier supply chain lifecycle: **Admin (mint) $\rightarrow$ Artisan $\rightarrow$ Co-op $\rightarrow$ Retailer $\rightarrow$ Buyer**

---

## 🚢 Deployment to Ethereum Sepolia

To deploy the `CraftChain` contract to the Sepolia testnet:

1. Ensure your deployer address has sufficient Sepolia ETH.
2. Verify network configuration in `hardhat.config.ts`.
3. Run the deployment script:
   ```bash
   npx hardhat run scripts/deploy-craftchain.ts --network sepolia
   ```
4. The script logs the deployer address, account balance, and the resulting deployed contract address.
