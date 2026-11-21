<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/assets/dsh-kit-hero-en-dark.webp">
  <img src="docs/assets/dsh-kit-hero-en-light.webp" width="100%" alt="dsh-kit: परिवार के लिए एक-कमांड इंस्टॉलर — plugins.txt में 96 specs (88 active + 8 frozen), roster में 99 रिपॉज़िटरी और 6 retired बाहर; दोनों इंस्टॉलर एक ही सूची पढ़ते हैं और node scripts/check-parity.mjs README के 88/8/96/99 तथा 9 सहोदर परिवार तालिकाओं को उसी सूची से बाँधता है">
</picture>

# dsh-kit

[English](README.md) · [简体中文](README-zh.md) · [Español](README-es.md) · [Português](README-pt.md) · [हिन्दी](README-hi.md)

</div>

[![Gitee](https://img.shields.io/badge/Gitee-mirror-c71d23?logo=gitee)](https://gitee.com/perrylink/dsh-kit)
[![dshfind](https://dshfind.com/api/badge/PerryLink/dsh-kit?metric=downloads)](https://dshfind.com/plugins/PerryLink/dsh-kit?ref=badge)

[![CI](https://img.shields.io/github/actions/workflow/status/PerryLink/dsh-kit/ci.yml?branch=main)](https://github.com/PerryLink/dsh-kit/actions)
[![npm](https://img.shields.io/npm/v/dsh-kit)](https://www.npmjs.com/package/dsh-kit)

**सक्रिय रूप से अनुरक्षित PerryLink DeepSeek Harness प्लगइन के लिए एक-कमांड स्टार्टर पैक, साथ में frozen प्लगइन जो इंस्टॉल योग्य बने रहते हैं।**

[dsh-kit](https://github.com/PerryLink/dsh-kit) [PerryLink के पूरे DSH प्लगइन परिवार](https://github.com/PerryLink/PerryLink/blob/main/FAMILY.md) का इंस्टॉलर और मुख्य roster है — तीन-स्तरीय मानक और जाँचें, गाइड, डेवलपर टूलचेन, runtime प्लगइन, 53-चेकर compliance सूट, डोमेन ऑपरेशंस, कैटलॉग, और अलग Phocinae निर्णय लाइन। हर प्लगइन पूर्ण `dsh.bundle` मैनिफ़ेस्ट, पाँच-भाषा दस्तावेज़, CI और npm प्रकाशन के साथ आता है।

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/assets/dsh-kit-flow-v5-dark.svg">
  <img src="docs/assets/dsh-kit-flow-v5-light.svg" width="100%" alt="dsh-kit का संरचना चित्र: family.txt (117 इंस्टॉल specs) और data/repos.json (99 PerryLink रिपॉज़िटरी) से plugins.txt बनता है; install-all.sh और install-all.ps1 वही roster पढ़कर dsh plugin add चलाते हैं; node scripts/check-parity.mjs 9 सहोदर परिवार तालिकाओं, README के 88/8/96/99 और दोनों इंस्टॉलरों को जाँचता है, जबकि npm run build:market market/index.json को DSH plugin-market format 1 में लिखता है">
</picture>

*संरचना: family.txt + data/repos.json → plugins.txt → install-all → dsh plugin add → गेट। चित्र के लेबल असली फ़ाइल नाम, स्क्रिप्ट नाम और कमांड हैं, इसलिए एक ही चित्र पाँचों भाषाओं के लिए है।*


## त्वरित शुरुआत

![dsh-kit: node scripts/check-parity.mjs --json का असली टर्मिनल रन — install 96, active 88, frozen 8, roster 99, familyRows 99, default स्कोप 35/46/8/3 और full स्कोप 88/99/8/3 (active/roster/frozen/retired)](docs/assets/dsh-kit-demo.gif)

*एनिमेशन: 2026-11-21 को node scripts/check-parity.mjs --json का दोबारा रन — वे roster गिनतियाँ जो गेट plugins.txt से निकालता है (असली stdout; मनुष्य के लिए सारांश पंक्तियाँ इस JSON से पहले छपती हैं)।*

कोई profile चुनें (जैसे `web`) और सब कुछ इंस्टॉल करें:

```sh
# Linux / macOS
./install-all.sh web

# Windows PowerShell
.\install-all.ps1 -Profile web
```

या अलग-अलग प्लगइन इंस्टॉल करें:

```sh
dsh plugin --profile web add dsh-checkpoint-rewind   # /rewind equivalent
dsh plugin --profile web add dsh-permission-rules    # allow/deny/ask rules
dsh plugin --profile web add dsh-output-styles       # outputStyles equivalent
```

## अंदर क्या है (चुने हुए मुख्य आकर्षण — इंस्टॉलर 43 npm specs और 53 वैकल्पिक, कुल 96 कवर करते हैं)

नीचे दिए दो आकर्षण **retired** हैं और एक **frozen** है। सब सूचीबद्ध और इंस्टॉल योग्य बने रहते हैं, क्योंकि लोग
उन्हें पहले से चला रहे हैं: 🧊 **FROZEN** का मतलब है कोई नया फ़ीचर नहीं और सिर्फ़ असली टूट-फूट ठीक होगी; 🚫 **RETIRED** का
मतलब है host अब यह काम नेटिव करता है और पैकेज npm पर deprecated है — retired पैकेज `plugins.txt` में **नहीं** हैं,
इसलिए नई इंस्टॉल उन्हें कभी नहीं खींचती।

### Claude Code समकक्ष तिकड़ी

| प्लगइन | एक-पंक्ति परिचय |
|---|---|
| [dsh-checkpoint-rewind](https://github.com/PerryLink/dsh-checkpoint-rewind) | हर बदलाव से पहले Git-first स्नैपशॉट, सेशन फ़ोर्क, और एक ही बार में `/rewind` रिस्टोर |
| [dsh-permission-rules](https://github.com/PerryLink/dsh-permission-rules) | ऑडिट, dry-run और हॉट रीलोड के साथ डिक्लेरेटिव allow/deny/ask अनुमति नियम |
| [dsh-output-styles](https://github.com/PerryLink/dsh-output-styles) | प्रति-सेशन पर्सिस्टेंस के साथ runtime में बदले जा सकने वाले मॉडल आउटपुट स्टाइल |

### मेमोरी, एजेंट और वर्कफ़्लो

| प्लगइन | एक-पंक्ति परिचय | स्थिति |
|---|---|---|
| [dsh-memento](https://github.com/PerryLink/dsh-memento) | अनुमोदन-गेटेड क्रॉस-सेशन मेमोरी: `ctx.memory` + SQLite + `memory` टूल | |
| [dsh-background-agents](https://github.com/PerryLink/dsh-background-agents) | टिकाऊ बैकग्राउंड चाइल्ड एजेंट: साइडबार प्रगति, मैसेजिंग, इंटरप्ट | 🚫 **RETIRED** — host अब नेटिव continuable subagents देता है |
| [dsh-doublecheck](https://github.com/PerryLink/dsh-doublecheck) | इंजीनियरिंग-अनुशासन गार्ड: आवश्यकता की गहन पूछताछ, टेस्ट गेट, विरोधी समीक्षा | |
| [dsh-auto-review](https://github.com/PerryLink/dsh-auto-review) | अनुमोदन श्रृंखला पर दूसरे मॉडल से ऑटो-रिव्यू, fail-closed | |

### डेवलपर और सुरक्षा उपकरण

| प्लगइन | एक-पंक्ति परिचय |
|---|---|
| [dsh-mcp-panel](https://github.com/PerryLink/dsh-mcp-panel) | केवल-पढ़न MCP runtime पैनल: `/mcp` + Settings टैब |
| [dsh-lsp-actions](https://github.com/PerryLink/dsh-lsp-actions) | LSP डायग्नोस्टिक्स, फ़ॉर्मेटिंग, कम्प्लीशन, कोड एक्शन, रीनेम |
| [dsh-github-bot](https://github.com/PerryLink/dsh-github-bot) | GitHub PR/issue इंटीग्रेशन; हर लेखन मानवीय अनुमोदन से गुज़रता है |
| [dsh-security-pack](https://github.com/PerryLink/dsh-security-pack) | सुरक्षा-ऑडिट skill पैक: सीक्रेट स्कैन, डिपेंडेंसी और सप्लाई-चेन समीक्षा |

### UX और माइग्रेशन

| प्लगइन | एक-पंक्ति परिचय | स्थिति |
|---|---|---|
| [dsh-session-pin](https://github.com/PerryLink/dsh-session-pin) | Web साइडबार में टिकाऊ क्रम के साथ सेशन पिन करें | 🚫 **RETIRED** — host अब नेटिव सेशन पिनिंग देता है |
| [dsh-composer-history](https://github.com/PerryLink/dsh-composer-history) | web composer के लिए टर्मिनल-स्टाइल इनपुट इतिहास: एरो, Ctrl+R | |
| [dsh-primer](https://github.com/PerryLink/dsh-primer) | माँग पर एजेंट skill के रूप में प्लगइन-डेवलपमेंट ज्ञानकोश | |
| [dsh-claude-move](https://github.com/PerryLink/dsh-claude-move) | Claude Code के सेशन, मेमोरी, skills और CLAUDE.md को DSH में माइग्रेट करें | 🧊 FROZEN — रिपॉज़िटरी का README देखें |

## नोट्स

- इंस्टॉल किया गया सेट [`plugins.txt`](plugins.txt) है — हर पंक्ति में एक npm spec, और roster लिखे जाने की यही एक जगह है। दोनों इंस्टॉलर इसे पढ़ते हैं, और `node scripts/check-parity.mjs` उन्हें और इस पेज की हर गिनती को इससे बाँधता है।
- **retired पैकेज `plugins.txt` में नहीं हैं**, इसलिए नई इंस्टॉल कभी कोई नहीं खींचती, और अगर कोई उन्हें वापस जोड़े तो गेट फ़ेल होता है। पाँचों retired नाम और उनका कारण फ़ाइल की अपनी हेडर टिप्पणी में हैं।
- **frozen पैकेज `plugins.txt` में हैं** और इंस्टॉल होते हैं; उनकी पंक्ति के अंत में `# 🧊 FROZEN` टिप्पणी उन्हें चिह्नित करती है, और दोनों इंस्टॉलर `dsh plugin add` कॉल करने से पहले वह टिप्पणी हटा देते हैं।
- इंस्टॉल स्क्रिप्ट **idempotent** हैं — दोबारा चलाना सुरक्षित है।
- `dsh-security-pack` npm से इंस्टॉल होता है।
- संस्करण npm के नवीनतम रिलीज़ के साथ चलते हैं; reproducibility चाहिए तो प्रति-प्लगइन एक विशेष संस्करण पिन करें।
- **मासिक डाउनलोड बेसलाइन:** `node scripts/npm-downloads-snapshot.mjs` इसी फ़ाइल का roster पढ़कर हर spec के साप्ताहिक और मासिक npm डाउनलोड `data/npm-downloads-snapshots.json` में जोड़ता है, ताकि डिस्ट्रिब्यूशन बदलाव को दावा करने के बजाय पिछले महीने से मापा जा सके। यह केवल वही सीरीज़ लिखता है — profile पेज का डाउनलोड आँकड़ा जहाँ था वहीं रहता है। देखें `scripts/npm-downloads-snapshot.mjs`।
- deprecated नाम इंस्टॉल नहीं होते: `dsh-background-agents`, `dsh-session-pin` और `dsh-team-rooms` (host अब तीनों नेटिव लागू करता है), तथा `dsh-plugin-upgrade-015` और उसका पुराना नाम `dsh-plugin-upgrade-rc1` (जिन्हें `dsh-codemod` ने बदला है, जो सारे corridor एक पैकेज में लाता है)। जो पहले से इंस्टॉल कर चुके हैं, उनके लिए वे npm पर रहते हैं।
- लाइसेंस: Apache-2.0 (प्लगइन परिवार के समान)।

## व्यक्तिगत प्लगइन इंडेक्स

[`market/index.json`](market/index.json) इस roster से बना [DSH plugin-market format 1](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/user/guide/plugin-market.md) इंडेक्स है। यह केवल PerryLink पैकेज सूचीबद्ध करता है और `https://perrylink.github.io/dsh-kit/index.json` पर प्रकाशित है; DSH में इसे **Plugins → Discover → Add index source** में जोड़ें। यह किसी भी आधिकारिक या कम्युनिटी मार्केट से स्वतंत्र है और इंस्टॉलरों का विकल्प नहीं है।

```sh
npm ci
npm run build:market   # regenerate from plugins.txt + family.txt (reads npm)
npm run check:market   # offline format/coverage checks
npm run test:market    # offline generator fixtures
```

client समर्थन (dsh-Go/dsh-TUI की सीमाओं सहित), denylist और display overlay के लिए [`market/README.md`](market/README.md) देखें।

## फ़ीडबैक

issues और फ़ीचर अनुरोध संबंधित प्लगइन रिपॉज़िटरी में खोलें, या पूरे परिवार पर आधिकारिक [DeepSeek Harness Discussions](https://github.com/deepseek-ai/deepseek-harness/discussions) में चर्चा करें (श्रेणी "Show Your Plugins!")।


## PerryLink DSH प्लगइन परिवार

यह परियोजना [PerryLink](https://github.com/PerryLink) के DeepSeek Harness प्लगइन परिवार का हिस्सा है। परिवार की तीन परतें हैं — मानक और गाइड, डेवलपर टूलचेन, और runtime/domain प्लगइन — साथ में अलग Phocinae निर्णय लाइन; समूह-दर-समूह पूरा इंडेक्स [FAMILY.md](https://github.com/PerryLink/PerryLink/blob/main/FAMILY.md) में है। इंस्टॉल roster नीचे सिकुड़ा रहता है ताकि हर README की पहली स्क्रीन छोटी रहे; हर पंक्ति और उसकी स्थिति देखने के लिए इसे खोलें।

<details>
<summary>सभी प्लगइन खोलें</summary>

| प्लगइन | स्थिति |
|---|---|
| **[dsh-aqua-input-check](https://github.com/PerryLink/dsh-aqua-input-check)** |  |
| **[dsh-archive-check](https://github.com/PerryLink/dsh-archive-check)** |  |
| **[dsh-auto-review](https://github.com/PerryLink/dsh-auto-review)** |  |
| **[dsh-autotier](https://github.com/PerryLink/dsh-autotier)** | 🧊 FROZEN — रिपॉज़िटरी का README देखें |
| **[dsh-bid-ca-precheck](https://github.com/PerryLink/dsh-bid-ca-precheck)** |  |
| **[dsh-bid-qual-check](https://github.com/PerryLink/dsh-bid-qual-check)** |  |
| **[dsh-cert-mcp](https://github.com/PerryLink/dsh-cert-mcp)** | 🧊 FROZEN — रिपॉज़िटरी का README देखें |
| **[dsh-checkpoint-rewind](https://github.com/PerryLink/dsh-checkpoint-rewind)** |  |
| **[dsh-click](https://github.com/PerryLink/dsh-click)** |  |
| **[dsh-community-bench](https://github.com/PerryLink/dsh-community-bench)** | 🧊 FROZEN — रिपॉज़िटरी का README देखें |
| **[dsh-composer-history](https://github.com/PerryLink/dsh-composer-history)** |  |
| **[dsh-contract-stance](https://github.com/PerryLink/dsh-contract-stance)** |  |
| **[dsh-customs-doc-check](https://github.com/PerryLink/dsh-customs-doc-check)** |  |
| **[dsh-data-quality](https://github.com/PerryLink/dsh-data-quality)** |  |
| **[dsh-demurrage-ledger](https://github.com/PerryLink/dsh-demurrage-ledger)** |  |
| **[dsh-doublecheck](https://github.com/PerryLink/dsh-doublecheck)** |  |
| **[dsh-drill-script-check](https://github.com/PerryLink/dsh-drill-script-check)** |  |
| **[dsh-eia-guide-check](https://github.com/PerryLink/dsh-eia-guide-check)** |  |
| **[dsh-emergency-plan](https://github.com/PerryLink/dsh-emergency-plan)** |  |
| **[dsh-essay-rubric-check](https://github.com/PerryLink/dsh-essay-rubric-check)** |  |
| **[dsh-evidence-check](https://github.com/PerryLink/dsh-evidence-check)** |  |
| **[dsh-export-ctl-check](https://github.com/PerryLink/dsh-export-ctl-check)** |  |
| **[dsh-fast](https://github.com/PerryLink/dsh-fast)** |  |
| **[dsh-fmea-table-check](https://github.com/PerryLink/dsh-fmea-table-check)** |  |
| **[dsh-forecast-penalty](https://github.com/PerryLink/dsh-forecast-penalty)** |  |
| **[dsh-fund-research](https://github.com/PerryLink/dsh-fund-research)** |  |
| **[dsh-github-bot](https://github.com/PerryLink/dsh-github-bot)** |  |
| **[dsh-gongwen-flow-check](https://github.com/PerryLink/dsh-gongwen-flow-check)** |  |
| **[dsh-gongwen-word-check](https://github.com/PerryLink/dsh-gongwen-word-check)** |  |
| **[dsh-guard-plan-qc](https://github.com/PerryLink/dsh-guard-plan-qc)** |  |
| **[dsh-hazchem-check](https://github.com/PerryLink/dsh-hazchem-check)** |  |
| **[dsh-hazplan-check](https://github.com/PerryLink/dsh-hazplan-check)** |  |
| **[dsh-hidden-risk-map](https://github.com/PerryLink/dsh-hidden-risk-map)** |  |
| **[dsh-hs-classify](https://github.com/PerryLink/dsh-hs-classify)** |  |
| **[dsh-icd-rule-check](https://github.com/PerryLink/dsh-icd-rule-check)** |  |
| **[dsh-industry-research](https://github.com/PerryLink/dsh-industry-research)** |  |
| **[dsh-lawcite-adapter](https://github.com/PerryLink/dsh-lawcite-adapter)** |  |
| **[dsh-laya](https://github.com/PerryLink/dsh-laya)** |  |
| **[dsh-lc-doc-check](https://github.com/PerryLink/dsh-lc-doc-check)** |  |
| **[dsh-learning-gap-check](https://github.com/PerryLink/dsh-learning-gap-check)** |  |
| **[dsh-library](https://github.com/PerryLink/dsh-library)** |  |
| **[dsh-local-ai](https://github.com/PerryLink/dsh-local-ai)** |  |
| **[dsh-lsp-actions](https://github.com/PerryLink/dsh-lsp-actions)** |  |
| **[dsh-mask](https://github.com/PerryLink/dsh-mask)** |  |
| **[dsh-mcp-panel](https://github.com/PerryLink/dsh-mcp-panel)** |  |
| **[dsh-medrec-qc](https://github.com/PerryLink/dsh-medrec-qc)** |  |
| **[dsh-memento](https://github.com/PerryLink/dsh-memento)** |  |
| **[dsh-nsfc-form-check](https://github.com/PerryLink/dsh-nsfc-form-check)** |  |
| **[dsh-nurse-record-check](https://github.com/PerryLink/dsh-nurse-record-check)** |  |
| **[dsh-observe](https://github.com/PerryLink/dsh-observe)** |  |
| **[dsh-origin-rvc-check](https://github.com/PerryLink/dsh-origin-rvc-check)** |  |
| **[dsh-ota-review-check](https://github.com/PerryLink/dsh-ota-review-check)** |  |
| **[dsh-output-styles](https://github.com/PerryLink/dsh-output-styles)** |  |
| **[dsh-paper-doc-adapter](https://github.com/PerryLink/dsh-paper-doc-adapter)** |  |
| **[dsh-permission-rules](https://github.com/PerryLink/dsh-permission-rules)** |  |
| **[dsh-permit-report-check](https://github.com/PerryLink/dsh-permit-report-check)** |  |
| **[dsh-pipeline-check](https://github.com/PerryLink/dsh-pipeline-check)** |  |
| **[dsh-pleading-draft](https://github.com/PerryLink/dsh-pleading-draft)** |  |
| **[dsh-clinic](https://github.com/PerryLink/dsh-clinic)** |  |
| **[dsh-primer](https://github.com/PerryLink/dsh-primer)** |  |
| **[dsh-scaffold](https://github.com/PerryLink/dsh-scaffold)** |  |
| **[dsh-codemod](https://github.com/PerryLink/dsh-codemod)** |  |
| **[dsh-policy-brief-draft](https://github.com/PerryLink/dsh-policy-brief-draft)** |  |
| **[dsh-power-loss-split](https://github.com/PerryLink/dsh-power-loss-split)** |  |
| **[dsh-power-ticket-check](https://github.com/PerryLink/dsh-power-ticket-check)** |  |
| **[dsh-ppap-check](https://github.com/PerryLink/dsh-ppap-check)** |  |
| **[dsh-protest-deadline](https://github.com/PerryLink/dsh-protest-deadline)** |  |
| **[dsh-railway-window](https://github.com/PerryLink/dsh-railway-window)** |  |
| **[dsh-repair-order-qc](https://github.com/PerryLink/dsh-repair-order-qc)** |  |
| **[dsh-research-report](https://github.com/PerryLink/dsh-research-report)** |  |
| **[dsh-review-reply-check](https://github.com/PerryLink/dsh-review-reply-check)** |  |
| **[dsh-rulefile-check](https://github.com/PerryLink/dsh-rulefile-check)** |  |
| **[dsh-safety-brief-check](https://github.com/PerryLink/dsh-safety-brief-check)** |  |
| **[dsh-score](https://github.com/PerryLink/dsh-score)** |  |
| **[dsh-session-sync](https://github.com/PerryLink/dsh-session-sync)** |  |
| **[dsh-site-log-check](https://github.com/PerryLink/dsh-site-log-check)** |  |
| **[dsh-security-pack](https://github.com/PerryLink/dsh-security-pack)** |  |
| **[dsh-soe-decision-check](https://github.com/PerryLink/dsh-soe-decision-check)** |  |
| **[dsh-soilwater-check](https://github.com/PerryLink/dsh-soilwater-check)** |  |
| **[dsh-sop-sync-check](https://github.com/PerryLink/dsh-sop-sync-check)** |  |
| **[dsh-spc-gbt-adapter](https://github.com/PerryLink/dsh-spc-gbt-adapter)** |  |
| **[dsh-talk](https://github.com/PerryLink/dsh-talk)** |  |
| **[dsh-tender-extract](https://github.com/PerryLink/dsh-tender-extract)** |  |
| **[dsh-tender-matrix](https://github.com/PerryLink/dsh-tender-matrix)** |  |
| **[dsh-test-drive](https://github.com/PerryLink/dsh-test-drive)** |  |
| **[dsh-dida](https://github.com/PerryLink/dsh-dida)** |  |
| **[dsh-param-repair](https://github.com/PerryLink/dsh-param-repair)** |  |
| **[dsh-warranty-calc](https://github.com/PerryLink/dsh-warranty-calc)** |  |
| **[dsh-catalog](https://github.com/PerryLink/dsh-catalog)** |  |
| **[dsh-plugin-certification](https://github.com/PerryLink/dsh-plugin-certification)** |  |
| **[dsh-plugin-portal](https://github.com/PerryLink/dsh-plugin-portal)** |  |
| **[dsh-budget](https://github.com/PerryLink/dsh-budget)** | 🧊 FROZEN — रिपॉज़िटरी का README देखें |
| **[dsh-claude-move](https://github.com/PerryLink/dsh-claude-move)** | 🧊 FROZEN — रिपॉज़िटरी का README देखें |
| **[dsh-defend](https://github.com/PerryLink/dsh-defend)** | 🧊 FROZEN — रिपॉज़िटरी का README देखें |
| **[dsh-draw](https://github.com/PerryLink/dsh-draw)** | 🧊 FROZEN — रिपॉज़िटरी का README देखें |
| **[dsh-reach](https://github.com/PerryLink/dsh-reach)** | 🧊 FROZEN — रिपॉज़िटरी का README देखें |
| **[dsh-background-agents](https://github.com/PerryLink/dsh-background-agents)** | 🚫 RETIRED — रिपॉज़िटरी का README देखें |
| **[dsh-session-pin](https://github.com/PerryLink/dsh-session-pin)** | 🚫 RETIRED — रिपॉज़िटरी का README देखें |
| **[dsh-team-rooms](https://github.com/PerryLink/dsh-team-rooms)** | 🚫 RETIRED — रिपॉज़िटरी का README देखें |

</details>

## इंस्टॉल roster से बाहर

दो सतहें केवल catalog-only हैं, नाम से इंस्टॉल होती हैं और जान-बूझकर `plugins.txt` / `family.txt` में नहीं हैं
(इसलिए `install-all` उन्हें इंस्टॉल नहीं करता):

- **`dsh-translate` 0.3.2** — अपनी खुद की मॉडल रूट पर वेब-GUI का पूर्ण-पृष्ठ अनुवाद; कोड, पथ, कमांड,
  पहचानकर्ता और उत्पाद नाम ज्यों के त्यों रहते हैं। `dsh plugin --profile <name> add dsh-translate`।
- **19-पैकेज research सूट** — citation, claim, dataset, grant, manuscript, meta-analysis और
  reproducibility टूल; देखें [FAMILY.md §10](https://github.com/PerryLink/PerryLink/blob/main/FAMILY.md#10-research-suite-catalog-only-19)।


## संगतता कवरेज

[HCB](https://github.com/PerryLink/dsh-hcb) 0.12.0 **143 पंक्तियाँ — 136 checked + 7 tested** दर्ज करता है — पूरा 112-पैकेज परिवार roster (34 mainline-default + 53 opt-in + 10 catalog-only + 15 domain) और 31 बाहरी प्लगइन — **3 FLOW `manual`** तथा **गेट 2 blocked · 31 review · 109 pilot · 1 `production-candidate`** के साथ (`dsh-plugin-guide@0.5.9` एकमात्र PC है; छह और पंक्तियाँ tested हैं: `dsh-budget@0.4.26`, `dsh-defend@0.3.28`, `dsh-mask@0.2.25`, `dsh-memento@0.5.31`, `dsh-observe@0.2.28`, `dsh-test-drive@0.3.26`; बाकी 136 पंक्तियाँ नहीं), और checker **`dsh-standards@1.7.0` पर 143/143 पंक्तियाँ** दर्ज करता है। CI `PerryLink/dsh-hcb-action@main` को कॉल कर सकती है।
