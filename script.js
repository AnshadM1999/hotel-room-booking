/* ==========================================================
   Raintech Hotel — Room Booking
   Vanilla JS. Business logic kept separate from DOM handling.
   ========================================================== */

/* ---------------- DATA ---------------- */

const rooms = [
  { code: "R101", type: "Deluxe Room", price: 3500, maxGuests: 2 },
  { code: "R102", type: "Deluxe Room", price: 3500, maxGuests: 2 },
  { code: "R201", type: "Executive Suite", price: 5800, maxGuests: 3 },
  { code: "R202", type: "Executive Suite", price: 5800, maxGuests: 3 },
  { code: "R301", type: "Family Room", price: 4200, maxGuests: 4 }
];

// Bonus 2 — a couple of hardcoded existing bookings.
// Dates are inclusive check-in / exclusive check-out (standard hotel convention).
const existingBookings = [
  { roomCode: "R101", checkIn: "2026-09-20", checkOut: "2026-09-23" },
  { roomCode: "R201", checkIn: "2026-09-25", checkOut: "2026-09-27" }
];

/* ---------------- STATE ---------------- */

let selectedRoomCode = null;

/* ---------------- BUSINESS LOGIC ---------------- */

/** Returns today's date as a YYYY-MM-DD string (local time, no timezone drift). */
function getTodayDate() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Parses a YYYY-MM-DD string into a calendar-only Date (midnight local), avoiding
 *  timezone-related off-by-one errors that come from parsing with `new Date(string)`. */
function parseDateOnly(dateString) {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day);
}

/** Calculates the number of nights between two YYYY-MM-DD calendar dates.
 *  Returns a positive integer, or null if the dates are invalid/out of order. */
function calculateNights(checkIn, checkOut) {
  if (!checkIn || !checkOut) return null;

  const inDate = parseDateOnly(checkIn);
  const outDate = parseDateOnly(checkOut);

  const MS_PER_DAY = 24 * 60 * 60 * 1000;
  const nights = Math.round((outDate - inDate) / MS_PER_DAY);

  if (nights <= 0) return null;
  return nights;
}

/** Total price = nights x price per night. */
function calculateTotal(pricePerNight, nights) {
  if (!nights || nights <= 0) return 0;
  return pricePerNight * nights;
}

/** Checks whether a room has an existing booking that overlaps the given date range. */
function isRoomBookedForDates(roomCode, checkIn, checkOut) {
  if (!checkIn || !checkOut) return false;

  const inDate = parseDateOnly(checkIn);
  const outDate = parseDateOnly(checkOut);

  return existingBookings.some((booking) => {
    if (booking.roomCode !== roomCode) return false;
    const bookedIn = parseDateOnly(booking.checkIn);
    const bookedOut = parseDateOnly(booking.checkOut);
    // Overlap if the requested range starts before the existing one ends
    // and ends after the existing one starts.
    return inDate < bookedOut && outDate > bookedIn;
  });
}

/** Validates the check-in/check-out pair on its own (date logic only).
 *  Returns an error message string, or null when valid. */
function validateDates(checkIn, checkOut) {
  if (!checkIn) return "Please select a check-in date.";
  if (!checkOut) return "Please select a check-out date.";

  const today = parseDateOnly(getTodayDate());
  const inDate = parseDateOnly(checkIn);
  const outDate = parseDateOnly(checkOut);

  if (inDate < today) return "Check-in date cannot be in the past.";
  if (outDate.getTime() === inDate.getTime()) {
    return "Check-out date must be after the check-in date.";
  }
  if (outDate < inDate) return "Check-out date must be after the check-in date.";

  return null;
}

/** Full booking validation: dates, room selection, guest capacity, availability.
 *  Returns an error message string, or null when the booking is valid. */
function validateBooking() {
  const checkIn = document.getElementById("checkInDate").value;
  const checkOut = document.getElementById("checkOutDate").value;
  const guestCount = Number(document.getElementById("guestCount").value);

  const dateError = validateDates(checkIn, checkOut);
  if (dateError) return dateError;

  if (!selectedRoomCode) return "Please select a room.";

  const room = rooms.find((r) => r.code === selectedRoomCode);

  if (guestCount > room.maxGuests) {
    return `Selected room allows a maximum of ${room.maxGuests} guests.`;
  }

  if (isRoomBookedForDates(room.code, checkIn, checkOut)) {
    return "Room unavailable for selected dates.";
  }

  return null;
}

/** Formats a number as Indian Rupee currency, e.g. 10500 -> "₹10,500". */
function formatINR(amount) {
  return "₹" + Math.round(amount).toLocaleString("en-IN");
}

