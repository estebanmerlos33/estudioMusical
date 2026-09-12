// ==========================================================================
// Dibuja un diapasón (6 cuerdas x 12 trastes) en SVG, resaltando una o dos
// posiciones. Se usa en los ejercicios que piden ubicar cuerda+traste (1 y 4)
// para dar una referencia visual, sin revelar la nota ni el intervalo (la
// respuesta): solo marca DÓNDE está la posición, no QUÉ es.
// ==========================================================================

const DIAPASON_NUM_CUERDAS = 6;
const DIAPASON_NUM_TRASTES = 12;

function diapasonCoordenadas() {
  const openWidth = 34;      // espacio a la izquierda del nut para el traste 0 (al aire)
  const fretWidth = 38;      // ancho de cada casilla de traste
  const stringSpacing = 24;  // separación vertical entre cuerdas
  const topPadding = 14;
  const bottomPadding = 26;  // espacio para los números de traste debajo
  const leftLabelWidth = 22; // espacio para el número de cuerda a la izquierda

  const nutX = leftLabelWidth + openWidth;
  const width = nutX + DIAPASON_NUM_TRASTES * fretWidth + 12;
  const height = topPadding + (DIAPASON_NUM_CUERDAS - 1) * stringSpacing + bottomPadding;

  return { openWidth, fretWidth, stringSpacing, topPadding, bottomPadding, leftLabelWidth, nutX, width, height };
}

function diapasonXDeTraste(coords, traste) {
  if (traste === 0) return coords.leftLabelWidth + coords.openWidth / 2;
  return coords.nutX + (traste - 1) * coords.fretWidth + coords.fretWidth / 2;
}

function diapasonYDeCuerda(coords, cuerda) {
  return coords.topPadding + (cuerda - 1) * coords.stringSpacing;
}

// Genera el SVG del diapasón. posiciones: [{ cuerda, traste, grupo }], grupo 1 o 2 (color distinto)
function generarDiapasonSVG(posiciones) {
  const coords = diapasonCoordenadas();
  const filaInferior = coords.topPadding + (DIAPASON_NUM_CUERDAS - 1) * coords.stringSpacing;
  const centroVertical = coords.topPadding + ((DIAPASON_NUM_CUERDAS - 1) * coords.stringSpacing) / 2;

  let svg = `<svg viewBox="0 0 ${coords.width} ${coords.height}" width="${coords.width}" height="${coords.height}" xmlns="http://www.w3.org/2000/svg" class="diapason-svg" role="img" aria-label="Diagrama de diapasón">`;

  // Etiquetas de cuerda (a la izquierda)
  for (let cuerda = 1; cuerda <= DIAPASON_NUM_CUERDAS; cuerda++) {
    const y = diapasonYDeCuerda(coords, cuerda);
    svg += `<text x="4" y="${y + 3}" class="diapason-label-cuerda">${cuerda}</text>`;
  }

  // Líneas de cuerda (horizontales)
  for (let cuerda = 1; cuerda <= DIAPASON_NUM_CUERDAS; cuerda++) {
    const y = diapasonYDeCuerda(coords, cuerda);
    svg += `<line x1="${coords.leftLabelWidth}" y1="${y}" x2="${coords.nutX + DIAPASON_NUM_TRASTES * coords.fretWidth}" y2="${y}" class="diapason-cuerda-linea" />`;
  }

  // Líneas de traste (verticales), el traste 0 (nut) más grueso
  for (let traste = 0; traste <= DIAPASON_NUM_TRASTES; traste++) {
    const x = coords.nutX + traste * coords.fretWidth;
    const clase = traste === 0 ? "diapason-traste-linea diapason-nut" : "diapason-traste-linea";
    svg += `<line x1="${x}" y1="${coords.topPadding}" x2="${x}" y2="${filaInferior}" class="${clase}" />`;
  }

  // Incrustaciones (puntos de referencia) en trastes 3,5,7,9 y doble en el 12
  [3, 5, 7, 9].forEach((traste) => {
    svg += `<circle cx="${diapasonXDeTraste(coords, traste)}" cy="${centroVertical}" r="3" class="diapason-inlay" />`;
  });
  const x12 = diapasonXDeTraste(coords, 12);
  svg += `<circle cx="${x12}" cy="${centroVertical - 6}" r="3" class="diapason-inlay" />`;
  svg += `<circle cx="${x12}" cy="${centroVertical + 6}" r="3" class="diapason-inlay" />`;

  // Números de traste debajo
  for (let traste = 0; traste <= DIAPASON_NUM_TRASTES; traste++) {
    svg += `<text x="${diapasonXDeTraste(coords, traste)}" y="${filaInferior + 18}" class="diapason-label-traste">${traste}</text>`;
  }

  // Posiciones resaltadas
  posiciones.forEach((posicion) => {
    const x = diapasonXDeTraste(coords, posicion.traste);
    const y = diapasonYDeCuerda(coords, posicion.cuerda);
    const claseGrupo = posicion.grupo === 2 ? "diapason-marcador-2" : "diapason-marcador-1";
    svg += `<circle cx="${x}" cy="${y}" r="7.5" class="diapason-marcador ${claseGrupo}" />`;
  });

  svg += "</svg>";
  return svg;
}

// Dibuja el diapasón dentro de un contenedor por id. Nunca lanza excepción hacia afuera:
// si algo falla, deja un aviso visible en el contenedor en vez de romper el resto del script
// que lo llama (por ejemplo, generarPregunta() seguiría ejecutándose con normalidad).
function renderizarDiapason(idContenedor, posiciones) {
  const contenedor = document.getElementById(idContenedor);
  if (!contenedor) return;

  try {
    contenedor.innerHTML = generarDiapasonSVG(posiciones);
  } catch (error) {
    contenedor.innerHTML = "";
    contenedor.textContent = "No se pudo dibujar el diapasón.";
    console.error("Error al dibujar el diapasón:", error);
  }
}