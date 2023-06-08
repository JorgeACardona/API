const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const port = 3000;

// Configuración de la conexión a la base de datos MongoDB
mongoose.connect('mongodb://localhost:27017/mydatabase', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Conexión exitosa a MongoDB');
}).catch((error) => {
  console.error('Error al conectar a MongoDB:', error);
});

// Definir el modelo de usuario en MongoDB
const userSchema = new mongoose.Schema({
  username: String,
  password: String
});
const User = mongoose.model('User', userSchema);

// Configuración de las rutas
app.use(express.json());

app.post('/signup', async (req, res) => {
  const { username, password } = req.body;

  // Verificar si el usuario ya existe
  const existingUser = await User.findOne({ username });
  if (existingUser) {
    return res.status(409).json({ error: 'El usuario ya existe' });
  }

  // Crear una nueva instancia de usuario
  const newUser = new User({ username, password });
  await newUser.save();

  return res.status(201).json({ message: 'Usuario creado exitosamente' });
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  // Verificar si el usuario existe
  const user = await User.findOne({ username });
  if (!user) {
    return res.status(401).json({ error: 'Credenciales inválidas' });
  }

  // Verificar la contraseña
  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    return res.status(401).json({ error: 'Credenciales inválidas' });
  }

  // Generar un token JWT
  const token = jwt.sign({ userId: user._id }, 'secretKey');

  return res.status(200).json({ token });
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});
