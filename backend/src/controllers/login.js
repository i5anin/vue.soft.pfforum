require('dotenv').config(); // Убедитесь, что это в самом начале вашего файла
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const dbConfig = require('../config').dbConfig;

// Создаем экземпляр pool используя конфигурацию из вашего файла config
const pool = new Pool(dbConfig);

// Функция для проверки пользователя и возвращения JWT
exports.validateUser = async (req, res) => {
  const { login, password } = req.body;

  try {
    // Запрос к базе данных для поиска пользователя по логину
    const query = 'SELECT * FROM "dbo"."login" WHERE login = $1';
    const user = await pool.query(query, [login]);

    // Логирование для отладки
    console.log('User found:', user.rows[0]);
    console.log('Submitted password:', password);

    // Проверка, найден ли пользователь
    if (user.rows.length > 0) {
      // Сравнение введенного пароля с хешированным паролем из базы данных
      const isValid = await bcrypt.compare(password, user.rows[0].password_hash || user.rows[0].password);
      console.log('Password valid:', isValid);

      if (isValid) {
        // Создание JWT, если пароль совпадает
        const token = jwt.sign(
          { id: user.rows[0].id, access: user.rows[0].access },
          process.env.SECRET_KEY, // Используйте переменную окружения или запасной ключ
          { expiresIn: '1h' }
        );
        // Возвращение токена клиенту
        res.json({ token });
      } else {
        // Если пароль не совпадает, отправка ошибки
        res.status(401).send('Invalid credentials');
      }
    } else {
      // Если пользователь не найден, отправка ошибки
      res.status(401).send('User not found');
    }
  } catch (err) {
    // Логирование ошибки сервера
    console.error('Error during user validation:', err.message);
    // Отправка сообщения об ошибке сервера
    res.status(500).send('Internal Server Error');
  }
};
