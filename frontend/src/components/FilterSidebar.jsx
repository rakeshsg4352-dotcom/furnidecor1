import './FilterSidebar.css';

export default function FilterSidebar({ categories, filters, onFilterChange, onClear }) {
  return (
    <aside className="filter-sidebar">
      <div className="filter-header">
        <h3>Filters</h3>
        <button className="filter-clear" onClick={onClear}>Clear All</button>
      </div>

      <div className="filter-group">
        <h4>Category</h4>
        <select
          value={filters.category || ''}
          onChange={(e) => onFilterChange('category', e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <h4>Price Range</h4>
        <div className="filter-price-inputs">
          <input
            type="number"
            placeholder="Min"
            value={filters.minPrice || ''}
            onChange={(e) => onFilterChange('minPrice', e.target.value)}
          />
          <span>-</span>
          <input
            type="number"
            placeholder="Max"
            value={filters.maxPrice || ''}
            onChange={(e) => onFilterChange('maxPrice', e.target.value)}
          />
        </div>
      </div>

      <div className="filter-group">
        <h4>Material</h4>
        <select
          value={filters.material || ''}
          onChange={(e) => onFilterChange('material', e.target.value)}
        >
          <option value="">Any Material</option>
          <option value="Fabric">Fabric</option>
          <option value="Engineered Wood">Engineered Wood</option>
          <option value="Solid Wood">Solid Wood</option>
          <option value="Leather">Leather</option>
          <option value="Leatherette">Leatherette</option>
          <option value="Metal">Metal</option>
          <option value="Glass & Metal">Glass & Metal</option>
        </select>
      </div>
    </aside>
  );
}
