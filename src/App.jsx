import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import heroBottle from './assets/hero-bottle.png';
import lifestyleImg from './assets/lifestyle.png';
import lineupImg from './assets/lineup.png';

function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAdminView, setIsAdminView] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminToken, setAdminToken] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('http://localhost:3002/api/products');
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error('Erro ao carregar produtos:', err);
    }
  };

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { ...product, qty: 1 }];
    });
    setIsCartOpen(true);
  };

  const updateQty = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(0, item.qty + delta);
        return newQty === 0 ? null : { ...item, qty: newQty };
      }
      return item;
    }).filter(Boolean));
  };

  const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0).toFixed(2);
  const cartCount = cart.reduce((acc, item) => acc + item.qty, 0);

  const handleCheckout = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      address: formData.get('address'),
      zipCode: formData.get('zipCode'),
      paymentMethod: formData.get('paymentMethod'),
      product: cart.map(item => `${item.qty}x ${item.name}`).join(', '),
      items: cart
    };
    try {
      const response = await fetch('http://localhost:3002/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (response.ok) {
        alert('Pedido realizado com sucesso! Verifique seu e-mail.');
        setCart([]);
        setIsModalOpen(false);
        setIsCartOpen(false);
      }
    } catch (err) {
      alert('Erro ao processar pedido.');
    }
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const username = formData.get('username');
    const password = formData.get('password');
    
    try {
      const res = await fetch('http://localhost:3002/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (data.success) {
        setIsAdminLoggedIn(true);
        setAdminToken(data.token);
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert('Erro ao conectar ao servidor');
    }
  };

  const updateProductPrice = async (id, newPrice) => {
    try {
      const res = await fetch(`http://localhost:3002/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ price: parseFloat(newPrice) })
      });
      if (res.ok) {
        fetchProducts();
      }
    } catch (err) {
      alert('Erro ao atualizar preço');
    }
  };

  if (isAdminView) {
    return (
      <div className="admin-page" style={{ background: '#000', minHeight: '100vh', color: '#fff', padding: '4rem' }}>
        <button className="label-caps" onClick={() => setIsAdminView(false)} style={{ color: 'var(--color-lime)', marginBottom: '2rem' }}>← Voltar para o Site</button>
        
        {!isAdminLoggedIn ? (
          <div className="login-form" style={{ maxWidth: '400px', margin: '100px auto', background: 'var(--color-surface)', padding: '3rem', border: '1px solid var(--color-lime)' }}>
            <h2 className="heading-serif" style={{ marginBottom: '2rem' }}>Painel <span className="text-gradient-lime">Admin</span></h2>
            <form onSubmit={handleAdminLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label>Usuário</label>
                <input name="username" type="text" placeholder="admin" required style={{ padding: '1rem', background: '#1c1b1b', border: '1px solid #444', color: '#fff' }} />
              </div>
              <div className="form-group">
                <label>Senha</label>
                <input name="password" type="password" placeholder="admin" required style={{ padding: '1rem', background: '#1c1b1b', border: '1px solid #444', color: '#fff' }} />
              </div>
              <button type="submit" className="btn-primary">Entrar</button>
            </form>
          </div>
        ) : (
          <div className="dashboard">
            <h2 className="heading-serif" style={{ marginBottom: '3rem' }}>Gestão de <span className="text-gradient-lime">Preços</span></h2>
            <div className="admin-grid" style={{ display: 'grid', gap: '1rem' }}>
              {products.map(p => (
                <div key={p.id} style={{ background: 'var(--color-surface)', padding: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--glass-border)' }}>
                  <div>
                    <h3 className="heading-serif">{p.name}</h3>
                    <p style={{ color: 'var(--color-text-dim)' }}>ID: {p.id}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span className="label-caps">R$</span>
                    <input 
                      type="number" 
                      defaultValue={p.price} 
                      step="0.01"
                      onBlur={(e) => updateProductPrice(p.id, e.target.value)}
                      style={{ width: '120px', padding: '0.8rem', background: '#1c1b1b', border: '1px solid var(--color-lime)', color: '#fff', fontSize: '1.2rem', fontWeight: '700' }} 
                    />
                  </div>
                </div>
              ))}
            </div>
            <button className="btn-secondary" style={{ marginTop: '3rem' }} onClick={() => setIsAdminLoggedIn(false)}>Sair</button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="app">
      <Navbar 
        onBuyClick={() => document.getElementById('shop').scrollIntoView({ behavior: 'smooth' })} 
        onCartClick={() => setIsCartOpen(true)}
        cartCount={cartCount}
      />
      
      {/* Hero Section */}
      <section className="hero" style={{ paddingTop: '160px', minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>
          <div className="hero-content">
            <span className="label-caps" style={{ color: 'var(--color-berry)', marginBottom: '1rem', display: 'block' }}>Exclusive Release</span>
            <h1 style={{ fontSize: 'clamp(3rem, 8vw, 5.5rem)', marginBottom: '2rem' }}>
              A Pureza do <br />
              <span className="text-gradient-lime">Caos.</span>
            </h1>
            <p style={{ fontSize: '1.25rem', color: 'var(--color-text-dim)', maxWidth: '500px', marginBottom: '2.5rem' }}>
              Energia limpa para quem vive a intensidade. 0% Taurina. 0% Cafeína. 100% Mansão.
            </p>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <button className="btn-primary" onClick={() => document.getElementById('shop').scrollIntoView({ behavior: 'smooth' })}>Buy Now</button>
              <button className="btn-secondary">The Science</button>
            </div>
          </div>
          <div className="hero-image">
            <img src={heroBottle} alt="Goró" style={{ width: '100%', height: 'auto' }} />
          </div>
        </div>
      </section>

      {/* Shop Section */}
      <section className="shop" id="shop">
        <div className="container">
          <div style={{ textAlign: 'center' }}>
            <span className="label-caps" style={{ color: 'var(--color-lime)' }}>Choose your vibe</span>
            <h2 style={{ fontSize: '3.5rem', marginTop: '1rem' }}>GORÓ Product Line</h2>
          </div>
          
          <div className="shop-grid">
            {products.map((p) => (
              <div key={p.id} className="product-card">
                <div>
                  <div className="product-image-container">
                    <div style={{ position: 'absolute', width: '200px', height: '200px', background: p.color, filter: 'blur(100px)', opacity: '0.2' }}></div>
                    <img src={lineupImg} alt={p.name} />
                  </div>
                  <h3>{p.name}</h3>
                  <p className="product-size">{p.size}</p>
                  <p className="product-desc">{p.desc}</p>
                </div>
                <div>
                  <div className="product-price-container">
                    <span className="current-price">R$ {p.price.toFixed(2).replace('.', ',')}</span>
                    <span className="original-price">R$ {p.original}</span>
                  </div>
                  <button className="btn-add" onClick={() => addToCart(p)}>Adicionar</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cart Drawer */}
      <div className={`cart-drawer ${isCartOpen ? 'open' : ''}`}>
        <div className="cart-header">
          <h2 className="heading-serif">Seu <span className="text-gradient-lime">Carrinho</span></h2>
          <span className="close-modal" style={{ position: 'static' }} onClick={() => setIsCartOpen(false)}>✕</span>
        </div>
        
        <div className="cart-items">
          {cart.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--color-text-dim)', marginTop: '4rem' }}>Seu carrinho está vazio.</p>
          ) : (
            cart.map(item => (
              <div key={item.id} className="cart-item">
                <img src={lineupImg} alt={item.name} />
                <div className="cart-item-info">
                  <h4>{item.name}</h4>
                  <p>R$ {item.price.toFixed(2).replace('.', ',')}</p>
                  <div className="quantity-controls">
                    <button className="qty-btn" onClick={() => updateQty(item.id, -1)}>-</button>
                    <span style={{ minWidth: '20px', textAlign: 'center' }}>{item.qty}</span>
                    <button className="qty-btn" onClick={() => updateQty(item.id, 1)}>+</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="cart-footer">
            <div className="cart-total">
              <span>Total</span>
              <span className="text-gradient-lime">R$ {cartTotal.replace('.', ',')}</span>
            </div>
            <button className="btn-primary" style={{ width: '100%' }} onClick={() => { setIsCartOpen(false); setIsModalOpen(true); }}>
              Finalizar Compra
            </button>
          </div>
        )}
      </div>

      {/* Checkout Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <span className="close-modal" onClick={() => setIsModalOpen(false)}>✕</span>
            <h2 style={{ marginBottom: '2rem' }}>Finalizar <span className="text-gradient-lime">Compra</span></h2>
            
            <div style={{ marginBottom: '2rem', padding: '1.5rem', background: 'rgba(255,255,255,0.05)', maxHeight: '200px', overflowY: 'auto' }}>
              <p className="label-caps" style={{ color: 'var(--color-lime)', marginBottom: '1rem' }}>Itens no Pedido</p>
              {cart.map(item => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                  <span>{item.qty}x {item.name}</span>
                  <span style={{ fontWeight: '700' }}>R$ {(item.price * item.qty).toFixed(2).replace('.', ',')}</span>
                </div>
              ))}
              <div style={{ borderTop: '1px solid #444', marginTop: '1rem', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', fontWeight: '700' }}>
                <span>TOTAL</span>
                <span className="text-gradient-lime">R$ {cartTotal.replace('.', ',')}</span>
              </div>
            </div>

            <form onSubmit={handleCheckout} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label>Nome Completo</label>
                <input name="name" type="text" placeholder="Seu Nome Completo" required style={{ padding: '1rem', background: '#1c1b1b', border: '1px solid #444', color: '#fff' }} />
              </div>
              <div className="form-group">
                <label>E-mail</label>
                <input name="email" type="email" placeholder="E-mail para entrega" required style={{ padding: '1rem', background: '#1c1b1b', border: '1px solid #444', color: '#fff' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Endereço</label>
                  <input name="address" type="text" placeholder="Rua, Número, Bairro" required style={{ padding: '1rem', background: '#1c1b1b', border: '1px solid #444', color: '#fff' }} />
                </div>
                <div className="form-group">
                  <label>CEP</label>
                  <input name="zipCode" type="text" placeholder="00000-000" required style={{ padding: '1rem', background: '#1c1b1b', border: '1px solid #444', color: '#fff' }} />
                </div>
              </div>
              <div className="form-group">
                <label>Forma de Pagamento</label>
                <select name="paymentMethod" required>
                  <option value="">Selecione...</option>
                  <option value="PIX">PIX</option>
                  <option value="Cartão">Cartão</option>
                </select>
              </div>
              <button type="submit" className="btn-primary" style={{ marginTop: '1rem' }}>Confirmar Pedido</button>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer style={{ padding: '4rem 0', borderTop: '1px solid var(--glass-border)' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div className="logo" style={{ marginBottom: '1rem' }}>GORÓ DA MANSÃO</div>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-dim)' }}>© 2024 Goró da Mansão. Sabor da Festa.</p>
          </div>
          <div style={{ display: 'flex', gap: '3rem', alignItems: 'center' }}>
            <a href="#" className="label-caps">Privacy</a>
            <a href="#" className="label-caps">Terms</a>
            <button className="label-caps" onClick={() => setIsAdminView(true)} style={{ color: 'var(--color-text-dim)', fontSize: '0.6rem' }}>Admin</button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
