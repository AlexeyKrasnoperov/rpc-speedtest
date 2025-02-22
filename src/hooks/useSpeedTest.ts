import { useState, useEffect } from "react";

interface RpcResult {
  time: number;
  error: boolean;
  errorMessage: string;
}

type SpeedTestData = Record<string, Record<string, RpcResult>>;

const fetchWithTimeout = async (url: string, body: any, timeout = 8000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal
    });
    clearTimeout(id);
    return response.ok ? response.json() : Promise.reject(new Error(`HTTP ${response.status}`));
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
};

export const useSpeedTest = (rpcUrls: string[], rpcMethods: string[]) => {
  const [data, setData] = useState<SpeedTestData>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setData({});
    setLoading(true);

    const runTests = async () => {
      for (const rpcUrl of rpcUrls) {
        for (const method of rpcMethods) {
          const startTime = performance.now();
          try {
            await fetchWithTimeout(rpcUrl, {
              jsonrpc: "2.0",
              method: method,
              params: [],
              id: 1
            });

            const endTime = performance.now();
            setData(prevData => ({
              ...prevData,
              [rpcUrl]: {
                ...prevData[rpcUrl],
                [method]: {
                  time: endTime - startTime,
                  error: false,
                  errorMessage: ""
                }
              }
            }));
          } catch (error: any) {
            setData(prevData => ({
              ...prevData,
              [rpcUrl]: {
                ...prevData[rpcUrl],
                [method]: {
                  time: 0,
                  error: true,
                  errorMessage: error.message
                }
              }
            }));
          }
        }
      }
      setLoading(false);
    };

    runTests();
  }, [rpcUrls, rpcMethods]);

  return { data, loading };
};
