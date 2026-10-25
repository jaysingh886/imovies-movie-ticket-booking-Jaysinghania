import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_imovies_jwt_token_key_2026!';
const PORT = Number(process.env.PORT) || 3000;

export interface User {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  createdAt: string;
}

export interface Cinema {
  _id: string;
  name: string;
  city: string;
  address: string;
  totalHalls: number;
}

export interface Movie {
  _id: string;
  title: string;
  description: string;
  genres: string[];
  language: string;
  duration: number; // in minutes
  rating: number;
  posterUrl: string;
  backdropUrl: string;
  status: 'now-showing' | 'coming-soon';
  releaseDate: string;
  cast: string[];
  director: string;
}

export interface Show {
  _id: string;
  movie: string; // Movie _id
  cinema: string; // Cinema _id
  showDateTime: string;
  ticketPrice: number;
  hallNumber: number;
  bookedSeats: string[];
}

export interface Booking {
  _id: string;
  bookingReference: string;
  user: string; // User _id
  show: string; // Show _id
  seats: string[];
  totalAmount: number;
  paymentMode: string;
  paymentStatus: 'COMPLETED' | 'FAILED' | 'PENDING';
  bookingStatus: 'CONFIRMED' | 'CANCELLED';
  createdAt: string;
}

// In-Memory Database store with initial seed data
class DatabaseStore {
  users: User[] = [];
  cinemas: Cinema[] = [];
  movies: Movie[] = [];
  shows: Show[] = [];
  bookings: Booking[] = [];

  constructor() {
    this.seed();
  }

