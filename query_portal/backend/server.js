const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ FIX: mount ALL query routes under /api
const queryRoutes = require("./routes/query.routes");
app.use("/api", queryRoutes);

// Serve frontend files (query.html, admin.html, js, css)
app.use(express.static(path.join(__dirname, "../frontend")));

app.listen(3001, () => {
  console.log("✅ Query Portal running on http://localhost:3001");
});

module.exports = app;
