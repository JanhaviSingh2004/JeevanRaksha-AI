const db = require("../config/db");

/* =================================
   USER CREATES A NEW QUERY
================================= */
exports.createQuery = (req, res) => {
  console.log("CREATE QUERY BODY:", req.body);

  const { user_id, message } = req.body;

  // 🔐 validation (do NOT remove)
  if (!user_id || !message || !message.trim()) {
    return res.status(400).json({
      success: false,
      error: "Missing user_id or message"
    });
  }

  db.query(
    "INSERT INTO queries (user_id, message, status) VALUES (?, ?, 'OPEN')",
    [user_id, message],
    (err, result) => {
      if (err) {
        console.error("INSERT QUERY ERROR:", err);
        return res.status(500).json({
          success: false,
          error: "Database error"
        });
      }

      // 🧵 store first message in thread
      db.query(
        "INSERT INTO query_messages (query_id, sender, sender_id, message) VALUES (?, 'USER', ?, ?)",
        [result.insertId, user_id, message],
        (msgErr) => {
          if (msgErr) {
            console.error("INSERT MESSAGE ERROR:", msgErr);
          }
        }
      );

      return res.json({
        success: true,
        query_id: result.insertId
      });
    }
  );
};

/* =================================
   USER: GET OWN QUERIES
================================= */
exports.getUserQueries = (req, res) => {
  const userId = req.params.userId;

  if (!userId) {
    return res.status(400).json({ success: false });
  }

  db.query(
    `SELECT query_id, message, status, created_at
     FROM queries
     WHERE user_id=?
     ORDER BY query_id DESC`,
    [userId],
    (err, data) => {
      if (err) {
        console.error("GET USER QUERIES ERROR:", err);
        return res.status(500).json([]);
      }
      res.json(data);
    }
  );
};

/* =================================
   ADMIN: GET ALL QUERIES
================================= */
exports.getAllQueries = (req, res) => {
  db.query(
    `SELECT q.query_id, q.user_id, q.message, q.status, q.created_at, u.name
     FROM queries q
     JOIN users u ON q.user_id = u.id
     ORDER BY q.query_id DESC`,
    (err, data) => {
      if (err) {
        console.error("GET ALL QUERIES ERROR:", err);
        return res.status(500).json([]);
      }
      res.json(data);
    }
  );
};

/* =================================
   SEND MESSAGE (USER / ADMIN)
================================= */
exports.sendMessage = (req, res) => {
  console.log("SEND MESSAGE BODY:", req.body); // 🔥 DEBUG

  const { query_id, sender, sender_id, message } = req.body;

  // ✅ strict validation
  if (!query_id || !sender || !sender_id || !message || !message.trim()) {
    console.error("❌ INVALID MESSAGE PAYLOAD");
    return res.status(400).json({ success: false });
  }

  db.query(
    "INSERT INTO query_messages (query_id, sender, sender_id, message) VALUES (?, ?, ?, ?)",
    [query_id, sender, sender_id, message],
    (err) => {
      if (err) {
        console.error("❌ MESSAGE INSERT ERROR:", err);
        return res.status(500).json({ success: false });
      }

      // ✅ update status only for admin reply
      if (sender === "ADMIN") {
        db.query(
          "UPDATE queries SET status='REPLIED' WHERE query_id=?",
          [query_id]
        );
      }

      console.log("✅ MESSAGE STORED");
      res.json({ success: true });
    }
  );
};



/* =================================
   GET FULL MESSAGE THREAD
================================= */
exports.getMessages = (req, res) => {
  const queryId = req.params.queryId;

  db.query(
    `SELECT sender, sender_id, message, sent_at
     FROM query_messages
     WHERE query_id=?
     ORDER BY sent_at ASC`,
    [queryId],
    (err, data) => {
      if (err) {
        console.error("GET MESSAGES ERROR:", err);
        return res.status(500).json([]);
      }
      res.json(data);
    }
  );
};

/* =================================
   DELETE QUERY (USER / ADMIN)
================================= */
exports.deleteQuery = (req, res) => {
  const queryId = req.params.queryId;

  if (!queryId) {
    return res.status(400).json({ success: false });
  }

  // delete messages first
  db.query(
    "DELETE FROM query_messages WHERE query_id=?",
    [queryId],
    () => {
      db.query(
        "DELETE FROM queries WHERE query_id=?",
        [queryId],
        (err) => {
          if (err) {
            console.error("DELETE QUERY ERROR:", err);
            return res.status(500).json({ success: false });
          }
          res.json({ success: true });
        }
      );
    }
  );
};

/* =================================
   ADMIN: QUICK REPLY
================================= */
exports.replyQuery = (req, res) => {
  const { query_id, staff_id, reply_message } = req.body;

  if (!query_id || !staff_id || !reply_message) {
    return res.status(400).json({ success: false });
  }

  db.query(
    "INSERT INTO query_messages (query_id, sender, sender_id, message) VALUES (?, 'ADMIN', ?, ?)",
    [query_id, staff_id, reply_message],
    (err) => {
      if (err) {
        console.error("ADMIN REPLY ERROR:", err);
        return res.status(500).json({ success: false });
      }

      db.query(
        "UPDATE queries SET status='REPLIED' WHERE query_id=?",
        [query_id],
        () => res.json({ success: true })
      );
    }
  );
};