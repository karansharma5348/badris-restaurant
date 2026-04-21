const testimonials = [
  {
    id: 1,
    text: "The best biryani I've ever had in Chembur! The portions are huge and the flavors are absolutely authentic. Badri's has been our family's go-to place for years. Value for money is unbeatable!",
    name: 'Rahul Sharma',
    initials: 'RS',
    role: 'Regular Customer',
    stars: 5,
  },
  {
    id: 2,
    text: "Ordered the Chicken Tandoori and Butter Chicken — both were outstanding! The tandoor flavors are smoky and rich. Staff is friendly and the food arrives fast. Highly recommend!",
    name: 'Priya Desai',
    initials: 'PD',
    role: 'Food Blogger',
    stars: 5,
  },
  {
    id: 3,
    text: "Chicken 65 here is legendary! Crispy, spicy, and absolutely addictive. Perfect for a quick snack or a full meal with their fried rice combo. Best casual dining in the area!",
    name: 'Amit Patel',
    initials: 'AP',
    role: 'Local Foodie',
    stars: 4,
  },
  {
    id: 4,
    text: "We order from Badri's at least twice a week. The consistency in taste is remarkable. Their home delivery is quick and food always arrives hot. The Mutton Biryani is to die for!",
    name: 'Sneha Kulkarni',
    initials: 'SK',
    role: 'Loyal Customer',
    stars: 5,
  },
  {
    id: 5,
    text: "Hands down the best value-for-money restaurant in Chembur. The Chicken Lollipop and Hakka Noodles are a perfect combo. Great place for family dinners without burning a hole in your pocket.",
    name: 'Mohammed Iqbal',
    initials: 'MI',
    role: 'Regular Diner',
    stars: 4,
  },
  {
    id: 6,
    text: "I've tried many restaurants but Badri's has a special charm. The Rogan Josh reminded me of authentic Kashmiri cooking. Love the ambiance and the generous portions. Keep it up!",
    name: 'Kavita Menon',
    initials: 'KM',
    role: 'Food Enthusiast',
    stars: 5,
  },
]

export default function Testimonials() {
  return (
    <section className="testimonials" id="reviews">
      <div className="container">
        <div className="section-header">
          <span className="section-subtitle">What People Say</span>
          <h2 className="section-title">Customer Reviews</h2>
          <div className="divider"></div>
          <p className="section-desc">
            Don't just take our word for it — here's what our beloved customers 
            have to say about their Badri's experience.
          </p>
        </div>

        <div className="testimonials-grid">
          {testimonials.slice(0, 3).map(t => (
            <div className="testimonial-card" key={t.id}>
              <div className="testimonial-quote">"</div>
              <p className="testimonial-text">{t.text}</p>
              <div className="testimonial-stars">
                {'★'.repeat(t.stars)}{'☆'.repeat(5 - t.stars)}
              </div>
              <div className="testimonial-author" style={{ marginTop: '12px' }}>
                <div className="testimonial-avatar">{t.initials}</div>
                <div>
                  <div className="testimonial-name">{t.name}</div>
                  <div className="testimonial-role">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
