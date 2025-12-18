import React, { useState, useEffect } from 'react';
import { apiRequest } from './api.js';

const STORAGE_KEY = 'appointment_auth';

const Login = ({ onAuth }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isRegister) {
        const res = await apiRequest('/auth/register', 'POST', { name, email, password });
        onAuth(res.token, res.user);
      } else {
        const res = await apiRequest('/auth/login', 'POST', { email, password });
        onAuth(res.token, res.user);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white/95 shadow-xl rounded-2xl p-8 border border-slate-100 backdrop-blur">
      <div className="mb-6 text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-blue-500 font-semibold">
          Appointment Booking
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-900">
          {isRegister ? 'Create Patient Account' : 'Welcome Back'}
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          {isRegister
            ? 'Register as a patient to book appointments quickly.'
            : 'Login as doctor or patient to manage appointments.'}
        </p>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        {isRegister && (
          <input
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        )}
        <input
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <div className="text-red-600 text-xs bg-red-50 border border-red-100 rounded px-2 py-1">
          {error}
        </div>}
        <button type="submit" disabled={loading}>
          {loading ? 'Please wait...' : isRegister ? 'Register (Patient)' : 'Login'}
        </button>
      </form>
      <button
        className="mt-4 w-full bg-slate-100 text-slate-800 hover:bg-slate-200"
        type="button"
        onClick={() => {
          setIsRegister((v) => !v);
          setError('');
        }}
      >
        {isRegister ? 'Already have an account? Login' : 'New patient? Register'}
      </button>
      <p className="mt-4 text-xs text-slate-500 text-center">
        Doctors are added by the system and log in with their email and password.
      </p>
    </div>
  );
};

