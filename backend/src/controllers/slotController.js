import Slot from '../models/Slot.js';
import BookingHistory from '../models/BookingHistory.js';
import { setCachedSlots, invalidateSlotsCache } from '../middleware/cacheMiddleware.js';

// Doctor creates availability slot
export const createSlot = async (req, res) => {
  const { date, time } = req.body;

  if (!date || !time) {
    return res.status(400).json({ message: 'Date and time are required' });
  }

  try {
    // Prevent creating duplicate slots for same doctor/date/time
    const existing = await Slot.findOne({ doctor: req.user._id, date, time });
    if (existing) {
      return res.status(400).json({ message: 'Slot already exists' });
    }

    const slot = await Slot.create({
      doctor: req.user._id,
      date,
      time,
    });

    // Invalidate cache when slot is created
    invalidateSlotsCache();

    return res.status(201).json(slot);
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
};

// Get available slots (cached)
export const getAvailableSlots = async (req, res) => {
  const doctorId = req.query.doctorId;
  const filter = {};
  if (doctorId) {
    filter.doctor = doctorId;
  }

  try {
    // Filter out slots that are already booked based on BookingHistory
    const slots = await Slot.find(filter).populate('doctor', 'name email');

    const booked = await BookingHistory.find({
      doctor: doctorId ? doctorId : { $in: slots.map((s) => s.doctor) },
    });

    const bookedSet = new Set(booked.map((b) => `${b.doctor}_${b.date}_${b.time}`));

    const available = slots.filter(
      (s) => !bookedSet.has(`${s.doctor}_${s.date}_${s.time}`)
    );

    if (req.cacheKey) {
      setCachedSlots(req.cacheKey, available);
    }

    return res.json(available);
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
};


