import Slot from '../models/Slot.js';
import BookingHistory from '../models/BookingHistory.js';
import { invalidateSlotsCache } from '../middleware/cacheMiddleware.js';

// Patient books an appointment
export const bookAppointment = async (req, res) => {
  const { slotId } = req.body;

  if (!slotId) {
    return res.status(400).json({ message: 'slotId is required' });
  }

  try {
    const slot = await Slot.findById(slotId);
    if (!slot) {
      return res.status(404).json({ message: 'Slot not found' });
    }

    // Check if already booked
    const existingBooking = await BookingHistory.findOne({
      doctor: slot.doctor,
      patient: req.user._id,
      date: slot.date,
      time: slot.time,
    });

    if (existingBooking) {
      return res.status(400).json({ message: 'You already booked this slot' });
    }

    // Prevent double booking of same slot by any patient
    const anyBooking = await BookingHistory.findOne({
      doctor: slot.doctor,
      date: slot.date,
      time: slot.time,
    });

    if (anyBooking) {
      return res.status(400).json({ message: 'Slot already booked' });
    }

    const booking = await BookingHistory.create({
      doctor: slot.doctor,
      patient: req.user._id,
      date: slot.date,
      time: slot.time,
    });

    // Invalidate cache when slot is booked
    invalidateSlotsCache();

    return res.status(201).json(booking);
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
};

// Optional cancel (for cache invalidation requirement)
export const cancelAppointment = async (req, res) => {
  const { bookingId } = req.body;

  if (!bookingId) {
    return res.status(400).json({ message: 'bookingId is required' });
  }

  try {
    const booking = await BookingHistory.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Patients can cancel their own; doctors can cancel their bookings
    if (
      String(booking.patient) !== String(req.user._id) &&
      String(booking.doctor) !== String(req.user._id)
    ) {
      return res.status(403).json({ message: 'Not authorized to cancel' });
    }

    await booking.deleteOne();

    // Invalidate cache when slot is cancelled
    invalidateSlotsCache();

    return res.json({ message: 'Booking cancelled' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
};

// Doctor: view booked appointments
export const getDoctorBookings = async (req, res) => {
  try {
    const bookings = await BookingHistory.find({ doctor: req.user._id })
      .populate('patient', 'name email')
      .sort({ date: 1, time: 1 });

    return res.json(bookings);
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
};

// Patient: view own appointments
export const getPatientBookings = async (req, res) => {
  try {
    const bookings = await BookingHistory.find({ patient: req.user._id })
      .populate('doctor', 'name email')
      .sort({ date: 1, time: 1 });

    return res.json(bookings);
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
};


