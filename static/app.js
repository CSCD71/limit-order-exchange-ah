// AI-generated code.

import {
  createPublicClient,
  createWalletClient,
  custom,
  getAddress,
  parseAbiItem,
  parseUnits,
  formatUnits
} from "https://esm.sh/viem@2.19.4";
import * as chains from "https://esm.sh/viem@2.19.4/chains";

const PAGE_SIZE = 6;

// MUST match your Exchange EIP712(name, version)
const EIP712_NAME = "D21P2";
const EIP712_VERSION = "1";

// Publish event
const ABI_PUBLISH_EVENT = parseAbiItem(
  "event PublishOrder(bytes32 indexed _hash, address indexed _seller, address indexed _tokenA, address _tokenB, uint256 _amountA, uint256 _amountB, uint256 _expiry, uint256 _nonce, bytes _signature)"
);

// Minimal Exchange ABI
const ABI_EXCHANGE = [
  {
    type: "function",
    name: "sellOrder",
    stateMutability: "nonpayable",
    inputs: [
      {
        name: "order",
        type: "tuple",
        components: [
          { name: "seller", type: "address" },
          { name: "tokenA", type: "address" },
          { name: "tokenB", type: "address" },
          { name: "amountA", type: "uint256" },
          { name: "amountB", type: "uint256" },
          { name: "expiry", type: "uint256" },
          { name: "nonce", type: "uint256" }
        ]
      },
      { name: "signature", type: "bytes" },
      { name: "shouldPublish", type: "bool" }
    ],
    outputs: []
  },
  {
    type: "function",
    name: "fillOrder",
    stateMutability: "nonpayable",
    inputs: [
      {
        name: "order",
        type: "tuple",
        components: [
          { name: "seller", type: "address" },
          { name: "tokenA", type: "address" },
          { name: "tokenB", type: "address" },
          { name: "amountA", type: "uint256" },
          { name: "amountB", type: "uint256" },
          { name: "expiry", type: "uint256" },
          { name: "nonce", type: "uint256" }
        ]
      },
      { name: "signature", type: "bytes" },
      { name: "fillAmountA", type: "uint256" }
    ],
    outputs: []
  },
  {
    type: "function",
    name: "cancelOrder",
    stateMutability: "nonpayable",
    inputs: [
      {
        name: "order",
        type: "tuple",
        components: [
          { name: "seller", type: "address" },
          { name: "tokenA", type: "address" },
          { name: "tokenB", type: "address" },
          { name: "amountA", type: "uint256" },
          { name: "amountB", type: "uint256" },
          { name: "expiry", type: "uint256" },
          { name: "nonce", type: "uint256" }
        ]
      },
      { name: "signature", type: "bytes" }
    ],
    outputs: []
  },
  {
    type: "function",
    name: "bulkFillOrders",
    stateMutability: "nonpayable",
    inputs: [
      {
        name: "orders",
        type: "tuple[]",
        components: [
          { name: "seller", type: "address" },
          { name: "tokenA", type: "address" },
          { name: "tokenB", type: "address" },
          { name: "amountA", type: "uint256" },
          { name: "amountB", type: "uint256" },
          { name: "expiry", type: "uint256" },
          { name: "nonce", type: "uint256" }
        ]
      },
      { name: "signatures", type: "bytes[]" },
      { name: "fillAmountAs", type: "uint256[]" }
    ],
    outputs: []
  },
  {
    type: "function",
    name: "filledAmountA",
    stateMutability: "view",
    inputs: [{ name: "", type: "bytes32" }],
    outputs: [{ name: "", type: "uint256" }]
  },
  {
    type: "function",
    name: "cancelled",
    stateMutability: "view",
    inputs: [{ name: "", type: "bytes32" }],
    outputs: [{ name: "", type: "bool" }]
  }
];

// Minimal ERC20 ABI for approvals
const ABI_ERC20 = [
  {
    type: "function",
    name: "approve",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" }
    ],
    outputs: [{ name: "", type: "bool" }]
  }
];

// DOM
const connectButton = document.getElementById("connectButton");
const networkSelect = document.getElementById("networkSelect");
const walletStatus = document.getElementById("walletStatus");
const message = document.getElementById("message");
const panelHead = document.getElementById("panelHead");

const grid = document.getElementById("grid");
const gridBody = document.getElementById("gridBody");
const pagination = document.getElementById("pagination");
const prevPage = document.getElementById("prevPage");
const nextPage = document.getElementById("nextPage");
const pageInfo = document.getElementById("pageInfo");

const refreshButton = document.getElementById("refreshButton");
const createOrderButton = document.getElementById("createOrderButton");
const approveTokenAButton = document.getElementById("approveTokenAButton");
const approveTokenBButton = document.getElementById("approveTokenBButton");

