---
name: GitHub asset syncing
description: Reliable way to sync exact tracked binaries through this Replit GitHub connection.
---

For GitHub repository writes from this Replit, use the connected GitHub integration through `@replit/connectors-sdk` and its proxy from the workspace runtime. Upload Git blobs, then create a tree and commit, and advance the ref without force. Do not pass full asset encodings through the CodeExecution shell-output bridge; it can return incomplete data while appearing successful.

**Why:** A base64 transfer routed through the sandbox shell callback was shorter than the source file despite reporting no truncation, while the workspace SDK proxy successfully uploaded a 15 MB file intact.

**How to apply:** Before syncing, compare local tracked paths, modes, and blob hashes with the remote tree. Use the remote head as the new commit's parent, verify the ref update, then compare every remote blob hash with the local tracked index.