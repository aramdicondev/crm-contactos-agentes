const express = require('express');
const path = require('path');
const contactosRouter = require('./routes/contactos');

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/contactos', contactosRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`CRM Contactos escuchando en el puerto ${PORT}`);
});

module.exports = app;
