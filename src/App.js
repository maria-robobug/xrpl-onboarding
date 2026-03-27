import { useState } from "react";

// DATA

const sections = [
  { id: "overview",     label: "Overview",        icon: "🌐" },
  { id: "token-types",  label: "Token Types",     icon: "🪙" },
  { id: "transactions", label: "Key Transactions",icon: "⚡" },
  { id: "stablecoin",   label: "RLUSD Stablecoin",icon: "💵" },
  { id: "updates",      label: "Recent Updates",  icon: "🔄" },
  { id: "faq",          label: "FAQ",             icon: "💬" },
];

const tokenTypes = [
  {
    name: "Trust Line Tokens",
    badge: "v1 — Production",
    badgeColor: "#22c55e",
    icon: "🔗",
    also: 'Previously called "IOUs" or "issued currencies" — those terms are no longer preferred.',
    description:
      "The original fungible token standard on XRPL, available in production since the ledger launched. Any account can be an issuer. Before a holder can receive one of these tokens, they must first send a TrustSet transaction. This is XRPL's way of ensuring nobody receives tokens they did not agree to hold. Trust line tokens work with cross-currency payments and the built-in decentralised exchange.",
    note: "There are edge cases to be aware of before using trust line tokens in production. The docs strongly recommend reading the concept page first.",
    pros: ["Fully available in production", "Works with cross-currency payments and the DEX", "Wide ecosystem support"],
    cons: ["Edge cases that require careful reading before use", "Less storage-efficient than MPTs", "Settings like transfer rate and tick size apply to all tokens from one issuer account. Use separate accounts per token type if you need different settings."],
    useCases: "Stablecoins, fiat-backed assets, community credit systems",
    sourceUrl: "https://xrpl.org/docs/concepts/tokens/fungible-tokens/trust-line-tokens",
  },
  {
    name: "Multi-Purpose Tokens (MPTs)",
    badge: "v2 — Live since Oct 2025",
    badgeColor: "#3b82f6",
    icon: "🧩",
    also: "Requires the MPTokensV1 amendment, activated October 2025.",
    description:
      "The next-generation fungible token standard, designed to fix limitations in trust line tokens. MPT settings are defined per issuance rather than per account, so one issuer can have tokens with entirely different rules without needing separate accounts. MPTs do not support rippling, which removes a category of edge cases present in trust line tokens. They are not yet at full feature parity with trust line tokens.",
    note: null,
    pros: ["Settings defined per issuance, not per account", "Built-in compliance features: supply cap, freeze/lock, clawback, allowlisting", "Rich on-chain metadata (up to 1024 bytes, per XLS-89 schema)", "No rippling, which means a simpler mental model"],
    cons: ["Not yet at full feature parity with trust line tokens", "DEX trading flag exists but is not yet implemented (requires XLS-82)", "Newer ecosystem tooling still maturing"],
    useCases: "Tokenised T-bills, real estate, commodities, institutional securities, stablecoins",
    sourceUrl: "https://xrpl.org/docs/concepts/tokens/fungible-tokens/multi-purpose-tokens",
  },
  {
    name: "Non-Fungible Tokens (NFTs)",
    badge: "XLS-20 — Production",
    badgeColor: "#a855f7",
    icon: "🎨",
    also: "Standard: XLS-20. Each NFT is unique and no two are interchangeable.",
    description:
      "NFTs encode ownership of unique, indivisible items. Unlike fungible tokens, you cannot split or exchange an NFT for another of the same type. Each one is a distinct object on the ledger. They can represent physical goods, digital art, in-game items, identity tokens, airline credits, or consumer rewards.",
    note: "The tfMutable flag (from the DynamicNFT amendment) allows the URI field of an NFT to be updated after minting, but only if that flag was set at mint time.",
    pros: ["Unique, indivisible ownership", "Native royalty support via TransferFee on mint", "DEX trading support"],
    cons: ["Not interchangeable or divisible", "Less relevant for institutional finance use cases"],
    useCases: "Art, in-game items, collectibles, identity tokens, airline credits, consumer rewards",
    sourceUrl: "https://xrpl.org/docs/concepts/tokens/nfts",
  },
];

const updates = [
  {
    date: "Sep 2025", title: "Credentials (XLS-70)", color: "#22c55e", status: "enabled",
    xls: "XLS-70", xlsUrl: "https://xls.xrpl.org/xls/XLS-0070-credentials.html",
    detail: "Adds on-chain tools for managing authorisation and compliance. Three new transaction types: CredentialCreate (issuer mints a credential for a subject account), CredentialAccept (subject accepts it, making it active), and CredentialDelete (removes it). Credentials can gate who is authorised to deposit funds. The CredentialIDs field was added to Payment, EscrowFinish, PaymentChannelClaim, and AccountDelete transactions to let senders prove authorisation.",
  },
  {
    date: "Oct 2025", title: "MPTokensV1 (XLS-33)", color: "#22c55e", status: "enabled",
    xls: "XLS-33", xlsUrl: "https://xls.xrpl.org/xls/XLS-0033-multi-purpose-tokens.html",
    detail: "Introduces the Multi-Purpose Token (MPT) standard. Adds two new ledger object types: MPTokenIssuance (records settings for an issuance) and MPToken (records an individual holder's balance). Key transactions: MPTokenIssuanceCreate, MPTokenIssuanceDestroy, MPTokenIssuanceSet, and MPTokenAuthorize.",
  },
  {
    date: "Feb 2026", title: "PermissionedDomains (XLS-80)", color: "#22c55e", status: "enabled",
    xls: "XLS-80", xlsUrl: "https://xls.xrpl.org/xls/XLS-0080-permissioned-domains.html",
    detail: "Creates controlled environments within the broader XRPL. A domain on its own does nothing. It is consumed by other features (such as the Permissioned DEX and Lending Protocol) to restrict access to accounts that hold valid credentials. Adds the PermissionedDomain ledger entry and PermissionedDomainSet and PermissionedDomainDelete transactions.",
  },
  {
    date: "Jan 2025", title: "AMMClawback (XLS-73)", color: "#22c55e", status: "enabled",
    xls: "XLS-73", xlsUrl: "https://xls.xrpl.org/xls/XLS-0073-amm-clawback.html",
    detail: "Allows token issuers to claw back tokens that holders have deposited into an AMM, if clawback is enabled on the token. Adds the AMMClawback transaction. Also modifies AMMDeposit to prevent depositing frozen tokens into an AMM.",
  },
  {
    date: "Jan 2026, voting in progress", title: "SingleAssetVault (XLS-65) + Lending Protocol (XLS-66)", color: "#f59e0b", status: "voting",
    xls: "XLS-65 / XLS-66", xlsUrl: "https://xls.xrpl.org/xls/XLS-0066-lending-protocol.html",
    detail: "Two amendments shipped together in rippled v3.1.0, currently in validator voting.\n\nSingleAssetVault (XLS-65): A vault aggregates assets from multiple depositors and makes them available to on-chain protocols. A vault holds exactly one asset type (XRP, a trust line token, or an MPT). Depositors receive shares, represented as MPTs, proportional to their contribution. Vaults can be public (anyone can deposit) or private (only accounts with valid credentials in a Permissioned Domain can deposit, though anyone can always redeem their existing shares). The Vault Owner manages the vault and can configure whether shares are transferable.\n\nLending Protocol (XLS-66): Enables fixed-term, uncollateralized loans drawn from vault funds. Three roles: Loan Brokers (create vaults, manage loans, and optionally deposit first-loss capital as a buffer against defaults), Depositors (add assets to vaults), and Borrowers (receive loans on defined terms). Creditworthiness is assessed off-chain. The protocol does not include automated on-chain collateral or liquidation. Requires 80% validator supermajority sustained for two weeks to activate.",
  },
];

