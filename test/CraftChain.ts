import { expect } from "chai";
import hre from "hardhat";

describe("CraftChain", function () {

  async function deployCraftChain() {
    const { ethers } = await hre.network.create();

    const [admin, artisan, buyer, randomUser] =
      await ethers.getSigners();

    const CraftChain = await ethers.getContractFactory(
      "CraftChain"
    );

    const craftChain = await CraftChain.deploy(
      admin.address
    );

    await craftChain.waitForDeployment();

    return {
      craftChain,
      admin,
      artisan,
      buyer,
      randomUser,
      ethers,
    };
  }

  it("should deploy correctly", async function () {
    const { craftChain } = await deployCraftChain();

    expect(await craftChain.name()).to.equal(
      "Craft Chain"
    );

    expect(await craftChain.symbol()).to.equal(
      "CRAFT"
    );
  });

  it("should give the admin the required roles", async function () {
    const {
      craftChain,
      admin
    } = await deployCraftChain();

    const DEFAULT_ADMIN_ROLE =
      await craftChain.DEFAULT_ADMIN_ROLE();

    const MINTER_ROLE =
      await craftChain.MINTER_ROLE();

    expect(
      await craftChain.hasRole(
        DEFAULT_ADMIN_ROLE,
        admin.address
      )
    ).to.equal(true);

    expect(
      await craftChain.hasRole(
        MINTER_ROLE,
        admin.address
      )
    ).to.equal(true);
  });

  it("should allow the minter to mint a batch", async function () {
    const {
      craftChain,
      admin,
      artisan,
      ethers
    } = await deployCraftChain();

    const metadataURI =
      "ipfs://bafy-test-batch-001";

    await expect(
      craftChain.connect(admin).mint(
        artisan.address,
        metadataURI
      )
    )
      .to.emit(craftChain, "Transfer")
      .withArgs(
        ethers.ZeroAddress,
        artisan.address,
        1n
      );

    expect(
      await craftChain.ownerOf(1n)
    ).to.equal(artisan.address);

    expect(
      await craftChain.tokenURI(1n)
    ).to.equal(metadataURI);
  });

  it("should prevent a non-minter from minting", async function () {
    const {
      craftChain,
      artisan,
      randomUser
    } = await deployCraftChain();

    const metadataURI =
      "ipfs://bafy-test-batch-002";

    await expect(
      craftChain.connect(randomUser).mint(
        artisan.address,
        metadataURI
      )
    ).to.be.revertedWithCustomError(
      craftChain,
      "AccessControlUnauthorizedAccount"
    );
  });

  it("should mint multiple batches with unique token IDs", async function () {
    const {
      craftChain,
      admin,
      artisan,
      ethers
    } = await deployCraftChain();

    const metadataURI1 =
      "ipfs://bafy-test-batch-001";

    const metadataURI2 =
      "ipfs://bafy-test-batch-002";

    const metadataURI3 =
      "ipfs://bafy-test-batch-003";

    // Mint first batch
    await expect(
      craftChain.connect(admin).mint(
        artisan.address,
        metadataURI1
      )
    )
      .to.emit(craftChain, "Transfer")
      .withArgs(
        ethers.ZeroAddress,
        artisan.address,
        1n
      );

    // Mint second batch
    await expect(
      craftChain.connect(admin).mint(
        artisan.address,
        metadataURI2
      )
    )
      .to.emit(craftChain, "Transfer")
      .withArgs(
        ethers.ZeroAddress,
        artisan.address,
        2n
      );

    // Mint third batch
    await expect(
      craftChain.connect(admin).mint(
        artisan.address,
        metadataURI3
      )
    )
      .to.emit(craftChain, "Transfer")
      .withArgs(
        ethers.ZeroAddress,
        artisan.address,
        3n
      );

    // Verify ownership
    expect(await craftChain.ownerOf(1n))
      .to.equal(artisan.address);

    expect(await craftChain.ownerOf(2n))
      .to.equal(artisan.address);

    expect(await craftChain.ownerOf(3n))
      .to.equal(artisan.address);

    // Verify metadata
    expect(await craftChain.tokenURI(1n))
      .to.equal(metadataURI1);

    expect(await craftChain.tokenURI(2n))
      .to.equal(metadataURI2);

    expect(await craftChain.tokenURI(3n))
      .to.equal(metadataURI3);
  });

  it("should allow the current owner to record a step", async function () {
    const { craftChain, admin, artisan, ethers } =
      await deployCraftChain();

    await craftChain.connect(admin).mint(
      artisan.address,
      "ipfs://batch-metadata"
    );

    const metadataURI = "ipfs://production-step";
    const dataHash = ethers.id("production-step");

    await expect(
      craftChain.connect(artisan).recordStep(
        1n,
        metadataURI,
        dataHash
      )
    ).to.emit(craftChain, "StepRecorded");
  });

  it("should prevent a non-owner from recording a step", async function () {
    const { craftChain, admin, artisan, randomUser, ethers } =
      await deployCraftChain();

    await craftChain.connect(admin).mint(
      artisan.address,
      "ipfs://batch-metadata"
    );

    await expect(
      craftChain.connect(randomUser).recordStep(
        1n,
        "ipfs://unauthorized-step",
        ethers.id("unauthorized-step")
      )
    ).to.be.revertedWith("Not token owner");
  });
  it("should allow the new owner to record after transfer", async function () {
    const { craftChain, admin, artisan, buyer, ethers } =
      await deployCraftChain();

    await craftChain.connect(admin).mint(
      artisan.address,
      "ipfs://batch-metadata"
    );

    // Artisan transfers custody to buyer.
    await craftChain.connect(artisan).safeTransferFrom(
      artisan.address,
      buyer.address,
      1n
    );

    expect(await craftChain.ownerOf(1n))
      .to.equal(buyer.address);

    // Previous owner should no longer be able to record.
    await expect(
      craftChain.connect(artisan).recordStep(
        1n,
        "ipfs://old-owner-step",
        ethers.id("old-owner-step")
      )
    ).to.be.revertedWith("Not token owner");

    // New owner can record.
    await expect(
      craftChain.connect(buyer).recordStep(
        1n,
        "ipfs://new-owner-step",
        ethers.id("new-owner-step")
      )
    ).to.emit(craftChain, "StepRecorded");
  });

  it("should complete the full custody lifecycle", async function () {
    const {
      craftChain,
      admin,
      artisan,
      buyer,
      randomUser,
      ethers,
    } = await deployCraftChain();

    // Use randomUser as the co-op.
    // Use admin as the retailer for this isolated test.
    const coop = randomUser;
    const retailer = admin;

    // 1. Admin mints the batch to the artisan.
    await craftChain.connect(admin).mint(
      artisan.address,
      "ipfs://batch-001"
    );

    expect(await craftChain.ownerOf(1n))
      .to.equal(artisan.address);

    // 2. Artisan records the production step.
    await expect(
      craftChain.connect(artisan).recordStep(
        1n,
        "ipfs://production-step",
        ethers.id("production-step")
      )
    ).to.emit(craftChain, "StepRecorded");

    // 3. Artisan transfers custody to the co-op.
    await craftChain.connect(artisan).safeTransferFrom(
      artisan.address,
      coop.address,
      1n
    );

    expect(await craftChain.ownerOf(1n))
      .to.equal(coop.address);

    // 4. Co-op records the processing step.
    await expect(
      craftChain.connect(coop).recordStep(
        1n,
        "ipfs://processing-step",
        ethers.id("processing-step")
      )
    ).to.emit(craftChain, "StepRecorded");

    // 5. Co-op transfers custody to the retailer.
    await craftChain.connect(coop).safeTransferFrom(
      coop.address,
      retailer.address,
      1n
    );

    expect(await craftChain.ownerOf(1n))
      .to.equal(retailer.address);

    // 6. Retailer records the distribution step.
    await expect(
      craftChain.connect(retailer).recordStep(
        1n,
        "ipfs://distribution-step",
        ethers.id("distribution-step")
      )
    ).to.emit(craftChain, "StepRecorded");

    // 7. Retailer transfers custody to the buyer.
    await craftChain.connect(retailer).safeTransferFrom(
      retailer.address,
      buyer.address,
      1n
    );

    // 8. Buyer is the final owner.
    expect(await craftChain.ownerOf(1n))
      .to.equal(buyer.address);
  });

});