# Hotel Room Booking

## Project Overview

This project was created for the Raintech Software Limited Developer Skills
Assessment. It is a single-page hotel room booking application: a visitor can
browse available rooms, pick check-in/check-out dates, and see a live price
summary before confirming a booking.

## Technology

- HTML5
- CSS3
- Vanilla JavaScript

No frontend framework or backend is used.

## Features

- Hotel room listing (5 hardcoded rooms)
- Room selection (single selection at a time)
- Check-in date picker
- Check-out date picker
- Full date validation with clear error messages
- Calendar-based night calculation
- Dynamic total price calculation (Indian Rupee formatting)
- Live-updating booking summary
- "Confirm Booking" flow with a success message
- Responsive design (desktop two-column / mobile single-column)
- **Bonus:** Filter rooms by guest count
- **Bonus:** Hardcoded existing bookings with overlap detection
- **Bonus:** Unit tests for the core calculation/validation functions

## How to Run

This is a static HTML/CSS/JS project — no build step or server required.

1. Download or clone this folder.
2. Open `index.html` directly in any modern browser (double-click it, or
   drag it into a browser window).

Alternatively, for auto-reload while editing, open the folder in VS Code and
use the "Live Server" extension.

## Project Structure

```
hotel-room-booking/
├── index.html          Page structure and semantic markup
├── style.css           All styling (CSS variables, layout, responsive rules)
├── script.js           Room data, business logic, and DOM rendering
├── tests/
│   └── booking.test.js Unit tests for the pure logic functions
└── README.md
```

## Validation Rules

The following rules are enforced before a booking can be confirmed:

1. Check-in date cannot be in the past.
2. Check-out date must be after the check-in date (same-day is not allowed).
3. A room must be selected.
4. The guest count cannot exceed the selected room's maximum capacity.
5. The selected room cannot be booked for dates that overlap an existing
   (hardcoded) booking.

Every failure shows a specific, visible error message — nothing fails
silently, and the "Confirm Booking" button stays disabled until the booking
is valid.

## Night & Price Calculation

Nights are calculated from calendar dates (not elapsed hours), so:

- 20 Sep → 21 Sep = 1 night
- 20 Sep → 23 Sep = 3 nights
- 20 Sep → 20 Sep = invalid (rejected)

Total price = number of nights × price per night, formatted as Indian
currency (e.g. `₹10,500`).

## Bonus Features Implemented

- **Guest filter** — the "Filter by guests" dropdown greys out rooms that
  can't accommodate the selected guest count.
- **Existing bookings** — two rooms (`R101`, `R201`) have hardcoded bookings.
  Selecting overlapping dates for those rooms is blocked with a clear
  message.
- **Unit tests** — `tests/booking.test.js` covers `calculateNights()`,
  `calculateTotal()`, `validateDates()`, and `formatINR()`. Run with:
  ```
  node tests/booking.test.js
  ```

## Future Improvements

- Backend integration for real room inventory
- A database for persisting bookings and availability
- Real booking persistence (currently confirmation is UI-only)
- User authentication and guest accounts
- Payment integration
- More comprehensive automated testing (including DOM/UI tests)
- Real-time room availability management across multiple booking channels
