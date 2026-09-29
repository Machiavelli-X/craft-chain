# Craft-Chain Data Contract

## 1. Batch Metadata

Batch metadata is stored off-chain on IPFS.

The smart contract stores the metadata URI returned by IPFS.

### Example

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