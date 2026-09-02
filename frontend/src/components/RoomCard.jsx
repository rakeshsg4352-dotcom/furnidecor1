import './RoomCard.css';

export default function RoomCard({ room, selected, onClick }) {
  return (
    <div
      className={'room-select-card' + (selected ? ' selected' : '')}
      onClick={() => onClick(room.id)}
    >
      <img
        src={room.image_url}
        alt={room.name}
        onError={(e) => { e.target.src = 'https://via.placeholder.com/300x200?text=FurniDecor'; }}
      />
      <span>{room.name}</span>
    </div>
  );
}