const fillFromJsonButton = document.getElementById("fillFromJsonButton");
const cancelFromJsonButton = document.getElementById("cancelFromJsonButton");
const bulkFillFromJsonButton = document.getElementById("bulkFillFromJsonButton");
const bulkFillSelectedButton = document.getElementById("bulkFillSelectedButton");

const txModal = document.getElementById("txModal");
const closeModal = document.getElementById("closeModal");
const txBody = document.getElementById("txBody");

const contractLink = document.getElementById("contractLink");
const contractLinkUrl = document.getElementById("contractLinkUrl");

// Order modal
const orderModal = document.getElementById("orderModal");
const closeOrderModal = document.getElementById("closeOrderModal");
const orderForm = document.getElementById("orderForm");
const tokenAEl = document.getElementById("tokenA");
const tokenBEl = document.getElementById("tokenB");
const amountAEl = document.getElementById("amountA");
const decimalsAEl = document.getElementById("decimalsA");
const amountBEl = document.getElementById("amountB");
const decimalsBEl = document.getElementById("decimalsB");
const expiryEl = document.getElementById("expiry");
const nonceEl = document.getElementById("nonce");
const signOnlyButton = document.getElementById("signOnlyButton");
const signAndPublishButton = document.getElementById("signAndPublishButton");
const signedJsonEl = document.getElementById("signedJson");
const copyJsonButton = document.getElementById("copyJsonButton");

// Approve modal
const approveModal = document.getElementById("approveModal");
const closeApproveModal = document.getElementById("closeApproveModal");
const approveForm = document.getElementById("approveForm");
const approveTitle = document.getElementById("approveTitle");
const approveTokenEl = document.getElementById("approveToken");
const approveAmountEl = document.getElementById("approveAmount");
const approveDecimalsEl = document.getElementById("approveDecimals");

// Fill modal
const fillModal = document.getElementById("fillModal");
const closeFillModal = document.getElementById("closeFillModal");
const fillForm = document.getElementById("fillForm");
const fillJsonEl = document.getElementById("fillJson");
const fillAmountAEl = document.getElementById("fillAmountA");
const fillDecimalsAEl = document.getElementById("fillDecimalsA");

// Cancel modal
const cancelModal = document.getElementById("cancelModal");
const closeCancelModal = document.getElementById("closeCancelModal");
const cancelForm = document.getElementById("cancelForm");
const cancelJsonEl = document.getElementById("cancelJson");

// Bulk modal
const bulkModal = document.getElementById("bulkModal");
const closeBulkModal = document.getElementById("closeBulkModal");
const bulkForm = document.getElementById("bulkForm");
const bulkJsonEl = document.getElementById("bulkJson");
const bulkFillAmountsEl = document.getElementById("bulkFillAmounts");
const bulkFillDecimalsAEl = document.getElementById("bulkFillDecimalsA");

let allRows = [];
let totalPages = 1;

let isConnected = false;
let configCache = null;

let walletClient = null;
let publicClient = null;
let currentChainId = null;
let currentAccount = null;
let currentExplorerBase = null;
const selectedOrderHashes = new Set();

// Approve mode: "A" or "B"
let approveMode = null;

function setMessage(text) {
  message.textContent = text;
}

function formatAddress(value) {
  if (!value) return "";
  return `${value.slice(0, 6)}...${value.slice(-4)}`;
}

function getChainName(chainId) {
  const id = Number(chainId);
  const entries = Object.values(chains);
  const chain = entries.find((item) => item && item.id === id);
  return chain ? chain.name : null;
}

function getChainById(chainId) {
  const id = Number(chainId);
  const entries = Object.values(chains);
  return entries.find((item) => item && item.id === id) ?? null;
}

function getExplorerBase(chainId) {
  const id = Number(chainId);
  const entries = Object.values(chains);
  const chain = entries.find((item) => item && item.id === id);
  return chain?.blockExplorers?.default?.url ?? null;
}

async function loadConfig() {
  const response = await fetch("config.json", { cache: "no-store" });
  if (!response.ok) throw new Error("Unable to load config.json");
  return response.json();
}

function populateNetworkSelect(config) {
  networkSelect.innerHTML = "";
  const ids = Object.keys(config);
  ids.forEach((id) => {
    const option = document.createElement("option");
    option.value = id;
    option.textContent = getChainName(id) ?? `Chain ${id}`;
    networkSelect.appendChild(option);
  });
}

function updateContractLink(chainId, address) {
  if (!chainId || !address) {
    contractLink.hidden = true;
    contractLinkUrl.href = "#";
    contractLinkUrl.textContent = "";
    return;
  }
  const explorerBase = getExplorerBase(chainId);
  if (explorerBase) {
    contractLinkUrl.href = `${explorerBase}/address/${address}`;
    contractLinkUrl.textContent = address;
    contractLink.hidden = false;
  } else {
    contractLink.hidden = true;
  }
}

