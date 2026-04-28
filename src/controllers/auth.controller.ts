import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { sendSuccess, sendError } from '../utils/responses';

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const { name, email, password } = req.body;
      if (!name || !email || !password) {
        return sendError(res, 400, 'Name, email, and password are required');
      }

      const user = await AuthService.registerUser(name, email, password);
      // Removed return statement here, using response immediately
      sendSuccess(res, 201, 'User registered successfully', user);
    } catch (error: any) {
      if (error.message === 'Email is already registered') {
        sendError(res, 409, error.message);
      } else {
        sendError(res, 500, 'Internal server error', error.message);
      }
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return sendError(res, 400, 'Email and password are required');
      }

      const result = await AuthService.loginUser(email, password);
      sendSuccess(res, 200, 'Login successful', result);
    } catch (error: any) {
      if (error.message === 'Invalid email or password') {
        sendError(res, 401, error.message);
      } else {
        sendError(res, 500, 'Internal server error', error.message);
      }
    }
  }
}
