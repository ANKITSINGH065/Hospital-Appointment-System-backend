const express = require('express');
const jwt = require('jsonwebtoken');
const Appointment = require('../models/Appointment');
const User = require('../models/User');

const router = express.Router();

// Middleware to verify token
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(403).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1]; // Split the Bearer prefix from the token
  if (!token) {
    return res.status(403).json({ message: 'No token provided' });
  }

  jwt.verify(token, 'secretKey', (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    req.userId = decoded.id;
    req.userRole = decoded.role;
    next();
  });
};

// Book an Appointment
router.post('/book', verifyToken, async (req, res) => {
  const { doctorId, date } = req.body;

  if (!doctorId || !date) {
    return res.status(400).json({ message: 'Doctor ID and date are required' });
  }

  try {
    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    const newAppointment = new Appointment({
      doctor: doctorId,
      patient: req.userId,
      date,
    });

    console.log(newAppointment);

    await newAppointment.save();
    res.status(201).json({ message: 'Appointment booked successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Cancel an Appointment
router.delete('/cancel/:id', verifyToken, async (req, res) => {
  const appointmentId = req.params.id;

  try {
    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (appointment.patient.toString() !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized action' });
    }

    appointment.status = 'cancelled';
    await appointment.save();

    res.status(200).json({ message: 'Appointment cancelled' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get All Appointments
router.get('/', verifyToken, async (req, res) => {
  try {
    let appointments;
    if (req.userRole === 'doctor') {
      appointments = await Appointment.find({ doctor: req.userId }).populate('patient', 'username');
    } else {
      appointments = await Appointment.find({ patient: req.userId }).populate('doctor', 'username');
    }

    res.status(200).json(appointments);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;