const transactions = [
  {
    type: "AccountSet",
    category: "Trust Line Tokens",
    tier: "primary",
    tierLabel: "Required — step 3 of 11 in 'Issue a Fungible Token' tutorial",
    color: "#22c55e",
    source: "xrpl.org/docs/tutorials/tokens/fungible-tokens/issue-a-fungible-token",
    tutorialUrl: "https://xrpl.org/docs/tutorials/tokens/fungible-tokens/issue-a-fungible-token",
    refUrls: [{ name: "AccountSet", url: "https://xrpl.org/docs/references/protocol/transactions/types/accountset" }],
    description: "Configures issuer account settings. For trust line token issuers this is a required step before creating any trust lines.\n• The issuer's cold address must set asfDefaultRipple before any trust lines exist — without it, holders cannot send the token to each other.\n• Also used to set TransferRate, TickSize, Domain, and flags like Disallow XRP and Require Destination Tags.\n• Not needed for MPT issuers, as MPTs do not use rippling.",
    example: `// Required cold address setup (trust line token issuers only)\nconst cold_settings_tx = {\n  "TransactionType": "AccountSet",\n  "Account": cold_wallet.address,\n  "TransferRate": 0,\n  "TickSize": 5,\n  "Domain": "6578616D706C652E636F6D",\n  "SetFlag": xrpl.AccountSetAsfFlags.asfDefaultRipple,\n  "Flags": (\n    xrpl.AccountSetTfFlags.tfDisallowXRP |\n    xrpl.AccountSetTfFlags.tfRequireDestTag\n  )\n}`,
  },
  {
    type: "TrustSet",
    category: "Trust Line Tokens",
    tier: "primary",
    tierLabel: "Primary — step 6 of 11 in 'Issue a Fungible Token' tutorial + Trust Line concept page",
    color: "#22c55e",
    source: "xrpl.org/docs/concepts/tokens/fungible-tokens/trust-line-tokens",
    tutorialUrl: "https://xrpl.org/docs/tutorials/tokens/fungible-tokens/issue-a-fungible-token",
    refUrls: [{ name: "TrustSet", url: "https://xrpl.org/docs/references/protocol/transactions/types/trustset" }],
    description: "Creates or modifies a trust line between a holder and an issuer. A holder must send this transaction before they can receive any trust line token. The ledger will not allow a token to be delivered to an account that has not opted in. The key field is LimitAmount, which sets the maximum the holder is willing to hold. TrustSet is also used to configure No Ripple, Freeze, DeepFreeze, and Quality settings on an existing trust line. AccountSet on the issuer must run first.",
    example: `{\n  "TransactionType": "TrustSet",\n  "Account": "rHolderAddress...",\n  "LimitAmount": {\n    "currency": "USD",\n    "issuer": "rIssuerColdAddress...",\n    "value": "1000"\n  }\n}`,
  },
  {
    type: "Payment",
    category: "Trust Line + MPT (Universal)",
    tier: "primary",
    tierLabel: "Primary — cited in both Trust Line and MPT concept pages; step 8 of 11 in fungible token tutorial",
    color: "#f59e0b",
    source: "xrpl.org/docs/concepts/tokens/fungible-tokens/trust-line-tokens + multi-purpose-tokens",
    tutorialUrl: null,
    tutorialUrls: [
      { name: "Create Trust Line and Send Currency", url: "https://xrpl.org/docs/tutorials/payments/create-trust-line-send-currency-in-javascript" },
      { name: "Sending MPTs in JavaScript", url: "https://xrpl.org/docs/tutorials/tokens/mpts/sending-mpts-in-javascript" },
    ],
    refUrls: [{ name: "Payment", url: "https://xrpl.org/docs/references/protocol/transactions/types/payment" }],
    description: "The universal transaction for transferring XRP, trust line tokens, and MPTs. For trust line token issuers, a Payment from the cold address to a hot address mints and distributes tokens. For MPT issuers, Payment is how new units are minted to holders. Sending tokens back to the issuer automatically burns them and reduces the outstanding supply. For MPTs, the Amount field uses mpt_issuance_id instead of currency and issuer.",
    example: `// Minting MPTs (issuer to holder)\n{\n  "TransactionType": "Payment",\n  "Account": "rIssuer...",\n  "Destination": "rHolder...",\n  "Amount": {\n    "mpt_issuance_id": "00070C44...",\n    "value": "500"\n  },\n  "Fee": "10"\n}\n\n// Burning MPTs (holder sends back to issuer)\n{\n  "TransactionType": "Payment",\n  "Account": "rHolder...",\n  "Destination": "rIssuer...",\n  "Amount": {\n    "mpt_issuance_id": "00070C44...",\n    "value": "100"\n  },\n  "Fee": "10"\n}`,
  },
  {
    type: "MPTokenIssuanceCreate",
    category: "MPT",
    tier: "primary",
    tierLabel: "Primary — MPT concept page See Also > References; step 4 of 5 in MPT tutorial",
    color: "#3b82f6",
    source: "xrpl.org/docs/concepts/tokens/fungible-tokens/multi-purpose-tokens#see-also",
    tutorialUrl: "https://xrpl.org/docs/tutorials/tokens/mpts/issue-a-multi-purpose-token",
    refUrls: [{ name: "MPTokenIssuanceCreate", url: "https://xrpl.org/docs/references/protocol/transactions/types/mptokenissuancecreate" }],
    description: "Creates a new MPT issuance. This is the only opportunity to set immutable fields — flags like Can Transfer, Require Auth, Can Lock, and Can Clawback cannot be changed after creation. Key fields:\n• AssetScale — where to place the decimal point when displaying amounts.\n• MaximumAmount — supply cap on circulating tokens.\n• TransferFee — 0 to 50%, charged on holder-to-holder transfers.\n• MPTokenMetadata — up to 1024 bytes of hex-encoded JSON per the XLS-89 schema.\n\nThe SDK encodeMPTokenMetadata() utility encodes metadata correctly. If metadata exceeds 1024 bytes, the transaction fails.",
    example: `{\n  "TransactionType": "MPTokenIssuanceCreate",\n  "Account": "rIssuer...",\n  "AssetScale": 4,\n  "MaximumAmount": "50000000",\n  "TransferFee": 0,\n  "Flags":\n    MPTokenIssuanceCreateFlags.tfMPTCanTransfer |\n    MPTokenIssuanceCreateFlags.tfMPTCanTrade,\n  "MPTokenMetadata": "7B22743A...",\n  "Fee": "10"\n}`,
  },
  {
    type: "MPTokenIssuanceDestroy",
    category: "MPT",
    tier: "primary",
    tierLabel: "Primary — MPT concept page See Also > References",
    color: "#3b82f6",
    source: "xrpl.org/docs/concepts/tokens/fungible-tokens/multi-purpose-tokens#see-also",
    tutorialUrl: null,
    refUrls: [{ name: "MPTokenIssuanceDestroy", url: "https://xrpl.org/docs/references/protocol/transactions/types/mptokenissuancedestroy" }],
    description: "Permanently destroys an MPT issuance and removes it from the ledger. Can only succeed when OutstandingAmount is zero, meaning all tokens must have been burned (sent back to the issuer) first. Frees the 0.2 XRP owner reserve the issuer set aside when the issuance was created.",
    example: `{\n  "TransactionType": "MPTokenIssuanceDestroy",\n  "Account": "rIssuer...",\n  "MPTokenIssuanceID": "00070C4495F14B0E...",\n  "Fee": "10"\n}`,
  },
  {
    type: "MPTokenIssuanceSet",
    category: "MPT",
    tier: "primary",
    tierLabel: "Primary — MPT concept page See Also > References",
    color: "#3b82f6",
    source: "xrpl.org/docs/concepts/tokens/fungible-tokens/multi-purpose-tokens#see-also",
    tutorialUrl: null,
    refUrls: [{ name: "MPTokenIssuanceSet", url: "https://xrpl.org/docs/references/protocol/transactions/types/mptokenissuanceset" }],
    description: "Modifies mutable settings on an existing MPT issuance. Used to lock or unlock the issuance globally (affecting all holders at once), or to lock or unlock a specific holder's balance. Locking is only possible if the issuance was created with the Can Lock flag. This is the MPT equivalent of a global or individual freeze on trust line tokens. When the DynamicMPT amendment is enabled, this transaction will also support updating MPTokenMetadata and TransferFee if those fields were declared mutable at creation.",
    example: `// Lock all holders globally\n{\n  "TransactionType": "MPTokenIssuanceSet",\n  "Account": "rIssuer...",\n  "MPTokenIssuanceID": "00070C44...",\n  "Flags": 1,\n  "Fee": "10"\n}\n\n// Lock a specific holder\n{\n  "TransactionType": "MPTokenIssuanceSet",\n  "Account": "rIssuer...",\n  "MPTokenIssuanceID": "00070C44...",\n  "MPTokenHolder": "rHolder...",\n  "Flags": 1,\n  "Fee": "10"\n}`,
  },
  {
    type: "MPTokenAuthorize",
    category: "MPT",
    tier: "primary",
    tierLabel: "Primary — MPT concept page See Also > References",
    color: "#3b82f6",
    source: "xrpl.org/docs/concepts/tokens/fungible-tokens/multi-purpose-tokens#see-also",
    tutorialUrl: "https://xrpl.org/docs/tutorials/tokens/mpts/sending-mpts-in-javascript",
    refUrls: [{ name: "MPTokenAuthorize", url: "https://xrpl.org/docs/references/protocol/transactions/types/mptokenauthorize" }],
    description: "Dual-purpose transaction:\n• Sent by a holder — opts in to holding an MPT (required before they can receive any).\n• Sent by an issuer (Require Auth issuances only) — explicitly authorises a specific account to hold the token.\n\nBoth sides must act before a holder can receive tokens on a Require Auth issuance.",
    example: `// Holder opts in\n{\n  "TransactionType": "MPTokenAuthorize",\n  "Account": "rHolder...",\n  "MPTokenIssuanceID": "00070C44...",\n  "Fee": "10"\n}\n\n// Issuer authorises a specific holder (Require Auth issuances only)\n{\n  "TransactionType": "MPTokenAuthorize",\n  "Account": "rIssuer...",\n  "MPTokenIssuanceID": "00070C44...",\n  "MPTokenHolder": "rHolder...",\n  "Fee": "10"\n}`,
  },
  {
    type: "CredentialCreate / CredentialAccept / CredentialDelete",
    category: "Credentials (XLS-70)",
    tier: "compliance",
    tierLabel: "Compliance layer — from Known Amendments > Credentials",
    color: "#ec4899",
    source: "xrpl.org/resources/known-amendments#credentials",
    tutorialUrl: null,
    refUrls: [
      { name: "CredentialCreate", url: "https://xrpl.org/docs/references/protocol/transactions/types/credentialcreate" },
      { name: "CredentialAccept", url: "https://xrpl.org/docs/references/protocol/transactions/types/credentialaccept" },
      { name: "CredentialDelete", url: "https://xrpl.org/docs/references/protocol/transactions/types/credentialdelete" },
    ],
    description: "Three-transaction lifecycle for on-chain credentials:\n• CredentialCreate — an authorised issuer mints a credential for a subject account (e.g. KYC-verified status).\n• CredentialAccept — the subject accepts it, making it active.\n• CredentialDelete — removes it from the ledger.\n\nOnce active, a credential's ID can be included in a CredentialIDs field on Payment, EscrowFinish, PaymentChannelClaim, and AccountDelete transactions, proving the sender meets deposit authorisation requirements.",
    example: `// Issuer creates credential\n{\n  "TransactionType": "CredentialCreate",\n  "Account": "rIssuer...",\n  "Subject": "rHolder...",\n  "CredentialType": "6B79630000...",\n  "Fee": "10"\n}\n\n// Holder accepts it\n{\n  "TransactionType": "CredentialAccept",\n  "Account": "rHolder...",\n  "Issuer": "rIssuer...",\n  "CredentialType": "6B79630000...",\n  "Fee": "10"\n}`,
  },
  {
    type: "NFTokenMint / NFTokenCreateOffer / NFTokenAcceptOffer",
    category: "NFTs (XLS-20)",
    tier: "nft",
    tierLabel: "NFT lifecycle — from /docs/concepts/tokens/nfts",
    color: "#a855f7",
    source: "xrpl.org/docs/concepts/tokens/nfts",
    tutorialUrl: null,
    refUrls: [
      { name: "NFTokenMint", url: "https://xrpl.org/docs/references/protocol/transactions/types/nftokenmint" },
      { name: "NFTokenCreateOffer", url: "https://xrpl.org/docs/references/protocol/transactions/types/nftokencreateoffer" },
      { name: "NFTokenAcceptOffer", url: "https://xrpl.org/docs/references/protocol/transactions/types/nftokenacceptoffer" },
    ],
    description: "The core NFT transaction set:\n• NFTokenMint — creates a unique NFT, setting immutable fields including TransferFee (royalty on each secondary sale), URI (link to off-chain metadata), and flags such as transferable or burnable.\n• NFTokenCreateOffer — creates a buy or sell offer for a specific NFT.\n• NFTokenAcceptOffer — executes the trade.\n• NFTokenBurn — permanently destroys an NFT.",
    example: `// Mint an NFT\n{\n  "TransactionType": "NFTokenMint",\n  "Account": "rCreator...",\n  "NFTokenTaxon": 0,\n  "TransferFee": 5000,\n  "Flags": 8,\n  "URI": "697066733A2F...",\n  "Fee": "10"\n}\n\n// Create a sell offer\n{\n  "TransactionType": "NFTokenCreateOffer",\n  "Account": "rSeller...",\n  "NFTokenID": "000800005...",\n  "Amount": "1000000",\n  "Flags": 1,\n  "Fee": "10"\n}`,
  },
];

