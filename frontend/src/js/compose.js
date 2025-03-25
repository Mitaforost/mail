document.addEventListener("DOMContentLoaded", () => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
        window.location.href = "login.html";
        return;
    }

    const userId = user.user.id;
    const userInfoDiv = document.getElementById("userInfo");
    const mail = user.user.email;
    const username = user.user.username;

    userInfoDiv.innerHTML = `<p>${username}, Почта - ${mail}</p>`;

    const composeForm = document.getElementById('composeForm');
    const receiverEmailInput = document.getElementById('receiverEmail');
    const emailDropdown = document.getElementById('emailDropdown');

    let selectedEmail = '';

    receiverEmailInput.addEventListener('input', () => {
        const searchTerm = receiverEmailInput.value;
        if (searchTerm.length > 1) {
            fetch(`http://127.0.0.1:5000/users?search=${searchTerm}`)
                .then(response => response.json())
                .then(data => {
                    emailDropdown.innerHTML = '';
                    data.forEach(user => {
                        const emailItem = document.createElement('div');
                        emailItem.classList.add('email-item');
                        emailItem.textContent = user.email;
                        emailItem.addEventListener('click', () => {
                            receiverEmailInput.value = user.email;
                            selectedEmail = user.email; // Save the selected email
                            emailDropdown.innerHTML = '';
                        });
                        emailDropdown.appendChild(emailItem);
                    });
                    if (data.length === 0) {
                        emailDropdown.innerHTML = '<div class="email-item">No matching users found</div>';
                    }
                })
                .catch(error => console.error('Ошибка при поиске пользователей:', error));
        } else {
            emailDropdown.innerHTML = '';
        }
    });

    composeForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const receiverEmail = receiverEmailInput.value.trim();
        if (!receiverEmail) {
            alert("Введите email получателя!");
            return;
        }

        const subject = document.getElementById('subject').value;
        const body = document.getElementById('body').value;

        console.log(`Receiver email before submit: ${receiverEmail}`); // Debugging log

        try {
            // Найти пользователя по точному email
            const receiverResponse = await fetch(`http://127.0.0.1:5000/users`);
            const users = await receiverResponse.json();

            const receiver = users.find(user => user.email === receiverEmail);
            if (!receiver) {
                alert("Получатель не найден!");
                return;
            }

            const receiverId = receiver.id;

            const message = {
                sender_id: userId,
                receiver_id: receiverId,
                subject: subject,
                body: body,
            };

            const response = await fetch('http://127.0.0.1:5000/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(message)
            });

            if (response.ok) {
                alert('Сообщение успешно отправлено!');
                composeForm.reset();
                selectedEmail = ''; // Очистка после отправки
            } else {
                const errorData = await response.json();
                alert(`Ошибка при отправке сообщения: ${errorData.error}`);
            }
        } catch (error) {
            console.error('Ошибка при отправке сообщения:', error);
        }
    });


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
