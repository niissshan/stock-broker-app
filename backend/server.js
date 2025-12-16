
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const PORT = process.env.PORT || 5000;

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});


app.use(cors({
  origin: "*"
}));

app.use(express.json());

// ---- Mock Database ----
const users = []; // { email, password, subscriptions: [] }

const stocks = {
  GOOG: 100,
  TSLA: 200,
  AMZN: 150,
  META: 180,
  NVDA: 250
};

// ---- Routes ----
app.post("/api/signup", (req, res) => {
  const { email, password } = req.body;

  const userExists = users.find(u => u.email === email);
  if (userExists) {
    return res.status(400).json({ message: "User already exists" });
  }

  users.push({ email, password, subscriptions: [] });
  res.json({ message: "Signup successful" });
});

app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  const user = users.find(u => u.email === email && u.password === password);
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  res.json({ message: "Login successful", email });
});

/* ✅ UPDATED: TOGGLE SUBSCRIBE / UNSUBSCRIBE */
app.post("/api/subscribe", (req, res) => {
  const { email, stock } = req.body;

  const user = users.find(u => u.email === email);
  if (!user) return res.status(404).json({ message: "User not found" });

  if (user.subscriptions.includes(stock)) {
    user.subscriptions = user.subscriptions.filter(s => s !== stock);
  } else {
    user.subscriptions.push(stock);
  }

  res.json({ subscriptions: user.subscriptions });
});

/* ✅ NEW: FETCH USER SUBSCRIPTIONS */
app.get("/api/subscriptions/:email", (req, res) => {
  const { email } = req.params;

  const user = users.find(u => u.email === email);
  if (!user) return res.status(404).json({ message: "User not found" });

  res.json({ subscriptions: user.subscriptions });
});

// ---- SOCKET.IO ----
io.on("connection", (socket) => {
  console.log("User connected");

  socket.emit("stockUpdate", stocks);

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

// ---- Random price updates every second ----
setInterval(() => {
  Object.keys(stocks).forEach(stock => {
    const change = (Math.random() * 4 - 2).toFixed(2);
    stocks[stock] = +(stocks[stock] + Number(change)).toFixed(2);
  });

  io.emit("stockUpdate", stocks);
}, 1000);

// ---- Start server ----
// server.listen(5000, () => {
//   console.log("Backend running on http://localhost:5000");
// });

server.listen(PORT, () => {
  console.log("Backend running on port", PORT);
});

