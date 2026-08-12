import { ImageResponse } from "next/og";

// ponytail: monograma provisorio con los colores de marca hasta tener el
// logo/isotipo definitivo (ver tarea "Conseguir logo y archivos maestros
// definitivos" en Notion). Reemplazar este archivo cuando llegue.
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#2c4a2e",
        borderRadius: 6,
      }}
    >
      <span
        style={{
          fontSize: 20,
          fontWeight: 700,
          color: "#f5f0e8",
          fontFamily: "serif",
        }}
      >
        P
      </span>
    </div>,
    size,
  );
}
