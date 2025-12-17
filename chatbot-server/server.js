import express from "express";
import cors from "cors";
import pkg from "pg";

const { Pool } = pkg;

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: parseInt(process.env.PGPORT) || 5432,
});

/* -------------------------
   GET messages
-------------------------- */
app.get("/messages", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, sender, content, timestamp
       FROM messages
       ORDER BY timestamp ASC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

/* -------------------------
   POST message
-------------------------- */
app.post("/messages", async (req, res) => {
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ error: "Message required" });
  }

  try {
    // Save user message
    await pool.query(
      `INSERT INTO messages (sender, content)
       VALUES ('user', $1)`,
      [content]
    );

    // Hybrid predefined response
    const predefined = await pool.query(
      `SELECT response
       FROM predefined_responses
       WHERE LOWER(trigger) = LOWER($1)
       LIMIT 1`,
      [content]
    );

    const botReply =
      predefined.rows.length > 0
        ? predefined.rows[0].response
        : `You said: ${content}`;

    // Save bot message
    await pool.query(
      `INSERT INTO messages (sender, content)
       VALUES ('bot', $1)`,
      [botReply]
    );

    res.json({ status: "ok" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

app.listen(5000, () => {
  console.log("Backend running on http://localhost:5000");
});
