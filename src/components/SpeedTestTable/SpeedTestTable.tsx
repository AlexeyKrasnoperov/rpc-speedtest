import styles from "./SpeedTestTable.module.css";

interface RpcResponse {
  method: string;
  time?: number;
  error: boolean;
  errorMessage?: string;
}

interface RpcData {
  rpcUrl: string;
  responses: RpcResponse[];
}

interface SpeedTestTableProps {
  rpcUrls: string[];
  rpcMethods: string[];
  data: RpcData[];
  loading: boolean;
}

export const SpeedTestTable: React.FC<SpeedTestTableProps> = ({ rpcUrls, rpcMethods, data, loading }) => {
  return (
    <div className={styles.speedTestTable}>
      <table>
        <thead>
          <tr>
            <th>Method</th>
            {rpcUrls.map((rpcUrl) => (
              <th key={rpcUrl} title={rpcUrl}>{new URL(rpcUrl).hostname}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rpcMethods.map((method) => (
            <tr key={method}>
              <td>{method}</td>
              {rpcUrls.map((rpcUrl) => {
                const entry = data.find((d) => d.rpcUrl === rpcUrl);
                const response = entry?.responses.find((r) => r.method === method);

                return (
                  <td key={rpcUrl} style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                    {response?.time === undefined
                      ? "⏳"
                      : response.error
                      ? `❌ ${response.errorMessage} (${response.time.toFixed(2)} ms)`
                      : `${response.time.toFixed(2)} ms`}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