const rlusdFaqs = [
  {
    title: "What is RLUSD?",
    content: "RLUSD is Ripple's US dollar-backed stablecoin. Each token is backed 1:1 by US dollar deposits, short-term US Treasury bills, and cash equivalents held in segregated reserve accounts. It is natively issued on both the XRP Ledger and Ethereum. Monthly third-party reserve attestations are published for transparency.",
  },
  {
    title: "Who issues and regulates it?",
    content: "RLUSD is issued by Standard Custody & Trust Company, LLC (SCTC), a subsidiary of Ripple, under a limited purpose trust charter from the New York Department of Financial Services (NYDFS). SCTC adheres to the strict KYC and AML requirements of New York banking laws. RLUSD also has approval from the Dubai Financial Services Authority (DFSA). BNY Mellon was selected as the primary custodian of RLUSD reserves in July 2025.",
  },
  {
    title: "What is it used for?",
    content: "According to Ripple's documentation, RLUSD is designed for cross-border payments (integrated into Ripple Payments), trading pairs on exchanges, on/off-ramping between fiat and crypto, DeFi collateral, and peer-to-peer or business payouts. It is also used for collateralising tokenised real-world assets.",
  },
  {
    title: "How does it differ from XRP?",
    content: "XRP is the native asset of the XRPL. It is used to pay transaction fees (called gas) and as a bridge currency in cross-currency payments. RLUSD is always worth approximately one USD and is designed for stable settlement. XRP handles the network's infrastructure costs; RLUSD handles value transfer without price volatility.",
  },
  {
    title: "Can RLUSD be used across multiple blockchains?",
    content: "Yes. RLUSD is natively issued on both the XRP Ledger and Ethereum. Ripple has announced plans to expand to Ethereum Layer 2 networks (Optimism, Base, Ink, Unichain) using Wormhole's Native Token Transfer standard. A pilot was underway as of December 2025, with a wider rollout pending NYDFS approval.",
  },
];

