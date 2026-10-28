import "dotenv/config";
import { PinataSDK } from "pinata";

if (!process.env.PINATA_JWT) {
  throw new Error("PINATA_JWT is not configured in .env");
}

if (!process.env.PINATA_GATEWAY) {
  throw new Error("PINATA_GATEWAY is not configured in .env");
}

const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT,
  pinataGateway: process.env.PINATA_GATEWAY,
});

export async function uploadJSON(data, filename) {
  if (!data || typeof data !== "object") {
    throw new Error("IPFS upload data must be an object");
  }

  if (!filename) {
    throw new Error("A filename is required for IPFS upload");
  }

  try {
    const jsonString = JSON.stringify(data);

    const file = new File(
      [jsonString],
      filename,
      { type: "application/json" }
    );

    const upload = await pinata.upload.public.file(file);

    if (!upload?.cid) {
      throw new Error("Pinata upload succeeded but no CID was returned");
    }

    return {
      cid: upload.cid,
      uri: `ipfs://${upload.cid}`,
      jsonString,
    };
  } catch (error) {
    throw new Error(
      `IPFS upload failed: ${error.message}`
    );
  }
}

export async function getJSON(cid) {
  if (!cid) {
    throw new Error("CID is required");
  }

  const gateway = process.env.PINATA_GATEWAY;
  const url = `https://${gateway}/ipfs/${cid}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(
        `Gateway returned ${response.status} ${response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    throw new Error(
      `IPFS retrieval failed: ${error.message}`
    );
  }
}