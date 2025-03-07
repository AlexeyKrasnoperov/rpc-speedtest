import { useEffect, useState } from "react";
import { SpeedTestTable } from "./components/SpeedTestTable";
import { Container, Typography, TextField, Button, Paper, Box, Chip, Stack } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import "./styles/App.css";
import { useSpeedTest } from "./hooks/useSpeedTest";

const defaultRpcUrls = [
  { url: "https://rpc.ankr.com/filecoin", name: "Ankr" },
  { url: "https://filecoin.chainup.net/rpc/v1", name: "ChainUp" },
  { url: "https://api.node.glif.io", name: "Glif" },
  { url: "https://filfox.info/rpc/v1", name: "Filfox" },
  { url: "https://filecoin.drpc.org", name: "DRPC" },
  { url: "https://rpcnode-mainnet.chainsafe-fil.io/rpc/v0", name: "ChainSafe" },
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
  "web3_clientVersion",
];

const App = () => {
  const storedCustomRpcs = JSON.parse(localStorage.getItem("customRpcs") || "[]");
  const storedSelectedRpcs = JSON.parse(localStorage.getItem("selectedRpcs") || "[]");
  const [selectedRpcUrls, setSelectedRpcUrls] = useState<string[]>(storedSelectedRpcs);
  const [customRpcUrls, setCustomRpcUrls] = useState<string[]>(storedCustomRpcs);
  const [newCustomRpc, setNewCustomRpc] = useState("");

  const { data } = useSpeedTest(selectedRpcUrls, rpcMethods);

  useEffect(() => {
    localStorage.setItem("customRpcs", JSON.stringify(customRpcUrls));
  }, [customRpcUrls]);

  useEffect(() => {
    localStorage.setItem("selectedRpcs", JSON.stringify(selectedRpcUrls));
  }, [selectedRpcUrls]);

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
    <Container maxWidth="xl" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        RPC Speed Test
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6">Select Nodes</Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap">
          {defaultRpcUrls.map(({ url, name }) => (
            <Chip
              key={url}
              label={name}
              clickable
              color={selectedRpcUrls.includes(url) ? "success" : "default"}
              onClick={() => toggleRpc(url)}
            />
          ))}
        </Stack>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6">Custom Nodes</Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap">
          {customRpcUrls.map((url) => (
            <Chip
              key={url}
              label={url}
              clickable
              color={selectedRpcUrls.includes(url) ? "primary" : "default"}
              onClick={() => toggleRpc(url)}
              onDelete={() => removeCustomRpc(url)}
              deleteIcon={<DeleteIcon />}
            />
          ))}
        </Stack>
        <Box display="flex" gap={1} mt={2}>
          <TextField
            fullWidth
            label="Enter custom RPC"
            value={newCustomRpc}
            onChange={(e) => setNewCustomRpc(e.target.value)}
          />
          <Button variant="contained" onClick={addCustomRpc} startIcon={<AddIcon />}>Add</Button>
        </Box>
      </Paper>

      {selectedRpcUrls.length > 0 ? (
        <SpeedTestTable rpcUrls={selectedRpcUrls} rpcMethods={rpcMethods} data={data} />
      ) : (
        <Typography variant="body1" color="textSecondary" align="center">
          No nodes selected
        </Typography>
      )}
    </Container>
  );
};

export default App;
