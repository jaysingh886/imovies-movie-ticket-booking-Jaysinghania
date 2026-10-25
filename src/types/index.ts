export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  token?: string;
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
  duration: number; // minutes
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
  movie: Movie;
  cinema: Cinema;
  showDateTime: string;
  ticketPrice: number;
  hallNumber: number;
  bookedSeats: string[];
}

export interface Booking {
  _id: string;
  bookingReference: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  show: {
    _id: string;
    movie: Movie;
    cinema: Cinema;
    showDateTime: string;
    ticketPrice: number;
    hallNumber: number;
  };
  seats: string[];
  totalAmount: number;
  paymentMode: string;
  paymentStatus: 'COMPLETED' | 'FAILED' | 'PENDING';
  bookingStatus: 'CONFIRMED' | 'CANCELLED';
  createdAt: string;
}
