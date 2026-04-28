import { Router } from 'express';
import { BookingController } from '../controllers/booking.controller';
import { authenticateJWT, requireAdmin } from '../middlewares/auth.middleware';
import { bookingLimiter } from '../middlewares/rateLimiter';

const router = Router();

/**
 * @swagger
 * /bookings:
 *   post:
 *     summary: Book tickets for an event
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - eventId
 *             properties:
 *               eventId:
 *                 type: integer
 *               tickets:
 *                 type: integer
 *                 default: 1
 *     responses:
 *       201:
 *         description: Tickets booked successfully
 *       400:
 *         description: Bad Request (e.g. not enough seats)
 *       401:
 *         description: Unauthorized
 */
router.post('/', authenticateJWT, bookingLimiter, BookingController.book);

/**
 * @swagger
 * /bookings/export:
 *   get:
 *     summary: Export all bookings as a CSV file
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A CSV file of all bookings
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/export', authenticateJWT, requireAdmin, BookingController.exportCSV);

export default router;
