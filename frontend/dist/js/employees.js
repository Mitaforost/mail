document.addEventListener("DOMContentLoaded", () => {
    const table = document.getElementById("employeesTable");
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

    let addEmployeeBtn = document.getElementById("addEmployeeBtn");
    if (!addEmployeeBtn) {
        addEmployeeBtn = document.createElement("button");
        addEmployeeBtn.id = "addEmployeeBtn";
        addEmployeeBtn.classList = "btn";
        addEmployeeBtn.textContent = "Добавить сотрудника";
        buttonContainer.appendChild(addEmployeeBtn);
    }

    let editMode = false;
    editModeBtn.addEventListener("click", () => {
        editMode = !editMode;
        editModeBtn.classList.toggle("active", editMode);
        document.querySelectorAll(".editBtn, .deleteBtn").forEach(btn => {
            btn.style.display = editMode ? "inline-block" : "none";
        });
    });

    function loadEmployees() {
        fetch("http://127.0.0.1:5000/employees")
            .then(response => response.json())
            .then(data => {
                if (!Array.isArray(data)) {
                    console.error("Ошибка: Ожидался массив данных, получено:", data);
                    return;
                }
                table.innerHTML = "";
                data.forEach(employee => addEmployeeRow(employee));
                if (role !== 1) {
                    document.querySelector('#buttonContainer').style.display = "none";
                }
            })
            .catch(error => console.error("Ошибка загрузки сотрудников:", error));
    }

    loadEmployees();

    function addEmployeeRow(employee) {
        const row = document.createElement("tr");
        row.setAttribute("data-id", employee.id);
        row.innerHTML =
            `<td>${employee.id}</td>
        <td class="editable" data-field="full_name">${employee.full_name}</td>
        <td class="editable" data-field="phone">${employee.phone}</td>
        <td class="editable" data-field="email">${employee.email}</td>
        <td class="editable" data-field="role">${employee.role}</td>
        <td>
            <button class="editBtn btn" style="display: none;">Редактировать</button>
            <button class="deleteBtn btn" style="display: none;">Удалить</button>
        </td>`;
        table.appendChild(row);
    }

    table.addEventListener("click", (event) => {
        const target = event.target;
        const row = target.closest("tr");
        const employeeId = row ? row.getAttribute("data-id") : null;

        if (target.classList.contains("editBtn") && employeeId) {
            openPopup(row);
        }

        if (target.classList.contains("deleteBtn") && employeeId) {
            if (confirm("Вы уверены, что хотите удалить этого сотрудника?")) {
                deleteEmployee(employeeId, row);
            }
        }
    });

    function openPopup(row) {
        if (!row) return;

        const idCell = row.querySelector("td");
        const nameCell = row.querySelector("[data-field='full_name']");
        const phoneCell = row.querySelector("[data-field='phone']");
        const emailCell = row.querySelector("[data-field='email']");
        const roleCell = row.querySelector("[data-field='role']");

        console.log("Ячейки:", { idCell, nameCell, phoneCell, emailCell, roleCell });

        if (!idCell || !nameCell || !phoneCell || !emailCell || !roleCell) {
            console.error("Ошибка: Не удалось найти все ячейки для редактирования.");
            return;
        }

        const id = idCell.textContent;
        const full_name = nameCell.textContent;
        const phone = phoneCell.textContent;
        const email = emailCell.textContent;
        const role = roleCell.textContent;

        const popup = document.getElementById("popup");
        popup.style.display = "block";

        document.getElementById("editEmployeeId").value = id;
        document.getElementById("editEmployeeName").value = full_name;
        document.getElementById("editEmployeePhone").value = phone;
        document.getElementById("editEmployeeEmail").value = email;
        document.getElementById("editEmployeeRole").value = role;

        const saveEditBtn = document.getElementById("saveEditEmployee");
        const cancelEditBtn = document.getElementById("cancelEditEmployee");

        saveEditBtn.onclick = function () {
            const newName = document.getElementById("editEmployeeName").value;
            const newPhone = document.getElementById("editEmployeePhone").value;
            const newEmail = document.getElementById("editEmployeeEmail").value;
            const newRole = document.getElementById("editEmployeeRole").value;

            const updatedData = {
                full_name: newName,
                phone: newPhone,
                email: newEmail,
                role: newRole
            };

            console.log("Отправляемые данные:", updatedData);

            updateEmployee(id, updatedData);

            nameCell.textContent = newName;
            phoneCell.textContent = newPhone;
            emailCell.textContent = newEmail;
            roleCell.textContent = newRole;

            popup.style.display = "none";
        };

        cancelEditBtn.onclick = () => popup.style.display = "none";
    }

    function updateEmployee(id, updatedData) {
        fetch(`http://127.0.0.1:5000/employees/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedData),
        })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    console.error("Ошибка обновления сотрудника:", data.error);
                    alert("Ошибка на сервере при обновлении сотрудника.");
                } else {
                    console.log("Сотрудник обновлён:", data);
                    loadEmployees();
                }
            })
            .catch(error => {
                console.error("Ошибка обновления сотрудника:", error);
                alert("Ошибка на сервере.");
            });
    }

    function deleteEmployee(id, row) {
        fetch(`http://127.0.0.1:5000/employees/${id}`, { method: "DELETE" })
            .then(response => response.json())
            .then(() => row.remove())
            .catch(error => console.error("Ошибка удаления сотрудника:", error));
    }

    document.getElementById("addEmployeeBtn").addEventListener("click", () => {
        document.getElementById("addEmployeePopup").style.display = "block";
    });

    document.getElementById("cancelAddEmployee").addEventListener("click", () => {
        document.getElementById("addEmployeePopup").style.display = "none";
    });

    document.getElementById("saveEmployee").addEventListener("click", () => {
        const full_name = document.getElementById("newEmployeeName").value;
        const phone = document.getElementById("newEmployeePhone").value;
        const email = document.getElementById("newEmployeeEmail").value;
        const role = document.getElementById("newEmployeeRole").value;

        createNewEmployee(full_name, phone, email, role);
    });

    function createNewEmployee(full_name, phone, email, role) {
        if (!full_name || !phone || !role) {
            alert("Пожалуйста, заполните все обязательные поля.");
            return;
        }

        const employeeData = {
            full_name: full_name,
            phone: phone,
            email: email,
            role: role
        };

        console.log("Отправляемые данные на сервер:", employeeData);

        fetch("http://127.0.0.1:5000/employees", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(employeeData),
        })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    console.error("Ошибка создания сотрудника:", data.error);
                    alert("Ошибка на сервере при создании сотрудника.");
                } else {
                    console.log("Новый сотрудник создан:", data);
                    loadEmployees();
                    document.getElementById("addEmployeePopup").style.display = "none";
                }
            })
            .catch(error => {
                console.error("Ошибка создания сотрудника:", error);
                alert("Ошибка на сервере.");
            });
    }
});
