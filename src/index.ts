import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import eventRoutes from './routes/event.routes';
import bookingRoutes from './routes/booking.routes';
import { setupSwagger } from './config/swagger';
import { sendError } from './utils/responses';

dotenv.config();

const app: Application = express();
const port = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Set up Swagger
setupSwagger(app);

// Routes
app.use('/auth', authRoutes);
app.use('/events', eventRoutes);
app.use('/bookings', bookingRoutes);

// Health check endpoint
app.get('/', (req: Request, res: Response) => {
  res.send('Event Booking API is running');
});

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  sendError(res, 500, 'Something went wrong!', err.message);
});

// 404 Handler
app.use((req: Request, res: Response) => {
  sendError(res, 404, 'Route not found');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
