import { PinataSDK } from "pinata";

const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT,
  pinataGateway: process.env.PINATA_GATEWAY,
});

export async function uploadJSON(data, filename) {
  const file = new File(
    [JSON.stringify(data)],
    filename,
    {
      type: "application/json",
    }
  );

  const upload = await pinata.upload.public.file(file);

  return {
    cid: upload.cid,
    uri: `ipfs://${upload.cid}`,
  };
}