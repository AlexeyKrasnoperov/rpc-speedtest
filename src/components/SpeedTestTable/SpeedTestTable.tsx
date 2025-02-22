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
            {rpcUrls.map((rpcUrl, index) => (
              <th key={index}>{new URL(rpcUrl).hostname}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rpcMethods.map((method, rowIndex) => (
            <tr key={rowIndex}>
              <td>{method}</td>
              {rpcUrls.map((rpcUrl, colIndex) => {
                const cellData = data[rpcUrl]?.[method] || {};
                return (
                  <td key={colIndex} className={cellData.error ? styles.error : styles.success}>
                    {loading || cellData.time === undefined
                      ? "..."
                      : cellData.error
                      ? `❌ ${cellData.errorMessage}`
                      : `${cellData.time.toFixed(2)} ms`}
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
