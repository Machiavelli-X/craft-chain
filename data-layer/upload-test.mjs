import "dotenv/config";
import { PinataSDK } from "pinata";

const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT,
  pinataGateway: process.env.PINATA_GATEWAY,
});

const metadata = {
  name: "Craft Batch #1",
  description: "Handcrafted cotton textile",
  attributes: [
    {
      trait_type: "Material",
      value: "Cotton",
    },
    {
      trait_type: "Origin",
      value: "Odisha",
    },
  ],
};

async function main() {
  try {
    const file = new File(
      [JSON.stringify(metadata)],
      "batch-1.json",
      {
        type: "application/json",
      }
    );

    const upload = await pinata.upload.public.file(file);

    console.log("Upload successful!");
    console.log("CID:", upload.cid);
    console.log("IPFS URI:", `ipfs://${upload.cid}`);

    const url = await pinata.gateways.public.convert(upload.cid);

    console.log("Gateway URL:", url);

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(
        `Failed to retrieve file: ${response.status}`
      );
    }

    const retrievedMetadata = await response.json();

    console.log("Retrieved metadata:");
    console.log(retrievedMetadata);
  } catch (error) {
    console.error("Upload failed:");
    console.error(error);
  }
}

main();