function ensureClients() {
  if (!window.ethereum) {
    throw new Error("No wallet detected. Install MetaMask or another provider.");
  }
  if (!walletClient) {
    walletClient = createWalletClient({ transport: custom(window.ethereum) });
  }
  if (!publicClient) {
    publicClient = createPublicClient({ transport: custom(window.ethereum) });
  }
}

function getPageFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const page = Number(params.get("page"));
  if (Number.isNaN(page) || page < 1) return 1;
  return page;
}

function updateUrl(page) {
  const params = new URLSearchParams(window.location.search);
  params.set("page", String(page));
  const newUrl = `${window.location.pathname}?${params.toString()}`;
  window.history.pushState({ page }, "", newUrl);
}

function renderPage(page) {
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const slice = allRows.slice(start, start + PAGE_SIZE);

  gridBody.innerHTML = "";
  slice.forEach((row) => {
    const explorer = currentExplorerBase;
    const hashLink = explorer
      ? `<a href="${explorer}/tx/${row.txHash}" target="_blank" rel="noreferrer">${formatAddress(row.hash)}</a>`
      : formatAddress(row.hash);

    const sellerLink = explorer
      ? `<a href="${explorer}/address/${row.seller}" target="_blank" rel="noreferrer">${formatAddress(row.seller)}</a>`
      : formatAddress(row.seller);

    const aLink = explorer
      ? `<a href="${explorer}/address/${row.tokenA}" target="_blank" rel="noreferrer">${formatAddress(row.tokenA)}</a>`
      : formatAddress(row.tokenA);

    const bLink = explorer
      ? `<a href="${explorer}/address/${row.tokenB}" target="_blank" rel="noreferrer">${formatAddress(row.tokenB)}</a>`
      : formatAddress(row.tokenB);

    const expiryDate = new Date(Number(row.expiry) * 1000);
    const expiryStr = `${expiryDate.toLocaleDateString()} ${expiryDate.toLocaleTimeString()}`;

    const displayDecimals = 18;
    const amountADisplay = (() => {
      try { return formatUnits(BigInt(row.amountA), displayDecimals); } catch { return String(row.amountA); }
    })();
    const amountBDisplay = (() => {
      try { return formatUnits(BigInt(row.amountB), displayDecimals); } catch { return String(row.amountB); }
    })();

    const line = document.createElement("div");
    line.className = "grid-row";

    let statusLabel = "Open";
    let statusClass = "status-open";
    if (row.cancelled) {
      statusLabel = "Cancelled";
      statusClass = "status-cancelled";
    } else if (row.remainingA === 0n) {
      statusLabel = "Filled";
      statusClass = "status-filled";
    } else if (row.filledA > 0n) {
      statusLabel = `Remaining ${(() => { try { return formatUnits(row.remainingA, 18); } catch { return row.remainingA.toString(); } })()}`;
    }

    line.innerHTML = `
      <div title="${row.hash}">${hashLink}</div>
      <div title="${row.seller}">${sellerLink}</div>
      <div title="${row.tokenA}">${aLink}</div>
      <div title="${row.tokenB}">${bLink}</div>
      <div title="${row.amountA}">${amountADisplay}</div>
      <div title="${row.amountB}">${amountBDisplay}</div>
      <div>${expiryStr}</div>
      <div><span class="status-pill ${statusClass}">${statusLabel}</span></div>
      <div class="action-cell"></div>
      <div class="action-cell"></div>
      <div class="action-cell"></div>
      <div class="action-cell"></div>
    `;

    const fillCell = line.children[8];
    const partialCell = line.children[9];
    const cancelCell = line.children[10];
    const selectCell = line.children[11];

    const fillBtn = document.createElement("button");
    fillBtn.className = "btn ghost compact-btn";
    fillBtn.type = "button";
    fillBtn.textContent = "Fill";
    fillBtn.disabled = row.cancelled || row.remainingA === 0n;
    fillBtn.addEventListener("click", () => {
      const payload = buildSignedPayloadFromRow(row);
      fillJsonEl.value = JSON.stringify(payload, null, 2);
      if (fillDecimalsAEl) fillDecimalsAEl.value = String(payload.display.decimalsA ?? 18);
      try {
        fillAmountAEl.value = formatUnits(row.remainingA, 18);
      } catch {
        fillAmountAEl.value = row.remainingA.toString();
      }
      fillModal.hidden = false;
    });
    fillCell.appendChild(fillBtn);

    const partialBtn = document.createElement("button");
    partialBtn.className = "btn ghost compact-btn";
    partialBtn.type = "button";
    partialBtn.textContent = "Partial";
    partialBtn.disabled = row.cancelled || row.remainingA === 0n;
    partialBtn.addEventListener("click", () => {
      const payload = buildSignedPayloadFromRow(row);
      fillJsonEl.value = JSON.stringify(payload, null, 2);
      if (fillDecimalsAEl) fillDecimalsAEl.value = String(payload.display.decimalsA ?? 18);
      fillAmountAEl.value = "";
      fillModal.hidden = false;
    });
    partialCell.appendChild(partialBtn);

    const cancelBtn = document.createElement("button");
    cancelBtn.className = "btn ghost compact-btn";
    cancelBtn.type = "button";
    cancelBtn.textContent = "Cancel";

    const isSeller =
      currentAccount &&
      row.seller.toLowerCase() === currentAccount.toLowerCase();

    cancelBtn.disabled = !isSeller || row.cancelled || row.remainingA === 0n;

    cancelBtn.addEventListener("click", async () => {
      try {
        const chainConfig = configCache?.[String(currentChainId)];
        const txHash = await walletClient.writeContract({
          account: currentAccount,
          address: getAddress(chainConfig.address),
          abi: ABI_EXCHANGE,
          functionName: "cancelOrder",
          args: [
            normalizeOrder({
              seller: row.seller,
              tokenA: row.tokenA,
              tokenB: row.tokenB,
              amountA: row.amountA,
              amountB: row.amountB,
              expiry: row.expiry,
              nonce: row.nonce
            }),
            row.signature
          ],
          chain: getChainById(currentChainId) ?? undefined
        });

        showTx(txHash);
      } catch (e) {
        setMessage(`Error: ${e.message}`);
      }
    });
    cancelCell.appendChild(cancelBtn);

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "compact-checkbox";
    checkbox.checked = selectedOrderHashes.has(row.hash);
    checkbox.disabled = row.cancelled || row.remainingA === 0n;
    checkbox.addEventListener("change", () => {
      if (checkbox.checked) selectedOrderHashes.add(row.hash);
      else selectedOrderHashes.delete(row.hash);
      setBulkSelectedButtonState();
    });
    selectCell.appendChild(checkbox);

    gridBody.appendChild(line);
  });

  pageInfo.textContent = `Page ${safePage} of ${totalPages}`;
  prevPage.disabled = safePage === 1;
  nextPage.disabled = safePage === totalPages;
  updateUrl(safePage);
  setBulkSelectedButtonState();
}

