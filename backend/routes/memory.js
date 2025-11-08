import express from 'express';
import {
  saveMemory,
  getAllMemories,
  searchMemories,
  deleteMemory,
} from '../controllers/memoryController.js';

const router = express.Router();

router.post('/save', saveMemory);
router.get('/all', getAllMemories);
router.get('/search', searchMemories);
router.delete('/:id', deleteMemory);

export default router;
