const USER_ID = localStorage.getItem("user_id");

if (!USER_ID) {
  alert("User not logged in. Please login again.");
}

/* ======================
   SEND QUERY
====================== */
function sendQuery() {
  const msg = document.getElementById("queryText").value.trim();
  if (!msg) return alert("Enter your query");

  fetch("http://localhost:3001/api/query", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_id: USER_ID,
      message: msg
    })
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        document.getElementById("queryText").value = "";
        loadQueries();
      } else {
        alert("Failed to send query");
      }
    });
}


/* ======================
   LOAD USER QUERIES
====================== */
function loadQueries() {
  fetch(`http://localhost:3001/api/user/${USER_ID}/queries`)
    .then(res => res.json())
    .then(data => {
      const box = document.getElementById("queryList");
      box.innerHTML = "";

      if (!data.length) {
        box.innerHTML = "<p>No queries yet</p>";
        return;
      }

      data.forEach(q => {
        box.innerHTML += `
          <div class="query-card">
            <b>Status:</b> ${q.status}<br>
            ${q.message}<br>
            <button onclick="openChat(${q.query_id})">Open Chat</button>
            <div id="chat-${q.query_id}" data-open="false"></div>
            <hr>
          </div>
        `;
      });
    });
}


/* ======================
   OPEN CHAT (USER)
====================== */
function openChat(id) {
  const box = document.getElementById("chat-" + id);

  if (box.getAttribute("data-open") === "true") {
    box.innerHTML = "";
    box.setAttribute("data-open", "false");
    return;
  }

  fetch(`http://localhost:3001/api/messages/${id}`)
    .then(res => res.json())
    .then(msgs => {
      box.setAttribute("data-open", "true");
      box.innerHTML = "";

      msgs.forEach(m => {
        box.innerHTML += `
          <div style="margin:6px 0; text-align:${m.sender === "USER" ? "right" : "left"}">
            <span style="
              display:inline-block;
              padding:8px 12px;
              border-radius:10px;
              background:${m.sender === "USER" ? "#C8E6C9" : "#E3F2FD"};
            ">
              ${m.message}
            </span>
          </div>
        `;
      });

      box.innerHTML += `
        <input id="r${id}" placeholder="Reply..." />
        <button onclick="reply(${id})">Send</button>
        <button onclick="closeChat(${id})">Close</button>
      `;
    });
}

function closeChat(id) {
  const box = document.getElementById("chat-" + id);
  box.innerHTML = "";
  box.setAttribute("data-open", "false");
}


/* ======================
   USER REPLY
====================== */
function reply(id) {
  const text = document.getElementById("r" + id).value.trim();
  if (!text) return;

  fetch("http://localhost:3001/api/message", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query_id: id,
      sender: "USER",
      sender_id: USER_ID,
      message: text
    })
  })
    .then(res => res.json())
    .then(() => openChat(id));
}

loadQueries();
