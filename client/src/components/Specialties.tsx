const specialties = [
  {
    name: 'Chicken Biryani',
    price: '₹280',
    image: '/biryani.png',
    desc: 'Aromatic basmati rice layered with tender chicken pieces, saffron, and a blend of royal spices. A Mughlai masterpiece.',
  },
  {
    name: 'Chicken Tandoori',
    price: '₹320',
    image: '/tandoori.png',
    desc: 'Juicy chicken marinated in yogurt and spices, slow-roasted in our traditional clay tandoor to smoky perfection.',
  },
  {
    name: 'Chicken 65',
    price: '₹250',
    image: '/chicken65.png',
    desc: 'Crispy, fiery, and irresistible — deep-fried chicken tossed with curry leaves, chilies, and our secret spice blend.',
  },
  {
    name: 'Butter Chicken',
    price: '₹300',
    image: '/butterchicken.png',
    desc: 'Tender tandoori chicken simmered in a rich, creamy tomato-butter gravy. The ultimate comfort food.',
  },
]

export default function Specialties() {
  return (
    <section className="specialties" id="specialties">
      <div className="container">
        <div className="section-header">
          <span className="section-subtitle">Chef's Picks</span>
          <h2 className="section-title">Our Signature Specialties</h2>
          <div className="divider"></div>
          <p className="section-desc">
            The dishes that made us famous. Crafted with love, served with pride — 
            these are the flavors locals can't stop talking about.
          </p>
        </div>
      </div>

      <div className="container">
        <div className="specialties-scroll">
          {specialties.map((item, index) => (
            <div className="specialty-card" key={index}>
              <div className="specialty-image">
                <img src={item.image} alt={item.name} />
                <div className="specialty-overlay">
                  <div className="specialty-name">{item.name}</div>
                  <div className="specialty-price">{item.price}</div>
                </div>
              </div>
              <div className="specialty-body">
                <p className="specialty-desc">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