async function fetchPublishEvents(exchangeAddress, fromBlock) {
  return publicClient.getLogs({
    address: getAddress(exchangeAddress),
    event: ABI_PUBLISH_EVENT,
    fromBlock: BigInt(fromBlock),
    toBlock: "latest"
  });
}

// EIP-712 Order signing
function orderTypes() {
  return {
    Order: [
      { name: "seller", type: "address" },
      { name: "tokenA", type: "address" },
      { name: "tokenB", type: "address" },
      { name: "amountA", type: "uint256" },
      { name: "amountB", type: "uint256" },
      { name: "expiry", type: "uint256" },
      { name: "nonce", type: "uint256" }
    ]
  };
}

function buildDomain(chainId, verifyingContract) {
  return {
    name: EIP712_NAME,
    version: EIP712_VERSION,
    chainId,
    verifyingContract
  };
}

function normalizeOrder(order) {
  return {
    seller: getAddress(order.seller),
    tokenA: getAddress(order.tokenA),
    tokenB: getAddress(order.tokenB),
    amountA: BigInt(order.amountA),
    amountB: BigInt(order.amountB),
    expiry: BigInt(order.expiry),
    nonce: BigInt(order.nonce)
  };
}

function buildSignedPayloadFromRow(row) {
  return {
    order: {
      seller: row.seller,
      tokenA: row.tokenA,
      tokenB: row.tokenB,
      amountA: row.amountA,
      amountB: row.amountB,
      expiry: row.expiry,
      nonce: row.nonce
    },
    signature: row.signature,
    display: {
      amountA: (() => { try { return formatUnits(BigInt(row.amountA), 18); } catch { return String(row.amountA); } })(),
      decimalsA: 18,
      amountB: (() => { try { return formatUnits(BigInt(row.amountB), 18); } catch { return String(row.amountB); } })(),
      decimalsB: 18,
      expiryLocal: new Date(Number(row.expiry) * 1000).toISOString()
    }
  };
}

function setBulkSelectedButtonState() {
  if (!bulkFillSelectedButton) return;
  bulkFillSelectedButton.disabled = selectedOrderHashes.size === 0;
  bulkFillSelectedButton.textContent = selectedOrderHashes.size > 0
    ? `Bulk Fill Selected (${selectedOrderHashes.size})`
    : "Bulk Fill Selected";
}

