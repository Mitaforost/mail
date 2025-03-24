document.addEventListener("DOMContentLoaded", () => {
    const table = document.getElementById("ordersTable");
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

// Создаем кнопку "Добавить заказ", если её нет
    let addOrderBtn = document.getElementById("addOrderBtn");
    if (!addOrderBtn) {
        addOrderBtn = document.createElement("button");
        addOrderBtn.id = "addOrderBtn";
        addOrderBtn.classList = "btn";
        addOrderBtn.textContent = "Добавить заказ";
        buttonContainer.appendChild(addOrderBtn);
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

    // Загружаем заказы с сервера
    function loadOrders() {
        fetch("http://127.0.0.1:5000/orders")
            .then(response => response.json())
            .then(data => {
                if (!Array.isArray(data)) {
                    console.error("Ошибка: Ожидался массив данных, получено:", data);
                    return;
                }
                table.innerHTML = "";
                data.forEach(order => addOrderRow(order));
                if (role !== 1) {
                    document.querySelector('#buttonContainer').style.display = "none";
                }
            })
            .catch(error => console.error("Ошибка загрузки заказов:", error));
    }

    // Начальная загрузка заказов
    loadOrders();

    // Добавление строки заказа в таблицу
    function addOrderRow(order) {
        const row = document.createElement("tr");
        row.setAttribute("data-id", order.id);
        row.innerHTML = `
            <td>${order.id}</td>
            <td class="editable" data-field="customer_id">${order.customer_id}</td>
            <td class="editable" data-field="status_id">${order.status_id}</td>
            <td class="editable" data-field="total_amount">${order.total_amount} BYN</td>
            <td class="editable" data-field="total_amount">${order.created_at}</td>
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
        const orderId = row ? row.getAttribute("data-id") : null;

        // Обработчик для редактирования
        if (target.classList.contains("editBtn") && orderId) {
            openPopup(row);
        }

        // Обработчик для удаления
        if (target.classList.contains("deleteBtn") && orderId) {
            if (confirm("Вы уверены, что хотите удалить этот заказ?")) {
                deleteOrder(orderId, row);
            }
        }
    });

    // Открытие попапа для редактирования заказа
    function openPopup(row) {
        if (!row) return;

        // Получаем все ячейки
        const idCell = row.querySelector("td");
        const customerIdCell = row.querySelector("[data-field='customer_id']");
        const statusIdCell = row.querySelector("[data-field='status_id']");
        const totalAmountCell = row.querySelector("[data-field='total_amount']");
        const createdAtCell = row.querySelector("[data-field='created_at']");

        // Логируем найденные элементы
        console.log("Ячейки:", { idCell, customerIdCell, statusIdCell, totalAmountCell, createdAtCell });

        // Проверяем, что все ячейки найдены
        if (!idCell || !customerIdCell || !statusIdCell || !totalAmountCell) {
            console.error("Ошибка: Не удалось найти все ячейки для редактирования.");
            return;
        }

        // Проверка наличия createdAtCell (если её нет, задаем пустую строку)
        const created_at = createdAtCell ? createdAtCell.textContent : "";

        const id = idCell.textContent;
        const customer_id = customerIdCell.textContent;
        const status_id = statusIdCell.textContent;
        const total_amount = totalAmountCell.textContent.replace(" ₽", "");

        const popup = document.getElementById("popup");
        popup.style.display = "block";

        document.getElementById("editOrderId").value = id;
        document.getElementById("editOrderCustomer").value = customer_id;
        document.getElementById("editOrderStatus").value = status_id;
        document.getElementById("editOrderAmount").value = total_amount;
        document.getElementById("editOrderDate").value = created_at; // Если пусто, просто оставит пустым

        const saveEditBtn = document.getElementById("saveEditOrder");
        const cancelEditBtn = document.getElementById("cancelEditOrder");

        // Обработчик сохранения изменений
        saveEditBtn.onclick = function () {
            const newCustomerId = Number(document.getElementById("editOrderCustomer").value);
            const newStatusId = Number(document.getElementById("editOrderStatus").value);
            const newTotalAmount = parseFloat(document.getElementById("editOrderAmount").value);
            let newOrderDate = document.getElementById("editOrderDate").value;

            if (!newOrderDate) {
                newOrderDate = new Date().toISOString(); // Если дата не введена, устанавливаем текущую
            }

            const updatedData = {
                customer_id: newCustomerId,
                status_id: newStatusId,
                total_amount: newTotalAmount,
                created_at: new Date(newOrderDate).toISOString()
            };

            console.log("Отправляемые данные:", updatedData);

            updateOrder(id, newCustomerId, newStatusId, newTotalAmount, newOrderDate);

            customerIdCell.textContent = newCustomerId;
            statusIdCell.textContent = newStatusId;
            totalAmountCell.textContent = newTotalAmount + " BYN";
            if (createdAtCell) createdAtCell.textContent = newOrderDate;

            popup.style.display = "none";
        };
        cancelEditBtn.onclick = () => popup.style.display = "none";
    }

    // Обновление заказа на сервере
    function updateOrder(id, customer_id, status_id, total_amount, created_at) {
        const orderData = {
            customer_id: Number(customer_id),
            status_id: Number(status_id),
            total_amount: parseFloat(total_amount),
            created_at: created_at
        };

        fetch(`http://127.0.0.1:5000/orders/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(orderData),
        })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    console.error("Ошибка обновления заказа:", data.error);
                    alert("Ошибка на сервере при обновлении заказа.");
                } else {
                    console.log("Заказ обновлён:", data);
                    loadOrders(); // Обновляем список заказов
                }
            })
            .catch(error => {
                console.error("Ошибка обновления заказа:", error);
                alert("Ошибка на сервере.");
            });
    }

    // Удаление заказа с сервера
    function deleteOrder(id, row) {
        fetch(`http://127.0.0.1:5000/orders/${id}`, {
            method: "DELETE",
        })
            .then(response => response.json())
            .then(() => {
                row.remove();
            })
            .catch(error => console.error("Ошибка удаления заказа:", error));
    }

    // Обработчик для добавления нового заказа
    document.getElementById("addOrderBtn").addEventListener("click", () => {
        document.getElementById("addOrderPopup").style.display = "block";
    });

    document.getElementById("cancelAddOrder").addEventListener("click", () => {
        document.getElementById("addOrderPopup").style.display = "none";
    });

    document.getElementById("saveOrder").addEventListener("click", () => {
        const customer = document.getElementById("newOrderCustomer").value;
        const date = document.getElementById("newOrderDate").value;
        const amount = document.getElementById("newOrderAmount").value;
        const status = document.getElementById("newOrderStatus").value;

        createNewOrder(customer, date, amount, status);
    });

    function createNewOrder(customer, date, amount, status) {
        // Проверка на заполненность всех полей
        if (!customer || !date || !amount || !status) {
            alert("Пожалуйста, заполните все поля.");
            return;
        }

        // Преобразование типов данных
        const orderData = {
            customer: Number(customer), // Преобразуем customer в число
            created_at: new Date().toISOString(), // Дата в формате ISO (правильный формат для TIMESTAMP)
            total_amount: parseFloat(amount), // Преобразуем amount в число (не строку)
            status: Number(status) // Преобразуем status в число
        };

        console.log("Отправляемые данные на сервер:", orderData);

        fetch("http://127.0.0.1:5000/orders", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(orderData),
        })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    console.error("Ошибка создания заказа:", data.error);
                    alert("Ошибка на сервере при создании заказа.");
                } else {
                    console.log("Новый заказ создан:", data);
                    loadOrders(); // Обновляем таблицу заказов
                    document.getElementById("addOrderPopup").style.display = "none";
                }
            })
            .catch(error => {
                console.error("Ошибка создания заказа:", error);
                alert("Ошибка на сервере.");
            });
    }
});