/** Formats a YYYY-MM-DD string as "20 Sep 2026". */
function formatDisplayDate(dateString) {
  const date = parseDateOnly(dateString);
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

/* ---------------- DOM RENDERING ---------------- */

function renderRooms() {
  const roomList = document.getElementById("roomList");
  const guestFilter = Number(document.getElementById("guestFilter").value);
  const checkIn = document.getElementById("checkInDate").value;
  const checkOut = document.getElementById("checkOutDate").value;

  roomList.innerHTML = "";

  rooms.forEach((room) => {
    const failsGuestFilter = guestFilter > 0 && guestFilter > room.maxGuests;
    const isBooked = isRoomBookedForDates(room.code, checkIn, checkOut);
    const isUnavailable = failsGuestFilter || isBooked;
    const isSelected = selectedRoomCode === room.code;

    const card = document.createElement("article");
    card.className = "room-card" + (isSelected ? " is-selected" : "") + (isUnavailable ? " is-unavailable" : "");

    card.innerHTML = `
      <div class="room-card-top">
        <div>
          <span class="room-code">${room.code}</span>
          <h3 class="room-type">${room.type}</h3>
        </div>
      </div>
      <div class="room-price">${formatINR(room.price)} <span>/ night</span></div>
      <div class="room-meta">Maximum Guests: ${room.maxGuests}</div>
      ${isUnavailable ? `<div class="room-unavailable-note">${
        isBooked ? "Room unavailable for selected dates." : "Exceeds guest capacity."
      }</div>` : ""}
      <button type="button" class="btn-select${isSelected ? " is-selected" : ""}"
        data-room-code="${room.code}" ${isUnavailable ? "disabled" : ""}>
        ${isSelected ? "Selected" : "Select Room"}
      </button>
    `;

    roomList.appendChild(card);
  });

  // Wire up the select buttons rendered above.
  roomList.querySelectorAll(".btn-select").forEach((btn) => {
    btn.addEventListener("click", () => selectRoom(btn.dataset.roomCode));
  });
}

function selectRoom(roomCode) {
  selectedRoomCode = selectedRoomCode === roomCode ? null : roomCode;
  hideError();
  hideSuccess();
  renderRooms();
  updateBookingSummary();
}

function updateBookingSummary() {
  const summaryBody = document.getElementById("summaryBody");
  const confirmBtn = document.getElementById("confirmBtn");
  const checkIn = document.getElementById("checkInDate").value;
  const checkOut = document.getElementById("checkOutDate").value;

  const room = rooms.find((r) => r.code === selectedRoomCode);
  const nights = room ? calculateNights(checkIn, checkOut) : null;

  if (!room || !nights) {
    summaryBody.innerHTML = `
      <p class="summary-empty-title">No room selected</p>
      <p class="summary-empty-sub">Select a room and dates to see your booking summary.</p>
    `;
    confirmBtn.disabled = true;
    return;
  }

  const total = calculateTotal(room.price, nights);

  summaryBody.innerHTML = `
    <div class="summary-row"><span class="label">Room</span><span class="value">${room.code}</span></div>
    <div class="summary-row"><span class="label">Room Type</span><span class="value">${room.type}</span></div>
    <div class="summary-row"><span class="label">Price / Night</span><span class="value">${formatINR(room.price)}</span></div>
    <div class="summary-row"><span class="label">Check-in</span><span class="value">${formatDisplayDate(checkIn)}</span></div>
    <div class="summary-row"><span class="label">Check-out</span><span class="value">${formatDisplayDate(checkOut)}</span></div>
    <div class="summary-row"><span class="label">Number of Nights</span><span class="value">${nights}</span></div>
    <div class="summary-total"><span class="label">Total Amount</span><span class="value">${formatINR(total)}</span></div>
  `;

  // Enable the confirm button only when the whole booking passes validation
  // (covers guest count / overlap rules, not just "room + dates present").
  confirmBtn.disabled = Boolean(validateBooking());
}

function showError(message) {
  const errorBox = document.getElementById("errorBox");
  errorBox.textContent = message;
  errorBox.hidden = false;
}

function hideError() {
  const errorBox = document.getElementById("errorBox");
  errorBox.hidden = true;
  errorBox.textContent = "";
}

function showSuccess(message) {
  const successBox = document.getElementById("successBox");
  successBox.textContent = message;
  successBox.hidden = false;
}

function hideSuccess() {
  const successBox = document.getElementById("successBox");
  successBox.hidden = true;
  successBox.textContent = "";
}

/* ---------------- EVENT WIRING ---------------- */

function handleFormChange() {
  hideSuccess();
  const error = validateBooking();
  if (error) {
    showError(error);
  } else {
    hideError();
  }
  renderRooms();
  updateBookingSummary();
}

function handleConfirmBooking() {
  const error = validateBooking();
  if (error) {
    showError(error);
    return;
  }
  hideError();
  showSuccess("Booking details confirmed successfully.");
}

function init() {
  const today = getTodayDate();
  document.getElementById("checkInDate").min = today;
  document.getElementById("checkOutDate").min = today;

  document.getElementById("checkInDate").addEventListener("change", handleFormChange);
  document.getElementById("checkOutDate").addEventListener("change", handleFormChange);
  document.getElementById("guestCount").addEventListener("change", handleFormChange);
  document.getElementById("guestFilter").addEventListener("change", () => {
    renderRooms();
  });
  document.getElementById("confirmBtn").addEventListener("click", handleConfirmBooking);

  renderRooms();
  updateBookingSummary();
}

if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", init);
}

// Expose the pure logic functions for the Node-based unit tests in tests/booking.test.js.
// Has no effect in the browser (module is undefined there).
if (typeof module !== "undefined" && module.exports) {
  module.exports = { calculateNights, calculateTotal, validateDates, formatINR };
}
