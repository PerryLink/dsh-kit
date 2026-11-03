# Publish gate

`scripts/publish-gate.mjs <package>` is the pre-publish check for the DSH plugin family.

- Pass: package is in `plugins.txt` and not marked `FROZEN`.
- Block: retired/pointer/support package, or a frozen package without `--allow-frozen`.
- This is a local gate, not a GitHub App. Release workflows must call it before `npm publish`;
  otherwise the label is documentation only.

The gate does not decide whether a frozen package may receive a security patch; that remains an
owner decision with `--allow-frozen`.
