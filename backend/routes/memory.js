import express from 'express';
import {
  saveMemory,
  getAllMemories,
  searchMemories,
  deleteMemory,
  getMemoriesByUrl,
} from '../controllers/memoryController.js';

const router = express.Router();

router.post('/save', saveMemory);
router.get('/all', getAllMemories);
router.get('/search', searchMemories);
router.get('/by-url', getMemoriesByUrl);
router.delete('/:id', deleteMemory);

export default router;
