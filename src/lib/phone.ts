/**
 * Normalización de números telefónicos a formato internacional E.164 para Argentina (+549...).
 */
export function normalizeArPhone(rawInput?: string | null): string {
  if (!rawInput) return "";
  const raw = String(rawInput).trim();
  if (!raw) return "";

  // Quitar todo lo que no sea dígito
  let digits = raw.replace(/\D/g, "");
  if (!digits || digits.length < 6) return raw;

  // Si ya empieza con el código de país de Argentina: 54
  if (digits.startsWith("54")) {
    digits = digits.slice(2);
    // Si tenía el 9 móvil internacional (+54 9 ...):
    if (digits.startsWith("9")) {
      digits = digits.slice(1);
    }
  }

  // Quitar prefijo interurbano nacional '0' (ej. 0299 -> 299, 011 -> 11)
  if (digits.startsWith("0")) {
    digits = digits.replace(/^0+/, "");
  }

  // Si tiene 12 dígitos y contiene "15":
  if (digits.length > 10) {
    if (digits.startsWith("1115") && digits.length === 12) {
      digits = "11" + digits.slice(4);
    } else if (digits.length === 12 && digits.slice(3, 5) === "15") {
      digits = digits.slice(0, 3) + digits.slice(5);
    } else if (digits.length === 12 && digits.slice(4, 6) === "15") {
      digits = digits.slice(0, 4) + digits.slice(6);
    } else if (digits.length === 11) {
      if (digits.slice(2, 4) === "15") {
        digits = digits.slice(0, 2) + digits.slice(4);
      } else if (digits.slice(3, 5) === "15") {
        digits = digits.slice(0, 3) + digits.slice(5);
      }
    }
  }

  if (digits.length === 10) {
    return `+549${digits}`;
  }

  if (digits.length >= 8 && digits.length <= 11) {
    return `+549${digits}`;
  }

  if (raw.startsWith("+")) {
    return `+${digits}`;
  }

  return `+549${digits}`;
}

export function formatPhoneDisplay(normalizedPhone?: string | null): string {
  if (!normalizedPhone) return "—";
  const clean = normalizedPhone.trim();
  if (!clean.startsWith("+549") || clean.length < 13) return clean;

  const rest = clean.slice(4);
  if (rest.startsWith("11")) {
    return `+54 9 11 ${rest.slice(2, 6)}-${rest.slice(6)}`;
  }
  return `+54 9 ${rest.slice(0, 3)} ${rest.slice(3, 6)}-${rest.slice(6)}`;
}
