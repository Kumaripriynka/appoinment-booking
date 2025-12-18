// Simple in-memory cache for available slots
// Keyed by doctor id or 'all'
const cacheStore = new Map();

export const getCachedSlots = (req, res, next) => {
  const doctorId = req.query.doctorId || 'all';
  const cacheKey = `slots_${doctorId}`;

  if (cacheStore.has(cacheKey)) {
    const data = cacheStore.get(cacheKey);
    return res.json(data);
  }

  req.cacheKey = cacheKey;
  next();
};

export const setCachedSlots = (key, data) => {
  cacheStore.set(key, data);
};

export const invalidateSlotsCache = () => {
  cacheStore.clear();
};


