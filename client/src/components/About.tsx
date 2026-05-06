export default function About() {
  return (
    <section className="about" id="about">
      <div className="container">
        <div className="about-grid">
          <div className="about-image-wrapper">
            <div className="about-image">
              <img src={`${import.meta.env.BASE_URL}butterchicken.png`} alt="Badri's Restaurant signature dish" />
            </div>
            <div className="about-image-accent"></div>
          </div>

          <div className="about-content">
            <span className="section-subtitle">Our Story</span>
            <h2 className="section-title" style={{ textAlign: 'left' }}>
              A Legacy of Taste & Tradition
            </h2>
            <p className="section-desc">
              Badri's Restaurant has been a beloved destination in Chembur, Mumbai 
              for years. Known for generous portions, incredible value, and 
              flavors that keep you coming back — we take pride in serving 
              authentic North Indian, Mughlai, Chinese, and Seafood cuisine 
              prepared with the freshest ingredients and traditional recipes passed 
              down through generations.
            </p>
            <p className="section-desc">
              Whether it's our signature Chicken Biryani, the perfectly spiced 
              Tandoori platters, or our aromatic gravies — every dish at Badri's 
              tells a story of passion, flavor, and warmth. We're not just a 
              restaurant, we're a family tradition.
            </p>

            <div className="about-features">
              <div className="about-feature">
                <div className="about-feature-icon">🔥</div>
                <div>
                  <h4>Fresh Ingredients</h4>
                  <p>Handpicked daily for the best quality</p>
                </div>
              </div>
              <div className="about-feature">
                <div className="about-feature-icon">👨‍🍳</div>
                <div>
                  <h4>Expert Chefs</h4>
                  <p>Masters of traditional Indian cooking</p>
                </div>
              </div>
              <div className="about-feature">
                <div className="about-feature-icon">💰</div>
                <div>
                  <h4>Value for Money</h4>
                  <p>Premium taste at budget-friendly prices</p>
                </div>
              </div>
              <div className="about-feature">
                <div className="about-feature-icon">🏠</div>
                <div>
                  <h4>Home Delivery</h4>
                  <p>Enjoy Badri's at your doorstep</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