const faqData = [
  {
    q: "What is a blockchain and how does XRPL fit in?",
    a: "A blockchain is a shared database maintained by many computers at once, with no single owner. Records on it cannot be altered once confirmed. The XRP Ledger (XRPL) is a public blockchain — anyone can use it or run a server that helps maintain it. It was designed specifically for fast, low-cost financial transactions and tokenisation.",
  },
  {
    q: "What does 'tokenisation' mean?",
    a: "Tokenisation means creating a digital representation of an asset on a blockchain. For example, a US Treasury bill can be represented as a token on XRPL. The token does not replace the real asset; it represents a claim on it. This makes assets easier to transfer, trade, or fractionalise without the friction of traditional settlement systems.",
  },
  {
    q: "Why does a holder have to opt in before receiving tokens?",
    a: "This is a core XRPL design principle: you cannot force someone to hold tokens they did not agree to. For trust line tokens, holders send a TrustSet transaction to opt in. For MPTs, holders send MPTokenAuthorize. XRP is the exception; any account can receive XRP without opting in.",
  },
  {
    q: "What happens when you send tokens back to the issuer?",
    a: "They are automatically burned (destroyed) and the outstanding supply decreases. Issuers cannot hold their own tokens. This is how token supply shrinks on XRPL. For MPTs with a supply cap, burned tokens free up room to issue new ones up to that cap.",
  },
  {
    q: "What is the DEX and how does it relate to tokens?",
    a: "The DEX (Decentralised Exchange) is a built-in trading system inside the XRPL itself; no separate application is needed. Trust line tokens can be traded on the DEX today. MPTs have a Can Trade flag but DEX trading for MPTs is not yet implemented. It is planned under XLS-82.",
  },
  {
    q: "What does 'amendment' mean on XRPL?",
    a: "An amendment is how the XRP Ledger gets new features or changes. Any proposed change is written as an amendment, then validator nodes vote on it. If more than 80% of trusted validators vote yes and sustain that for two consecutive weeks, the amendment activates permanently for all participants. Changes cannot be forced through by any single organisation.",
  },
  {
    q: "What is rippling and why does it matter?",
    a: "Rippling is a feature of trust line tokens where a payment can flow through an intermediary account that holds trust lines in the same currency. For example, if Alice and Bob both hold USD from the same issuer, a payment from Alice to Bob might route through the issuer rather than moving directly. This is useful in community credit systems, but can cause unexpected behaviour for issuers if not configured correctly. Issuers should enable the Default Ripple flag on their account so holders can send tokens to each other. Non-issuer accounts should generally disable rippling on their trust lines using the No Ripple flag to avoid their account being used as an unintended pass-through. MPTs do not use rippling at all, which is one reason the MPT model is considered simpler.",
  },
];

// COMPONENTS

const tierStyles = {
  primary:    { bg: "#f0fdf4", border: "#bbf7d0", badge: "#16a34a", label: "✅ Primary" },
  compliance: { bg: "#fdf4ff", border: "#e9d5ff", badge: "#9333ea", label: "🔐 Compliance" },
  nft:        { bg: "#f5f3ff", border: "#ddd6fe", badge: "#7c3aed", label: "🎨 NFT Lifecycle" },
};

