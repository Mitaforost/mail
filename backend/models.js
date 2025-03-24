const { Sequelize, DataTypes } = require('sequelize');
const config = require('./config');

// Инициализация sequelize
const sequelize = new Sequelize({
    dialect: config.dialect,
    host: config.host,
    username: config.username,
    password: config.password,
    database: config.database,
    logging: config.logging
});

// Определение моделей
const User = sequelize.define('User', {
    username: { type: DataTypes.STRING(50), unique: true, allowNull: false },
    password: { type: DataTypes.STRING(255), allowNull: false },
    email: { type: DataTypes.STRING(100), unique: true, allowNull: false },
    created_at: { type: DataTypes.DATE, defaultValue: Sequelize.NOW },
}, { tableName: 'users', timestamps: false });

const Message = sequelize.define('Message', {
    sender_id: { type: DataTypes.INTEGER, allowNull: false },
    receiver_id: { type: DataTypes.INTEGER, allowNull: false },
    subject: { type: DataTypes.STRING(255) },
    body: { type: DataTypes.TEXT, allowNull: false },
    status: { type: DataTypes.STRING(20), defaultValue: 'не просмотрено' },
    sent_at: { type: DataTypes.DATE, defaultValue: Sequelize.NOW },
}, { tableName: 'messages', timestamps: false });

const MessageFolder = sequelize.define('MessageFolder', {
    message_id: { type: DataTypes.INTEGER, allowNull: false },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    folder: { type: DataTypes.STRING(20), allowNull: false, validate: { isIn: [['входящие', 'отправленные', 'черновики', 'корзина', 'избранные']] } }
}, { tableName: 'message_folders', timestamps: false });

const Attachment = sequelize.define('Attachment', {
    message_id: { type: DataTypes.INTEGER, allowNull: false },
    file_path: { type: DataTypes.STRING(255), allowNull: false },
    file_type: { type: DataTypes.STRING(50) },
    uploaded_at: { type: DataTypes.DATE, defaultValue: Sequelize.NOW },
}, { tableName: 'attachments', timestamps: false });

const MessageStatus = sequelize.define('MessageStatus', {
    message_id: { type: DataTypes.INTEGER, allowNull: false },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    is_read: { type: DataTypes.BOOLEAN, defaultValue: false },
    is_deleted: { type: DataTypes.BOOLEAN, defaultValue: false },
}, { tableName: 'message_status', timestamps: false });

User.hasMany(Message, { foreignKey: 'sender_id', onDelete: 'CASCADE' });
User.hasMany(Message, { foreignKey: 'receiver_id', onDelete: 'CASCADE' });

Message.hasMany(MessageFolder, { foreignKey: 'message_id', onDelete: 'CASCADE' });
MessageFolder.belongsTo(Message, { foreignKey: 'message_id', onDelete: 'CASCADE' });

Message.hasMany(Attachment, { foreignKey: 'message_id', onDelete: 'CASCADE' });
Attachment.belongsTo(Message, { foreignKey: 'message_id', onDelete: 'CASCADE' });

Message.hasMany(MessageStatus, { foreignKey: 'message_id', onDelete: 'CASCADE' });
MessageStatus.belongsTo(Message, { foreignKey: 'message_id', onDelete: 'CASCADE' });

MessageFolder.belongsTo(User, { foreignKey: 'user_id', onDelete: 'CASCADE' });
MessageStatus.belongsTo(User, { foreignKey: 'user_id', onDelete: 'CASCADE' });

async function getStatistics() {
    try {
        const [userCount, messageCount, attachmentCount] = await Promise.all([
            User.count(),
            Message.count(),
            Attachment.count()
        ]);

        return {
            userCount,
            messageCount,
            attachmentCount
        };
    } catch (error) {
        console.error('Error while fetching statistics:', error);
        throw error;
    }
}

module.exports = {
    sequelize,
    User,
    Message,
    MessageFolder,
    Attachment,
    MessageStatus,
    getStatistics,
};
