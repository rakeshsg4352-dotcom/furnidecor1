import { Link } from 'react-router-dom';
import './CategoryCard.css';

export default function CategoryCard({ category }) {
  return (
    <Link to={'/furniture?category=' + category.id} className="category-card">
      <img
        src={category.image_url}
        alt={category.name}
        onError={(e) => { e.target.src = 'https://via.placeholder.com/300x300?text=FurniDecor'; }}
      />
      <div className="category-card-overlay">
        <span>{category.name}</span>
      </div>
    </Link>
  );
}