function renderDescription(text) {
  const lines = text.split('\n');
  const result = [];
  let bullets = [];
  const flushBullets = () => {
    if (bullets.length === 0) return;
    result.push(<ul key={result.length} style={{ margin: "6px 0 0", paddingLeft: 20 }}>{bullets.map((b, i) => <li key={i} style={{ color: "#374151", fontSize: 14, lineHeight: 1.7, marginBottom: 2 }}>{b}</li>)}</ul>);
    bullets = [];
  };
  lines.forEach(line => {
    if (line.startsWith('•')) { bullets.push(line.slice(1).trim()); }
    else if (line === '') { flushBullets(); }
    else { flushBullets(); result.push(<p key={result.length} style={{ color: "#374151", lineHeight: 1.7, fontSize: 14, margin: result.length > 0 ? "8px 0 0" : "0" }}>{line}</p>); }
  });
  flushBullets();
  return result;
}

function Pill({ color, children }) {
  return <span style={{ background: color, color: "#fff", borderRadius: 6, padding: "2px 9px", fontSize: 11, fontWeight: 700, whiteSpace: "nowrap" }}>{children}</span>;
}

function Chevron({ open }) {
  return <span style={{ color: "#9ca3af", flexShrink: 0 }}>{open ? "▲" : "▼"}</span>;
}


function Accordion({ expanded, onToggle, header, children, borderColor = "#e5e7eb", bgOpen = "#f8fafc" }) {
  return (
    <div style={{ border: `1px solid ${expanded ? borderColor : "#e5e7eb"}`, borderRadius: 10, marginBottom: 12, overflow: "hidden", cursor: "pointer", background: expanded ? bgOpen : "#fff" }} onClick={onToggle}>
      <div style={{ padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
        {header}
        <Chevron open={expanded} />
      </div>
      {expanded && <div style={{ padding: "0 16px 16px", borderTop: `1px solid ${borderColor}` }}>{children}</div>}
    </div>
  );
}

function TokenCard({ t, expanded, onToggle }) {
  return (
    <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, marginBottom: 16, overflow: "hidden", cursor: "pointer", background: expanded ? "#f8fafc" : "#fff", boxShadow: expanded ? "0 4px 16px rgba(0,0,0,0.08)" : "0 1px 4px rgba(0,0,0,0.04)" }} onClick={onToggle}>
      <div style={{ padding: "18px 20px", display: "flex", alignItems: "center", gap: 14 }}>
        <span style={{ fontSize: 28, flexShrink: 0 }}>{t.icon}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <span style={{ fontWeight: 700, fontSize: 17 }}>{t.name}</span>
            <span style={{ background: t.badgeColor, color: "#fff", borderRadius: 20, padding: "2px 10px", fontSize: 12, fontWeight: 600 }}>{t.badge}</span>
          </div>
          <div style={{ color: "#6b7280", fontSize: 12, marginTop: 3 }}>{t.also}</div>
        </div>
        <Chevron open={expanded} />
      </div>
      {expanded && (
        <div style={{ padding: "0 20px 20px", borderTop: "1px solid #f1f5f9" }}>
          <p style={{ color: "#374151", lineHeight: 1.7, marginTop: 14, fontSize: 14 }}>{t.description}</p>
          {t.note && <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: "10px 14px", fontSize: 13, marginTop: 10 }}><strong>Note:</strong> {t.note}</div>}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 14 }}>
            <div style={{ background: "#f0fdf4", borderRadius: 8, padding: "12px 14px" }}>
              <div style={{ fontWeight: 600, color: "#16a34a", marginBottom: 6, fontSize: 13 }}>✅ Strengths</div>
              {t.pros.map((p, i) => <div key={i} style={{ color: "#374151", fontSize: 13, marginBottom: 4, lineHeight: 1.5 }}>• {p}</div>)}
            </div>
            <div style={{ background: "#fff7ed", borderRadius: 8, padding: "12px 14px" }}>
              <div style={{ fontWeight: 600, color: "#ea580c", marginBottom: 6, fontSize: 13 }}>⚠️ Considerations</div>
              {t.cons.map((c, i) => <div key={i} style={{ color: "#374151", fontSize: 13, marginBottom: 4, lineHeight: 1.5 }}>• {c}</div>)}
            </div>
          </div>
          <div style={{ marginTop: 12, background: "#eff6ff", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#1e40af" }}>
            <strong>Common use cases:</strong> {t.useCases}
          </div>
          <div style={{ marginTop: 8 }}>
            <a href={t.sourceUrl} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: "#6b7280" }}>📖 Source: {t.sourceUrl} ↗</a>
          </div>
        </div>
      )}
    </div>
  );
}

