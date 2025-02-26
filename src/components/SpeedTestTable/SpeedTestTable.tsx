import { useEffect } from "react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography } from "@mui/material";
import { RpcData } from "../../hooks/useSpeedTest";

interface SpeedTestTableProps {
  rpcUrls: string[];
  rpcMethods: string[];
  data: RpcData[];
}

const getCellStyle = (time?: number, error?: boolean) => {
  if (error) return { backgroundColor: "#ffcccc" }; // Red for errors
  if (time === undefined) return { backgroundColor: "#f0f0f0" }; // Grey for pending
  if (time < 100) return { backgroundColor: "#ccffcc" }; // Green for fast
  if (time < 300) return { backgroundColor: "#ffffcc" }; // Yellow for moderate
  return { backgroundColor: "#ffcc99" }; // Orange for slow
};

export const SpeedTestTable: React.FC<SpeedTestTableProps> = ({ rpcUrls, rpcMethods, data }) => {
  const calculateAverage = (method: string) => {
    const times = data
      .flatMap((entry) => entry.responses.filter((r) => r.method === method && r.time !== undefined))
      .map((r) => r.time!);

    return times.length ? `${(times.reduce((sum, t) => sum + t, 0) / times.length).toFixed(2)} ms` : "—";
  };

  const calculateMedian = (method: string) => {
    const times = data
      .flatMap((entry) => entry.responses.filter((r) => r.method === method && r.time !== undefined))
      .map((r) => r.time!)
      .sort((a, b) => a - b);

    if (!times.length) return "—";

    const mid = Math.floor(times.length / 2);
    return times.length % 2 !== 0
      ? `${times[mid].toFixed(2)} ms`
      : `${((times[mid - 1] + times[mid]) / 2).toFixed(2)} ms`;
  };

  useEffect(() => {
    console.log("Updated data:", data);
  }, [data]);

  return (
    <TableContainer component={Paper} sx={{ mt: 3, maxWidth: "100%", overflowX: "auto" }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={{ whiteSpace: "nowrap", fontWeight: "bold" }}>Method</TableCell>
            {rpcUrls.map((rpcUrl) => (
              <TableCell key={rpcUrl} title={rpcUrl} align="center" sx={{ whiteSpace: "nowrap", minWidth: "120px" }}>
                <Typography variant="body2" fontWeight="bold">
                  {new URL(rpcUrl).hostname}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {data.find((d) => d.rpcUrl === rpcUrl)?.web3ClientVersion || "⏳"}
                </Typography>
              </TableCell>
            ))}
            <TableCell sx={{ whiteSpace: "nowrap", fontWeight: "bold" }}>Average</TableCell>
            <TableCell sx={{ whiteSpace: "nowrap", fontWeight: "bold" }}>Median</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rpcMethods.map((method) => (
            <TableRow key={method}>
              <TableCell sx={{ whiteSpace: "nowrap" }}>{method}</TableCell>
              {rpcUrls.map((rpcUrl) => {
                const entry = data.find((d) => d.rpcUrl === rpcUrl);
                const response = entry?.responses.find((r) => r.method === method);

                return (
                  <TableCell
                    key={rpcUrl}
                    align="center"
                    sx={{ overflowX: "auto", minWidth: "100px", maxWidth: "200px", ...getCellStyle(response?.time, response?.error) }}
                  >
                    {response?.time === undefined
                      ? "⏳"
                      : response.error
                      ? `❌ ${response.errorMessage} (${response.time.toFixed(2)} ms)`
                      : `${response.time.toFixed(2)} ms`}
                  </TableCell>
                );
              })}
              <TableCell sx={{ whiteSpace: "nowrap" }}>{calculateAverage(method)}</TableCell>
              <TableCell sx={{ whiteSpace: "nowrap" }}>{calculateMedian(method)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
