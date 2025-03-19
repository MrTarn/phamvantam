
document.addEventListener("DOMContentLoaded", function () {
    const submitButton = document.getElementById("submit");

    if (!submitButton) {
        console.error("❌ Không tìm thấy nút đăng nhập (id='submit')");
        return;
    }

    submitButton.addEventListener("click", async function (e) {
        e.preventDefault();

        const usernameInput = document.querySelector(".Username");
        const passwordInput = document.querySelector(".password");

        if (!usernameInput || !passwordInput) {
            console.error("❌ Không tìm thấy input Username hoặc Password.");
            return;
        }

        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();

        if (!username || !password) {
            alert("⚠️ Vui lòng nhập đầy đủ tài khoản và mật khẩu.");
            return;
        }

        try {
            const response = await fetch("http://localhost:3001/api/login", { // 🔥 API đúng đường dẫn
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
                credentials: "include"
            });
            

            const result = await response.json();

            if (!response.ok) {
                alert(`❌ ${result.message || "Sai tài khoản hoặc mật khẩu!"}`);
                return;
            }

            alert("✅ Đăng nhập thành công!");
            window.location.href = "/Views/index_login_sussces.html"; 
        } catch (error) {
            console.error("❌ Lỗi khi đăng nhập:", error);
            alert("⚠️ Đã xảy ra lỗi hệ thống. Vui lòng thử lại!");
        }
    });
});