async function signOrder(exchangeAddress, order) {
  const chainId = currentChainId ?? (await walletClient.getChainId());
  const domain = buildDomain(chainId, getAddress(exchangeAddress));
  const types = orderTypes();

  return walletClient.signTypedData({
    account: currentAccount,
    domain,
    types,
    primaryType: "Order",
    message: normalizeOrder(order)
  });
}

function showTx(hash) {
  const explorer = currentExplorerBase;
  const link = explorer ? `${explorer}/tx/${hash}` : null;
  const shortHash = `${hash.slice(0, 6)}...${hash.slice(-4)}`;
  txBody.innerHTML = link
    ? `Transaction submitted. Hash: <a href="${link}" target="_blank" rel="noreferrer">${shortHash}</a>`
    : `Transaction submitted. Hash: ${shortHash}`;
  txModal.hidden = false;
}

function resetUi() {
  isConnected = false;
  connectButton.textContent = "Connect Wallet";
  walletStatus.textContent = "";
  setMessage("Please connect your wallet first.");
  currentExplorerBase = null;

  panelHead.hidden = true;
  refreshButton.hidden = true;
  createOrderButton.hidden = true;
  approveTokenAButton.hidden = true;
  approveTokenBButton.hidden = true;

  fillFromJsonButton.hidden = true;
  cancelFromJsonButton.hidden = true;
  bulkFillFromJsonButton.hidden = true;
  bulkFillSelectedButton.hidden = true;

  grid.hidden = true;
  pagination.hidden = true;

  txModal.hidden = true;
  orderModal.hidden = true;
  approveModal.hidden = true;
  fillModal.hidden = true;
  cancelModal.hidden = true;
  bulkModal.hidden = true;

  allRows = [];
  totalPages = 1;
  updateUrl(1);
}

async function initNetworks() {
  configCache = await loadConfig();
  populateNetworkSelect(configCache);

  const [firstChainId] = Object.keys(configCache);
  if (firstChainId && configCache[firstChainId]?.address) {
    updateContractLink(Number(firstChainId), configCache[firstChainId].address);
  }
}

// If config includes deployment tx hash, find its block
async function resolveDeploymentBlock(chainConfig) {
  if (chainConfig.hash) {
    const receipt = await publicClient.getTransactionReceipt({ hash: chainConfig.hash });
    return Number(receipt.blockNumber);
  }
  return Number(chainConfig.deploymentBlock ?? 0);
}

async function refreshPublishedOrders() {
  const chainConfig = configCache?.[String(currentChainId)];
  if (!chainConfig?.address) return;

  const deploymentBlock = await resolveDeploymentBlock(chainConfig);
  setMessage("Fetching PublishOrder events...");

  const logs = await fetchPublishEvents(chainConfig.address, deploymentBlock);

  const baseRows = logs
    .map((log) => ({
      hash: log.args._hash,
      seller: log.args._seller,
      tokenA: log.args._tokenA,
      tokenB: log.args._tokenB,
      amountA: log.args._amountA?.toString?.() ?? String(log.args._amountA),
      amountB: log.args._amountB?.toString?.() ?? String(log.args._amountB),
      expiry: log.args._expiry?.toString?.() ?? String(log.args._expiry),
      nonce: log.args._nonce?.toString?.() ?? String(log.args._nonce),
      signature: log.args._signature,
      txHash: log.transactionHash
    }))
    .reverse();

  const enrichedRows = await Promise.all(
    baseRows.map(async (row) => {
      try {
        const [filledA, isCancelled] = await Promise.all([
          publicClient.readContract({
            address: getAddress(chainConfig.address),
            abi: ABI_EXCHANGE,
            functionName: "filledAmountA",
            args: [row.hash]
          }),
          publicClient.readContract({
            address: getAddress(chainConfig.address),
            abi: ABI_EXCHANGE,
            functionName: "cancelled",
            args: [row.hash]
          })
        ]);

        const totalA = BigInt(row.amountA);
        const filled = BigInt(filledA);
        const remainingA = totalA > filled ? totalA - filled : 0n;

        return {
          ...row,
          filledA: filled,
          remainingA,
          cancelled: Boolean(isCancelled)
        };
      } catch {
        return {
          ...row,
          filledA: 0n,
          remainingA: BigInt(row.amountA),
          cancelled: false
        };
      }
    })
  );

  allRows = enrichedRows;

  if (!allRows.length) {
    setMessage("No published orders yet. You can still fill off-chain orders by pasting JSON.");
    grid.hidden = true;
    pagination.hidden = true;
    setBulkSelectedButtonState();
    return;
  }

  setMessage("Published orders loaded.");
  grid.hidden = false;
  totalPages = Math.max(1, Math.ceil(allRows.length / PAGE_SIZE));
  pagination.hidden = totalPages <= 1;
  renderPage(getPageFromUrl());
}

