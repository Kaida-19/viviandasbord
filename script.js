const sidebar = document.getElementById('sidebar');
    const toggleBtn = document.getElementById('toggleSidebar');
    const chat = document.getElementById('chat');
    const roomsList = document.getElementById('rooms');
    let room = null;
    let ws = null;

    toggleBtn.onclick = () => {
      sidebar.classList.toggle('collapsed');
    };

    // Load rooms
    async function loadRooms() {
      try {
        // const res = await fetch("http://127.0.0.1:8000/rooms");
        const res = await fetch("https://support-chat-wpms.onrender.com/rooms");
        const rooms = await res.json();
        roomsList.innerHTML = '';
        rooms.forEach(r => {
          const li = document.createElement('li');
          li.textContent = r;
          li.onclick = () => joinRoom(r);
          roomsList.appendChild(li);
        });
      } catch (err) {
        console.error("Could not load rooms:", err);
      }
    }

    // Join a room
    function joinRoom(r) {
      room = r;
      chat.innerHTML = '';
      if (ws) ws.close();
      // ws = new WebSocket(`ws://127.0.0.1:8000/ws/${room}`);
      ws = new WebSocket(`wss://support-chat-wpms.onrender.com/ws/${room}`);
      ws.onmessage = (e) => {
        const msg = JSON.parse(e.data);
        const div = document.createElement('div');
        div.className = 'message ' + (msg.sender === 'admin' ? 'admin' : 'customer');
        div.innerHTML = `${msg.content}<div class="timestamp">${new Date(msg.timestamp).toLocaleTimeString()}</div>`;
        chat.appendChild(div);
        chat.scrollTop = chat.scrollHeight;
      };
    }

    // Send message
    function send() {
      if (!ws || !room) return alert("Select a room first!");
      const content = document.getElementById('msg').value;
      if (!content) return;
      ws.send(JSON.stringify({ sender: "admin", content }));
      document.getElementById('msg').value = '';
    }

    // Refresh rooms every 5 seconds
    setInterval(loadRooms, 5000);
    loadRooms();