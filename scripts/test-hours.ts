import assert from "node:assert";
import {
  isStoreOpenNow,
  getNextOpeningLabel,
  getOpenDaysLabel,
  validateOpeningHoursInput,
  validateClosedDatesInput,
  DEFAULT_OPENING_HOURS,
  OpeningHours,
} from "../src/lib/hours";

console.log("▶ Iniciando self-check de horarios (lib/hours.ts)...");

// Mock date builder en zona horaria America/Argentina/Buenos_Aires (UTC-3)
function makeBuenosAiresDate(
  year: number,
  month: number, // 1-indexed (9 = Septiembre)
  day: number,
  hour: number,
  minute: number,
): Date {
  const pad = (n: number) => String(n).padStart(2, "0");
  // En ISO con offset -03:00
  return new Date(`${year}-${pad(month)}-${pad(day)}T${pad(hour)}:${pad(minute)}:00-03:00`);
}

// ── Test 1: Lunes cerrado ──────────────────────────────────────────
{
  // 2026-09-28 es lunes
  const mondayMorning = makeBuenosAiresDate(2026, 9, 28, 10, 30);
  const mondayEvening = makeBuenosAiresDate(2026, 9, 28, 18, 0);

  assert.strictEqual(
    isStoreOpenNow(DEFAULT_OPENING_HOURS, [], mondayMorning),
    false,
    "El lunes a la mañana debe estar cerrado",
  );
  assert.strictEqual(
    isStoreOpenNow(DEFAULT_OPENING_HOURS, [], mondayEvening),
    false,
    "El lunes a la tarde debe estar cerrado",
  );
  console.log("  ✔ Test 1 superado: lunes cerrado correctamente.");
}

// ── Test 2: Sábado en el borde del cierre ─────────────────────────
{
  // 2026-09-26 es sábado (horario 09:00 - 14:00)
  const satInside = makeBuenosAiresDate(2026, 9, 26, 13, 59);
  const satExactClose = makeBuenosAiresDate(2026, 9, 26, 14, 0);
  const satAfterClose = makeBuenosAiresDate(2026, 9, 26, 14, 1);

  assert.strictEqual(
    isStoreOpenNow(DEFAULT_OPENING_HOURS, [], satInside),
    true,
    "Sábado 13:59 debe figurar como abierto (antes de las 14:00)",
  );
  assert.strictEqual(
    isStoreOpenNow(DEFAULT_OPENING_HOURS, [], satExactClose),
    false,
    "Sábado 14:00 debe figurar como cerrado (borde exacto de cierre)",
  );
  assert.strictEqual(
    isStoreOpenNow(DEFAULT_OPENING_HOURS, [], satAfterClose),
    false,
    "Sábado 14:01 debe figurar como cerrado",
  );
  console.log("  ✔ Test 2 superado: sábado en el borde exacto del cierre.");
}

// ── Test 3: Franja partida 13:00–17:00 (siesta) ───────────────────
{
  // Configuración con horario cortado de martes a viernes: 09:00 a 13:00 y 17:00 a 21:00
  const splitSchedule: OpeningHours = {
    ...DEFAULT_OPENING_HOURS,
    tue: {
      closed: false,
      ranges: [
        { open: "09:00", close: "13:00" },
        { open: "17:00", close: "21:00" },
      ],
    },
  };

  // 2026-09-29 es martes
  const morning = makeBuenosAiresDate(2026, 9, 29, 11, 0);
  const siesta = makeBuenosAiresDate(2026, 9, 29, 15, 0);
  const evening = makeBuenosAiresDate(2026, 9, 29, 18, 30);
  const night = makeBuenosAiresDate(2026, 9, 29, 21, 30);

  assert.strictEqual(
    isStoreOpenNow(splitSchedule, [], morning),
    true,
    "Martes 11:00 en franja 1 debe estar abierto",
  );
  assert.strictEqual(
    isStoreOpenNow(splitSchedule, [], siesta),
    false,
    "Martes 15:00 en corte de siesta 13:00-17:00 debe estar cerrado",
  );
  assert.strictEqual(
    isStoreOpenNow(splitSchedule, [], evening),
    true,
    "Martes 18:30 en franja 2 debe estar abierto",
  );
  assert.strictEqual(
    isStoreOpenNow(splitSchedule, [], night),
    false,
    "Martes 21:30 post-cierre debe estar cerrado",
  );

  // Verificación de próxima apertura durante la siesta: "hoy desde las 17:00"
  const nextOpeningDuringSiesta = getNextOpeningLabel(splitSchedule, [], siesta);
  assert.strictEqual(
    nextOpeningDuringSiesta,
    "hoy desde las 17:00",
    `Durante la siesta la próxima apertura debe ser hoy a las 17:00, recibido: ${nextOpeningDuringSiesta}`,
  );

  console.log("  ✔ Test 3 superado: franja partida y detección durante corte de siesta.");
}