  private seed() {
    // Passwords
    const adminHash = bcrypt.hashSync('admin123', 10);
    const userHash = bcrypt.hashSync('user123', 10);

    this.users = [
      {
        _id: 'usr_admin',
        name: 'System Admin',
        email: 'admin@imovies.com',
        password: adminHash,
        role: 'admin',
        createdAt: new Date().toISOString()
      },
      {
        _id: 'usr_regular',
        name: 'John Doe',
        email: 'john@example.com',
        password: userHash,
        role: 'user',
        createdAt: new Date().toISOString()
      }
    ];

    this.cinemas = [
      {
        _id: 'cin_1',
        name: 'IMovies PVR IMAX',
        city: 'Metropolis',
        address: 'Forum Mall, Central Avenue',
        totalHalls: 4
      },
      {
        _id: 'cin_2',
        name: 'IMovies Cinepolis Gold',
        city: 'Metropolis',
        address: '4th Floor, Nexus Galleria',
        totalHalls: 3
      },
      {
        _id: 'cin_3',
        name: 'IMovies INOX Luxe',
        city: 'Metropolis',
        address: 'Downtown City Center, Level 5',
        totalHalls: 5
      }
    ];

    this.movies = [
      {
        _id: 'mov_1',
        title: 'Interstellar: Echoes',
        description: 'A dedicated team of deep-space astrophysicists voyage beyond an uncharted gravitational anomaly in a desperate mission to preserve civilization.',
        genres: ['Sci-Fi', 'Adventure', 'Drama'],
        language: 'English',
        duration: 165,
        rating: 9.1,
        posterUrl: '/src/assets/images/poster_interstellar_echoes_1792938365498.jpg',
        backdropUrl: '/src/assets/images/hero_cinema_interstellar_1792938367222.jpg',
        status: 'now-showing',
        releaseDate: '2024-05-10',
        director: 'Christopher Nolan',
        cast: ['Matthew McConaughey', 'Anne Hathaway', 'Jessica Chastain']
      },
      {
        _id: 'mov_2',
        title: 'Cyberpunk Odyssey',
        description: 'In a rain-drenched neon megacity, an insurgent data courier risks his synthesized identity after uncovering a corporate consciousness conspiracy.',
        genres: ['Action', 'Sci-Fi'],
        language: 'English',
        duration: 140,
        rating: 8.7,
        posterUrl: '/src/assets/images/poster_cyberpunk_odyssey_1792938366634.jpg',
        backdropUrl: '/src/assets/images/poster_cyberpunk_odyssey_1792938366634.jpg',
        status: 'now-showing',
        releaseDate: '2024-06-01',
        director: 'Denis Villeneuve',
        cast: ['Keanu Reeves', 'Ana de Armas', 'Hiroyuki Sanada']
      },
      {
        _id: 'mov_3',
        title: 'The Silent Mirage',
        description: 'An evocative psychological journey into the heart of ancient sands where long-buried forgotten truths resurface before twilight fades.',
        genres: ['Mystery', 'Thriller'],
        language: 'French',
        duration: 118,
        rating: 8.3,
        posterUrl: '/src/assets/images/poster_silent_mirage_1792938366924.jpg',
        backdropUrl: '/src/assets/images/poster_silent_mirage_1792938366924.jpg',
        status: 'now-showing',
        releaseDate: '2024-04-15',
        director: 'Jean-Luc Moreau',
        cast: ['Vincent Cassel', 'Marion Cotillard', 'Tahar Rahim']
      },
      {
        _id: 'mov_4',
        title: 'Quantum Realm: Incursion',
        description: 'Multiverse boundaries fragment as warriors traverse parallel dimensions to avert the annihilation of quantum spacetime.',
        genres: ['Action', 'Fantasy'],
        language: 'English',
        duration: 152,
        rating: 8.9,
        posterUrl: '/src/assets/images/poster_quantum_realm_1792938368646.jpg',
        backdropUrl: '/src/assets/images/poster_quantum_realm_1792938368646.jpg',
        status: 'coming-soon',
        releaseDate: '2024-12-20',
        director: 'Sam Raimi',
        cast: ['Benedict Cumberbatch', 'Elizabeth Olsen', 'Pedro Pascal']
      }
    ];

    const now = Date.now();
    this.shows = [
      {
        _id: 'show_1',
        movie: 'mov_1',
        cinema: 'cin_1',
        showDateTime: new Date(now + 1000 * 60 * 60 * 3).toISOString(), // in 3 hours
        ticketPrice: 280,
        hallNumber: 1,
        bookedSeats: ['B3', 'B4', 'C4']
      },
      {
        _id: 'show_2',
        movie: 'mov_1',
        cinema: 'cin_2',
        showDateTime: new Date(now + 1000 * 60 * 60 * 7).toISOString(), // in 7 hours
        ticketPrice: 320,
        hallNumber: 2,
        bookedSeats: ['A1', 'A2']
      },
      {
        _id: 'show_3',
        movie: 'mov_1',
        cinema: 'cin_3',
        showDateTime: new Date(now + 1000 * 60 * 60 * 24).toISOString(), // tomorrow
        ticketPrice: 290,
        hallNumber: 3,
        bookedSeats: []
      },
      {
        _id: 'show_4',
        movie: 'mov_2',
        cinema: 'cin_1',
        showDateTime: new Date(now + 1000 * 60 * 60 * 5).toISOString(),
        ticketPrice: 260,
        hallNumber: 3,
        bookedSeats: ['C5', 'C6', 'C7']
      },
      {
        _id: 'show_5',
        movie: 'mov_2',
        cinema: 'cin_3',
        showDateTime: new Date(now + 1000 * 60 * 60 * 9).toISOString(),
        ticketPrice: 275,
        hallNumber: 1,
        bookedSeats: ['D2', 'D3']
      },
      {
        _id: 'show_6',
        movie: 'mov_3',
        cinema: 'cin_2',
        showDateTime: new Date(now + 1000 * 60 * 60 * 6).toISOString(),
        ticketPrice: 240,
        hallNumber: 2,
        bookedSeats: ['E4']
      },
      {
        _id: 'show_7',
        movie: 'mov_4',
        cinema: 'cin_1',
        showDateTime: new Date(now + 1000 * 60 * 60 * 48).toISOString(),
        ticketPrice: 350,
        hallNumber: 1,
        bookedSeats: []
      }
    ];

    // Seed 1 default booking for John Doe
    this.bookings = [
      {
        _id: 'bk_sample1',
        bookingReference: 'IMV-7K9W2-8841',
        user: 'usr_regular',
        show: 'show_1',
        seats: ['B3', 'B4'],
        totalAmount: 560,
        paymentMode: 'DEMO_PAYMENT',
        paymentStatus: 'COMPLETED',
        bookingStatus: 'CONFIRMED',
        createdAt: new Date(now - 1000 * 60 * 60 * 2).toISOString()
      }
    ];
  }

  // Helper methods
  populateShow(show: Show) {
    const movie = this.movies.find((m) => m._id === show.movie);
    const cinema = this.cinemas.find((c) => c._id === show.cinema);
    return {
      ...show,
      movie: movie || null,
      cinema: cinema || null
    };
  }

  populateBooking(booking: Booking) {
    const show = this.shows.find((s) => s._id === booking.show);
    const user = this.users.find((u) => u._id === booking.user);
    const populatedShow = show ? this.populateShow(show) : null;
    return {
      ...booking,
      show: populatedShow,
      user: user ? { _id: user._id, name: user.name, email: user.email } : null
    };
  }
}