async function connectWallet() {
  if (isConnected) {
    resetUi();
    return;
  }
  try {
    connectButton.disabled = true;
    setMessage("Connecting to wallet...");

    ensureClients();
    const accounts = await walletClient.requestAddresses();
    const address = accounts[0];
    if (!address) {
      setMessage("No account selected.");
      return;
    }

    currentAccount = address;
    walletStatus.textContent = `Connected: ${formatAddress(address)}`;
    panelHead.hidden = false;

    currentChainId = await walletClient.getChainId();
    currentExplorerBase = getExplorerBase(currentChainId);
    networkSelect.value = String(currentChainId);

    if (!configCache) {
      configCache = await loadConfig();
      populateNetworkSelect(configCache);
    }

    const chainConfig = configCache[String(currentChainId)];
    if (!chainConfig?.address) {
      setMessage("This app is not deployed on the connected chain.");
      contractLink.hidden = true;
      isConnected = true;
      connectButton.textContent = "Disconnect Wallet";
      return;
    }

    updateContractLink(currentChainId, chainConfig.address);

    refreshButton.hidden = false;
    createOrderButton.hidden = false;
    approveTokenAButton.hidden = false;
    approveTokenBButton.hidden = false;

    fillFromJsonButton.hidden = false;
    cancelFromJsonButton.hidden = false;
    bulkFillFromJsonButton.hidden = false;
    bulkFillSelectedButton.hidden = false;

    await refreshPublishedOrders();

    isConnected = true;
    connectButton.textContent = "Disconnect Wallet";
  } catch (error) {
    setMessage(`Error: ${error.message}`);
  } finally {
    connectButton.disabled = false;
  }
}

// Pagination
prevPage.addEventListener("click", () => renderPage(getPageFromUrl() - 1));
nextPage.addEventListener("click", () => renderPage(getPageFromUrl() + 1));

// Switch chain
networkSelect.addEventListener("change", async (event) => {
  const chainId = Number(event.target.value);
  if (!chainId) return;
  try {
    ensureClients();
    await walletClient.switchChain({ id: chainId });
  } catch (error) {
    setMessage(`Error: ${error.message}`);
  }
});

refreshButton.addEventListener("click", async () => {
  if (!isConnected) return;
  await refreshPublishedOrders();
});

// Order modal
createOrderButton.addEventListener("click", () => {
  orderForm.reset();
  // defaults
  nonceEl.value = makeRandomNonce();
  if (decimalsAEl) decimalsAEl.value = String(decimalsAEl.value || 18);
  if (decimalsBEl) decimalsBEl.value = String(decimalsBEl.value || 18);
  setDefaultExpiryInput();
  signedJsonEl.value = "";
  orderModal.hidden = false;
});

closeOrderModal.addEventListener("click", () => (orderModal.hidden = true));

copyJsonButton.addEventListener("click", async () => {
  if (!signedJsonEl.value) return;
  await navigator.clipboard.writeText(signedJsonEl.value);
  setMessage("Copied signed order JSON to clipboard.");
});

function toInt(value, fallback = 18) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(0, Math.min(36, Math.floor(n)));
}

function parseHumanAmount(value, decimals) {
  const clean = String(value ?? "").trim();
  if (!clean) throw new Error("Amount is required.");
  // viem parseUnits supports decimals strings like "0.5"
  return parseUnits(clean, decimals);
}

function unixFromDatetimeLocal(dtValue) {
  const v = String(dtValue ?? "").trim();
  if (!v) throw new Error("Expiry is required.");
  const ms = new Date(v).getTime();
  if (!Number.isFinite(ms)) throw new Error("Invalid expiry date/time.");
  return BigInt(Math.floor(ms / 1000));
}

function setDefaultExpiryInput() {
  // default to now + 1 hour
  const now = new Date(Date.now() + 60 * 60 * 1000);
  const pad = (x) => String(x).padStart(2, "0");
  const val = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
  expiryEl.value = val;
}

function makeRandomNonce() {
  // simple nonce for demo
  return String(BigInt(Date.now()) * 1000000n + BigInt(Math.floor(Math.random() * 1e6)));
}

orderForm.addEventListener("reset", () => {
  nonceEl.value = makeRandomNonce();
  setDefaultExpiryInput();
});

