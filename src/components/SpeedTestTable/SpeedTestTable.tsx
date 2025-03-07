import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography } from "@mui/material";
import { RpcData } from "../../hooks/useSpeedTest";
import "./SpeedTestTable.module.css";
import { styled } from "@mui/material/styles";

interface SpeedTestTableProps {
  rpcUrls: string[];
  rpcMethods: string[];
  data: RpcData[];
}

interface StyledTableCellProps {
  time?: number;
  error?: boolean;
}

const StyledTableCell = styled(TableCell)<StyledTableCellProps>(({ theme, time, error }) => ({
  backgroundColor: error
    ? theme.palette.error.light
    : time === undefined
      ? theme.palette.grey[300]
      : time < 100
        ? theme.palette.success.light
        : time < 300
          ? theme.palette.warning.light
          : theme.palette.warning.dark,
}));

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

  return (
    <TableContainer component={Paper} sx={{ mt: 3, maxWidth: "100%", overflowX: "auto" }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell className="header-cell">Method</TableCell>
            {rpcUrls.map((rpcUrl) => (
              <TableCell key={rpcUrl} title={rpcUrl} align="center" className="header-cell">
                <Typography variant="body2" fontWeight="bold">
                  {new URL(rpcUrl).hostname}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {data.find((d) => d.rpcUrl === rpcUrl)?.web3ClientVersion || "⏳"}
                </Typography>
              </TableCell>
            ))}
            <TableCell className="header-cell">Average</TableCell>
            <TableCell className="header-cell">Median</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rpcMethods.map((method) => (
            <TableRow key={method}>
              <TableCell className="method-cell">{method}</TableCell>
              {rpcUrls.map((rpcUrl) => {
                const entry = data.find((d) => d.rpcUrl === rpcUrl);
                const response = entry?.responses.find((r) => r.method === method);

                return (
                  <StyledTableCell
                    key={rpcUrl}
                    align="center"
                    time={response?.time}
                    error={response?.error}
                    sx={{ overflowX: "auto", minWidth: "100px", maxWidth: "200px" }}
                  >

                    {response?.time === undefined
                      ? "⏳"
                      : response.error
                        ? `❌ ${response.errorMessage} (${response.time.toFixed(2)} ms)`
                        : `${response.time.toFixed(2)} ms`}
                  </StyledTableCell>
                );
              })}
              <TableCell className="average-cell">{calculateAverage(method)}</TableCell>
              <TableCell className="median-cell">{calculateMedian(method)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
