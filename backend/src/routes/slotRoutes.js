import express from 'express';
import { createSlot, getAvailableSlots } from '../controllers/slotController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';
import { getCachedSlots } from '../middleware/cacheMiddleware.js';

const router = express.Router();

// Doctor-only: create slots
router.post('/', protect, authorizeRoles('doctor'), createSlot);

// Protected: view available slots (cached) for any authenticated user
router.get('/available', protect, getCachedSlots, getAvailableSlots);

export default router;


