import { Request, Response } from 'express';
import { BookingService } from '../services/booking.service';
import { sendSuccess, sendError } from '../utils/responses';
import { AuthRequest } from '../middlewares/auth.middleware';
import { Parser } from 'json2csv';

export class BookingController {
  static async book(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const { eventId, tickets } = req.body;

      if (!userId) {
        return sendError(res, 401, 'Unauthorized');
      }

      if (!eventId) {
        return sendError(res, 400, 'Event ID is required');
      }

      const booking = await BookingService.bookEvent(userId, eventId, tickets || 1);
      sendSuccess(res, 201, 'Tickets booked successfully', booking);
    } catch (error: any) {
      if (error.message === 'Event not found' || error.message === 'Not enough available seats') {
        sendError(res, 400, error.message);
      } else {
        sendError(res, 500, 'Internal server error', error.message);
      }
    }
  }

  static async exportCSV(req: Request, res: Response) {
    try {
      const bookings = await BookingService.getAllBookingsForExport();

      if (bookings.length === 0) {
         // Fix TypeScript warning by returning the response
         return res.status(404).send('No bookings available to export');
      }

      const fields = ['Booking_ID', 'User_Name', 'User_Email', 'Event_Name', 'Event_Date', 'Tickets', 'Booked_At'];
      const json2csvParser = new Parser({ fields });
      const csv = json2csvParser.parse(bookings);

      res.header('Content-Type', 'text/csv');
      res.attachment('bookings.csv');
      return res.send(csv);
    } catch (error: any) {
      sendError(res, 500, 'Internal server error while exporting CSV', error.message);
    }
  }
}
