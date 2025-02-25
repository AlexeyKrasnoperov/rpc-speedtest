import { useEffect, useState } from "react";
import { useSpeedTest } from "./hooks/useSpeedTest";
import { SpeedTestTable } from "./components/SpeedTestTable";
import "./styles/App.css";

const defaultRpcUrls = [
  { url: "https://rpc.ankr.com/filecoin", name: "Ankr" },
  { url: "https://filecoin.chainup.net/rpc/v1", name: "ChainUp" },
  { url: "https://api.node.glif.io", name: "Glif" },
  { url: "https://filfox.info/rpc/v1", name: "Filfox" },
  { url: "https://filecoin.drpc.org", name: "DRPC" },
  { url: "https://rpcnode-mainnet.chainsafe-fil.io/rpc/v0", name: "ChainSafe"}
];

const rpcMethods = [
  "eth_accounts",
  "eth_blockNumber",
  "eth_getBlockByNumber",
  "eth_getBlockByHash",
  "eth_getBlockTransactionCountByNumber",
  "eth_getBlockTransactionCountByHash",
  "eth_getTransactionByHash",
  "eth_getTransactionCount",
  "eth_getTransactionReceipt",
  "eth_getBlockReceipts",
  "eth_getTransactionByBlockHashAndIndex",
  "eth_getTransactionByBlockNumberAndIndex",

  "eth_getCode",
  "eth_getStorageAt",
  "eth_chainId",
  "eth_syncing",
  "eth_feeHistory",
  "eth_protocolVersion",
  "eth_maxPriorityFeePerGas",
  // "eth_sendRawTransaction", // TODO: construct transaction or skip it completely?
  "eth_estimateGas",

  // "eth_getFilterChanges", // TODO: we have to create a filter first and then call it sequentially
  // "eth_getFilterLogs", // TODO: we have to create a filter first and then call it sequentially
  "eth_newFilter",
  "eth_newBlockFilter",
  "eth_newPendingTransactionFilter",
  // "eth_uninstallFilter", // TODO: we have to create a filter first and then call it sequentially
  // "eth_subscribe", // - connection doesn"t support callbacks
  // "eth_unsubscribe", // TODO: we have to subscribe first

  "eth_call",
  "eth_getLogs",
  "eth_getBalance",
  "eth_gasPrice",

  "trace_block",
  "trace_replayBlockTransactions",
  "trace_transaction",
  "trace_filter",

  "net_version",
  "net_listening",
  "web3_clientVersion"
];

const App = () => {
  const storedCustomRpcs = JSON.parse(localStorage.getItem("customRpcs") || "[]");
  const [selectedRpcUrls, setSelectedRpcUrls] = useState<string[]>([]);
  const [customRpcUrls, setCustomRpcUrls] = useState<string[]>(storedCustomRpcs);
  const [newCustomRpc, setNewCustomRpc] = useState("");

  const { data } = useSpeedTest(selectedRpcUrls, rpcMethods);

  useEffect(() => {
    localStorage.setItem("customRpcs", JSON.stringify(customRpcUrls));
  }, [customRpcUrls]);

  const toggleRpc = (url: string) => {
    setSelectedRpcUrls((prev) =>
      prev.includes(url) ? prev.filter((u) => u !== url) : [...prev, url]
    );
  };

  const normalizeUrl = (url: string) => {
    url = url.trim();
    if (!/^https?:\/\//.test(url)) {
      url = `http://${url}`;
    }
    return url;
  };

  const isValidUrl = (url: string) => {
    if (/^(https?:\/\/)?(localhost|\d{1,3}(\.\d{1,3}){3}):\d+$/.test(url)) {
      return true;
    }
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const addCustomRpc = () => {
    let formattedUrl = normalizeUrl(newCustomRpc);
    if (!isValidUrl(formattedUrl)) {
      alert("Invalid RPC URL");
      return;
    }
    if (!customRpcUrls.includes(formattedUrl) && !defaultRpcUrls.some((n) => n.url === formattedUrl)) {
      setCustomRpcUrls((prev) => [...prev, formattedUrl]);
      setNewCustomRpc("");
    }
  };

  const removeCustomRpc = (url: string) => {
    setCustomRpcUrls((prev) => prev.filter((u) => u !== url));
    setSelectedRpcUrls((prev) => prev.filter((u) => u !== url));
  };

  return (
    <div className="appContainer">
      <h1 className="title">RPC Speed Test</h1>

      <div className="rpc-selection">
        <h3>Select Nodes</h3>
        {defaultRpcUrls.map(({ url, name }) => (
          <label key={url} className="rpc-option">
            <input
              type="checkbox"
              checked={selectedRpcUrls.includes(url)}
              onChange={() => toggleRpc(url)}
            />
            {name}
          </label>
        ))}

        <h3>Custom Nodes</h3>
        {customRpcUrls.map((url) => (
          <div key={url} className="custom-rpc-item">
            <label className="rpc-option">
              <input
                type="checkbox"
                checked={selectedRpcUrls.includes(url)}
                onChange={() => toggleRpc(url)}
              />
              {url}
            </label>
            <button className="remove-btn" onClick={() => removeCustomRpc(url)}>❌</button>
          </div>
        ))}

        <div className="add-custom">
          <input
            type="text"
            placeholder="Enter custom RPC"
            value={newCustomRpc}
            onChange={(e) => setNewCustomRpc(e.target.value)}
          />
          <button onClick={addCustomRpc}>➕</button>
        </div>
      </div>

      {selectedRpcUrls.length > 0 ? (
        <SpeedTestTable rpcUrls={selectedRpcUrls} rpcMethods={rpcMethods} data={data} />
      ) : (
        <p className="no-nodes">No nodes selected</p>
      )}
    </div>
  );
};

export default App;
