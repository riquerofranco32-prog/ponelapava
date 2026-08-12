// ← PLACEHOLDER: replace with the real production domain once deployed
export const SITE_URL = "https://ponelapava.com.ar";

export const INSTAGRAM_HANDLE = "ponelapava_yerbas";
export const INSTAGRAM_URL = `https://www.instagram.com/${INSTAGRAM_HANDLE}/`;

export const STORE_ADDRESS_LINE = "Avenida San Martín 475";
export const STORE_ADDRESS_CITY = "Catriel, Río Negro";
export const STORE_MAPS_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  `${STORE_ADDRESS_LINE}, ${STORE_ADDRESS_CITY}`,
)}`;

// ← PLACEHOLDER: replace with real opening hours once confirmed
export const STORE_HOURS = [
  { days: "Lun–Vie", hours: "9:00 – 19:00" },
  { days: "Sáb", hours: "9:00 – 14:00" },
];
