import fs from "fs";
import path from "path";
import crypto from "crypto";

const DATA_DIR = path.resolve(process.cwd(), ".data", "ipfs");

function ensureDirectoryExists() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

/**
 * Computes deterministic IPFS CIDv1 (raw leaf sha2-256 in base32 format)
 */
export function generateIpfsCid(content: string): string {
  const hash = crypto.createHash("sha256").update(content).digest();
  // IPFS raw leaf multihash prefix: 0x01 (CIDv1) + 0x55 (raw) + 0x12 (sha2-256) + 0x20 (32 bytes)
  const multihash = Buffer.concat([
    Buffer.from([0x01, 0x55, 0x12, 0x20]),
    hash,
  ]);

  const alphabet = "abcdefghijklmnopqrstuvwxyz234567";
  let bits = 0;
  let value = 0;
  let output = "b";

  for (let i = 0; i < multihash.length; i++) {
    value = (value << 8) | multihash[i];
    bits += 8;
    while (bits >= 5) {
      output += alphabet[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }

  if (bits > 0) {
    output += alphabet[(value << (5 - bits)) & 31];
  }

  return output;
}

export async function storeMetadata(
  data: Record<string, unknown>,
  filename: string
): Promise<{ cid: string; uri: string; jsonString: string }> {
  ensureDirectoryExists();

  const jsonString = JSON.stringify(data);
  const cid = generateIpfsCid(jsonString);

  // 1. Persist locally to resilient storage
  const filePath = path.join(DATA_DIR, `${cid}.json`);
  fs.writeFileSync(filePath, jsonString, "utf8");

  // 2. Best-effort upload to Pinata if configured
  const pinataJwt = process.env.PINATA_JWT;
  if (pinataJwt) {
    try {
      const formData = new FormData();
      const fileBlob = new Blob([jsonString], { type: "application/json" });
      formData.append("file", fileBlob, filename);
      formData.append("network", "public");

      const res = await fetch("https://uploads.pinata.cloud/v3/files", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${pinataJwt}`,
        },
        body: formData,
        signal: AbortSignal.timeout(20000),
      });

      if (res.ok) {
        const pinataRes = await res.json();
        const pinataCid = pinataRes?.data?.cid || pinataRes?.cid;
        if (pinataCid) {
          // Cache locally under Pinata CID too
          const pinataLocalFile = path.join(DATA_DIR, `${pinataCid}.json`);
          fs.writeFileSync(pinataLocalFile, jsonString, "utf8");
          return {
            cid: pinataCid,
            uri: `ipfs://${pinataCid}`,
            jsonString,
          };
        }
      } else {
        const errText = await res.text();
        console.warn(`[IPFS] Pinata upload warning (status ${res.status}):`, errText);
      }
    } catch (pinataErr) {
      console.warn("[IPFS] Pinata upload fallback:", pinataErr instanceof Error ? pinataErr.message : pinataErr);
    }
  }

  return {
    cid,
    uri: `ipfs://${cid}`,
    jsonString,
  };
}

export async function getMetadata(cid: string): Promise<Record<string, unknown> | null> {
  ensureDirectoryExists();

  // 1. Check local persistent store
  const localFile = path.join(DATA_DIR, `${cid}.json`);
  if (fs.existsSync(localFile)) {
    try {
      const raw = fs.readFileSync(localFile, "utf8");
      return JSON.parse(raw);
    } catch {
      // Continue to remote fetch
    }
  }

  // 2. Check Pinata gateway if configured
  const gateway = process.env.PINATA_GATEWAY;
  if (gateway && /^[a-zA-Z0-9.-]+$/.test(gateway)) {
    try {
      const response = await fetch(`https://${gateway}/ipfs/${cid}`, {
        signal: AbortSignal.timeout(5000),
        cache: "no-store",
      });
      if (response.ok) {
        const json = await response.json();
        // Cache locally for fast subsequent reads
        fs.writeFileSync(localFile, JSON.stringify(json), "utf8");
        return json;
      }
    } catch {
      // Fall through to public gateway
    }
  }

  // 3. Fallback to public IPFS gateway
  try {
    const response = await fetch(`https://ipfs.io/ipfs/${cid}`, {
      signal: AbortSignal.timeout(5000),
      cache: "no-store",
    });
    if (response.ok) {
      const json = await response.json();
      fs.writeFileSync(localFile, JSON.stringify(json), "utf8");
      return json;
    }
  } catch {
    // Not found
  }

  return null;
}
