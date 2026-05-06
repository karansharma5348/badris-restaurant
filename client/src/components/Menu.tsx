import { useState } from 'react'

type Category = 'all' | 'starters' | 'biryani' | 'mains' | 'chinese' | 'seafood' | 'veg'

interface MenuItem {
  id: number
  name: string
  price: string
  category: Category
  desc: string
  image: string
  badge?: string
  isVeg?: boolean
  tags: string[]
}

const menuItems: MenuItem[] = [
  {
    id: 1,
    name: 'Chicken 65',
    price: '₹250',
    category: 'starters',
    desc: 'Crispy deep-fried chicken bites tossed with curry leaves, green chilies, and aromatic spices.',
    image: `${import.meta.env.BASE_URL}chicken65.png`,
    badge: 'Bestseller',
    tags: ['Spicy', 'Crispy'],
  },
  {
    id: 2,
    name: 'Chicken Tandoori',
    price: '₹320',
    category: 'starters',
    desc: 'Half chicken marinated overnight in yogurt-spice blend, roasted in clay tandoor until smoky perfection.',
    image: `${import.meta.env.BASE_URL}tandoori.png`,
    badge: 'Popular',
    tags: ['Smoky', 'Tandoor'],
  },
  {
    id: 3,
    name: 'Chicken Lollipop',
    price: '₹230',
    category: 'starters',
    desc: 'Frenched drumettes with a crispy spiced coating, served with tangy schezwan sauce.',
    image: `${import.meta.env.BASE_URL}chicken65.png`,
    tags: ['Crunchy', 'Party Snack'],
  },
  {
    id: 4,
    name: 'Chicken Biryani',
    price: '₹280',
    category: 'biryani',
    desc: 'Fragrant basmati rice layered with spiced chicken, saffron threads, and fried onions. Served with raita.',
    image: `${import.meta.env.BASE_URL}biryani.png`,
    badge: 'Signature',
    tags: ['Aromatic', 'Royal'],
  },
  {
    id: 5,
    name: 'Mutton Biryani',
    price: '₹350',
    category: 'biryani',
    desc: 'Slow-cooked tender mutton pieces with aromatic basmati rice, infused with whole spices and herbs.',
    image: `${import.meta.env.BASE_URL}biryani.png`,
    tags: ['Premium', 'Slow Cooked'],
  },
  {
    id: 6,
    name: 'Veg Biryani',
    price: '₹200',
    category: 'biryani',
    desc: 'Mixed seasonal vegetables with fragrant rice, garnished with fried onions and fresh herbs.',
    image: `${import.meta.env.BASE_URL}biryani.png`,
    isVeg: true,
    tags: ['Vegetarian', 'Aromatic'],
  },
  {
    id: 7,
    name: 'Butter Chicken',
    price: '₹300',
    category: 'mains',
    desc: 'Tender tandoori chicken in a velvety tomato-butter gravy with a touch of cream and kasuri methi.',
    image: `${import.meta.env.BASE_URL}butterchicken.png`,
    badge: 'Must Try',
    tags: ['Creamy', 'Rich'],
  },
  {
    id: 8,
    name: 'Chicken Tikka Masala',
    price: '₹290',
    category: 'mains',
    desc: 'Grilled chicken tikka pieces simmered in a thick, spiced onion-tomato gravy.',
    image: `${import.meta.env.BASE_URL}butterchicken.png`,
    tags: ['Spiced', 'Gravy'],
  },
  {
    id: 9,
    name: 'Mutton Rogan Josh',
    price: '₹380',
    category: 'mains',
    desc: 'Kashmiri-style slow-cooked mutton in a rich, aromatic red gravy with warm spices.',
    image: `${import.meta.env.BASE_URL}butterchicken.png`,
    tags: ['Kashmiri', 'Premium'],
  },
  {
    id: 10,
    name: 'Chicken Fried Rice',
    price: '₹200',
    category: 'chinese',
    desc: 'Wok-tossed basmati rice with chicken, fresh vegetables, soy sauce, and aromatic spices.',
    image: `${import.meta.env.BASE_URL}biryani.png`,
    tags: ['Indo-Chinese', 'Quick'],
  },
  {
    id: 11,
    name: 'Chicken Hakka Noodles',
    price: '₹220',
    category: 'chinese',
    desc: 'Stir-fried noodles with tender chicken strips, crunchy vegetables, and flavorful sauces.',
    image: `${import.meta.env.BASE_URL}chicken65.png`,
    tags: ['Stir-Fried', 'Popular'],
  },
  {
    id: 12,
    name: 'Chilli Chicken',
    price: '₹260',
    category: 'chinese',
    desc: 'Crispy chicken tossed in a spicy, tangy sauce with bell peppers, onions, and green chilies.',
    image: `${import.meta.env.BASE_URL}chicken65.png`,
    badge: 'Hot Seller',
    tags: ['Spicy', 'Indo-Chinese'],
  },
  {
    id: 13,
    name: 'Fish Fry',
    price: '₹300',
    category: 'seafood',
    desc: 'Fresh Bombay Duck or Surmai fillets marinated in local spices and shallow fried until golden crispy.',
    image: `${import.meta.env.BASE_URL}tandoori.png`,
    tags: ['Fresh Catch', 'Crispy'],
  },
  {
    id: 14,
    name: 'Prawn Curry',
    price: '₹350',
    category: 'seafood',
    desc: 'Juicy prawns cooked in a rich coconut-based curry with Malvani spices and fresh green herbs.',
    image: `${import.meta.env.BASE_URL}butterchicken.png`,
    tags: ['Coastal', 'Coconut'],
  },
  {
    id: 15,
    name: 'Paneer Butter Masala',
    price: '₹240',
    category: 'veg',
    desc: 'Soft paneer cubes in a rich, creamy tomato gravy with aromatic spices and a hint of sweetness.',
    image: `${import.meta.env.BASE_URL}butterchicken.png`,
    isVeg: true,
    badge: 'Veg Favourite',
    tags: ['Creamy', 'Rich'],
  },
  {
    id: 16,
    name: 'Dal Tadka',
    price: '₹160',
    category: 'veg',
    desc: 'Yellow lentils tempered with ghee, cumin, garlic, and dried red chilies. Comfort food at its best.',
    image: `${import.meta.env.BASE_URL}butterchicken.png`,
    isVeg: true,
    tags: ['Comfort', 'Healthy'],
  },
]

