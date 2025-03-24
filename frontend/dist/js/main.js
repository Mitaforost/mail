document.addEventListener("DOMContentLoaded", () => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
        window.location.href = "login.html";
        return;
    }

    const userInfoDiv = document.getElementById("userInfo");
    const role = user.user.role_id;
    const username = user.user.username;

    let roleText = "";
    switch (role) {
        case 1:
            roleText = "Администратор";
            break;
        case 2:
            roleText = "Менеджер";
            break;
        case 3:
            roleText = "Кассир";
            break;
        case 4:
            roleText = "Клиент";
            break;
        default:
            roleText = "Неизвестная роль";
            break;
    }

    userInfoDiv.innerHTML = `<p>${roleText} ${username}</p>`;

    // Ограничение доступа по ролям
    function restrictAccess() {
        if (role === 4) {
            document.querySelector('a[href="employees.html"]').style.display = "none";
            document.querySelector('a[href="customers.html"]').style.display = "none";
            document.querySelector('a[href="orders.html"]').style.display = "none";

            document.querySelector('#totalEmployees').closest('.overview__item').style.display = "none";
            document.querySelector('#totalCustomers').closest('.overview__item').style.display = "none";
            document.querySelector('#totalOrders').closest('.overview__item').style.display = "none";
        } else if (role === 3) {
            document.querySelector('a[href="payments.html"]').style.display = "none";
        } else if (role === 2) {
            document.querySelector('a[href="payments.html"]').style.display = "none";
        }
        // Убираем кнопки редактирования и добавления для клиентов и менеджеров
        if (role !== 1) {
            const editButtons = document.querySelectorAll('.editModeBtn');
            const addButtons = document.querySelectorAll('.editAddBtn');
            editButtons.forEach(button => button.style.display = 'none');
            addButtons.forEach(button => button.style.display = 'none');
            // document.querySelector('#buttonContainer').style.display = "none";
        }
    }

    restrictAccess();

    function loadStatistics() {
        fetch('http://127.0.0.1:5000/statistics')
            .then(response => response.json())
            .then(data => {
                if (role === 1) {
                    document.getElementById("totalOrders").textContent = data.orderCount;
                    document.getElementById("totalCustomers").textContent = data.userCount;
                    document.getElementById("totalProducts").textContent = data.productCount;
                    document.getElementById("totalEmployees").textContent = data.logCount;
                } else if (role === 2) {
                    document.getElementById("totalOrders").textContent = data.orderCount;
                    document.getElementById("totalCustomers").textContent = data.userCount;
                    document.getElementById("totalProducts").textContent = data.productCount;
                    document.getElementById("totalEmployees").style.display = "none";
                } else if (role === 3) {
                    document.getElementById("totalOrders").textContent = "Доступ ограничен";
                    document.getElementById("totalCustomers").style.display = "none";
                    document.getElementById("totalProducts").textContent = data.productCount;
                    document.getElementById("totalEmployees").style.display = "none";
                } else if (role === 4) {
                    document.getElementById("totalProducts").textContent = data.productCount;
                }
            })
            .catch(error => console.error('Ошибка при загрузке статистики:', error));
    }

    loadStatistics();

    const logoutPopup = document.getElementById("logoutPopup");
    const confirmLogout = document.getElementById("confirmLogout");
    const cancelLogout = document.getElementById("cancelLogout");

    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.style.display = "inline-block";
        logoutBtn.addEventListener("click", () => {
            logoutPopup.style.display = "flex";
        });

        confirmLogout.addEventListener("click", () => {
            localStorage.removeItem("user");
            window.location.href = "login.html";
        });

        cancelLogout.addEventListener("click", () => {
            logoutPopup.style.display = "none";
        });
    }
});
