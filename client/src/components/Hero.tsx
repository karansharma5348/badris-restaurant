export default function Hero() {
  return (
    <section className="hero" id="hero">
      <div className="hero-bg">
        <img src={`${import.meta.env.BASE_URL}badripic.png`} alt="Badri's Restaurant ambiance" />
      </div>

      <div className="hero-content">
        <div className="hero-tag">
          ✦ Authentic Indian Cuisine Since Generations
        </div>

        <h1 className="hero-title">
          Experience the <span className="highlight">Finest Flavors</span> of India
        </h1>

        <p className="hero-description">
          Nestled in the heart of Chembur, Mumbai — Badri's Restaurant serves
          authentic North Indian, Mughlai, Chinese & Seafood delicacies prepared
          with love and tradition.
        </p>

        <div className="hero-buttons">
          <a href="#menu" className="btn-primary">
            🍽️ Explore Menu
          </a>
          <a href="#contact" className="btn-secondary">
            📞 Reserve a Table
          </a>
        </div>

        <div className="hero-stats">
          <div className="hero-stat">
            <div className="hero-stat-number">4.4★</div>
            <div className="hero-stat-label">Google Rating</div>
          </div>
          <div className="hero-stat">
            <div className="hero-stat-number">5000+</div>
            <div className="hero-stat-label">Happy Customers</div>
          </div>
          <div className="hero-stat">
            <div className="hero-stat-number">100+</div>
            <div className="hero-stat-label">Menu Items</div>
          </div>
          <div className="hero-stat">
            <div className="hero-stat-number">₹350</div>
            <div className="hero-stat-label">Avg. for Two</div>
          </div>
        </div>
      </div>
    </section>
  )
}
