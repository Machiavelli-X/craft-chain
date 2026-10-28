import { getJSON } from "./utils/ipfs.js";

const cid = "bafkreievpn4l76ioglewzpi7vqxyqo6zp5hsrpfhkq3ir23fjzgrbg5pre";

const data = await getJSON(cid);

console.log("\nRetrieved data from IPFS:");
console.log(data);