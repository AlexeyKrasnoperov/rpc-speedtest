import styles from "./SpeedTestTable.module.css";

interface SpeedTestTableProps {
  rpcUrls: string[];
  rpcMethods: string[];
  data: Record<string, Record<string, { time: number; error: boolean; errorMessage: string }>>;
  loading: boolean;
}

export const SpeedTestTable: React.FC<SpeedTestTableProps> = ({ rpcUrls, rpcMethods, data, loading }) => {
  return (
    <div className={styles.speedTestTable}>
      <table>
        <thead>
          <tr>
            <th>Method</th>
            {data.map((entry) => (
              <th key={entry.rpcUrl} title={entry.rpcUrl}>
                {new URL(entry.rpcUrl).hostname}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rpcMethods.map((method) => (
            <tr key={method}>
              <td>{method}</td>
              {data.map((entry) => {
                const response = entry.responses.find((r) => r.method === method);
                return (
                  <td key={entry.rpcUrl} style={{ whiteSpace: "pre-wrap", wordBreak: "break-word", overflowY: "auto" }}>
                    {response
                      ? response.error
                        ? (
                          <>
                            ❌ {response.errorMessage} ({response.time.toFixed(2)} ms)
                          </>
                        )
                        : `${response.time.toFixed(2)} ms`
                      : "⏳"}
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
