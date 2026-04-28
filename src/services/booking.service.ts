import pool from '../config/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';

export class BookingService {
  static async bookEvent(userId: number, eventId: number, tickets: number = 1): Promise<any> {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // Lock the row for update to prevent race conditions during concurrent bookings
      const [eventRows] = await connection.query<RowDataPacket[]>(
        'SELECT id, availableSeats FROM events WHERE id = ? FOR UPDATE',
        [eventId]
      );

      if (eventRows.length === 0) {
        throw new Error('Event not found');
      }

      const event = eventRows[0];

      if (event.availableSeats < tickets) {
        throw new Error('Not enough available seats');
      }

      // Proceed with booking
      const [insertResult] = await connection.query<ResultSetHeader>(
        'INSERT INTO bookings (user_id, event_id, tickets_booked) VALUES (?, ?, ?)',
        [userId, eventId, tickets]
      );

      // Decrement available capacity
      await connection.query(
        'UPDATE events SET availableSeats = availableSeats - ? WHERE id = ?',
        [tickets, eventId]
      );

      await connection.commit();

      return {
        bookingId: insertResult.insertId,
        userId,
        eventId,
        tickets
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async getAllBookingsForExport(): Promise<any[]> {
    const [rows] = await pool.query<RowDataPacket[]>(`
      SELECT 
        b.id as Booking_ID, 
        u.name as User_Name, 
        u.email as User_Email,
        e.name as Event_Name, 
        e.date as Event_Date,
        b.tickets_booked as Tickets,
        b.created_at as Booked_At
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN events e ON b.event_id = e.id
      ORDER BY b.created_at DESC
    `);
    
    return rows;
  }
}
