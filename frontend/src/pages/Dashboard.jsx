import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";
import "./Dashboard.css";

/* LOGOS */
import amazonLogo from "../assets/amazon.png";
import googleLogo from "../assets/google.jpg";
import metaLogo from "../assets/meta-facebook-rebranding-name-news_dezeen_2364_col_hero2.jpg";
import nvidiaLogo from "../assets/nvidia-logo-nvidia-icon-free-free-vector.jpg";
import teslaLogo from "../assets/Tesla_Motors.svg.png";

const socket = io("http://localhost:5000");

const STOCKS = {
  NVDA: { logo: nvidiaLogo },
  TSLA: { logo: teslaLogo },
  AMZN: { logo: amazonLogo },
  META: { logo: metaLogo },
  GOOG: { logo: googleLogo }
};

export default function Dashboard() {
  const navigate = useNavigate();
  const email = localStorage.getItem("userEmail");

  const [prices, setPrices] = useState({});
  const [prevPrices, setPrevPrices] = useState({});
  const [subscriptions, setSubscriptions] = useState([]);
  const [graphData, setGraphData] = useState({});

  /* AUTH CHECK */
  useEffect(() => {
    if (!email) navigate("/");
  }, [email, navigate]);

  /* ✅ LOAD SUBSCRIPTIONS FROM BACKEND */
  useEffect(() => {
    if (!email) return;

    fetch(`http://localhost:5000/api/subscriptions/${email}`)
      .then(res => res.json())
      .then(data => {
        if (data.subscriptions) {
          setSubscriptions(data.subscriptions);
        }
      });
  }, [email]);

  /* SOCKET UPDATES */
  useEffect(() => {
    const handleUpdate = (data) => {
      setPrevPrices((p) => ({ ...p, ...prices }));
      setPrices(data);

      setGraphData((prev) => {
        const updated = { ...prev };
        subscriptions.forEach((t) => {
          if (!updated[t]) updated[t] = [];
          updated[t] = [...updated[t].slice(-60), data[t]];
        });
        return updated;
      });
    };

    socket.on("stockUpdate", handleUpdate);
    return () => socket.off("stockUpdate", handleUpdate);
  }, [prices, subscriptions]);

  /* ✅ BACKEND-CONNECTED SUBSCRIBE */
  const toggleSubscribe = async (ticker) => {
    const res = await fetch("http://localhost:5000/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, stock: ticker })
    });

    const data = await res.json();
    setSubscriptions(data.subscriptions);
  };

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  const getChange = (t) =>
    !prevPrices[t] || !prices[t]
      ? 0
      : (prices[t] - prevPrices[t]).toFixed(2);

  return (
    <div className="dashboard">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <h2 className="logo">Escrow Stack</h2>
        <ul className="menu">
          <li className="active">Dashboard</li>
          <li>Portfolio</li>
          <li>Notifications</li>
          <li>Settings</li>
        </ul>
      </aside>

      {/* MAIN */}
      <main className="main">
        {/* HEADER */}
        <div className="header">
          <div />
          <div className="header-right">
            <span>{email}</span>
            <button className="logout" onClick={logout}>Logout</button>
          </div>
        </div>

        {/* STOCK CARDS */}
        <div className="cards">
          {Object.keys(STOCKS).map((t) => {
            const change = getChange(t);
            const subscribed = subscriptions.includes(t);

            return (
              <div className="card" key={t}>
                <div className="title">
                  <img src={STOCKS[t].logo} alt={t} />
                  {t}
                </div>

                <div className="price">${prices[t]?.toFixed(2) || "--"}</div>

                <div className={change >= 0 ? "green" : "red"}>
                  {change >= 0 ? "▲" : "▼"} {Math.abs(change)}
                </div>

                <button
                  className={subscribed ? "unsub" : "sub"}
                  onClick={() => toggleSubscribe(t)}
                >
                  {subscribed ? "Unsubscribe" : "Subscribe"}
                </button>
              </div>
            );
          })}
        </div>

        {/* LOWER */}
        <div className="lower">
          {/* CHARTS */}
          <div className="charts">
            {subscriptions.map((t) => {
              const data = graphData[t] || [];
              if (data.length < 2) return null;

              const min = Math.min(...data);
              const max = Math.max(...data);
              const range = max - min || 1;

              return (
                <div className="chart-card" key={t}>
                  <h3>{t} Live</h3>
                  <div className="bar-chart">
                    {data.map((p, i) => {
                      const prev = data[i - 1] ?? p;
                      const up = p >= prev;
                      const height = ((p - min) / range) * 100;

                      return (
                        <div
                          key={i}
                          className={`bar ${up ? "up" : "down"}`}
                          style={{ height: `${height}%` }}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* MY STOCKS */}
          <div className="my-stocks">
            <h3>My Stocks</h3>
            <ul>
              {subscriptions.map((t) => (
                <li key={t}>
                  <span>
                    <img src={STOCKS[t].logo} alt={t} /> {t}
                  </span>
                  <span className={getChange(t) >= 0 ? "green" : "red"}>
                    {prices[t]?.toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
