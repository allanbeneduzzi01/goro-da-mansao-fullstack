import React, { useState, useEffect } from 'react';

const Navbar = ({ onBuyClick, onCartClick, cartCount }) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`navbar ${scrolled ? 'glass-panel' : ''}`}>
      <div className="container">
        <div className="logo">GORÓ DA MANSÃO</div>
        <div className="nav-links">
          <a href="#shop">Shop</a>
          <a href="#flavors">Flavors</a>
          <a href="#mansion">Mansion</a>
          <a href="#purity">Purity</a>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <div className="cart-icon-container" onClick={onCartClick}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </div>
          <button className="btn-primary label-caps" onClick={onBuyClick} style={{ padding: '0.5rem 1.5rem', fontSize: '0.75rem' }}>
            Buy Now
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
