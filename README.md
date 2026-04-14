# n8n-nodes-forecastr

Official n8n community node for [Forecastr](https://forecastr.dev).

Forecastr timestamps every AI prediction via RFC 3161 before the outcome is known.
Every output gets a cryptographic proof — independently verifiable, no trust required.

## Operations

| Operation | Description |
|---|---|
| Forecast | Run TimesFM 2.5 inference on a time series. Returns result_hash + RFC 3161 timestamp. |
| Submit Output | Timestamp your own model output. Bring any model, Forecastr handles the proof. |
| Verify Hash | Look up any result_hash — returns anchor date, TSR status, verify URL. |
| Anchor Claim | Anchor a prediction claim before the outcome. Used by ArbiterBot / ProofOfCall. |

## Install

In n8n: **Settings → Community Nodes → Install**

Package name: `n8n-nodes-forecastr`

## Credentials

Get a free API key at [forecastr.dev](https://forecastr.dev) — 50 requests/day, no credit card.

## Forecast — example output

```json
{
  "result_hash": "4fde860e9547ff3a...",
  "point_forecast": [108.60, 108.92, 109.14, 109.45, 109.78, 110.02, 110.31],
  "input_hash": "c363b2d0b248...",
  "model_version": "2f776efe6245e42b",
  "regime_flag": "NONE",
  "latency_ms": 847,
  "tsr_verified": true
}
```

The `result_hash` is anchored via RFC 3161 — verifiable locally:

```bash
openssl ts -verify -data canonical.txt -in tsr.tsr -CAfile freetsa_cacert.pem
# Verification: OK
```

## On-chain SLA Settlement

Forecastr also supports trustless settlement on Base Mainnet.
Agents lock USDC escrow, Forecastr runs inference and commits the output hash on-chain.
Escrow releases automatically after a 6h challenge window.

Contract: [0xDc3eBf3c...B936](https://basescan.org/address/0xDc3eBf3cC1542180F6d9d89aeF8A5768b0BcB936)
SDK: [npm install @forecastrdev/sdk](https://www.npmjs.com/package/@forecastrdev/sdk)

## Links

- [forecastr.dev](https://forecastr.dev)
- [API Docs](https://forecastr.dev/docs.html)
- [npm](https://www.npmjs.com/package/n8n-nodes-forecastr)
- [GitHub](https://github.com/dnsreicht/n8n-nodes-forecastr)