const db = new DatabaseStore();

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

// Auth helper
function generateToken(id: string) {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: '7d' });
}

// Authentication middleware
interface AuthenticatedRequest extends Request {
  user?: User;
}

const protect = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  let token: string | undefined;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
      const user = db.users.find((u) => u._id === decoded.id);
      if (!user) {
        res.status(401).json({ message: 'User session not found' });
        return;
      }
      req.user = user;
      next();
      return;
    } catch {
      res.status(401).json({ message: 'Not authorized, invalid token' });
      return;
    }
  }
  res.status(401).json({ message: 'Not authorized, no token provided' });
};

const adminOnly = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied: Admins only' });
  }
};

// -----------------------------------------------------------------------------
// REST API ROUTES
// -----------------------------------------------------------------------------

// Health check
app.get('/api/health', (_req, res) => {
  res.status(200).json({ status: 'UP', message: 'IMovies REST API is running' });
});

// 1. Auth routes
app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    res.status(400).json({ message: 'Please provide all required fields' });
    return;
  }
  const cleanEmail = email.toLowerCase().trim();
  const exists = db.users.find((u) => u.email === cleanEmail);
  if (exists) {
    res.status(400).json({ message: 'User already exists with this email' });
    return;
  }
  const hashedPassword = bcrypt.hashSync(password, 10);
  const newUser: User = {
    _id: 'usr_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
    name: name.trim(),
    email: cleanEmail,
    password: hashedPassword,
    role: 'user',
    createdAt: new Date().toISOString()
  };
  db.users.push(newUser);

  res.status(201).json({
    _id: newUser._id,
    name: newUser.name,
    email: newUser.email,
    role: newUser.role,
    token: generateToken(newUser._id)
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ message: 'Please provide email and password' });
    return;
  }
  const user = db.users.find((u) => u.email === email.toLowerCase().trim());
  if (user && bcrypt.compareSync(password, user.password)) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id)
    });
    return;
  }
  res.status(401).json({ message: 'Invalid email or password' });
});

app.get('/api/auth/me', protect, (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    res.status(401).json({ message: 'Not authenticated' });
    return;
  }
  const { password, ...safeUser } = req.user;
  res.json(safeUser);
});

// 2. Movie routes
app.get('/api/movies', (req, res) => {
  const { search, genre, status } = req.query;
  let results = [...db.movies];

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    results = results.filter((m) => m.title.toLowerCase().includes(q) || m.description.toLowerCase().includes(q));
  }
  if (genre && typeof genre === 'string' && genre !== 'All') {
    results = results.filter((m) => m.genres.some((g) => g.toLowerCase() === genre.toLowerCase()));
  }
  if (status && typeof status === 'string' && status !== 'All') {
    results = results.filter((m) => m.status === status);
  }

  // Sort now showing first
  results.sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime());
  res.json(results);
});

app.get('/api/movies/:id', (req, res) => {
  const movie = db.movies.find((m) => m._id === req.params.id);
  if (!movie) {
    res.status(404).json({ message: 'Movie not found' });
    return;
  }
  res.json(movie);
});

app.post('/api/movies', protect, adminOnly, (req, res) => {
  const { title, description, genres, language, duration, rating, posterUrl, backdropUrl, status, releaseDate, cast, director } = req.body;
  if (!title || !description) {
    res.status(400).json({ message: 'Title and description are required' });
    return;
  }
  const newMovie: Movie = {
    _id: 'mov_' + Date.now().toString(36),
    title,
    description,
    genres: Array.isArray(genres) ? genres : [genres || 'General'],
    language: language || 'English',
    duration: Number(duration) || 120,
    rating: Number(rating) || 8.0,
    posterUrl: posterUrl || '/src/assets/images/poster_interstellar_echoes_1792938365498.jpg',
    backdropUrl: backdropUrl || '/src/assets/images/hero_cinema_interstellar_1792938367222.jpg',
    status: status === 'coming-soon' ? 'coming-soon' : 'now-showing',
    releaseDate: releaseDate || new Date().toISOString().split('T')[0],
    cast: Array.isArray(cast) ? cast : [],
    director: director || 'Director'
  };
  db.movies.unshift(newMovie);
  res.status(201).json(newMovie);
});

app.delete('/api/movies/:id', protect, adminOnly, (req, res) => {
  const index = db.movies.findIndex((m) => m._id === req.params.id);
  if (index === -1) {
    res.status(404).json({ message: 'Movie not found' });
    return;
  }
  db.movies.splice(index, 1);
  // Also clean up shows
  db.shows = db.shows.filter((s) => s.movie !== req.params.id);
  res.json({ message: 'Movie removed successfully' });
});

