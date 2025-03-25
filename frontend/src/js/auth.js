document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");

    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const username = document.getElementById("username").value; // Заменили username на email
            const password = document.getElementById("password").value;

            try {
                const response = await fetch("http://127.0.0.1:5000/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username, password }),  // Передаем email вместо username
                });

                const result = await response.json();

                if (response.ok) {
                    alert("Успешный вход!");
                    localStorage.setItem("user", JSON.stringify(result));  // Сохраняем пользователя
                    window.location.href = "index.html"; // Перенаправляем на главную
                } else {
                    alert(result.message || "Ошибка входа");
                }
            } catch (error) {
                console.error("Ошибка запроса:", error);
                alert("Ошибка соединения с сервером.");
            }
        });
    }
});
