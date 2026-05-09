import express from 'express';
import cors from 'cors';
import { initDb, Order, Product } from './database.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Auth
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === 'admin') {
    res.json({ success: true, token: 'fake-jwt-token' });
  } else {
    res.status(401).json({ success: false, message: 'Credenciais inválidas' });
  }
});

// Product Routes
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.findAll();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/products/:id', async (req, res) => {
  try {
    const { price } = req.body;
    const product = await Product.findByPk(req.params.id);
    if (product) {
      product.price = price;
      await product.save();
      res.json({ success: true, product });
    } else {
      res.status(404).json({ success: false, message: 'Produto não encontrado' });
    }
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Order Routes
app.post('/api/orders', async (req, res) => {
  try {
    const { name, email, product, address, zipCode, paymentMethod, items } = req.body;
    const order = await Order.create({ 
      name, email, product, address, zipCode, paymentMethod, 
      items: typeof items === 'string' ? items : JSON.stringify(items) 
    });
    res.status(201).json({ success: true, order });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.get('/api/orders', async (req, res) => {
  try {
    const orders = await Order.findAll({ order: [['createdAt', 'DESC']] });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Goró da Mansão Backend is running.' });
});

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Initialize DB
initDb().catch(err => console.error('DB Init Error:', err));

// Export for Vercel
export default app;

// Start Server locally
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on http://0.0.0.0:${PORT}`);
  });
}
