import pool from '../config/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';

export class EventService {
  static async createEvent(name: string, date: string, capacity: number): Promise<any> {
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO events (name, date, capacity, availableSeats) VALUES (?, ?, ?, ?)',
      [name, date, capacity, capacity]
    );

    return { id: result.insertId, name, date, capacity, availableSeats: capacity };
  }

  static async getEvents(filters: { start?: string; end?: string; page?: string; limit?: string }): Promise<any> {
    let query = 'SELECT * FROM events';
    const params: any[] = [];
    const conditions: string[] = [];

    if (filters.start) {
      conditions.push('date >= ?');
      params.push(filters.start);
    }
    if (filters.end) {
      conditions.push('date <= ?');
      params.push(filters.end);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY date ASC';

    // Pagination
    const page = parseInt(filters.page || '1', 10);
    const limit = parseInt(filters.limit || '10', 10);
    const offset = (page - 1) * limit;

    query += ' LIMIT ? OFFSET ?';
    params.push(limit, offset);

    // Count query
    let countQuery = 'SELECT COUNT(*) as total FROM events';
    const countParams: any[] = [];
    if (conditions.length > 0) {
      countQuery += ' WHERE ' + conditions.join(' AND ');
      countParams.push(...params.slice(0, conditions.length));
    }

    const [rows] = await pool.query<RowDataPacket[]>(query, params);
    const [countResult] = await pool.query<RowDataPacket[]>(countQuery, countParams);
    
    return {
      events: rows,
      total: countResult[0].total,
      page,
      limit,
      totalPages: Math.ceil(countResult[0].total / limit)
    };
  }

  static async updateEvent(id: number, updates: { name?: string; date?: string; capacity?: number }): Promise<any> {
    const fields = [];
    const params = [];

    if (updates.name) {
      fields.push('name = ?');
      params.push(updates.name);
    }
    if (updates.date) {
      fields.push('date = ?');
      params.push(updates.date);
    }
    if (updates.capacity !== undefined) {
      // Note: updating capacity should ideally adjust availableSeats accordingly
      fields.push('capacity = ?');
      params.push(updates.capacity);
      
      // Keep it simple here for now or update availableSeats:
      // availableSeats = availableSeats + (newCapacity - oldCapacity)
      fields.push('availableSeats = availableSeats + (? - capacity)');
      params.push(updates.capacity);
    }

    if (fields.length === 0) return null;

    params.push(id);
    const query = `UPDATE events SET ${fields.join(', ')} WHERE id = ?`;

    const [result] = await pool.query<ResultSetHeader>(query, params);

    if (result.affectedRows === 0) {
      throw new Error('Event not found');
    }

    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM events WHERE id = ?', [id]);
    return rows[0];
  }

  static async deleteEvent(id: number): Promise<void> {
    const [result] = await pool.query<ResultSetHeader>('DELETE FROM events WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      throw new Error('Event not found');
    }
  }

  static async getEventById(id: number): Promise<any> {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM events WHERE id = ?', [id]);
    if (rows.length === 0) {
      throw new Error('Event not found');
    }
    return rows[0];
  }
}
