import { useState } from 'react';
import './SearchBar.css';

export default function SearchBar({ initialValue, onSearch }) {
  const [query, setQuery] = useState(initialValue || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Search furniture (e.g. sofa, office chair, bed)..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button type="submit">Search</button>
    </form>
  );
}
