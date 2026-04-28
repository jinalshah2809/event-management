import { Request, Response } from 'express';
import { EventService } from '../services/event.service';
import { sendSuccess, sendError } from '../utils/responses';

export class EventController {
  static async create(req: Request, res: Response) {
    try {
      const { name, date, capacity } = req.body;
      if (!name || !date || !capacity) {
        return sendError(res, 400, 'Name, date, and capacity are required');
      }

      const event = await EventService.createEvent(name, date, capacity);
      sendSuccess(res, 201, 'Event created successfully', event);
    } catch (error: any) {
      sendError(res, 500, 'Internal server error', error.message);
    }
  }

  static async getAll(req: Request, res: Response) {
    try {
      const { start, end, page, limit } = req.query;
      const result = await EventService.getEvents({
        start: start as string,
        end: end as string,
        page: page as string,
        limit: limit as string
      });

      sendSuccess(res, 200, 'Events retrieved successfully', result);
    } catch (error: any) {
      sendError(res, 500, 'Internal server error', error.message);
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return sendError(res, 400, 'Invalid event ID');
      }

      const event = await EventService.updateEvent(id, req.body);
      if (!event) {
        return sendError(res, 400, 'No updates provided');
      }

      sendSuccess(res, 200, 'Event updated successfully', event);
    } catch (error: any) {
      if (error.message === 'Event not found') {
        sendError(res, 404, error.message);
      } else {
        sendError(res, 500, 'Internal server error', error.message);
      }
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return sendError(res, 400, 'Invalid event ID');
      }

      await EventService.deleteEvent(id);
      sendSuccess(res, 200, 'Event deleted successfully');
    } catch (error: any) {
      if (error.message === 'Event not found') {
        sendError(res, 404, error.message);
      } else {
        sendError(res, 500, 'Internal server error', error.message);
      }
    }
  }
}
