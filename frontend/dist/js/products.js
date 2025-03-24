document.addEventListener("DOMContentLoaded", () => {
    const productsCards = document.getElementById("productsCards");
    const editModeBtn = document.getElementById("editModeBtn");
    const addProductBtn = document.getElementById("addProductBtn");

    let editMode = false;
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
        console.log('Current role:', role);

        // Убираем кнопки редактирования и добавления для клиентов
        if (role === 4) {
            const editButtons = document.querySelectorAll('.editBtn');
            const addButtons = document.querySelectorAll('.addProductBtn');
            editButtons.forEach(button => button.style.display = 'none');
            addButtons.forEach(button => button.style.display = 'none');
        }
    }

    restrictAccess();

    editModeBtn.addEventListener("click", () => {
        editMode = !editMode;
        editModeBtn.classList.toggle("active", editMode);
        document.querySelectorAll(".editBtn, .deleteBtn").forEach(btn => {
            btn.style.display = editMode ? "inline-block" : "none";
        });
    });

    function loadProducts() {
        fetch("http://127.0.0.1:5000/products")
            .then(response => response.json())
            .then(data => {
                if (!Array.isArray(data)) {
                    console.error("Ошибка: Ожидался массив данных, получено:", data);
                    return;
                }
                productsCards.innerHTML = "";
                data.forEach(product => addProductCard(product));
                if (role === 4) {
                    document.querySelector('#buttonContainer').style.display = "none";
                }
            })
            .catch(error => console.error("Ошибка загрузки товаров:", error));
    }

    loadProducts();

    function addProductCard(product) {
        const card = document.createElement("div");
        card.className = "products__card products-card";
        card.setAttribute("data-id", product.id);
        card.innerHTML = `
            <h3 class="products-card__title">${product.name}</h3>
            <p class="products-card__subtitle">${product.description}</p>
            <p class="products-card__price">Цена: ${product.price} BYN</p>
            <p>Количество: ${product.stock_quantity}</p>
            <p>Категория: ${product.category_id}</p>
            <button class="editBtn btn" style="display: none;">Редактировать</button>
            <button class="deleteBtn btn" style="display: none;">Удалить</button>
        `;
        productsCards.appendChild(card);
    }

    productsCards.addEventListener("click", (event) => {
        const target = event.target;
        const card = target.closest(".products-card");
        const productId = card ? card.getAttribute("data-id") : null;

        if (target.classList.contains("editBtn") && productId) {
            openPopup(card);
        }

        if (target.classList.contains("deleteBtn") && productId) {
            if (confirm("Вы уверены, что хотите удалить этот товар?")) {
                deleteProduct(productId, card);
            }
        }
    });

    function openPopup(card) {
        if (!card) return;

        const id = card.getAttribute("data-id");
        const name = card.querySelector("h3").textContent;
        const description = card.querySelector("p:nth-child(2)").textContent;
        const price = card.querySelector("p:nth-child(3)").textContent.replace("Цена: ", "").replace(" ₽", "");
        const stock = card.querySelector("p:nth-child(4)").textContent.replace("Количество: ", "");
        const category = card.querySelector("p:nth-child(5)").textContent.replace("Категория: ", "");

        const popup = document.getElementById("popup");
        popup.style.display = "block";

        document.getElementById("editProductId").value = id;
        document.getElementById("editProductName").value = name;
        document.getElementById("editProductDescription").value = description;
        document.getElementById("editProductPrice").value = price;
        document.getElementById("editProductStock").value = stock;
        document.getElementById("editProductCategory").value = category;

        const saveEditBtn = document.getElementById("saveEditProduct");
        const cancelEditBtn = document.getElementById("cancelEditProduct");

        saveEditBtn.onclick = function () {
            const newName = document.getElementById("editProductName").value;
            const newDescription = document.getElementById("editProductDescription").value;
            const newPrice = parseFloat(document.getElementById("editProductPrice").value);
            const newStock = parseInt(document.getElementById("editProductStock").value);
            const newCategory = parseInt(document.getElementById("editProductCategory").value);

            const updatedData = {
                name: newName,
                description: newDescription,
                price: newPrice,
                stock_quantity: newStock,
                category_id: newCategory
            };

            updateProduct(id, updatedData);

            card.querySelector("h3").textContent = newName;
            card.querySelector("p:nth-child(2)").textContent = newDescription;
            card.querySelector("p:nth-child(3)").textContent = `Цена: ${newPrice} BYN`;
            card.querySelector("p:nth-child(4)").textContent = `Количество: ${newStock}`;
            card.querySelector("p:nth-child(5)").textContent = `Категория: ${newCategory}`;

            popup.style.display = "none";
        };

        cancelEditBtn.onclick = () => popup.style.display = "none";
    }

    function updateProduct(id, updatedData) {
        fetch(`http://127.0.0.1:5000/products/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedData),
        })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    console.error("Ошибка обновления товара:", data.error);
                    alert("Ошибка на сервере при обновлении товара.");
                } else {
                    console.log("Товар обновлён:", data);
                    loadProducts();
                }
            })
            .catch(error => {
                console.error("Ошибка обновления товара:", error);
                alert("Ошибка на сервере.");
            });
    }

    function deleteProduct(id, card) {
        fetch(`http://127.0.0.1:5000/products/${id}`, { method: "DELETE" })
            .then(response => response.json())
            .then(() => card.remove())
            .catch(error => console.error("Ошибка удаления товара:", error));
    }

    addProductBtn.addEventListener("click", () => {
        document.getElementById("addProductPopup").style.display = "block";
    });

    document.getElementById("cancelAddProduct").addEventListener("click", () => {
        document.getElementById("addProductPopup").style.display = "none";
    });

    document.getElementById("saveProduct").addEventListener("click", () => {
        const name = document.getElementById("newProductName").value;
        const description = document.getElementById("newProductDescription").value;
        const price = document.getElementById("newProductPrice").value;
        const stock = document.getElementById("newProductStock").value;
        const category = document.getElementById("newProductCategory").value;

        createNewProduct(name, description, price, stock, category);
    });

    function createNewProduct(name, description, price, stock, category) {
        if (!name || !description || !price || !stock || !category) {
            alert("Пожалуйста, заполните все поля.");
            return;
        }

        const productData = {
            name: name,
            description: description,
            price: parseFloat(price),
            stock_quantity: parseInt(stock),
            category_id: parseInt(category)
        };

        fetch("http://127.0.0.1:5000/products", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(productData),
        })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    console.error("Ошибка создания товара:", data.error);
                    alert("Ошибка на сервере при создании товара.");
                } else {
                    console.log("Новый товар создан:", data);
                    loadProducts();
                    document.getElementById("addProductPopup").style.display = "none";
                }
            })
            .catch(error => {
                console.error("Ошибка создания товара:", error);
                alert("Ошибка на сервере.");
            });
    }
});
