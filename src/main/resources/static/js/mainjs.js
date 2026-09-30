document.addEventListener("DOMContentLoaded", function () {
    // 1. Xử lý sự kiện Đăng nhập tại trang login.html
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", function (e) {
            e.preventDefault();

            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;

            // Gọi API đăng nhập backend
            fetch("/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email: email, password: password })
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error("Đăng nhập thất bại. Kiểm tra lại email hoặc mật khẩu!");
                }
                return response.json();
            })
            .then(data => {
                // Lấy token từ response (hỗ trợ cả token hoặc accessToken)
                const token = data.token || data.accessToken;
                if (token) {
                    localStorage.setItem("access_token", token);
                    // Chuyển hướng sang trang profile sau khi đăng nhập thành công
                    window.location.href = "/user/profile"; // Hoặc đường dẫn trang profile của bạn
                } else {
                    alert("Không nhận được token từ hệ thống!");
                }
            })
            .catch(error => {
                alert(error.message);
            });
        });
    }

    // 2. Xử lý tải thông tin người dùng tại trang profile.html
    const profileCard = document.querySelector(".profile-card");
    if (profileCard) {
        const token = localStorage.getItem("access_token");
        if (!token) {
            // Nếu chưa đăng nhập, chuyển hướng về trang login
            window.location.href = "/login";
            return;
        }

        // Gọi API lấy thông tin user hiện tại với đúng endpoint /users/me
        fetch("/users/me", {
            method: "GET",
            headers: {
                "Authorization": "Bearer " + token,
                "Content-Type": "application/json"
            }
        })
        .then(response => {
            if (response.status === 401 || response.status === 403) {
                localStorage.removeItem("access_token");
                window.location.href = "/login";
                throw new Error("Phiên đăng nhập đã hết hạn.");
            }
            return response.json();
        })
        .then(user => {
            // Hiển thị email lên giao diện profile (khớp với id="userEmail" ở file HTML)
            const emailSpan = document.getElementById("userEmail");
            if (emailSpan) {
                emailSpan.innerText = user.email || "Không rõ";
            }
        })
        .catch(error => {
            console.error("Lỗi xác thực:", error);
        });

        // 3. Xử lý sự kiện nút Đăng Xuất
        const btnLogout = document.getElementById("btnLogout");
        if (btnLogout) {
            btnLogout.addEventListener("click", function () {
                localStorage.removeItem("access_token");
                window.location.href = "/login";
            });
        }
    }
});