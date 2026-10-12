# DV Experiments Hub v1.3 — Pinned Live Lab Fix

- Always select NZ EcoSim first, using `https://dvexperiments.github.io/nz-ecosim/` independently of public GitHub metadata or `embed` flags.
- Keep Little Worlds in the selector if it is eligible, without allowing it to take over as a fallback default.
- Preserve deliberate user selection during asynchronous GitHub metadata refreshes.
- Pin homepage featured content to NZ EcoSim as well.
- Add `?v=1.3.0` to scripts so browsers load the patched JavaScript instead of cached v1.2 copies.
- No NZ EcoSim repo edits required.

**Install:** Upload the contents of `DV_Experiments_Hub_v1.3_NZ_EcoSim_PINNED.zip` into the root of the `DVExperiments/dvexperiments.github.io` repository, replacing files where prompted. Alternatively, upload the contents of the patch archive preserving `assets/` subfolders.
