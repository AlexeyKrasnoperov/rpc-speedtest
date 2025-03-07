import { useState, useEffect, useRef } from "react";

interface RpcResponse {
    method: string;
    time?: number;
    result?: any;
    error: boolean;
    errorMessage?: string | null;
    fullError?: any;
}

export interface RpcData {
    rpcUrl: string;
    web3ClientVersion?: string;
    responses: RpcResponse[];
}

const BLOCK_NUMBER = "0x485e8c";
const BLOCK_HASH = "0x8733e021ee55d36ecbaa9576ad9eb5227ec3a1b57373aa033b6ae5960303fd05";
const TRANSACTION_HASH = "0x3f90a8d63f4e06b2a165c1e2da778e23700eb5481ff2aaf9e1fc2a0b807e04ee";

const methodParams: Record<string, any[]> = {
    "eth_accounts": [],
    "eth_blockNumber": [],
    "eth_getBlockByNumber": ["latest", false],
    "eth_getBlockByHash": [BLOCK_HASH, false],
    "eth_getBlockTransactionCountByNumber": [BLOCK_NUMBER],
    "eth_getBlockTransactionCountByHash": [BLOCK_HASH],
    "eth_getTransactionByHash": [TRANSACTION_HASH],
    "eth_getTransactionCount": ["0x0000000000000000000000000000000000000000", "latest"],
    "eth_getTransactionReceipt": [TRANSACTION_HASH],
    "eth_getBlockReceipts": ["latest"],
    "eth_getTransactionByBlockHashAndIndex": [BLOCK_HASH, "0x0"],
    "eth_getTransactionByBlockNumberAndIndex": [BLOCK_NUMBER, "0x0"],
    "eth_getCode": ["0x0000000000000000000000000000000000000000", "latest"],
    "eth_getStorageAt": ["0x0000000000000000000000000000000000000000", "0x0", "latest"],
    "eth_chainId": [],
    "eth_syncing": [],
    "eth_feeHistory": ["0x10", "latest", []],
    "eth_protocolVersion": [],
    "eth_maxPriorityFeePerGas": [],
    "eth_estimateGas": [{ to: "0x0000000000000000000000000000000000000000" }],
    "eth_newFilter": [{ fromBlock: "latest", toBlock: "latest", address: "0x0000000000000000000000000000000000000000" }],
    "eth_newBlockFilter": [],
    "eth_newPendingTransactionFilter": [],
    "eth_call": [{ to: "0x7B90337f65fAA2B2B8ed583ba1Ba6EB0C9D7eA44", data: "0xdfe6d366" }, "latest"],
    "eth_getLogs": [{ fromBlock: "latest", address: "0x0000000000000000000000000000000000000000" }],
    "eth_getBalance": ["0x0000000000000000000000000000000000000000", "latest"],
    "eth_gasPrice": [],
    "trace_block": ["latest"],
    "trace_replayBlockTransactions": ["latest", ["trace"]],
    "trace_transaction": [TRANSACTION_HASH],
    "trace_filter": [{ fromBlock: "latest", toBlock: "latest", count: 10 }],
    "net_version": [],
    "net_listening": [],
    "web3_clientVersion": []
};

export const useSpeedTest = (rpcUrls: string[], rpcMethods: string[]) => {
    const [data, setData] = useState<RpcData[]>([]);
    const prevRpcUrls = useRef<string[]>([]);
    const MAX_RETRIES = 5;

    const fetchRpcMethod = async (rpcUrl: string, method: string, attempt = 1): Promise<RpcResponse> => {
        const params = methodParams[method] || [];
        const requestData = { jsonrpc: "2.0", method, params, id: 1 };
        const startTime = performance.now();

        try {
            const response = await fetch(rpcUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(requestData)
            });

            if (!response.ok) {
                if (response.status === 429 && attempt <= MAX_RETRIES) {
                    const retryAfter = response.headers.get("Retry-After");
                    const delay = retryAfter ? parseInt(retryAfter, 10) * 1000 : 2000;
                    await new Promise((resolve) => setTimeout(resolve, delay));
                    return fetchRpcMethod(rpcUrl, method, attempt + 1);
                }
                throw new Error(`HTTP ${response.status} ${response.statusText}`);
            }

            const json = await response.json();

            return {
                method,
                time: performance.now() - startTime,
                result: json.result || null,
                error: !!json.error,
                errorMessage: json.error?.message || "",
                fullError: json.error || null
            };
        } catch (error: any) {
            return {
                method,
                time: performance.now() - startTime,
                error: true,
                errorMessage: error.message,
                fullError: error
            };
        }
    };

    const fetchData = async (urls: string[]) => {
        const allRequests: Promise<void>[] = [];

        urls.forEach((rpcUrl) => {
            const web3VersionRequest = fetchRpcMethod(rpcUrl, "web3_clientVersion").then((response) => {
                setData((prevData) =>
                    prevData.map((entry) =>
                        entry.rpcUrl === rpcUrl ? { ...entry, web3ClientVersion: response.result || "Unknown" } : entry
                    )
                );
            });

            allRequests.push(web3VersionRequest);

            rpcMethods.forEach((method) => {
                const request = fetchRpcMethod(rpcUrl, method).then((response) => {
                    setData((prevData) =>
                        prevData.map((entry) =>
                            entry.rpcUrl === rpcUrl
                                ? {
                                    ...entry,
                                    responses: entry.responses.map((r) =>
                                        r.method === method ? response : r
                                    )
                                }
                                : entry
                        )
                    );
                });

                allRequests.push(request);
            });
        });

        await Promise.allSettled(allRequests);
    };

    useEffect(() => {
        const newRpcUrls = rpcUrls.filter((url) => !prevRpcUrls.current.includes(url));
        const removedRpcUrls = prevRpcUrls.current.filter((url) => !rpcUrls.includes(url));
        prevRpcUrls.current = rpcUrls;

        setData((prevData) => {
            const updatedData = prevData.filter((entry) => !removedRpcUrls.includes(entry.rpcUrl));

            newRpcUrls.forEach((url) => {
                updatedData.push({
                    rpcUrl: url,
                    web3ClientVersion: "⏳",
                    responses: rpcMethods.map((method) => ({
                        method,
                        time: undefined,
                        error: false,
                        errorMessage: ""
                    }))
                });
            });

            return updatedData;
        });

        fetchData(newRpcUrls);
    }, [rpcUrls]);

    return { data };
};
