import { useState, useEffect, useRef } from "react";

interface RpcResponse {
    method: string;
    time: number;
    result?: any;
    error: boolean;
    errorMessage?: string | null;
    fullError?: any;
}

interface RpcData {
    rpcUrl: string;
    responses: RpcResponse[];
}

const BLOCK_NUMBER = "0x483aa6"
const BLOCK_HASH = "0x45c05a533885d5f76293f9f0d190daa8aba0e056144cd30eabf4c35997535b13"
const TRANSACTION_HASH = "0x47b1b0d5296a7c883a1b8d666ff3f86ed39c91efa5847d688299382e4a6897f7"

const methodParams: Record<string, any[]> = {
    "eth_accounts": [],
    "eth_blockNumber": [],
    "eth_getBlockByNumber": ["latest", false],
    "eth_getBlockByHash": [BLOCK_HASH, false],
    "eth_getBlockTransactionCountByNumber": [BLOCK_NUMBER],
    "eth_getBlockTransactionCountByHash": [BLOCK_HASH],
    "eth_getTransactionByHash": [TRANSACTION_HASH], // -TIMEOUT
    "eth_getTransactionCount": ["0x0000000000000000000000000000000000000000", "latest"],
    "eth_getTransactionReceipt": [TRANSACTION_HASH], // -TIMEOUT
    "eth_getBlockReceipts": ["latest"],
    "eth_getTransactionByBlockHashAndIndex": [BLOCK_HASH, "0x0"],
    "eth_getTransactionByBlockNumberAndIndex": [BLOCK_NUMBER, "0x0"],

    "eth_getCode": ["0x0000000000000000000000000000000000000000", "latest"],
    "eth_getStorageAt": ["0x0000000000000000000000000000000000000000", "0x0", "latest"], // TODO?
    "eth_chainId": [],
    "eth_syncing": [],
    "eth_feeHistory": ["0x10", "latest", []], // +
    "eth_protocolVersion": [],
    "eth_maxPriorityFeePerGas": [],
    "eth_sendRawTransaction": ["0x0"], // TODO: construct transaction or skip it completely?
    "eth_estimateGas": [{ to: "0x0000000000000000000000000000000000000000" }],

    "eth_getFilterChanges": ["0x31ffc268444342ce8b09ff747df2401600000000000000000000000000000000"], // TODO: we have to create a filter first and then call it sequentially
    "eth_getFilterLogs": ["0x31ffc268444342ce8b09ff747df2401600000000000000000000000000000000"], // TODO: we have to create a filter first and then call it sequentially
    "eth_newFilter": [{ fromBlock: "latest", toBlock: "latest", address: "0x0000000000000000000000000000000000000000" }],
    "eth_newBlockFilter": [],
    "eth_newPendingTransactionFilter": [],
    "eth_uninstallFilter": ["0x0"], // TODO: Pass a freshly created filter hash
    "eth_subscribe": ["newHeads"], // - connection doesn't support callbacks
    "eth_unsubscribe": ["0x1"], // - unmarshaling params for 'eth_unsubscribe' (param: *ethtypes.EthSubscriptionID): expected hex string length sans prefix 64, got 2

    "eth_call": [{ to: "0x7B90337f65fAA2B2B8ed583ba1Ba6EB0C9D7eA44", data: "0xdfe6d366" }, "latest"],
    "eth_getLogs": [{ fromBlock: "latest", address: "0x0000000000000000000000000000000000000000" }], // - CHANGE ADDRESS
    "eth_getBalance": ["0x0000000000000000000000000000000000000000", "latest"],
    "eth_gasPrice": [],

    "trace_block": ["latest"],
    "trace_replayBlockTransactions": ["latest", ["trace"]],
    "trace_transaction": [TRANSACTION_HASH], // - TIMEOUT
    "trace_filter": [{ fromBlock: "latest", toBlock: "latest", count: 10 }],

    "net_version": [],
    "net_listening": [],

    "web3_clientVersion": []
};

export const useSpeedTest = (rpcUrls: string[], rpcMethods: string[]) => {
    const [data, setData] = useState<RpcData[]>([]);
    const [loading, setLoading] = useState(true);
    const hasFetched = useRef(false);
    const MAX_RETRIES = 5;

    useEffect(() => {
        if (hasFetched.current) return;
        hasFetched.current = true;
        setLoading(true);

        setData(
            rpcUrls.map((url) => ({
                rpcUrl: url,
                responses: rpcMethods.map((method) => ({
                    method,
                    time: undefined,
                    error: false,
                    errorMessage: "",
                })),
            }))
        );

        const fetchRpcMethod = async (rpcUrl: string, method: string, attempt = 1): Promise<RpcResponse> => {
            const params = methodParams[method] || [];
            const requestData = { jsonrpc: "2.0", method, params, id: 1 };
            const startTime = performance.now();

            try {
                const response = await fetch(rpcUrl, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(requestData),
                });
                const endTime = performance.now();

                if (!response.ok) {
                    if (response.status === 429 && attempt <= MAX_RETRIES) {
                        console.warn(`⚠️ ${rpcUrl} -> ${method}: 429 Too Many Requests. Retrying in 1s (Attempt ${attempt})`);
                        await new Promise((resolve) => setTimeout(resolve, 1000));
                        return fetchRpcMethod(rpcUrl, method, attempt + 1);
                    }
                    throw new Error(`HTTP ${response.status} ${response.statusText}`);
                }

                const json = await response.json();

                return {
                    method,
                    time: endTime - startTime,
                    result: json.result || null,
                    error: !!json.error,
                    errorMessage: json.error?.message || "",
                    fullError: json.error || null,
                };
            } catch (error: any) {
                return {
                    method,
                    time: performance.now() - startTime,
                    error: true,
                    errorMessage: error.message.includes("Unexpected token")
                        ? "Invalid JSON Response"
                        : error.message,
                    fullError: error,
                };
            }
        };

        const fetchData = async () => {
            await Promise.all(
                rpcUrls.map(async (rpcUrl) => {
                    const responses: RpcResponse[] = await Promise.all(
                        rpcMethods.map((method) => fetchRpcMethod(rpcUrl, method))
                    );

                    setData((prevData) =>
                        prevData.map((entry) =>
                            entry.rpcUrl === rpcUrl
                                ? { ...entry, responses }
                                : entry
                        )
                    );
                })
            );

            setLoading(false);
        };

        fetchData();
    }, [rpcUrls, rpcMethods]);

    return { data, loading };
};