// Sign & optional publish
async function doSign(shouldPublish) {
  if (!isConnected) return;
  const chainConfig = configCache?.[String(currentChainId)];
  if (!chainConfig?.address) return;

  const tokenA = tokenAEl.value.trim();
  const tokenB = tokenBEl.value.trim();

  const decimalsA = toInt(decimalsAEl?.value, 18);
  const decimalsB = toInt(decimalsBEl?.value, 18);

  // Convert human → raw uint256
  const amountAWei = parseHumanAmount(amountAEl.value, decimalsA);
  const amountBWei = parseHumanAmount(amountBEl.value, decimalsB);
  const expiryUnix = unixFromDatetimeLocal(expiryEl.value);

  const order = {
    seller: currentAccount,
    tokenA,
    tokenB,
    amountA: amountAWei.toString(),
    amountB: amountBWei.toString(),
    expiry: expiryUnix.toString(),
    nonce: nonceEl.value.trim()
  };

  const display = {
    amountA: amountAEl.value.trim(),
    decimalsA,
    amountB: amountBEl.value.trim(),
    decimalsB,
    expiryLocal: expiryEl.value
  };

  const signature = await signOrder(chainConfig.address, order);
  signedJsonEl.value = JSON.stringify({ order, signature, display }, null, 2);
  setMessage("Order signed. You can share the JSON.");

  if (shouldPublish) {
    setMessage("Publishing order...");
    const chain = getChainById(currentChainId);
    const txHash = await walletClient.writeContract({
      account: currentAccount,
      address: getAddress(chainConfig.address),
      abi: ABI_EXCHANGE,
      functionName: "sellOrder",
      args: [normalizeOrder(order), signature, true],
      chain: chain ?? undefined
    });
    showTx(txHash);
  }
}

signOnlyButton.addEventListener("click", async () => {
  try { await doSign(false); } catch (e) { setMessage(`Error: ${e.message}`); }
});

signAndPublishButton.addEventListener("click", async () => {
  try { await doSign(true); } catch (e) { setMessage(`Error: ${e.message}`); }
});

// ---- Approvals ----
approveTokenAButton.addEventListener("click", () => {
  approveMode = "A";
  approveTitle.textContent = "Approve Token A (Seller)";
  approveTokenEl.value = tokenAEl.value?.trim() ?? "";
  approveAmountEl.value = amountAEl.value?.trim() ?? "";
  if (approveDecimalsEl) approveDecimalsEl.value = String(toInt(decimalsAEl?.value, 18));
  approveModal.hidden = false;
});

approveTokenBButton.addEventListener("click", () => {
  approveMode = "B";
  approveTitle.textContent = "Approve Token B (Buyer)";
  approveTokenEl.value = tokenBEl.value?.trim() ?? "";
  approveAmountEl.value = amountBEl.value?.trim() ?? "";
  if (approveDecimalsEl) approveDecimalsEl.value = String(toInt(decimalsBEl?.value, 18));
  approveModal.hidden = false;
});

closeApproveModal.addEventListener("click", () => {
  approveModal.hidden = true;
});

approveForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    const chainConfig = configCache?.[String(currentChainId)];
    if (!chainConfig?.address) throw new Error("No exchange configured for this chain.");

    const token = getAddress(approveTokenEl.value.trim());
    const spender = getAddress(chainConfig.address);
    const decimals = toInt(approveDecimalsEl?.value, 18);
    const amount = parseHumanAmount(approveAmountEl.value, decimals);

    const chain = getChainById(currentChainId);

    setMessage(`Approving ${approveMode === "A" ? "Token A" : "Token B"}...`);
    const txHash = await walletClient.writeContract({
      account: currentAccount,
      address: token,
      abi: ABI_ERC20,
      functionName: "approve",
      args: [spender, amount],
      chain: chain ?? undefined
    });

    showTx(txHash);
    approveModal.hidden = true;
  } catch (e) {
    setMessage(`Error: ${e.message}`);
  }
});

// Fill modal
fillFromJsonButton.addEventListener("click", () => {
  fillForm.reset();
  if (fillDecimalsAEl) fillDecimalsAEl.value = "18";
  fillModal.hidden = false;
});

// Auto-detect decimalsA from pasted JSON (if present)
fillJsonEl.addEventListener("input", () => {
  try {
    const parsed = JSON.parse(fillJsonEl.value);
    const d = parsed?.display?.decimalsA;
    if (fillDecimalsAEl && Number.isFinite(Number(d))) fillDecimalsAEl.value = String(toInt(d, 18));
  } catch {
    // ignore while typing
  }
});

closeFillModal.addEventListener("click", () => (fillModal.hidden = true));

fillForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    const chainConfig = configCache?.[String(currentChainId)];
    if (!chainConfig?.address) throw new Error("No exchange configured for this chain.");

    const parsed = JSON.parse(fillJsonEl.value);
    const order = parsed.order;
    const signature = parsed.signature;
    const decimalsA = toInt(fillDecimalsAEl?.value ?? parsed?.display?.decimalsA, 18);
    const fillAmountA = parseHumanAmount(fillAmountAEl.value, decimalsA);

    const chain = getChainById(currentChainId);
    const txHash = await walletClient.writeContract({
      account: currentAccount,
      address: getAddress(chainConfig.address),
      abi: ABI_EXCHANGE,
      functionName: "fillOrder",
      args: [normalizeOrder(order), signature, fillAmountA],
      chain: chain ?? undefined
    });

    showTx(txHash);
    fillModal.hidden = true;
  } catch (e) {
    setMessage(`Error: ${e.message}`);
  }
});

// Cancel modal
cancelFromJsonButton.addEventListener("click", () => {
  cancelForm.reset();
  cancelModal.hidden = false;
});
closeCancelModal.addEventListener("click", () => (cancelModal.hidden = true));

cancelForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    const chainConfig = configCache?.[String(currentChainId)];
    if (!chainConfig?.address) throw new Error("No exchange configured for this chain.");

    const parsed = JSON.parse(cancelJsonEl.value);
    const order = parsed.order;
    const signature = parsed.signature;

    const chain = getChainById(currentChainId);
    const txHash = await walletClient.writeContract({
      account: currentAccount,
      address: getAddress(chainConfig.address),
      abi: ABI_EXCHANGE,
      functionName: "cancelOrder",
      args: [normalizeOrder(order), signature],
      chain: chain ?? undefined
    });

    showTx(txHash);
    cancelModal.hidden = true;
  } catch (e) {
    setMessage(`Error: ${e.message}`);
  }
});

// Bulk fill modal
bulkFillFromJsonButton.addEventListener("click", () => {
  bulkForm.reset();
  bulkModal.hidden = false;
});
bulkFillSelectedButton.addEventListener("click", () => {
  const selected = allRows.filter((row) => selectedOrderHashes.has(row.hash));
  if (!selected.length) {
    setMessage("Select at least one open order first.");
    return;
  }

  const payload = selected.map((row) => buildSignedPayloadFromRow(row));
  bulkJsonEl.value = JSON.stringify(payload, null, 2);
  if (bulkFillDecimalsAEl) bulkFillDecimalsAEl.value = "18";
  bulkFillAmountsEl.value = selected.map((row) => {
    try { return formatUnits(row.remainingA, 18); } catch { return row.remainingA.toString(); }
  }).join(", ");
  bulkModal.hidden = false;
});

closeBulkModal.addEventListener("click", () => (bulkModal.hidden = true));

bulkForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    const chainConfig = configCache?.[String(currentChainId)];
    if (!chainConfig?.address) throw new Error("No exchange configured for this chain.");

    const parsed = JSON.parse(bulkJsonEl.value);
    if (!Array.isArray(parsed)) throw new Error("Bulk JSON must be an array.");

const defaultDecimalsA = toInt(bulkFillDecimalsAEl?.value, 18);
const fillStrings = bulkFillAmountsEl.value
  .split(",")
  .map((x) => x.trim())
  .filter(Boolean);

if (fillStrings.length !== parsed.length) {
  throw new Error("Fill amounts count must match number of orders.");
}

const fills = fillStrings.map((s, i) => {
  const d = parsed?.[i]?.display?.decimalsA;
  const decimalsA = toInt(d ?? defaultDecimalsA, defaultDecimalsA);
  return parseHumanAmount(s, decimalsA);
});


    const orders = parsed.map((p) => normalizeOrder(p.order));
    const signatures = parsed.map((p) => p.signature);

    const chain = getChainById(currentChainId);
    const txHash = await walletClient.writeContract({
      account: currentAccount,
      address: getAddress(chainConfig.address),
      abi: ABI_EXCHANGE,
      functionName: "bulkFillOrders",
      args: [orders, signatures, fills],
      chain: chain ?? undefined
    });

    showTx(txHash);
    bulkModal.hidden = true;
  } catch (e) {
    setMessage(`Error: ${e.message}`);
  }
});

// TX modal close
closeModal.addEventListener("click", async () => {
  txModal.hidden = true;
  if (isConnected) await refreshPublishedOrders();
});

connectButton.addEventListener("click", connectWallet);

window.addEventListener("popstate", () => {
  if (!allRows.length) return;
  renderPage(getPageFromUrl());
});

// React to wallet changes
if (window.ethereum) {
  window.ethereum.on("accountsChanged", (accounts) => {
    if (!accounts || accounts.length === 0) resetUi();
    else if (isConnected) { resetUi(); connectWallet(); }
  });
  window.ethereum.on("chainChanged", () => {
    if (isConnected) { resetUi(); connectWallet(); }
  });
}

txModal.hidden = true;
initNetworks();
resetUi();