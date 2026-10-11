import './App.css';

function App() {
  return (
    <div className="app">
      <nav className="navbar">
        <div className="nav-brand">🚗 Auto Pro</div>
        <div className="nav-links">
          <a href="#services">Services</a>
          <a href="#emergency">Emergency</a>
          <a href="#parts">Spare Parts</a>
          <a href="#cars">Used Cars</a>
          <a href="#contact">Contact</a>
        </div>
      </nav>
      <header className="hero">
        <h1>Professional Automotive Services</h1>
        <p>Car Service • Emergency Assistance • Spare Parts • Used Cars</p>
        <div className="hero-buttons">
          <button className="btn-primary">Book a Service</button>
          <button className="btn-secondary">Emergency Help</button>
        </div>
      </header>
      <main className="main-content">
        <section className="features">
          <div className="feature-card">
            <h3>🔧 Car Service</h3>
            <p>Professional car servicing at your doorstep</p>
          </div>
          <div className="feature-card">
            <h3>🆘 Emergency Assistance</h3>
            <p>24/7 roadside assistance when you need it</p>
          </div>
          <div className="feature-card">
            <h3>🛒 Spare Parts</h3>
            <p>Genuine spare parts delivered to you</p>
          </div>
          <div className="feature-card">
            <h3>🚙 Used Cars</h3>
            <p>Inspected and certified pre-owned vehicles</p>
          </div>
        </section>
      </main>
      <footer className="footer">
        <p>© 2026 Auto Pro. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
