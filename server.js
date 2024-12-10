const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const cardRoutes = require('./routes/cards');

const app = express();

// Middleware
app.use(bodyParser.json());
// app.use(cors());
app.use(
  cors({
      origin: "*",
      // origin: "https://fun-kids.netlify.app", // Укажите URL вашего фронтенда
      methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
      credentials: true,
  })
);
// MongoDB Atlas Connection
mongoose.connect(
    'mongodb+srv://bttarasenko:highsummary@cluster0.t5wmt.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0',
    
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }
).then(() => console.log('Connected to MongoDB Atlas'))
  .catch((err) => console.error('Error connecting to MongoDB:', err));

// Routes
app.use('/api/words', cardRoutes);
const proxyRoute = require('./routes/proxy');
app.use('/api', proxyRoute);
const imagesRoute = require('./routes/images');
app.use('/api', imagesRoute);


const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
