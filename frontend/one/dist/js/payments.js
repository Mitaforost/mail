document.addEventListener("DOMContentLoaded", () => {
    const table = document.getElementById("paymentsTable");
    const main = document.querySelector("main");
    const h2 = main ? main.querySelector("h2") : null;
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
            document.querySelector('a[href="orders.html"]').style.display = "none";
        } else if (role === 3) {
            document.querySelector('a[href="payments.html"]').style.display = "none";
        } else if (role === 2) {
            document.querySelector('a[href="payments.html"]').style.display = "none";
        }
        // Убираем кнопки редактирования и добавления для клиентов и менеджеров
        if (role !== 1) {
            const editButtons = document.querySelectorAll('.edit-btn');
            const addButtons = document.querySelectorAll('.add-btn');
            editButtons.forEach(button => button.style.display = 'none');
            addButtons.forEach(button => button.style.display = 'none');
            // document.querySelector('#buttonContainer').style.display = "none";
        }
    }

    restrictAccess();

    if (!table || !main || !h2) {
        console.error("Ошибка: Один из необходимых элементов не найден");
        return;
    }

    // Проверяем, есть ли уже блок для кнопок
    let buttonContainer = document.getElementById("buttonContainer");
    if (!buttonContainer) {
        buttonContainer = document.createElement("div");
        buttonContainer.id = "buttonContainer";
        buttonContainer.style.display = "flex";
        buttonContainer.style.gap = "20px";
        buttonContainer.style.marginBottom = "20px";
        h2.after(buttonContainer);
    }

    // Создаем кнопку "Режим редактирования", если её нет
    let editModeBtn = document.getElementById("editModeBtn");
    if (!editModeBtn) {
        editModeBtn = document.createElement("button");
        editModeBtn.id = "editModeBtn";
        editModeBtn.classList = "btn";
        editModeBtn.textContent = "Режим редактирования";
        buttonContainer.appendChild(editModeBtn);
    }

    // Создаем кнопку "Добавить платеж", если её нет
    let addPaymentBtn = document.getElementById("addPaymentBtn");
    if (!addPaymentBtn) {
        addPaymentBtn = document.createElement("button");
        addPaymentBtn.id = "addPaymentBtn";
        addPaymentBtn.classList = "btn";
        addPaymentBtn.textContent = "Добавить платеж";
        buttonContainer.appendChild(addPaymentBtn);
    }

    // Логика режима редактирования
    let editMode = false;
    editModeBtn.addEventListener("click", () => {
        editMode = !editMode;
        editModeBtn.classList.toggle("active", editMode);
        document.querySelectorAll(".editBtn, .deleteBtn").forEach(btn => {
            btn.style.display = editMode ? "inline-block" : "none";
        });
    });

    // Загружаем платежи с сервера
    function loadPayments() {
        fetch("http://127.0.0.1:5000/payments")
            .then(response => response.json())
            .then(data => {
                if (!Array.isArray(data)) {
                    console.error("Ошибка: Ожидался массив данных, получено:", data);
                    return;
                }
                table.innerHTML = "";
                data.forEach(payment => addPaymentRow(payment));

                // После успешной загрузки данных скрываем buttonContainer для ролей, не равных 1
                if (role !== 1) {
                    document.querySelector('#buttonContainer').style.display = "none";
                }
            })
            .catch(error => console.error("Ошибка загрузки платежей:", error));
    }

    // Начальная загрузка платежей
    loadPayments();

    // Добавление строки платежа в таблицу
    function addPaymentRow(payment) {
        const row = document.createElement("tr");
        row.setAttribute("data-id", payment.id);
        row.innerHTML = `
            <td>${payment.id}</td>
            <td class="editable" data-field="order_id">${payment.order_id}</td>
            <td class="editable" data-field="amount">${payment.amount} ₽</td>
            <td class="editable" data-field="payment_date">${new Date(payment.payment_date).toLocaleDateString()}</td>
            <td>
                <button class="editBtn btn" style="display: none;">Редактировать</button>
                <button class="deleteBtn btn" style="display: none;">Удалить</button>
            </td>
        `;
        table.appendChild(row);
    }

    // Обработка кликов по кнопкам редактирования и удаления
    table.addEventListener("click", (event) => {
        const target = event.target;

        // Найти ближайшую строку и ее ID
        const row = target.closest("tr");
        const paymentId = row ? row.getAttribute("data-id") : null;

        // Обработчик для редактирования
        if (target.classList.contains("editBtn") && paymentId) {
            openPopup(row);
        }

        // Обработчик для удаления
        if (target.classList.contains("deleteBtn") && paymentId) {
            if (confirm("Вы уверены, что хотите удалить этот платеж?")) {
                deletePayment(paymentId, row);
            }
        }
    });

    // Открытие попапа для редактирования платежа
    function openPopup(row) {
        if (!row) return;

        // Получаем все ячейки
        const idCell = row.querySelector("td");
        const orderIdCell = row.querySelector("[data-field='order_id']");
        const amountCell = row.querySelector("[data-field='amount']");
        const paymentDateCell = row.querySelector("[data-field='payment_date']");

        // Логируем найденные элементы
        console.log("Ячейки:", { idCell, orderIdCell, amountCell, paymentDateCell });

        // Проверяем, что все ячейки найдены
        if (!idCell || !orderIdCell || !amountCell || !paymentDateCell) {
            console.error("Ошибка: Не удалось найти все ячейки для редактирования.");
            return;
        }

        const payment = {
            id: idCell.textContent,
            order_id: orderIdCell.textContent,
            amount: parseFloat(amountCell.textContent.replace(" ₽", "")),
            payment_date: new Date(paymentDateCell.textContent).toISOString().split('T')[0]
        };

        const popup = document.getElementById("popup");
        popup.style.display = "block";

        document.getElementById("editPaymentId").value = payment.id;
        document.getElementById("editPaymentOrderId").value = payment.order_id;
        document.getElementById("editPaymentAmount").value = payment.amount;
        document.getElementById("editPaymentDate").value = payment.payment_date;

        const saveEditBtn = document.getElementById("saveEditPayment");
        const cancelEditBtn = document.getElementById("cancelEditPayment");

        // Обработчик сохранения изменений
        saveEditBtn.onclick = function () {
            const updatedPayment = {
                id: payment.id,
                order_id: Number(document.getElementById("editPaymentOrderId").value),
                amount: parseFloat(document.getElementById("editPaymentAmount").value),
                payment_date: document.getElementById("editPaymentDate").value
            };

            updatePayment(updatedPayment);

            orderIdCell.textContent = updatedPayment.order_id;
            amountCell.textContent = updatedPayment.amount + " ₽";
            paymentDateCell.textContent = new Date(updatedPayment.payment_date).toLocaleDateString();

            popup.style.display = "none";
        };

        // Обработчик отмены редактирования
        cancelEditBtn.onclick = function () {
            popup.style.display = "none";
        };
    }

    // Обновление платежа на сервере
    function updatePayment(payment) {
        fetch(`http://127.0.0.1:5000/payments/${payment.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payment),
        })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    console.error("Ошибка обновления платежа:", data.error);
                    alert("Ошибка на сервере при обновлении платежа.");
                } else {
                    console.log("Платеж обновлён:", data);
                    loadPayments(); // Обновляем список платежей
                }
            })
            .catch(error => {
                console.error("Ошибка обновления платежа:", error);
                alert("Ошибка на сервере.");
            });
    }

    // Удаление платежа с сервера
    function deletePayment(id, row) {
        fetch(`http://127.0.0.1:5000/payments/${id}`, {
            method: "DELETE",
        })
            .then(response => response.json())
            .then(() => {
                row.remove();
            })
            .catch(error => console.error("Ошибка удаления платежа:", error));
    }

    // Обработчик для добавления нового платежа
    addPaymentBtn.addEventListener("click", () => {
        document.getElementById("addPaymentPopup").style.display = "block";
    });

    document.getElementById("cancelAddPayment").addEventListener("click", () => {
        document.getElementById("addPaymentPopup").style.display = "none";
    });

    document.getElementById("savePayment").addEventListener("click", () => {
        const order_id = document.getElementById("newPaymentOrderId").value;
        const amount = document.getElementById("newPaymentAmount").value;
        const payment_date = document.getElementById("newPaymentDate").value;

        createNewPayment(order_id, amount, payment_date);
    });

    function createNewPayment(order_id, amount, payment_date) {
        // Проверка на заполненность всех полей
        if (!order_id || !amount || !payment_date) {
            alert("Пожалуйста, заполните все поля.");
            return;
        }

        // Преобразование типов данных
        const paymentData = {
            order_id: Number(order_id),
            amount: parseFloat(amount),
            payment_date: new Date(payment_date).toISOString()
        };

        console.log("Отправляемые данные на сервер:", paymentData);

        fetch("http://127.0.0.1:5000/payments", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(paymentData),
        })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    console.error("Ошибка создания платежа:", data.error);
                    alert("Ошибка на сервере при создании платежа.");
                } else {
                    console.log("Новый платеж создан:", data);
                    loadPayments(); // Обновляем таблицу платежей
                    document.getElementById("addPaymentPopup").style.display = "none";
                }
            })
            .catch(error => {
                console.error("Ошибка создания платежа:", error);
                alert("Ошибка на сервере.");
            });
    }
});
