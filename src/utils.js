export const STATUSES = ["Booked", "Confirmed", "Completed", "Cancelled"];

export const SERVER_ERROR =
  "Couldn't reach the server. Start it with `npm run server` and refresh.";

// Local date as YYYY-MM-DD (toISOString would give the UTC date, which can be off by a day)
export function todayStr() {
  const d = new Date();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${month}-${day}`;
}

export function prettyDate(dateStr) {
  return new Date(dateStr + "T00:00").toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export const isPhone = (value) => /^\d{10}$/.test(value);
export const isEmail = (value) => /^\S+@\S+\.\S+$/.test(value);

export const initials = (name) =>
  name.replace("Dr. ", "").split(" ").map((w) => w[0]).slice(0, 2).join("");

// ids can be numbers (from the server) or strings (from <select>), so compare as text
export const sameId = (a, b) => String(a) === String(b);
