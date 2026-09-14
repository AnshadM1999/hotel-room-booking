/* ==========================================================
   Basic unit tests for calculateNights() / calculateTotal()
   No test framework — run directly with: node tests/booking.test.js
   ========================================================== */

const { calculateNights, calculateTotal, validateDates, formatINR } = require("../script.js");

let passed = 0;
let failed = 0;

function assertEqual(actual, expected, description) {
  const ok = actual === expected;
  if (ok) {
    passed++;
    console.log(`PASS: ${description}`);
  } else {
    failed++;
    console.log(`FAIL: ${description} (expected ${expected}, got ${actual})`);
  }
}

// --- calculateNights ---
assertEqual(calculateNights("2026-09-20", "2026-09-23"), 3, "20 Sep -> 23 Sep = 3 nights");
assertEqual(calculateNights("2026-09-20", "2026-09-21"), 1, "20 Sep -> 21 Sep = 1 night");
assertEqual(calculateNights("2026-09-20", "2026-09-20"), null, "same-day dates are invalid");
assertEqual(calculateNights("2026-09-23", "2026-09-20"), null, "check-out before check-in is invalid");

// --- calculateTotal ---
assertEqual(calculateTotal(3500, 3), 10500, "3500 x 3 nights = 10500");
assertEqual(calculateTotal(5800, 1), 5800, "5800 x 1 night = 5800");
assertEqual(calculateTotal(3500, 0), 0, "0 nights = 0 total");

// --- validateDates ---
assertEqual(validateDates("2026-09-20", "2026-09-20"), "Check-out date must be after the check-in date.", "rejects same-day dates");
assertEqual(validateDates("2026-09-23", "2026-09-20"), "Check-out date must be after the check-in date.", "rejects checkout before checkin");
assertEqual(validateDates("2026-09-20", "2026-09-23"), null, "accepts a valid future date range");

// --- formatINR ---
assertEqual(formatINR(10500), "₹10,500", "formats 10500 as Indian currency");
assertEqual(formatINR(3500), "₹3,500", "formats 3500 as Indian currency");

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