// ── Test 4: Feriado en closed_dates ────────────────────────────────
{
  // 2026-09-29 es martes (normalmente abierto)
  const regularTuesday = makeBuenosAiresDate(2026, 9, 29, 11, 0);

  assert.strictEqual(
    isStoreOpenNow(DEFAULT_OPENING_HOURS, [], regularTuesday),
    true,
    "El martes regular debe figurar abierto",
  );

  // Marcamos el 29 de septiembre como feriado en closed_dates
  const holidayClosedDates = ["2026-09-29"];
  assert.strictEqual(
    isStoreOpenNow(DEFAULT_OPENING_HOURS, holidayClosedDates, regularTuesday),
    false,
    "El martes marcado en closed_dates debe figurar cerrado",
  );
  console.log("  ✔ Test 4 superado: feriado en closed_dates respeta el cierre.");
}

// ── Test 5: Próxima apertura desde sábado a la noche → "el martes" ──
{
  // 2026-09-26 21:00 es sábado a la noche. Domingo y lunes están cerrados.
  const saturdayNight = makeBuenosAiresDate(2026, 9, 26, 21, 0);

  const nextOpening = getNextOpeningLabel(DEFAULT_OPENING_HOURS, [], saturdayNight);
  assert.strictEqual(
    nextOpening,
    "el martes desde las 09:00",
    `Desde sábado a la noche la próxima apertura debe ser el martes a las 09:00, recibido: "${nextOpening}"`,
  );

  // Si además el martes 2026-09-29 fuese feriado en closed_dates, debe saltar al miércoles
  const nextOpeningWithTuesdayHoliday = getNextOpeningLabel(
    DEFAULT_OPENING_HOURS,
    ["2026-09-29"],
    saturdayNight,
  );
  assert.strictEqual(
    nextOpeningWithTuesdayHoliday,
    "el miércoles desde las 09:00",
    `Si el martes es feriado, debe saltar al miércoles, recibido: "${nextOpeningWithTuesdayHoliday}"`,
  );

  console.log("  ✔ Test 5 superado: próxima apertura desde sábado noche salta días cerrados y feriados.");
}

// ── Test 6: Validación de rangos en servidor (open < close y no pisarse) ─
{
  // Franja invertida
  assert.throws(
    () =>
      validateOpeningHoursInput({
        ...DEFAULT_OPENING_HOURS,
        tue: { closed: false, ranges: [{ open: "19:00", close: "09:00" }] },
      }),
    /anterior a la de cierre/,
    "Debe rechazar apertura >= cierre",
  );

  // Franjas que se pisan
  assert.throws(
    () =>
      validateOpeningHoursInput({
        ...DEFAULT_OPENING_HOURS,
        tue: {
          closed: false,
          ranges: [
            { open: "09:00", close: "14:00" },
            { open: "13:00", close: "18:00" },
          ],
        },
      }),
    /no pueden superponerse/,
    "Debe rechazar franjas superpuestas",
  );

  // Fechas cerradas
  const validDates = validateClosedDatesInput(["2026-12-25", "2026-01-01"]);
  assert.deepStrictEqual(validDates, ["2026-01-01", "2026-12-25"]);

  assert.throws(
    () => validateClosedDatesInput(["fecha-invalida"]),
    /Fecha cerrada inválida/,
    "Debe rechazar formato de fecha incorrecto",
  );

  console.log("  ✔ Test 6 superado: validadores de servidor funcionando.");
}

// ── Test 7: OPEN_DAYS_LABEL ───────────────────────────────────────
{
  const label = getOpenDaysLabel(DEFAULT_OPENING_HOURS);
  assert.strictEqual(label, "Martes a sábado");
  console.log(`  ✔ Test 7 superado: OPEN_DAYS_LABEL="${label}"`);
}

console.log("\n✅ TODOS LOS TESTS DE HORARIOS SUPERADOS EXITOSAMENTE.\n");