const DoctorDashboard = ({ token, user, onLogout }) => {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [creating, setCreating] = useState(false);
  const [slots, setSlots] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState('');

  const loadSlots = async () => {
    try {
      setError('');
      const data = await apiRequest(`/slots/available?doctorId=${user.id}`, 'GET', null, token);
      setSlots(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const loadBookings = async () => {
    try {
      setError('');
      const data = await apiRequest('/bookings/doctor', 'GET', null, token);
      setBookings(data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadSlots();
    loadBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreateSlot = async (e) => {
    e.preventDefault();
    setCreating(true);
    setError('');
    try {
      await apiRequest('/slots', 'POST', { date, time }, token);
      setDate('');
      setTime('');
      await loadSlots();
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto mt-4 space-y-6">
      <header className="flex items-center justify-between bg-white shadow-sm rounded-xl px-6 py-4 border border-slate-100">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Doctor Dashboard</h2>
          <div className="text-sm text-slate-600 flex items-center gap-2 mt-1">
            <span>{user.name}</span>
            <span className="text-slate-400">•</span>
            <span>{user.email}</span>
            <span className="ml-2 inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 border border-blue-100">
              Doctor
            </span>
          </div>
        </div>
        <button onClick={onLogout}>Logout</button>
      </header>

      {error && (
        <div className="text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-2 text-sm">
          {error}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <section className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-800">Create Availability Slot</h3>
          </div>
          <form
            onSubmit={handleCreateSlot}
            className="flex flex-col sm:flex-row sm:items-center gap-3 mt-2"
          >
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="flex-1"
            />
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
              className="flex-1"
            />
            <button type="submit" disabled={creating} className="w-full sm:w-auto">
              {creating ? 'Creating...' : 'Create Slot'}
            </button>
          </form>

          <div className="mt-5">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Upcoming Slots
              </h4>
              <button
                type="button"
                onClick={loadSlots}
                className="bg-slate-100 text-slate-800 hover:bg-slate-200 px-2 py-1 text-xs"
              >
                Refresh
              </button>
            </div>
            {slots.length === 0 ? (
              <div className="text-xs text-slate-500">No available slots yet.</div>
            ) : (
              <ul className="divide-y divide-slate-100 text-sm">
                {slots.map((s) => (
                  <li key={s._id} className="py-2 flex items-center justify-between">
                    <span className="font-medium text-slate-800">
                      {s.date}{' '}
                      <span className="text-slate-500 font-normal">{s.time}</span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <section className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-slate-800">Booked Appointments</h3>
            <button
              type="button"
              onClick={loadBookings}
              className="bg-slate-100 text-slate-800 hover:bg-slate-200 px-2 py-1 text-xs"
            >
              Refresh
            </button>
          </div>
          {bookings.length === 0 ? (
            <div className="text-xs text-slate-500">No bookings yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wide text-slate-500 border-b border-slate-100">
                    <th className="py-2 pr-4">Date</th>
                    <th className="py-2 pr-4">Time</th>
                    <th className="py-2">Patient</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => (
                    <tr key={b._id} className="border-b border-slate-50">
                      <td className="py-2 pr-4">{b.date}</td>
                      <td className="py-2 pr-4">{b.time}</td>
                      <td className="py-2">
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-800">
                            {b.patient?.name}
                          </span>
                          <span className="text-xs text-slate-500">
                            {b.patient?.email}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

const PatientDashboard = ({ token, user, onLogout }) => {
  const [slots, setSlots] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [bookingId, setBookingId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadSlots = async () => {
    try {
      setError('');
      const data = await apiRequest('/slots/available', 'GET', null, token);
      setSlots(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const loadBookings = async () => {
    try {
      setError('');
      const data = await apiRequest('/bookings/patient', 'GET', null, token);
      setBookings(data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadSlots();
    loadBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleBook = async (slotId) => {
    setLoading(true);
    setError('');
    try {
      await apiRequest('/bookings', 'POST', { slotId }, token);
      await loadSlots();
      await loadBookings();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (e) => {
    e.preventDefault();
    if (!bookingId) return;
    setLoading(true);
    setError('');
    try {
      await apiRequest('/bookings/cancel', 'POST', { bookingId }, token);
      setBookingId('');
      await loadSlots();
      await loadBookings();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto mt-4 space-y-6">
      <header className="flex items-center justify-between bg-white shadow-sm rounded-xl px-6 py-4 border border-slate-100">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Patient Dashboard</h2>
          <div className="text-sm text-slate-600 flex items-center gap-2 mt-1">
            <span>{user.name}</span>
            <span className="text-slate-400">•</span>
            <span>{user.email}</span>
            <span className="ml-2 inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 border border-emerald-100">
              Patient
            </span>
          </div>
        </div>
        <button onClick={onLogout}>Logout</button>
      </header>

      {error && (
        <div className="text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-2 text-sm">
          {error}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <section className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-slate-800">Available Slots</h3>
            <button
              type="button"
              onClick={loadSlots}
              className="bg-slate-100 text-slate-800 hover:bg-slate-200 px-2 py-1 text-xs"
            >
              Refresh
            </button>
          </div>
          {slots.length === 0 ? (
            <div className="text-xs text-slate-500">No available slots.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wide text-slate-500 border-b border-slate-100">
                    <th className="py-2 pr-4">Date</th>
                    <th className="py-2 pr-4">Time</th>
                    <th className="py-2 pr-4">Doctor</th>
                    <th className="py-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {slots.map((s) => (
                    <tr key={s._id} className="border-b border-slate-50">
                      <td className="py-2 pr-4">{s.date}</td>
                      <td className="py-2 pr-4">{s.time}</td>
                      <td className="py-2 pr-4">{s.doctor?.name}</td>
                      <td className="py-2">
                        <button
                          disabled={loading}
                          onClick={() => handleBook(s._id)}
                          className="text-xs px-3 py-1"
                        >
                          Book
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-slate-800">Your Appointments</h3>
            <button
              type="button"
              onClick={loadBookings}
              className="bg-slate-100 text-slate-800 hover:bg-slate-200 px-2 py-1 text-xs"
            >
              Refresh
            </button>
          </div>
          {bookings.length === 0 ? (
            <div className="text-xs text-slate-500">No appointments yet.</div>
          ) : (
            <>
              <div className="overflow-x-auto mb-3">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-wide text-slate-500 border-b border-slate-100">
                      <th className="py-2 pr-4">Date</th>
                      <th className="py-2 pr-4">Time</th>
                      <th className="py-2">Doctor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((b) => (
                      <tr key={b._id} className="border-b border-slate-50">
                        <td className="py-2 pr-4">{b.date}</td>
                        <td className="py-2 pr-4">{b.time}</td>
                        <td className="py-2">
                          <div className="flex flex-col">
                            <span className="font-medium text-slate-800">
                              {b.doctor?.name}
                            </span>
                            <span className="text-xs text-slate-500">
                              {b.doctor?.email}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <form onSubmit={handleCancel} className="mt-2 flex flex-col sm:flex-row gap-2 items-center">
                <input
                  placeholder="Booking ID to cancel"
                  value={bookingId}
                  onChange={(e) => setBookingId(e.target.value)}
                  className="w-full sm:flex-1"
                />
                <button type="submit" disabled={loading || !bookingId} className="w-full sm:w-auto bg-rose-600 hover:bg-rose-700">
                  Cancel Booking
                </button>
              </form>
            </>
          )}
        </section>
      </div>
    </div>
  );
};

const App = () => {
  const [token, setToken] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setToken(parsed.token);
        setUser(parsed.user);
      } catch {
        // ignore
      }
    }
  }, []);

  const handleAuth = (jwtToken, authUser) => {
    setToken(jwtToken);
    setUser(authUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ token: jwtToken, user: authUser }));
  };

  const handleLogout = () => {
    setToken('');
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  if (!token || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
        <Login onAuth={handleAuth} />
      </div>
    );
  }

  if (user.role === 'doctor') {
    return (
      <div className="min-h-screen bg-slate-100 py-8 px-4">
        <DoctorDashboard token={token} user={user} onLogout={handleLogout} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4">
      <PatientDashboard token={token} user={user} onLogout={handleLogout} />
    </div>
  );
};

export default App;