const categories = [
  { key: 'all' as Category, label: 'All Items' },
  { key: 'starters' as Category, label: 'Starters' },
  { key: 'biryani' as Category, label: 'Biryani' },
  { key: 'mains' as Category, label: 'Main Course' },
  { key: 'chinese' as Category, label: 'Chinese' },
  { key: 'seafood' as Category, label: 'Seafood' },
  { key: 'veg' as Category, label: 'Vegetarian' },
]

export default function Menu() {
  const [activeCategory, setActiveCategory] = useState<Category>('all')

  const filteredItems = activeCategory === 'all'
    ? menuItems
    : menuItems.filter(item => item.category === activeCategory)

  return (
    <section className="menu" id="menu">
      <div className="container">
        <div className="section-header">
          <span className="section-subtitle">Delicious Offerings</span>
          <h2 className="section-title">Our Menu</h2>
          <div className="divider"></div>
          <p className="section-desc">
            From sizzling starters to aromatic biryanis and rich gravies — 
            explore our diverse menu crafted for every palate.
          </p>
        </div>

        <div className="menu-categories">
          {categories.map(cat => (
            <button
              key={cat.key}
              className={`menu-cat-btn ${activeCategory === cat.key ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat.key)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="menu-grid">
          {filteredItems.map(item => (
            <div className="menu-card" key={item.id}>
              <div className="menu-card-image">
                <img src={item.image} alt={item.name} />
                {item.badge && (
                  <span className={`menu-card-badge ${item.isVeg ? 'veg' : ''}`}>
                    {item.badge}
                  </span>
                )}
              </div>
              <div className="menu-card-body">
                <div className="menu-card-header">
                  <h3 className="menu-card-title">{item.name}</h3>
                  <span className="menu-card-price">{item.price}</span>
                </div>
                <p className="menu-card-desc">{item.desc}</p>
                <div className="menu-card-tags">
                  {item.tags.map((tag, i) => (
                    <span className="menu-card-tag" key={i}>{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
