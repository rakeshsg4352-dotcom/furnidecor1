const express = require('express');
const router = express.Router();

const {
  getRooms,
  getRoomById,
  getRoomRecommendations,
  createRoom,
  updateRoom,
  deleteRoom,
  addRoomRecommendation,
  deleteRoomRecommendation
} = require('../controllers/roomController');

const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');

router.get('/', getRooms);
router.get('/:id', getRoomById);
router.get('/:id/recommendations', getRoomRecommendations);

router.post('/', protect, admin, createRoom);
router.put('/:id', protect, admin, updateRoom);
router.delete('/:id', protect, admin, deleteRoom);
router.post('/:id/recommendations', protect, admin, addRoomRecommendation);
router.delete('/recommendations/:recId', protect, admin, deleteRoomRecommendation);

module.exports = router;
