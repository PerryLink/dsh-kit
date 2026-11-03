# Roster scopes

Four lists are often confused. They answer different questions and must not be quoted as one number.

| List | Count (2026-11-03) | Question it answers | Authority |
|---|---:|---|---|
| `plugins.txt` | 96 | What is installed by the mainline installer? | **canonical install roster** |
| `family.txt` | 117 | What is the wider distribution family (39 default + 53 opt-in + 10 catalog-only + 15 domain)? | generated from `dsh-plugins/family.json` |
| GitHub topic `dsh-plugin` | 148 | What is discoverable on GitHub (includes tools, support, pointers, new homes)? | discovery superset, not installable count |
| `dsh-plugin-kit/data/repos.json` | 99 | Old kit data snapshot (updated 2026-10-31) | retired store; do not use for current status |

Rules:

- Quote the list and date with every count.
- `plugins.txt` is the only list a release workflow should use for installability.
- New homes `dsh-primer`, `dsh-clinic`, `dsh-codemod`, `dsh-scaffold` are developer tools/support,
  not runtime plugins; they do not belong in `plugins.txt`.
- Topic 148 includes 9 pointer repos and support/data repos; it is not "148 plugins".
