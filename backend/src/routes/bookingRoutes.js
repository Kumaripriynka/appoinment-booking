import express from 'express';
import {
  bookAppointment,
  cancelAppointment,
  getDoctorBookings,
  getPatientBookings,
} from '../controllers/bookingController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';
import { bookingRateLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Patient-only: book appointment
router.post('/', protect, authorizeRoles('patient'), bookingRateLimiter, bookAppointment);

// Cancel appointment (doctor or patient involved in booking)
router.post('/cancel', protect, cancelAppointment);

// Doctor: view booked appointments
router.get('/doctor', protect, authorizeRoles('doctor'), getDoctorBookings);

// Patient: view own appointments
router.get('/patient', protect, authorizeRoles('patient'), getPatientBookings);

export default router;