// 3. Cinema routes
app.get('/api/cinemas', (_req, res) => {
  res.json(db.cinemas);
});

// 4. Show routes
app.get('/api/shows/movie/:movieId', (req, res) => {
  const shows = db.shows.filter((s) => s.movie === req.params.movieId);
  const populated = shows.map((s) => db.populateShow(s));
  populated.sort((a, b) => new Date(a.showDateTime).getTime() - new Date(b.showDateTime).getTime());
  res.json(populated);
});

app.get('/api/shows/:id', (req, res) => {
  const show = db.shows.find((s) => s._id === req.params.id);
  if (!show) {
    res.status(404).json({ message: 'Showtime not found' });
    return;
  }
  res.json(db.populateShow(show));
});

app.post('/api/shows', protect, adminOnly, (req, res) => {
  const { movie, cinema, showDateTime, ticketPrice, hallNumber } = req.body;
  if (!movie || !cinema || !showDateTime) {
    res.status(400).json({ message: 'Missing required show information' });
    return;
  }
  const newShow: Show = {
    _id: 'show_' + Date.now().toString(36),
    movie,
    cinema,
    showDateTime,
    ticketPrice: Number(ticketPrice) || 250,
    hallNumber: Number(hallNumber) || 1,
    bookedSeats: []
  };
  db.shows.push(newShow);
  res.status(201).json(db.populateShow(newShow));
});

// 5. Booking routes (Atomic Concurrency Protection)
app.post('/api/bookings', protect, (req: AuthenticatedRequest, res) => {
  const { showId, seats, totalAmount } = req.body;

  if (!seats || !Array.isArray(seats) || seats.length === 0) {
    res.status(400).json({ message: 'No seats selected' });
    return;
  }

  const show = db.shows.find((s) => s._id === showId);
  if (!show) {
    res.status(404).json({ message: 'Showtime not found' });
    return;
  }

  // Atomic seat conflict check: Ensure none of the chosen seats are already booked
  const conflictingSeats = seats.filter((seat) => show.bookedSeats.includes(seat));
  if (conflictingSeats.length > 0) {
    res.status(409).json({
      message: `Seat ${conflictingSeats.join(', ')} has just been booked by another user. Please choose another seat.`
    });
    return;
  }

  // Atomic reservation update
  show.bookedSeats.push(...seats);

  const bookingRef = 'IMV-' + Math.random().toString(36).substring(2, 7).toUpperCase() + '-' + Date.now().toString().slice(-4);
  const newBooking: Booking = {
    _id: 'bk_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
    bookingReference: bookingRef,
    user: req.user!._id,
    show: showId,
    seats,
    totalAmount: Number(totalAmount) || seats.length * show.ticketPrice,
    paymentMode: 'DEMO_PAYMENT',
    paymentStatus: 'COMPLETED',
    bookingStatus: 'CONFIRMED',
    createdAt: new Date().toISOString()
  };

  db.bookings.unshift(newBooking);
  const populated = db.populateBooking(newBooking);
  res.status(201).json(populated);
});

app.get('/api/bookings/my-bookings', protect, (req: AuthenticatedRequest, res) => {
  const userBookings = db.bookings.filter((b) => b.user === req.user!._id);
  const populated = userBookings.map((b) => db.populateBooking(b));
  populated.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json(populated);
});

app.get('/api/bookings/admin/all', protect, adminOnly, (_req, res) => {
  const all = db.bookings.map((b) => db.populateBooking(b));
  all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json(all);
});

app.get('/api/bookings/:id', protect, (req: AuthenticatedRequest, res) => {
  const booking = db.bookings.find((b) => b._id === req.params.id);
  if (!booking) {
    res.status(404).json({ message: 'Booking not found' });
    return;
  }
  if (booking.user !== req.user!._id && req.user!.role !== 'admin') {
    res.status(403).json({ message: 'Unauthorized to view this booking' });
    return;
  }
  res.json(db.populateBooking(booking));
});

// Centralized error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[IMovies API Error]', err);
  res.status(500).json({ message: err.message || 'Internal Server Error' });
});

// Dev Vite server or static production files
async function startServer() {
  if (process.env.NODE_ENV === 'production' && fs.existsSync(path.resolve('dist'))) {
    app.use(express.static(path.resolve('dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve('dist/index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[IMovies Server] Running at http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[Fatal startup error]', err);
  process.exit(1);
});
