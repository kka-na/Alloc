import express from 'express';
import cors from 'cors';
import budgetsRouter from './routes/budgets.js';
import categoriesRouter from './routes/categories.js';
import itemsRouter from './routes/items.js';
import shareRouter from './routes/share.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/budgets', budgetsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/items', itemsRouter);
app.use('/api/share', shareRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
