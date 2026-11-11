# Personal plugin market

This directory is a **DSH plugin-market format 1** index generated from the dsh-kit roster. It only lists PerryLink's own packages; it is not an official or community marketplace and does not replace `install-all`.

- Index URL: <https://perrylink.github.io/dsh-kit/index.json>
- Input: `plugins.txt` first, then family-only entries from `family.txt`
- Output: `index.json` (the market), `dropped.json` (roster entries that npm no longer serves)

## Use it

In DSH Web/Desktop, enable the experimental **Custom plugin indexes** bundle, open **Plugins → Discover → Add index source**, and paste the URL above. dsh-ee members can add the same URL as an additional source next to the company index; the company index is unchanged.

dsh-Go and dsh-TUI do not accept arbitrary index sources today. Install the same package/version into the shared DSH host (for example `dsh plugin --profile web add dsh-memento@0.5.30`) and it appears in their "installed" view; for the dsh-Go in-app market, submit to `ccch1mneyyy/dsh-go-market` instead.

Every version in the index installs from the public npm registry and carries `engines.dsh`, so Discover can filter by the running DSH version. Packages are published by PerryLink; the index carries no signature, so read the source before installing.

## Regenerate

```sh
npm ci
npm run build:market     # network: reads npm packuments, validates with the official parser
npm run check:market     # offline: format, coverage, ownership, labels, icons
npm run test:market      # offline: generator fixtures
```

`market/denylist.txt` explicitly excludes third-party packages that happen to live under the PerryLink GitHub org (currently `dsh-phocinae`). `market/display.json` is an optional display overlay (`title`, `titleZh`, `description`, `descriptionZh`, `icon`) for names in the index; it never decides what is listed.

The roster is the single source of truth. Do not add plugin names to `index.json` by hand: add them to `plugins.txt`/`family.txt`, then regenerate.

## Limits

- The index lists only versions with a valid `dsh.bundle.patch` and `engines.dsh`; deprecated/private versions are skipped and reported in `dropped.json`.
- A package rename or retirement in npm shows up as a `dropped` entry until the roster source is updated.
- GitHub Pages caches the file for about 10 minutes; DSH itself caches indexes for 10 minutes.
- The index is personal by design. It is not submitted to dshfind, the official market, or dsh-ee's company catalog.
