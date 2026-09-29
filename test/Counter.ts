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

});