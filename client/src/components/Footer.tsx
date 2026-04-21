export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="footer" id="footer">
      <div className="footer-grid">
        <div className="footer-brand">
          <div className="footer-brand-name">
            Badri<span>'s</span> Restaurant
          </div>
          <p>
            Authentic North Indian, Mughlai, Chinese & Seafood cuisine in the 
            heart of Chembur, Mumbai. Serving delicious food with love since 
            generations.
          </p>
          <div className="footer-social">
            <a href="#" aria-label="Facebook">📘</a>
            <a href="#" aria-label="Instagram">📷</a>
            <a href="#" aria-label="WhatsApp">💬</a>
            <a href="#" aria-label="Google Maps">📍</a>
          </div>
        </div>

        <div className="footer-col">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="#about">About Us</a></li>
            <li><a href="#menu">Full Menu</a></li>
            <li><a href="#specialties">Specialties</a></li>
            <li><a href="#reviews">Reviews</a></li>
            <li><a href="#contact">Reservations</a></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Cuisines</h4>
          <ul>
            <li><a href="#menu">North Indian</a></li>
            <li><a href="#menu">Mughlai</a></li>
            <li><a href="#menu">Chinese</a></li>
            <li><a href="#menu">Seafood</a></li>
            <li><a href="#menu">Vegetarian</a></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Contact Info</h4>
          <ul>
            <li><a href="#">📍 Chembur, Mumbai</a></li>
            <li><a href="#">🕐 12 PM – 1 AM Daily</a></li>
            <li><a href="#">📱 Available on Swiggy</a></li>
            <li><a href="#">📱 Available on Zomato</a></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {currentYear} Badri's Restaurant, Chembur. All rights reserved.</p>
        <div className="footer-bottom-links">
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
        </div>
      </div>
    </footer>
  )
}
