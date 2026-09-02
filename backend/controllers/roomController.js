const pool = require('../config/db');
const { asyncHandler } = require('../middleware/errorMiddleware');

const getRooms = asyncHandler(async (req, res) => {
  const [rooms] = await pool.query('SELECT * FROM rooms ORDER BY name ASC');
  res.json(rooms);
});

const getRoomById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const [rooms] = await pool.query('SELECT * FROM rooms WHERE id = ?', [id]);
  if (rooms.length === 0) {
    res.status(404);
    throw new Error('Room not found.');
  }
  res.json(rooms[0]);
});

const getRoomRecommendations = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const [room] = await pool.query('SELECT * FROM rooms WHERE id = ?', [id]);
  if (room.length === 0) {
    res.status(404);
    throw new Error('Room not found.');
  }

  const sql = 'SELECT rr.id AS recommendation_id, rr.priority, p.* ' +
    'FROM room_recommendations rr ' +
    'JOIN products p ON rr.product_id = p.id ' +
    "WHERE rr.room_id = ? AND p.status = 'ACTIVE' " +
    'ORDER BY rr.priority ASC';

  const [recommendations] = await pool.query(sql, [id]);

  res.json({ room: room[0], recommendations });
});

const createRoom = asyncHandler(async (req, res) => {
  const { name, description, image_url } = req.body;
  if (!name) {
    res.status(400);
    throw new Error('Room name is required.');
  }
  const [result] = await pool.query(
    'INSERT INTO rooms (name, description, image_url) VALUES (?, ?, ?)',
    [name, description || null, image_url || null]
  );
  res.status(201).json({ id: result.insertId, message: 'Room created successfully.' });
});

const updateRoom = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, description, image_url } = req.body;

  const [existing] = await pool.query('SELECT id FROM rooms WHERE id = ?', [id]);
  if (existing.length === 0) {
    res.status(404);
    throw new Error('Room not found.');
  }

  const sql = 'UPDATE rooms SET ' +
    'name = COALESCE(?, name), ' +
    'description = COALESCE(?, description), ' +
    'image_url = COALESCE(?, image_url) ' +
    'WHERE id = ?';

  await pool.query(sql, [name, description, image_url, id]);

  res.json({ message: 'Room updated successfully.' });
});

const deleteRoom = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const [existing] = await pool.query('SELECT id FROM rooms WHERE id = ?', [id]);
  if (existing.length === 0) {
    res.status(404);
    throw new Error('Room not found.');
  }
  await pool.query('DELETE FROM rooms WHERE id = ?', [id]);
  res.json({ message: 'Room deleted successfully.' });
});

const addRoomRecommendation = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { product_id, priority } = req.body;

  if (!product_id) {
    res.status(400);
    throw new Error('product_id is required.');
  }

  const [result] = await pool.query(
    'INSERT INTO room_recommendations (room_id, product_id, priority) VALUES (?, ?, ?)',
    [id, product_id, priority || 0]
  );

  res.status(201).json({ id: result.insertId, message: 'Recommendation added successfully.' });
});

const deleteRoomRecommendation = asyncHandler(async (req, res) => {
  const { recId } = req.params;
  await pool.query('DELETE FROM room_recommendations WHERE id = ?', [recId]);
  res.json({ message: 'Recommendation removed successfully.' });
});

module.exports = {
  getRooms,
  getRoomById,
  getRoomRecommendations,
  createRoom,
  updateRoom,
  deleteRoom,
  addRoomRecommendation,
  deleteRoomRecommendation
};
