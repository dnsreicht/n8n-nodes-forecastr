# n8n-nodes-forecastr

Official n8n community node for [Forecastr](https://forecastr.dev).

Forecastr timestamps every AI prediction via RFC 3161 before the outcome is known.
Every output gets a cryptographic proof — independently verifiable, no trust required.

Bring your own model or use managed inference. The proof layer works with any model.

## Install

In n8n: **Settings → Community Nodes → Install**

Package name: `n8n-nodes-forecastr`

## Credentials

Get a free API key at [forecastr.dev](https://forecastr.dev) — 50 requests/day, no credit card.

## Operations

| Operation | Description |
|---|---|
| Forecast | Run TimesFM 2.5 inference on a time series. Returns result_hash + RFC 3161 timestamp. |
| Submit Output | Submit your own model output for RFC 3161 + on-chain proof. Bring any model. |
| Verify Hash | Look up any result_hash — returns anchor date, TSR status, verify URL. |
| Anchor Claim | Anchor a prediction claim before the outcome. Used by ArbiterBot / ProofOfCall. |

## Submit Output — BYOM example

Run inference with any model outside n8n, then anchor the proof:

```json
{
  "asset": "brent-crude",
  "horizon": 7,
  "point_forecast": [82.1, 82.4, 82.8, 83.1, 83.0, 82.7, 82.5],
  "model_id": "my-model-v1",
  "context_hash": "sha256-of-your-input-data"
}
```

Returns:

```json
{
  "result_hash": "4fde860e9547ff3a...",
  "verify_url": "https://api.forecastr.dev/verify/hash/4fde...",
  "tsr_verified": true,
  "rfc_timestamp": "2026-04-18T14:20:00Z"
}
```

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

## On-chain Proof Registry

Forecastr supports trustless proof registration on Base Mainnet.
Any result_hash can be registered on-chain — no escrow, no fee, gas only.

Contract: [0x6b9056EcE5...631](https://basescan.org/address/0x6b9056EcE5D4C267d8d8959ce3A16f72C8933631)
SDK: [npm install @forecastrdev/sdk](https://www.npmjs.com/package/@forecastrdev/sdk)

## Links

- [forecastr.dev](https://forecastr.dev)
- [API Docs](https://forecastr.dev/docs.html)
- [npm](https://www.npmjs.com/package/n8n-nodes-forecastr)
- [GitHub](https://github.com/dnsreicht/n8n-nodes-forecastr)