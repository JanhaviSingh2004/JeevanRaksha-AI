/* ======================
   LOAD ALL QUERIES (ADMIN)
====================== */
fetch("http://localhost:3001/api/admin/queries")
  .then(res => res.json())
  .then(data => {
    const list = document.getElementById("list");
    list.innerHTML = "";

    if (!data.length) {
      list.innerHTML = "<p>No open queries</p>";
      return;
    }

    data.forEach(q => {
      list.innerHTML += `
        <div class="card">
          <p><b>Query:</b> ${q.message}</p>
          <button onclick="openChat(${q.query_id})">Open Chat</button>
          <button class="delete-btn" onclick="deleteQuery(${q.query_id})">Delete</button>
          <div id="chat-${q.query_id}" data-open="false"></div>
        </div>
      `;
    });
  })
  .catch(err => console.error("ADMIN QUERY FETCH ERROR:", err));


/* ======================
   OPEN CHAT
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
          <div class="chat-row ${m.sender === "ADMIN" ? "right" : "left"}">
            <div class="chat-bubble ${m.sender === "ADMIN" ? "admin-bubble" : "user-bubble"}">
              ${m.message}
            </div>
          </div>
        `;
      });

      box.innerHTML += `
        <div class="chat-actions">
          <input id="r${id}" placeholder="Reply..." />
          <button onclick="reply(${id})">Send</button>
          <button class="close-btn" onclick="closeChat(${id})">Close</button>
        </div>
      `;
    });
}


/* ======================
   CLOSE CHAT
====================== */
function closeChat(id) {
  const box = document.getElementById("chat-" + id);
  box.innerHTML = "";
  box.setAttribute("data-open", "false");
}


/* ======================
   SEND ADMIN REPLY
====================== */
function reply(id) {
  const replyMsg = document.getElementById("r" + id).value.trim();
  if (!replyMsg) return;

  fetch("http://localhost:3001/api/message", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query_id: id,
      sender: "ADMIN",
      sender_id: 1,
      message: replyMsg
    })
  })
    .then(res => res.json())
    .then(() => openChat(id))
    .catch(err => console.error("REPLY ERROR:", err));
}


/* ======================
   DELETE QUERY
====================== */
function deleteQuery(id) {
  fetch(`http://localhost:3001/api/admin/query/${id}`, {
    method: "DELETE"
  })
    .then(() => location.reload())
    .catch(err => console.error("DELETE ERROR:", err));
}
