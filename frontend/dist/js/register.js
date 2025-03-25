// Обработчик события для формы регистрации
document.getElementById('registerForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    // Считываем значения из формы
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Создаем объект с данными пользователя
    const userData = {
        username: name,
        email: email,
        password: password,
        role_id: 4 // Автоматически присваиваем роль с ID 3
    };

    try {
        // Отправляем запрос на сервер для создания пользователя
        const response = await fetch('http://localhost:5000/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        const data = await response.json();

        if (response.ok) {
            // Если регистрация успешна
            alert('Регистрация успешна!');
            window.location.href = 'login.html'; // Перенаправляем на страницу входа
        } else {
            // Если произошла ошибка на сервере
            alert('Ошибка: ' + data.error);
        }
    } catch (error) {
        // Если произошла ошибка в запросе
        console.error('Ошибка:', error);
        alert('Произошла ошибка при регистрации.');
    }
});
