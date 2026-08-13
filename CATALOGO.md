# Cómo actualizar productos y precios

Todo el catálogo vive en un solo archivo: `src/data/products.ts`. No hay base
de datos ni panel externo — se edita ese archivo y se sube el cambio.

## Editar un precio

Buscá el producto por nombre en `src/data/products.ts` y cambiá el campo
`price` (es un número, sin puntos ni el símbolo `$`):

```ts
{
  name: "Yerba Amanda Compuesta 500g",
  price: 2800,   // ← esto es lo que cambiás
  ...
}
```

## Agregar un producto nuevo

Copiá un producto existente de la misma categoría y pegalo dentro del array
`products`, con estos campos:

| Campo | Qué va | Obligatorio |
|---|---|---|
| `id` | Un número único como texto, ej `"21"` | Sí |
| `name` | Nombre que se ve en el sitio | Sí |
| `slug` | Versión del nombre en minúsculas y con guiones, para la URL | Sí |
| `description` | Descripción corta (tarjetas de producto) | Sí |
| `longDescription` | Descripción larga (página de producto) | No |
| `price` | Precio en pesos, solo número | Sí |
| `category` | Una de: `yerbas`, `mates`, `bombillas`, `termos`, `accesorios`, `combos` | Sí |
| `status` | `available`, `out_of_stock` o `featured` | Sí |
| `images` | Lista de rutas de imagen (ver abajo) | Sí |
| `weight`, `brand`, `tags` | Datos extra que se muestran en la ficha | No |
| `featured` | `true` para que aparezca en "Selección de la casa" del home | No |

## Sacar un producto de stock

No lo borres — cambiá `status` a `"out_of_stock"`. El sitio ya sabe mostrarlo
como agotado sin borrar el producto (útil para cuando vuelva a haber stock).

## Agregar la foto de un producto

1. Poné el archivo de imagen en la carpeta `public/` (formato `.png` o
   `.jpg`, ideal cuadrado o 4:3).
2. En el producto, referencialo como `"/nombre-del-archivo.png"` (con la
   barra `/` al principio, sin `public/`).

## Después de editar

Guardá el archivo y subí el cambio (`git add`, `git commit`, `git push`) —
Vercel lo despliega solo. Si algo no compila, `npm run build` te va a decir
en qué línea está el error antes de subir.