function TxCard({ tx, expanded, onToggle }) {
  const ts = tierStyles[tx.tier] || tierStyles.primary;
  return (
    <div style={{ border: `1px solid ${expanded ? ts.border : "#e5e7eb"}`, borderRadius: 10, marginBottom: 12, overflow: "hidden", cursor: "pointer", background: expanded ? ts.bg : "#fff" }} onClick={onToggle}>
      <div style={{ padding: "13px 16px", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <Pill color={tx.color}>{tx.category}</Pill>
        <Pill color={ts.badge}>{ts.label}</Pill>
        <span style={{ fontWeight: 700, fontFamily: "monospace", fontSize: 13, flex: 1 }}>{tx.type}</span>
        <Chevron open={expanded} />
      </div>
      {expanded && (
        <div style={{ padding: "0 16px 16px", borderTop: `1px solid ${ts.border}` }}>
          <div style={{ marginTop: 12, marginBottom: 10, fontSize: 12, color: "#6b7280", display: "flex", gap: 12, flexWrap: "wrap" }}>
            {tx.tutorialUrl && <a href={tx.tutorialUrl} target="_blank" rel="noreferrer" style={{ color: "#7c3aed" }}>📘 Tutorial ↗</a>}
            {tx.tutorialUrls && tx.tutorialUrls.map(t => (
              <a key={t.url} href={t.url} target="_blank" rel="noreferrer" style={{ color: "#7c3aed" }}>📘 {t.name} ↗</a>
            ))}
            {tx.refUrls && tx.refUrls.map(r => (
              <a key={r.url} href={r.url} target="_blank" rel="noreferrer" style={{ color: "#2563eb" }}>📄 {r.name} ↗</a>
            ))}
          </div>
          <div style={{ fontSize: 11, color: "#9ca3af", marginBottom: 10, fontStyle: "italic" }}>{tx.tierLabel}</div>
          {renderDescription(tx.description)}
          <pre style={{ background: "#1e293b", color: "#e2e8f0", borderRadius: 8, padding: "12px 14px", fontSize: 11, marginTop: 12, overflowX: "auto", lineHeight: 1.7 }}>{tx.example}</pre>
        </div>
      )}
    </div>
  );
}

// APP

export default function App() {
  const [active, setActive] = useState("overview");
  const [expanded, setExpanded] = useState(null);
  const toggle = id => setExpanded(expanded === id ? null : id);

  return (
    <div style={{ fontFamily: "system-ui, -apple-system, sans-serif", maxWidth: 780, margin: "0 auto", padding: "16px 16px 40px" }}>

      <div style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)", borderRadius: 14, padding: "24px 28px", marginBottom: 20, color: "#fff" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ fontSize: 36 }}>🪙</span>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>Tokenization on the XRP Ledger</h1>
            <p style={{ margin: "4px 0 0", color: "#94a3b8", fontSize: 14 }}>Interactive onboarding guide · Sources: xrpl.org, xls.xrpl.org, ripple.com, docs.ripple.com, opensource.ripple.com · March 2026</p>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
        {sections.map(s => (
          <button key={s.id} onClick={() => { setActive(s.id); setExpanded(null); }} style={{ border: "none", borderRadius: 8, padding: "8px 14px", cursor: "pointer", fontSize: 13, fontWeight: 600, background: active === s.id ? "#2563eb" : "#f1f5f9", color: active === s.id ? "#fff" : "#374151", transition: "all 0.15s" }}>
            {s.icon} {s.label}
          </button>
        ))}
      </div>

      {active === "overview" && (
        <div>
          <h2 style={{ fontWeight: 800, fontSize: 20, marginBottom: 8 }}>What is tokenization on the XRP Ledger?</h2>
          <p style={{ color: "#374151", lineHeight: 1.7, fontSize: 15 }}>
            Tokenization means creating a digital representation of an asset on a blockchain. On the XRP Ledger, this is done natively, with no external smart contract code required. Compliance tools, a built-in trading exchange (DEX), and settlement are all part of the protocol itself.
          </p>
          <p style={{ color: "#374151", lineHeight: 1.7, fontSize: 15, marginTop: 8 }}>
            XRPL confirms transactions through a consensus process. Designated servers called validators agree on the order and outcome of transactions every 3 to 5 seconds. Over 150 validators are currently active, operated by universities, exchanges, businesses, and individuals.
          </p>
          <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 10, padding: "14px 18px", marginTop: 16 }}>
            <strong>Key point for new readers:</strong> XRP is the native asset of the XRP Ledger. It is <em>not</em> a token in XRPL terminology. Every account must hold a small amount of XRP in reserve, and small amounts of XRP are burned as a fee on every transaction. All other assets are tokens.
          </div>
          <h3 style={{ fontWeight: 700, fontSize: 16, marginTop: 20, marginBottom: 10 }}>Token use cases on XRPL</h3>
          <p style={{ color: "#6b7280", fontSize: 13, marginBottom: 12 }}>Source: <a href="https://xrpl.org/docs/concepts/tokens" target="_blank" rel="noreferrer" style={{ color: "#2563eb" }}>xrpl.org/docs/concepts/tokens</a></p>
          {[
            ["🏦", "Stablecoins", "An issuer holds real-world assets (e.g. USD) outside the ledger and issues tokens representing equivalent value on-chain. RLUSD is Ripple's own example."],
            ["📜", "Real-World Assets (RWAs)", "Physical or financial assets such as T-bills, real estate, and commodities, represented as tokens. The token is a claim on the off-chain asset."],
            ["🎮", "Digital and gaming tokens", "Purely digital tokens for online systems, games, and in-game economies. NFTs are a common format here."],
            ["🤝", "Community credit", "Individuals track debts to each other on-chain. XRPL can automatically route payments through these relationships using a feature called rippling."],
            ["🪙", "Meme coins and ICOs", "Community-driven speculative tokens. ICOs may be regulated as securities in some jurisdictions. Check local regulations before proceeding."],
          ].map(([icon, title, desc]) => (
            <div key={title} style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
              <span style={{ fontSize: 22, marginTop: 2, flexShrink: 0 }}>{icon}</span>
              <div><strong style={{ fontSize: 14 }}>{title}</strong><div style={{ color: "#6b7280", fontSize: 13, lineHeight: 1.6 }}>{desc}</div></div>
            </div>
          ))}
        </div>
      )}

      {active === "token-types" && (
        <div>
          <h2 style={{ fontWeight: 800, fontSize: 20, marginBottom: 6 }}>Token Standards</h2>
          <p style={{ color: "#6b7280", fontSize: 14, marginBottom: 4 }}>XRPL has three token standards. Click each to expand details.</p>
          <p style={{ color: "#6b7280", fontSize: 13, marginBottom: 18 }}>Source: <a href="https://xrpl.org/docs/concepts/tokens" target="_blank" rel="noreferrer" style={{ color: "#2563eb" }}>xrpl.org/docs/concepts/tokens</a></p>
          {tokenTypes.map((t, i) => <TokenCard key={i} t={t} expanded={expanded === `t${i}`} onToggle={() => toggle(`t${i}`)} />)}
        </div>
      )}

      {active === "transactions" && (
        <div>
          <h2 style={{ fontWeight: 800, fontSize: 20, marginBottom: 8 }}>Key Transactions for Tokenization</h2>
          <div style={{ background: "#f8fafc", border: "1px solid #e5e7eb", borderRadius: 10, padding: "12px 16px", marginBottom: 14, fontSize: 13, color: "#374151" }}>
            <strong>How this list was derived:</strong> Every transaction here is explicitly cited in the official xrpl.org concept pages (<a href="https://xrpl.org/docs/concepts/tokens/fungible-tokens/trust-line-tokens" target="_blank" rel="noreferrer" style={{ color: "#2563eb" }}>Trust Line Tokens</a>, <a href="https://xrpl.org/docs/concepts/tokens/fungible-tokens/multi-purpose-tokens" target="_blank" rel="noreferrer" style={{ color: "#2563eb" }}>Multi-Purpose Tokens</a>, <a href="https://xrpl.org/docs/concepts/tokens/nfts" target="_blank" rel="noreferrer" style={{ color: "#2563eb" }}>NFTs</a>, <a href="https://xrpl.org/resources/known-amendments#credentials" target="_blank" rel="noreferrer" style={{ color: "#2563eb" }}>Credentials amendment</a>) and/or the official <a href="https://xrpl.org/docs/tutorials" target="_blank" rel="noreferrer" style={{ color: "#2563eb" }}>Tokens, Payments, and DeFi tutorials</a>.
          </div>
          <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 10, padding: "12px 16px", marginBottom: 18, fontSize: 13 }}>
            <strong>📚 Official tutorial sequence</strong> — organised by category at <a href="https://xrpl.org/docs/tutorials" target="_blank" rel="noreferrer" style={{ color: "#2563eb" }}>xrpl.org/docs/tutorials</a>
            <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { label: "Tokens", links: [
                  ["Issue a Multi-Purpose Token", "https://xrpl.org/docs/tutorials/tokens/mpts/issue-a-multi-purpose-token"],
                  ["Issue a Fungible Token", "https://xrpl.org/docs/tutorials/tokens/fungible-tokens/issue-a-fungible-token"],
                  ["Mint and Burn NFTs", "https://xrpl.org/docs/tutorials/tokens/nfts/mint-and-burn-nfts-js"],
                ]},
                { label: "Payments", links: [
                  ["Send XRP", "https://xrpl.org/docs/tutorials/payments/send-xrp"],
                  ["Sending MPTs in JavaScript", "https://xrpl.org/docs/tutorials/tokens/mpts/sending-mpts-in-javascript"],
                  ["Create Trust Line and Send Currency", "https://xrpl.org/docs/tutorials/payments/create-trust-line-send-currency-in-javascript"],
                ]},
                { label: "DeFi", links: [
                  ["Trade in the DEX", "https://xrpl.org/docs/tutorials/defi/dex/trade-in-the-decentralized-exchange"],
                  ["Create an AMM", "https://xrpl.org/docs/tutorials/defi/dex/create-an-automated-market-maker"],
                  ["Create a Single Asset Vault", "https://xrpl.org/docs/tutorials/defi/lending/use-single-asset-vaults/create-a-single-asset-vault"],
                  ["Create a Loan Broker", "https://xrpl.org/docs/tutorials/defi/lending/use-the-lending-protocol/create-a-loan-broker"],
                  ["Create a Loan", "https://xrpl.org/docs/tutorials/defi/lending/use-the-lending-protocol/create-a-loan"],
                ]},
              ].map(({ label, links }) => (
                <div key={label}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {links.map(([name, url]) => (
                      <a key={name} href={url} target="_blank" rel="noreferrer" style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 6, padding: "3px 10px", fontSize: 12, color: "#2563eb", textDecoration: "none", whiteSpace: "nowrap" }}>{name}</a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
            {[["✅ Primary", "#16a34a", "Core issuance and transfer"], ["🔐 Compliance", "#9333ea", "Credential and authorisation layer"], ["🎨 NFT Lifecycle", "#7c3aed", "NFT-specific"]].map(([l, c, d]) => (
              <div key={l} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
                <span style={{ background: c, color: "#fff", borderRadius: 5, padding: "2px 8px", fontWeight: 600 }}>{l}</span>
                <span style={{ color: "#6b7280" }}>{d}</span>
              </div>
            ))}
          </div>
          {transactions.map((tx, i) => <TxCard key={i} tx={tx} expanded={expanded === `tx${i}`} onToggle={() => toggle(`tx${i}`)} />)}
          <div style={{ background: "#eff6ff", borderRadius: 10, padding: "14px 18px", marginTop: 8, fontSize: 14, color: "#1e40af" }}>
            <strong>Not in this list:</strong> OfferCreate/Cancel (DEX trading), EscrowCreate/Finish (time-locked transfers), AMMCreate/Deposit (liquidity pools), and Lending Protocol transactions (vault operations from XLS-65/66) are all tokenization-adjacent but belong to DEX, DeFi, or account-management flows.
          </div>
        </div>
      )}

      {active === "stablecoin" && (
        <div>
          <div style={{ background: "linear-gradient(135deg, #064e3b, #065f46)", borderRadius: 12, padding: "20px 24px", color: "#fff", marginBottom: 20 }}>
            <div style={{ fontSize: 32 }}>💵</div>
            <h2 style={{ fontWeight: 800, fontSize: 20, margin: "8px 0 4px" }}>RLUSD — Ripple USD</h2>
            <p style={{ color: "#a7f3d0", fontSize: 14, margin: "0 0 8px" }}>Ripple's US dollar-backed stablecoin, launched December 2024.</p>
            <p style={{ color: "#6ee7b7", fontSize: 12, margin: 0 }}>Sources: <a href="https://ripple.com/solutions/stablecoin/" target="_blank" rel="noreferrer" style={{ color: "#6ee7b7" }}>ripple.com/solutions/stablecoin</a> · <a href="https://docs.ripple.com/products/stablecoin/overview" target="_blank" rel="noreferrer" style={{ color: "#6ee7b7" }}>docs.ripple.com/products/stablecoin</a></p>
          </div>
          {rlusdFaqs.map((item, i) => (
            <Accordion key={i} expanded={expanded === `rl${i}`} onToggle={() => toggle(`rl${i}`)}
              header={<span style={{ fontWeight: 700, fontSize: 15 }}>{item.title}</span>}>
              <p style={{ marginTop: 12, color: "#374151", lineHeight: 1.7, fontSize: 14 }}>{item.content}</p>
            </Accordion>
          ))}
          <div style={{ background: "#f8fafc", border: "1px solid #e5e7eb", borderRadius: 10, padding: "14px 16px", marginTop: 8, fontSize: 13, color: "#374151" }}>
            <strong>What the docs say about RLUSD vs. XRP:</strong> "XRP and RLUSD are both digital assets, but they serve different purposes. XRP is the native cryptocurrency of the XRP Ledger. RLUSD is designed to maintain a constant value of one US dollar." — <a href="https://ripple.com/solutions/stablecoin/" target="_blank" rel="noreferrer" style={{ color: "#2563eb" }}>ripple.com/solutions/stablecoin</a>
          </div>
        </div>
      )}

      {active === "updates" && (
        <div>
          <h2 style={{ fontWeight: 800, fontSize: 20, marginBottom: 6 }}>Recent Updates</h2>
          <div style={{ background: "#f8fafc", border: "1px solid #e5e7eb", borderRadius: 8, padding: "10px 14px", marginBottom: 18, fontSize: 12, color: "#374151" }}>
            Sources: <a href="https://xrpl.org/resources/known-amendments" target="_blank" rel="noreferrer" style={{ color: "#2563eb" }}>xrpl.org/resources/known-amendments</a> · <a href="https://xls.xrpl.org/" target="_blank" rel="noreferrer" style={{ color: "#2563eb" }}>xls.xrpl.org</a> · <a href="https://opensource.ripple.com" target="_blank" rel="noreferrer" style={{ color: "#2563eb" }}>opensource.ripple.com</a> · <a href="https://github.com/XRPLF/XRPL-Standards" target="_blank" rel="noreferrer" style={{ color: "#2563eb" }}>github.com/XRPLF/XRPL-Standards</a>
          </div>
          <div style={{ position: "relative", paddingLeft: 24 }}>
            <div style={{ position: "absolute", left: 10, top: 0, bottom: 0, width: 2, background: "#e5e7eb" }} />
            {updates.map((u, i) => (
              <div key={i} style={{ position: "relative", marginBottom: 24 }}>
                <div style={{ position: "absolute", left: -19, top: 4, width: 14, height: 14, borderRadius: "50%", background: u.color, border: "2px solid #fff", boxShadow: `0 0 0 2px ${u.color}44` }} />
                <div style={{ background: u.status === "voting" ? "#fffbeb" : "#f8fafc", border: u.status === "voting" ? "1.5px solid #fbbf24" : "1px solid #e5e7eb", borderRadius: 10, padding: "14px 18px", marginLeft: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
                    <Pill color={u.color}>{u.date}</Pill>
                    {u.xls && <span style={{ background: "#eff6ff", color: "#1d4ed8", borderRadius: 6, padding: "2px 9px", fontSize: 11, fontWeight: 600 }}>{u.xls}</span>}
                    {u.status === "voting" && <Pill color="#f59e0b">🗳️ Voting in progress</Pill>}
                    {u.status === "enabled" && <Pill color="#22c55e">✅ Enabled</Pill>}
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 8 }}>{u.title}</div>
                  {u.detail.split("\n\n").map((para, pi) => (
                    <p key={pi} style={{ color: "#374151", fontSize: 14, lineHeight: 1.7, margin: pi > 0 ? "10px 0 0" : "0" }}>{para}</p>
                  ))}
                  {u.xlsUrl && <a href={u.xlsUrl} target="_blank" rel="noreferrer" style={{ display: "inline-block", marginTop: 10, fontSize: 12, color: "#2563eb" }}>View {u.xls} spec ↗</a>}
                </div>
              </div>
            ))}
          </div>
          <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 10, padding: "14px 18px", marginTop: 4, fontSize: 14 }}>
            <strong>On the horizon</strong> — specs merged or code shipped, not yet open for voting:
            <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { xls: "XLS-94", status: "Draft", title: "Dynamic MPTs", url: "https://opensource.ripple.com/docs/xls-94-dynamic-mpts", author: "Yinyi Qian",
                  detail: "By default, all MPT fields are permanently immutable after MPTokenIssuanceCreate. This amendment extends MPTs to let issuers designate specific properties as mutable during token creation, enabling those attributes to be updated later as business needs change. Fields that can be declared mutable: MPTokenMetadata and TransferFee. Flags that can be declared mutable: CanLock, RequireAuth, CanEscrow, CanTrade, CanTransfer, CanClawback. Mutable fields can later be updated via MPTokenIssuanceSet. Fields not marked as mutable at creation remain immutable permanently." },
                { xls: "XLS-96", status: "Draft — testable on Devnet", title: "Confidential Transfers for Multi-Purpose Tokens", url: "https://opensource.ripple.com/docs/xls-96-confidential-transfers", author: "Murat Cenk, Aanchal Malhotra, Ayo Akinyele, Peter Chen, Shawn Xie, Yinyi Qian",
                  detail: "Provides institutional-grade privacy for MPTs. Individual balances and transfer amounts are hidden from the public ledger using EC-ElGamal encryption and zero-knowledge proofs. Compliance mechanisms are preserved: authorised parties (issuers, auditors, or designated entities) can verify total supply and meet regulatory obligations without seeing individual balances. Introduces five new transactions: ConfidentialMPTConvert, ConfidentialMPTSend, ConfidentialMPTMergeInbox, ConfidentialMPTConvertBack, and ConfidentialMPTClawback. Requires XLS-33." },
                { xls: "XLS-68", status: "Draft", title: "Sponsored Fees and Reserves", url: "https://xls.xrpl.org/xls/XLS-0068-sponsored-fees-and-reserves.html", author: "Mayukha Vadari",
                  detail: "Allows a Sponsor account to pay XRP transaction fees and/or account reserves on behalf of another account (the Sponsee). The sponsee retains full control of their own keys. Two new transactions: SponsorshipSet and SponsorshipTransfer. Two new granular permissions: SponsorFee and SponsorReserve. Supports both pre-funded sponsorship (the sponsor deposits XRP in advance) and co-signing flows (the sponsor co-signs individual transactions). Requires XLS-74 (Account Permissions). Primary use case: platforms absorbing onboarding costs so end users do not need to hold XRP themselves." },
                { xls: "XLS-82", status: "Draft (GitHub discussion only)", title: "MPT Support on the DEX", url: "https://github.com/XRPLF/XRPL-Standards/discussions/231", author: "XRPLF community",
                  detail: "Extends existing DEX and AMM transactions to accept MPT amounts. Affected transactions: AMMCreate, AMMDeposit, AMMWithdraw, AMMClawback, CheckCreate, and CheckCash. MPT amounts use mpt_issuance_id in the Amount field rather than the currency and issuer pair used by trust line tokens. The tfMPTCanTrade flag already exists on MPT issuances. The xrpl.org docs note it is not currently implemented, and this amendment delivers the implementation. Note: XLS-82 has not yet been published to xls.xrpl.org or opensource.ripple.com." },
              ].map(item => (
                <div key={item.xls} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, padding: "10px 14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                    <span style={{ background: "#eff6ff", color: "#1d4ed8", borderRadius: 5, padding: "2px 8px", fontSize: 11, fontWeight: 700 }}>{item.xls}</span>
                    <span style={{ background: "#f3f4f6", color: "#6b7280", borderRadius: 5, padding: "2px 7px", fontSize: 10, fontWeight: 600 }}>{item.status}</span>
                    <a href={item.url} target="_blank" rel="noreferrer" style={{ fontWeight: 700, fontSize: 14, color: "#111", textDecoration: "none" }}>{item.title} ↗</a>
                  </div>
                  <div style={{ fontSize: 11, color: "#9ca3af", marginBottom: 6 }}>Author: {item.author}</div>
                  <p style={{ margin: 0, fontSize: 13, color: "#374151", lineHeight: 1.7 }}>{item.detail}</p>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 12, fontSize: 13, color: "#92400e" }}>
              Also in development: the Hooks amendment (XLS still in development), continued EVM sidechain development, and RLUSD's full L2 multichain rollout (pending NYDFS approval, targeted late 2026).
            </div>
          </div>
        </div>
      )}

      {active === "faq" && (
        <div>
          <h2 style={{ fontWeight: 800, fontSize: 20, marginBottom: 6 }}>Frequently Asked Questions</h2>
          <p style={{ color: "#6b7280", fontSize: 14, marginBottom: 16 }}>Click any question to expand the answer.</p>
          {faqData.map((item, i) => (
            <Accordion key={i} expanded={expanded === `faq${i}`} onToggle={() => toggle(`faq${i}`)}
              header={<span style={{ fontWeight: 600, fontSize: 14 }}>{item.q}</span>}>
              <p style={{ marginTop: 12, color: "#374151", lineHeight: 1.7, fontSize: 14 }}>{item.a}</p>
            </Accordion>
          ))}
        </div>
      )}

    </div>
  );
}
