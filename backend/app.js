const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Op } = require('sequelize');
const { getStatistics } = require('./models');
const {
    User, Message, MessageFolder, Attachment, MessageStatus
} = require('./models'); // Sequelize models import

const app = express();
app.use(cors());  // Enable CORS for all routes
app.use(bodyParser.json());  // Parse JSON body data

// Test route
app.get('/', (req, res) => {
    res.send("API is working!");
});

// LOGIN ROUTE
app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Find the user by username
        const user = await User.findOne({ where: { username } });

        if (!user) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        // Validate the password (assuming passwords are stored securely with hashing, modify accordingly)
        if (user.password !== password) {  // Ideally, use a hashed comparison here
            return res.status(401).json({ error: "Invalid credentials" });
        }

        return res.status(200).json({
            message: "Login successful",
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

// USERS ROUTES
app.get('/users', async (req, res) => {
    try {
        const users = await User.findAll();
        return res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

app.post('/users', async (req, res) => {
    try {
        const newUser = await User.create(req.body);
        return res.status(201).json({ message: "User created!" });
    } catch (error) {
        console.error('Error creating user:', error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

// REGISTER ROUTE
app.post('/register', async (req, res) => {
    try {
        const { username, password, email } = req.body;

        // Check if the user already exists
        const existingUser = await User.findOne({ where: { username } });
        if (existingUser) {
            return res.status(400).json({ error: "Username already exists" });
        }

        // Create a new user (Note: Make sure passwords are hashed before saving)
        const newUser = await User.create({
            username,
            password, // In a real app, hash the password here before saving
            email,
        });

        return res.status(201).json({ message: "User registered successfully!" });
    } catch (error) {
        console.error('Error registering user:', error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

// Получение списка сообщений
app.get('/messages', async (req, res) => {
    try {
        const messages = await Message.findAll();
        return res.json(messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

// Создание нового сообщения
app.post('/messages', async (req, res) => {
    try {
        const newMessage = await Message.create(req.body);
        return res.status(201).json(newMessage);
    } catch (error) {
        console.error('Error creating message:', error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

// Редактирование сообщения
app.put('/messages/:id', async (req, res) => {
    try {
        const messageId = req.params.id;
        const { sender_id, receiver_id, subject, body, status } = req.body;

        const message = await Message.findByPk(messageId);
        if (!message) {
            return res.status(404).json({ error: "Сообщение не найдено" });
        }

        await message.update({ sender_id, receiver_id, subject, body, status });

        return res.status(200).json(message);
    } catch (error) {
        console.error('Error updating message:', error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

// Удаление сообщения
app.delete('/messages/:id', async (req, res) => {
    try {
        const messageId = req.params.id;

        const message = await Message.findByPk(messageId);
        if (!message) {
            return res.status(404).json({ error: "Сообщение не найдено" });
        }

        await message.destroy();
        return res.status(200).json({ message: "Сообщение успешно удалено" });
    } catch (error) {
        console.error('Error deleting message:', error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

// Получение списка вложений
app.get('/attachments', async (req, res) => {
    try {
        const attachments = await Attachment.findAll();
        return res.json(attachments);
    } catch (error) {
        console.error('Error fetching attachments:', error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

// Создание нового вложения
app.post('/attachments', async (req, res) => {
    try {
        const newAttachment = await Attachment.create(req.body);
        return res.status(201).json(newAttachment);
    } catch (error) {
        console.error('Error creating attachment:', error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

// Редактирование вложения
app.put('/attachments/:id', async (req, res) => {
    try {
        const attachmentId = req.params.id;
        const { message_id, file_path, file_type } = req.body;

        const attachment = await Attachment.findByPk(attachmentId);
        if (!attachment) {
            return res.status(404).json({ error: "Вложение не найдено" });
        }

        await attachment.update({ message_id, file_path, file_type });

        return res.status(200).json(attachment);
    } catch (error) {
        console.error('Error updating attachment:', error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

// Удаление вложения
app.delete('/attachments/:id', async (req, res) => {
    try {
        const attachmentId = req.params.id;

        const attachment = await Attachment.findByPk(attachmentId);
        if (!attachment) {
            return res.status(404).json({ error: "Вложение не найдено" });
        }

        await attachment.destroy();
        return res.status(200).json({ message: "Вложение успешно удалено" });
    } catch (error) {
        console.error('Error deleting attachment:', error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

// Получение списка папок сообщений
app.get('/message_folders', async (req, res) => {
    try {
        const messageFolders = await MessageFolder.findAll();
        return res.json(messageFolders);
    } catch (error) {
        console.error('Error fetching message folders:', error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

// Создание новой папки сообщений
app.post('/message_folders', async (req, res) => {
    try {
        const newMessageFolder = await MessageFolder.create(req.body);
        return res.status(201).json(newMessageFolder);
    } catch (error) {
        console.error('Error creating message folder:', error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

// Редактирование папки сообщений
app.put('/message_folders/:id', async (req, res) => {
    try {
        const messageFolderId = req.params.id;
        const { message_id, user_id, folder } = req.body;

        const messageFolder = await MessageFolder.findByPk(messageFolderId);
        if (!messageFolder) {
            return res.status(404).json({ error: "Папка сообщений не найдена" });
        }

        await messageFolder.update({ message_id, user_id, folder });

        return res.status(200).json(messageFolder);
    } catch (error) {
        console.error('Error updating message folder:', error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

// Удаление папки сообщений
app.delete('/message_folders/:id', async (req, res) => {
    try {
        const messageFolderId = req.params.id;

        const messageFolder = await MessageFolder.findByPk(messageFolderId);
        if (!messageFolder) {
            return res.status(404).json({ error: "Папка сообщений не найдена" });
        }

        await messageFolder.destroy();
        return res.status(200).json({ message: "Папка сообщений успешно удалена" });
    } catch (error) {
        console.error('Error deleting message folder:', error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

app.get('/statistics', async (req, res) => {
    try {
        // Fetch counts and sums
        const statistics = await getStatistics();

        // Respond with statistics data
        return res.status(200).json(statistics);
    } catch (error) {
        console.error('Error while fetching statistics:', error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

// Запуск сервера
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
