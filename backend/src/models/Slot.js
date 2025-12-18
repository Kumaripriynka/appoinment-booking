import mongoose from 'mongoose';

const slotSchema = new mongoose.Schema({
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
});

const Slot = mongoose.model('Slot', slotSchema);

export default Slot;


