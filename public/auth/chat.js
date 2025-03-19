
const socket = io("http://localhost:3001");
let selectedUserId = null;
let currentUserId = null;

document.addEventListener("DOMContentLoaded", function () {
    checkSession();

    // ✅ Gán sự kiện cho nút gửi tin nhắn
    const sendButton = document.getElementById("send");
    const messageInput = document.getElementById("messageInput");
    const logoutButton = document.getElementById("logoutButton");

    if (sendButton) sendButton.addEventListener("click", sendMessage);
    if (messageInput) {
        messageInput.addEventListener("keydown", function (event) {
            if (event.key === "Enter") sendMessage();
        });
    }
    if (logoutButton) logoutButton.addEventListener("click", logout);
});

// ✅ Kiểm tra session người dùng
function checkSession() {
    fetch("/api/check-session", { credentials: "include" })
        .then(response => response.json())
        .then(data => {
            console.log("🔍 Kiểm tra session:", data); // ✅ Debug
            if (data.loggedIn) {
                currentUserId = data.user.id;
                document.getElementById("loginUser").textContent = `👤 ${data.user.username}`;
                document.getElementById("logoutButton").style.display = "inline-block";
                document.getElementById("content");
                loadUsers();
            } else {
                window.location.href = "/views/index.html"; // Chuyển về trang đăng nhập nếu chưa login
            }
        })
        .catch(error => console.error("❌ Lỗi kiểm tra session:", error));
}

// ✅ Đăng xuất
function logout() {
    fetch("/api/logout", { method: "POST", credentials: "include" })
        .then(() => {
            alert("🚪 Đăng xuất thành công!");
            window.location.href = "/Views/index.html";
        })
        .catch(error => console.error("❌ Lỗi đăng xuất:", error));
}

// ✅ Tải danh sách người dùng
function loadUsers() {
    fetch("/api/users", { credentials: "include" })
        .then(response => response.json())
        .then(users => {
            console.log("📋 Danh sách người dùng:", users); // ✅ Debug
            const userList = document.getElementById("users");
            if (!userList) return;

            userList.innerHTML = "";
            users.forEach(user => {
                if (user.id !== currentUserId) {
                    const li = document.createElement("li");
                    li.textContent = user.username;
                    li.onclick = () => selectUser(user.id, user.username);
                    userList.appendChild(li);
                }
            });
        })
        .catch(error => console.error("❌ Lỗi tải danh sách người dùng:", error));
}

// ✅ Chọn người dùng để chat
function selectUser(userId, username) {
    selectedUserId = userId;
    document.getElementById("chatWith").textContent = `Chat với ${username}`;
    loadMessages();
}

// ✅ Tải tin nhắn giữa 2 người
function loadMessages() {
    if (!selectedUserId || !currentUserId) return;

    fetch(`/api/messages?senderId=${currentUserId}&receiverId=${selectedUserId}`, { credentials: "include" })
        .then(response => response.json())
        .then(messages => {
            console.log("💬 Tin nhắn nhận được:", messages);

            if (!Array.isArray(messages)) {
                console.error("❌ API không trả về mảng tin nhắn:", messages);
                return;
            }

            const messageBox = document.getElementById("messages");
            if (!messageBox) return;

            messageBox.innerHTML = "";
            messages.forEach(msg => {
                const div = document.createElement("div");
                
                // ✅ Phân loại tin nhắn gửi hoặc nhận
                div.classList.add("message", msg.sender_id == currentUserId ? "sent" : "received");

                const senderName = msg.sender_username || "Không xác định";
                let timeSent = msg.timestamp ? new Date(msg.timestamp).toLocaleString("vi-VN") : "Không có thời gian";

                div.innerHTML = `<strong>${senderName}:</strong> ${msg.message} <span class="time">(${timeSent})</span>`;
                messageBox.appendChild(div);
            });

            // ✅ Cuộn xuống tin nhắn mới nhất
            messageBox.scrollTop = messageBox.scrollHeight;
        })
        .catch(error => console.error("❌ Lỗi tải tin nhắn:", error));
}

function loadUsers() {
    fetch("/api/users", { credentials: "include" })
        .then(response => response.json())
        .then(users => {
            console.log("📋 Phản hồi từ API /api/users:", users); // ✅ Debug dữ liệu API

            // 🔥 Kiểm tra dữ liệu có phải mảng không
            if (!Array.isArray(users)) {
                console.error("❌ API không trả về mảng người dùng:", users);
                return;
            }

            const userList = document.getElementById("users");
            if (!userList) return;

            userList.innerHTML = "";
            users.forEach(user => {
                if (user.id !== currentUserId) {
                    const li = document.createElement("li");
                    li.textContent = user.username;
                    li.onclick = () => selectUser(user.id, user.username);
                    userList.appendChild(li);
                }
            });
        })
        .catch(error => console.error("❌ Lỗi tải danh sách người dùng:", error));
}


// ✅ Gửi tin nhắn
socket.on("newMessage", (data) => {
    console.log("🔔 Tin nhắn mới nhận được:", data);

    // 🔥 Kiểm tra nếu tin nhắn liên quan đến người đang chat
    if (data.senderId === selectedUserId || data.receiverId === selectedUserId) {
        loadMessages();
    }
});

// ✅ Gửi tin nhắn
function sendMessage() {
    const messageInput = document.getElementById("messageInput");
    if (!messageInput) return;

    const message = messageInput.value.trim();
    if (!message || !selectedUserId || !currentUserId) return;

    fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ senderId: currentUserId, receiverId: selectedUserId, message }),
        credentials: "include"
    })
    .then(response => response.json())
    .then(result => {
        console.log("✅ Tin nhắn đã gửi:", result);
        messageInput.value = "";
    })
    .catch(error => console.error("❌ Lỗi gửi tin nhắn:", error));
}