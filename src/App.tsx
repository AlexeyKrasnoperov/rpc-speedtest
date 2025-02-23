import { useEffect, useState } from "react";
import { useSpeedTest } from "./hooks/useSpeedTest";
import { SpeedTestTable } from "./components/SpeedTestTable";
import "./styles/App.css";

const rpcUrls = [
  "https://rpc.ankr.com/filecoin",
  "https://filecoin.chainup.net/rpc/v1",
  "https://api.node.glif.io",
  "https://filfox.info/rpc/v1",
  "https://filecoin.drpc.org"
];

const rpcMethods = [
  "eth_accounts",
  "eth_blockNumber",
  "eth_getBlockByNumber",
  "eth_getBlockByHash",
  "eth_getBlockTransactionCountByNumber",
  "eth_getBlockTransactionCountByHash",
  "eth_getTransactionByHash", // -TIMEOUT
  "eth_getTransactionCount",
  "eth_getTransactionReceipt", // -TIMEOUT
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
  // "eth_unsubscribe", // TODO: we have to subsribe first

  "eth_call",
  "eth_getLogs",
  "eth_getBalance",
  "eth_gasPrice",

  "trace_block",
  "trace_replayBlockTransactions",
  "trace_transaction", // - TIMEOUT
  "trace_filter",

  "net_version",
  "net_listening",

  "web3_clientVersion",
];

const App = () => {
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"));
  
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((prev) => (prev === "light" ? "dark" : "light"));

  const { data, loading } = useSpeedTest(rpcUrls, rpcMethods);

  return (
    <div className="appContainer">
      <button className="theme-toggle" onClick={toggleTheme}>
        {theme === "light" ? "🌙" : "☀️"}
      </button>
      <h1 className="title">RPC Speed Test</h1>
      <SpeedTestTable rpcUrls={rpcUrls} rpcMethods={rpcMethods} data={data} loading={loading} />
    </div>
  );
};

export default App;
