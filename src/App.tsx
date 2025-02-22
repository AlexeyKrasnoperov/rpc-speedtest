import { useEffect, useState } from "react";
import { useSpeedTest } from "./hooks/useSpeedTest";
import { SpeedTestTable } from "./components/SpeedTestTable";
import "./styles/App.css";

const rpcUrls = [
  "https://rpc.ankr.com/filecoin"
];

const rpcMethods = [
  "eth_blockNumber",
  "eth_gasPrice"
];

const App = () => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  });

  const { data, loading } = useSpeedTest(rpcUrls, rpcMethods);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <div className="appContainer">
      <button className="theme-toggle" onClick={toggleTheme}>
        {theme === "light" ? "🌙" : "☀️"}
      </button>
      <h1 className="title">RPC Speed Test</h1>
      <SpeedTestTable rpcUrls={rpcUrls} rpcMethods={rpcMethods} data={data} loading={loading} />
    </div>
  );
};

export default App;
