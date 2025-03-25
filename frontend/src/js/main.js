document.addEventListener("DOMContentLoaded", () => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
        window.location.href = "login.html";
        return;
    }

    const userInfoDiv = document.getElementById("userInfo");
    const mail = user.user.email;
    const username = user.user.username;


    userInfoDiv.innerHTML = `<p>${username}, Почта - ${mail}</p>`;

    function loadMessages() {
        fetch('http://127.0.0.1:5000/messages')
            .then(response => response.json())
            .then(data => {
                const messagesList = document.querySelector('.messages__list');
                messagesList.innerHTML = '';

                data.forEach(message => {
                    const messageItem = document.createElement('li');
                    messageItem.innerHTML = `
                        <h3>${message.subject}</h3>
                        <p>${message.body}</p>
                        <p><strong>Отправитель:</strong> ${message.sender_id}</p>
                        <p><strong>Получатель:</strong> ${message.receiver_id}</p>
                        <p><strong>Статус:</strong> ${message.status}</p>
                    `;
                    messagesList.appendChild(messageItem);
                });
            })
            .catch(error => console.error('Ошибка при загрузке сообщений:', error));
    }

    loadMessages();

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