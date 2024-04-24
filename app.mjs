// src/app.mjs
import express from 'express';
import apiRoutes from './src/routes/api.mjs';

const app = express();
const PORT = process.env.PORT || 3000; // Use the port from environment variable or default to 3000

app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.send('Welcome to True Authenticate');
});

app.use('/api', apiRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;