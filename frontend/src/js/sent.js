document.addEventListener("DOMContentLoaded", () => {
    const userId = JSON.parse(localStorage.getItem("user")).user.id;
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
        window.location.href = "login.html";
        return;
    }

    const userInfoDiv = document.getElementById("userInfo");
    const mail = user.user.email;
    const username = user.user.username;

    userInfoDiv.innerHTML = `<p>${username}, Почта - ${mail}</p>`;
    function loadSentMessages() {
        fetch(`http://127.0.0.1:5000/messages/sent/${userId}`)
            .then(response => response.json())
            .then(data => {
                const messagesList = document.getElementById('sentMessages');
                messagesList.innerHTML = '';

                if (data.length === 0) {
                    const noMessagesItem = document.createElement('li');
                    noMessagesItem.innerHTML = `<p>У вас нет новых сообщений</p>`;
                    messagesList.appendChild(noMessagesItem);
                } else {
                    data.forEach(message => {
                        const messageItem = document.createElement('li');
                        messageItem.innerHTML = `
                        <h3>${message.subject}</h3>
                        <p>${message.body}</p>
                        <p><strong>Статус:</strong> ${message.status}</p>
                    `;
                        messagesList.appendChild(messageItem);
                    });
                }
            })
            .catch(error => console.error('Ошибка при загрузке отправленных сообщений:', error));
    }
    function loadStatistics() {
        fetch('http://127.0.0.1:5000/statistics')
            .then(response => response.json())
            .then(data => {
                document.getElementById('userCount').innerText = `Пользователей: ${data.userCount}`;
                document.getElementById('messageCount').innerText = `Сообщений: ${data.messageCount}`;
                document.getElementById('attachmentCount').innerText = `Вложений: ${data.attachmentCount}`;
            })
            .catch(error => console.error('Ошибка при загрузке статистики:', error));
    }

    loadStatistics();
    loadSentMessages();
    const logoutBtn = document.getElementById("logoutBtn");
    const logoutPopup = document.getElementById("logoutPopup");
    const confirmLogout = document.getElementById("confirmLogout");
    const cancelLogout = document.getElementById("cancelLogout");

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
