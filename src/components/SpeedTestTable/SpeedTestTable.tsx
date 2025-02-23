import styles from "./SpeedTestTable.module.css";
import { RpcData } from "../../hooks/useSpeedTest";

interface SpeedTestTableProps {
  rpcUrls: string[];
  rpcMethods: string[];
  data: RpcData[];
}

export const SpeedTestTable: React.FC<SpeedTestTableProps> = ({ rpcUrls, rpcMethods, data }) => {
  const calculateAverage = (method: string) => {
    const times = data
      .flatMap((entry) => entry.responses.filter((r) => r.method === method && r.time !== undefined))
      .map((r) => r.time!);

    return times.length ? (times.reduce((sum, t) => sum + t, 0) / times.length).toFixed(2) + " ms" : "—";
  };

  const calculateMedian = (method: string) => {
    const times = data
      .flatMap((entry) => entry.responses.filter((r) => r.method === method && r.time !== undefined))
      .map((r) => r.time!)
      .sort((a, b) => a - b);

    if (!times.length) return "—";

    const mid = Math.floor(times.length / 2);
    return times.length % 2 !== 0 ? times[mid].toFixed(2) + " ms" : ((times[mid - 1] + times[mid]) / 2).toFixed(2) + " ms";
  };

  const getCellClass = (time?: number, error?: boolean) => {
    if (error) return styles.error;
    if (time === undefined) return styles.pending;
    if (time < 100) return styles.fast;
    if (time < 300) return styles.moderate;
    return styles.slow;
  };

  return (
    <div className={styles.tableContainer}>
      <table className={styles.speedTestTable}>
        <thead>
          <tr>
            <th>Method</th>
            {rpcUrls.map((rpcUrl) => (
              <th key={rpcUrl} title={rpcUrl}>
                <div className={styles.rpcTitle}>
                  {new URL(rpcUrl).hostname}
                  <span className={styles.web3ClientVersion}>
                    {data.find((d) => d.rpcUrl === rpcUrl)?.web3ClientVersion || "⏳"}
                  </span>
                </div>
              </th>
            ))}
            <th>Average</th>
            <th>Median</th>
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
                  <td key={rpcUrl} className={getCellClass(response?.time, response?.error)}>
                    {response?.time === undefined
                      ? "⏳"
                      : response.error
                        ? `❌ ${response.errorMessage} (${response.time.toFixed(2)} ms)`
                        : `${response.time.toFixed(2)} ms`}
                  </td>
                );
              })}
              <td>{calculateAverage(method)}</td>
              <td>{calculateMedian(method)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
