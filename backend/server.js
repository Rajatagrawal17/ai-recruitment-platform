require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

/* =========================
   DEBUG (Remove later)
========================= */
console.log("MONGO_URI:", process.env.MONGO_URI);

/* =========================
   MIDDLEWARE
========================= */
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:3001"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

/* =========================
   ROUTES
========================= */
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/jobs", require("./routes/jobRoutes"));
app.use("/api/applications", require("./routes/applicationRoutes"));

/* =========================
   TEST ROUTE
========================= */
app.get("/", (req, res) => {
  res.send("API is running 🚀");
});

/* =========================
   MONGODB CONNECTION
========================= */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected ✅");

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} 🚀`);
    });
  })
  .catch((error) => {
    console.error("MongoDB Connection Failed ❌");
    console.error(error.message);
    process.exit(1);
  });
