import { Router } from 'express';
import * as bookingController from '../controllers/bookingController.js';

const router = Router();

router.get('/', bookingController.getAllBookings);
router.get('/room-date', bookingController.getBookingsByRoomAndDate);
router.get('/:id', bookingController.getBookingById);
router.post('/check', bookingController.checkAvailability);
router.post('/', bookingController.createBooking);
router.delete('/:id', bookingController.deleteBooking);

export default router;
