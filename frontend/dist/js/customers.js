document.addEventListener("DOMContentLoaded", () => {
    const table = document.getElementById("customersTable");
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

    let buttonContainer = document.getElementById("buttonContainer");
    if (!buttonContainer) {
        buttonContainer = document.createElement("div");
        buttonContainer.id = "buttonContainer";
        buttonContainer.style.display = "flex";
        buttonContainer.style.gap = "20px";
        buttonContainer.style.marginBottom = "20px";
        h2.after(buttonContainer);
    }

    let editModeBtn = document.getElementById("editModeBtn");
    if (!editModeBtn) {
        editModeBtn = document.createElement("button");
        editModeBtn.id = "editModeBtn";
        editModeBtn.classList = "btn";
        editModeBtn.textContent = "Режим редактирования";
        buttonContainer.appendChild(editModeBtn);
    }

    let addCustomerBtn = document.getElementById("addCustomerBtn");
    if (!addCustomerBtn) {
        addCustomerBtn = document.createElement("button");
        addCustomerBtn.id = "addCustomerBtn";
        addCustomerBtn.classList = "btn";
        addCustomerBtn.textContent = "Добавить клиента";
        buttonContainer.appendChild(addCustomerBtn);
    }

    let editMode = false;
    editModeBtn.addEventListener("click", () => {
        editMode = !editMode;
        editModeBtn.classList.toggle("active", editMode);
        document.querySelectorAll(".editBtn, .deleteBtn").forEach(btn => {
            btn.style.display = editMode ? "inline-block" : "none";
        });
    });

    function loadCustomers() {
        fetch("http://127.0.0.1:5000/customers")
            .then(response => response.json())
            .then(data => {
                if (!Array.isArray(data)) {
                    console.error("Ошибка: Ожидался массив данных, получено:", data);
                    return;
                }
                table.innerHTML = "";
                data.forEach(customer => addCustomerRow(customer));
                if (role !== 1) {
                    document.querySelector('#buttonContainer').style.display = "none";
                }
            })
            .catch(error => console.error("Ошибка загрузки клиентов:", error));
    }

    loadCustomers();

    function addCustomerRow(customer) {
        const row = document.createElement("tr");
        row.setAttribute("data-id", customer.id);
        row.innerHTML =
            `<td>${customer.id}</td>
        <td class="editable" data-field="full_name">${customer.full_name}</td>
        <td class="editable" data-field="phone">${customer.phone}</td>
        <td class="editable" data-field="email">${customer.email}</td>
        <td class="editable" data-field="address">${customer.address}</td>
        <td>
            <button class="editBtn btn" style="display: none;">Редактировать</button>
            <button class="deleteBtn btn" style="display: none;">Удалить</button>
        </td>`;
        table.appendChild(row);
    }

    table.addEventListener("click", (event) => {
        const target = event.target;
        const row = target.closest("tr");
        const customerId = row ? row.getAttribute("data-id") : null;

        if (target.classList.contains("editBtn") && customerId) {
            openPopup(row);
        }

        if (target.classList.contains("deleteBtn") && customerId) {
            if (confirm("Вы уверены, что хотите удалить этого клиента?")) {
                deleteCustomer(customerId, row);
            }
        }
    });

    function openPopup(row) {
        if (!row) return;

        const idCell = row.querySelector("td");
        const nameCell = row.querySelector("[data-field='full_name']");
        const phoneCell = row.querySelector("[data-field='phone']");
        const emailCell = row.querySelector("[data-field='email']");
        const addressCell = row.querySelector("[data-field='address']");

        console.log("Ячейки:", { idCell, nameCell, phoneCell, emailCell, addressCell });

        if (!idCell || !nameCell || !phoneCell || !emailCell || !addressCell) {
            console.error("Ошибка: Не удалось найти все ячейки для редактирования.");
            return;
        }

        const id = idCell.textContent;
        const full_name = nameCell.textContent;
        const phone = phoneCell.textContent;
        const email = emailCell.textContent;
        const address = addressCell.textContent;

        const popup = document.getElementById("popup");
        popup.style.display = "block";

        document.getElementById("editCustomerId").value = id;
        document.getElementById("editCustomerName").value = full_name;
        document.getElementById("editCustomerPhone").value = phone;
        document.getElementById("editCustomerEmail").value = email;
        document.getElementById("editCustomerAddress").value = address;

        const saveEditBtn = document.getElementById("saveEditCustomer");
        const cancelEditBtn = document.getElementById("cancelEditCustomer");

        saveEditBtn.onclick = function () {
            const newName = document.getElementById("editCustomerName").value;
            const newPhone = document.getElementById("editCustomerPhone").value;
            const newEmail = document.getElementById("editCustomerEmail").value;
            const newAddress = document.getElementById("editCustomerAddress").value;

            const updatedData = {
                full_name: newName,
                phone: newPhone,
                email: newEmail,
                address: newAddress
            };

            console.log("Отправляемые данные:", updatedData);

            updateCustomer(id, updatedData);

            nameCell.textContent = newName;
            phoneCell.textContent = newPhone;
            emailCell.textContent = newEmail;
            addressCell.textContent = newAddress;

            popup.style.display = "none";
        };

        cancelEditBtn.onclick = () => popup.style.display = "none";
    }

    function updateCustomer(id, updatedData) {
        fetch(`http://127.0.0.1:5000/customers/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedData),
        })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    console.error("Ошибка обновления клиента:", data.error);
                    alert("Ошибка на сервере при обновлении клиента.");
                } else {
                    console.log("Клиент обновлён:", data);
                    loadCustomers();
                }
            })
            .catch(error => {
                console.error("Ошибка обновления клиента:", error);
                alert("Ошибка на сервере.");
            });
    }

    function deleteCustomer(id, row) {
        fetch(`http://127.0.0.1:5000/customers/${id}`, { method: "DELETE" })
            .then(response => response.json())
            .then(() => row.remove())
            .catch(error => console.error("Ошибка удаления клиента:", error));
    }

    document.getElementById("addCustomerBtn").addEventListener("click", () => {
        document.getElementById("addCustomerPopup").style.display = "block";
    });

    document.getElementById("cancelAddCustomer").addEventListener("click", () => {
        document.getElementById("addCustomerPopup").style.display = "none";
    });

    document.getElementById("saveCustomer").addEventListener("click", () => {
        const full_name = document.getElementById("newCustomerName").value;
        const phone = document.getElementById("newCustomerPhone").value;
        const email = document.getElementById("newCustomerEmail").value;
        const address = document.getElementById("newCustomerAddress").value;

        createNewCustomer(full_name, phone, email, address);
    });

    function createNewCustomer(full_name, phone, email, address) {
        if (!full_name || !phone || !address) {
            alert("Пожалуйста, заполните все обязательные поля.");
            return;
        }

        const customerData = {
            full_name: full_name,
            phone: phone,
            email: email,
            address: address
        };

        console.log("Отправляемые данные на сервер:", customerData);

        fetch("http://127.0.0.1:5000/customers", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(customerData),
        })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    console.error("Ошибка создания клиента:", data.error);
                    alert("Ошибка на сервере при создании клиента.");
                } else {
                    console.log("Новый клиент создан:", data);
                    loadCustomers();
                    document.getElementById("addCustomerPopup").style.display = "none";
                }
            })
            .catch(error => {
                console.error("Ошибка создания клиента:", error);
                alert("Ошибка на сервере.");
            });
    }
});
