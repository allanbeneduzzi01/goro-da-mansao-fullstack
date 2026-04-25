import { Sequelize, DataTypes } from 'sequelize';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, 'database.sqlite'),
  logging: false
});

const Order = sequelize.define('Order', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: true
    }
  },
  product: {
    type: DataTypes.STRING,
    allowNull: true
  },
  items: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  address: {

    type: DataTypes.STRING,
    allowNull: true
  },
  zipCode: {
    type: DataTypes.STRING,
    allowNull: true
  },
  paymentMethod: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'pending'
  }
});

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  size: {
    type: DataTypes.STRING
  },
  desc: {
    type: DataTypes.TEXT
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  original: {
    type: DataTypes.STRING
  },
  color: {
    type: DataTypes.STRING
  }
});

const initDb = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
    
    // Seed initial products if empty
    const count = await Product.count();
    if (count === 0) {
      await Product.bulkCreate([
        {
          id: 'neon-pump',
          name: 'NEON PUMP',
          size: '260ml',
          desc: 'Explosão cítrica eletrizante para máxima performance e foco total.',
          price: 18.90,
          original: '22,00',
          color: 'var(--color-lime)'
        },
        {
          id: 'midnight-vibe',
          name: 'MIDNIGHT VIBE',
          size: '500ml',
          desc: 'O sabor intenso das frutas roxas para dominar a noite com estilo.',
          price: 28.90,
          original: '32,00',
          color: 'var(--color-berry)'
        },
        {
          id: 'solar-peak',
          name: 'SOLAR PEAK',
          size: '900ml',
          desc: 'Energia tropical inspirada no nascer do sol para renovar seus sentidos.',
          price: 35.90,
          original: '44,00',
          color: '#FFB800'
        }
      ]);
      console.log('Initial products seeded.');
    }
    
    console.log('Database connected and synchronized.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

export { sequelize, Order, Product, initDb };


