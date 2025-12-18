import mongoose from 'mongoose';

const bookingHistorySchema = new mongoose.Schema({
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
});

const BookingHistory = mongoose.model('BookingHistory', bookingHistorySchema);

export default BookingHistory;


