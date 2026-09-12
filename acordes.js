// ==========================================================================
// Sistema de deletreo diatónico de notas (letra + alteración), necesario para
// que un acorde use el nombre de nota correcto según la estructura de grados
// funcionales (I-VII), no según cuál nombre sea "más común".
// Requiere que diapason.js esté cargado antes (usa notasOrden, quitarAcentos).
// ==========================================================================

const letrasEscala = ["Do", "Re", "Mi", "Fa", "Sol", "La", "Si"];
const semitonoNaturalPorLetra = { Do: 0, Re: 2, Mi: 4, Fa: 5, Sol: 7, La: 9, Si: 11 };

// Separa el nombre canónico de una raíz (tal como se usa en toda la app: Do, Do#, Re, Re#...)
// en letra + alteración. Las raíces canónicas siempre son naturales o con un solo sostenido.
function separarNotaCanonica(notaCanonica) {
  if (notaCanonica.endsWith("#")) {
    return { letra: notaCanonica.slice(0, -1), alteracion: 1 };
  }
  return { letra: notaCanonica, alteracion: 0 };
}

function alteracionASufijo(alteracion) {
  if (alteracion === 0) return "";
  return alteracion > 0 ? "#".repeat(alteracion) : "b".repeat(-alteracion);
}

function nombreNota(notaDeletreada) {
  return `${notaDeletreada.letra}${alteracionASufijo(notaDeletreada.alteracion)}`;
}

function letraPorIndice(indice) {
  return letrasEscala[((indice % 7) + 7) % 7];
}

function indiceDeLetra(letra) {
  return letrasEscala.indexOf(letra);
}

// Calcula la nota resultante de aplicar un grado a una raíz deletreada, contando LETRAS
// de la escala (no semitonos) para decidir qué letra usar, y luego alterándola lo necesario
// para llegar al semitono exacto pedido. Esto es lo que hace que Re->Fa# sea correcto (3er
// grado de Re, contando Re-Mi-Fa) y Re->Solb sea incorrecto (Sol es el 4to grado, no el 3ro).
//   letterSteps: cuántas letras de la escala hay que avanzar (3ra=2, 5ta=4, 7ma=6, 9na=1, 11na=3, 13na=5)
//   semitonos: distancia cromática exacta desde la raíz que debe tener el resultado
function calcularNotaDeGrado(raizDeletreada, letterSteps, semitonos) {
  const semitonoRaizAbsoluto = ((semitonoNaturalPorLetra[raizDeletreada.letra] + raizDeletreada.alteracion) % 12 + 12) % 12;

  const letraResultado = letraPorIndice(indiceDeLetra(raizDeletreada.letra) + letterSteps);
  const semitonoNaturalResultado = semitonoNaturalPorLetra[letraResultado];

  const semitonoObjetivo = ((semitonoRaizAbsoluto + semitonos) % 12 + 12) % 12;

  let diferencia = semitonoObjetivo - semitonoNaturalResultado;
  if (diferencia > 6) diferencia -= 12;
  if (diferencia < -6) diferencia += 12;

  return { letra: letraResultado, alteracion: diferencia };
}

// ==========================================================================
// Recetas de acordes: cada grado es [letterSteps, semitonosDesdeLaRaiz]
// Los acordes con extensión (9na/11na/13na) se arman como "shell" de 4 notas
// (raíz - 3ra - 7ma - extensión, sin la 5ta), voicing estándar para mantenerlos
// en 4 notas y consistentes con el resto de las tétradas.
// ==========================================================================

// ==========================================================================
// Recetas de acordes: cada grado es { grado, letterSteps, semitonos }
//   grado: número de grado según cifrado americano (1,2,3,4,5,7,9,11,13) — se usa
//          solo para generar la fórmula en números romanos, no afecta el cálculo.
//   letterSteps: cuántas letras de la escala avanzar desde la raíz (3ra=2, 5ta=4, etc.)
//   semitonos: distancia cromática exacta desde la raíz que debe tener la nota resultante
// Los acordes con extensión (9na/11na/13na) se arman como "shell" de 4 notas
// (raíz - 3ra - 7ma - extensión, sin la 5ta), voicing estándar para mantenerlos
// en 4 notas y consistentes con el resto de las tétradas.
// ==========================================================================

const recetasAcordes = {
  mayor: {
    cantidadNotas: 3,
    grados: [{ grado: 1, letterSteps: 0, semitonos: 0 }, { grado: 3, letterSteps: 2, semitonos: 4 }, { grado: 5, letterSteps: 4, semitonos: 7 }]
  },
  menor: {
    cantidadNotas: 3,
    grados: [{ grado: 1, letterSteps: 0, semitonos: 0 }, { grado: 3, letterSteps: 2, semitonos: 3 }, { grado: 5, letterSteps: 4, semitonos: 7 }]
  },
  aumentado: {
    cantidadNotas: 3,
    grados: [{ grado: 1, letterSteps: 0, semitonos: 0 }, { grado: 3, letterSteps: 2, semitonos: 4 }, { grado: 5, letterSteps: 4, semitonos: 8 }]
  },
  disminuido: {
    cantidadNotas: 3,
    grados: [{ grado: 1, letterSteps: 0, semitonos: 0 }, { grado: 3, letterSteps: 2, semitonos: 3 }, { grado: 5, letterSteps: 4, semitonos: 6 }]
  },
  sus2: {
    cantidadNotas: 3,
    grados: [{ grado: 1, letterSteps: 0, semitonos: 0 }, { grado: 2, letterSteps: 1, semitonos: 2 }, { grado: 5, letterSteps: 4, semitonos: 7 }]
  },
  sus4: {
    cantidadNotas: 3,
    grados: [{ grado: 1, letterSteps: 0, semitonos: 0 }, { grado: 4, letterSteps: 3, semitonos: 5 }, { grado: 5, letterSteps: 4, semitonos: 7 }]
  },
  maj7: {
    cantidadNotas: 4,
    grados: [{ grado: 1, letterSteps: 0, semitonos: 0 }, { grado: 3, letterSteps: 2, semitonos: 4 }, { grado: 5, letterSteps: 4, semitonos: 7 }, { grado: 7, letterSteps: 6, semitonos: 11 }]
  },
  m7: {
    cantidadNotas: 4,
    grados: [{ grado: 1, letterSteps: 0, semitonos: 0 }, { grado: 3, letterSteps: 2, semitonos: 3 }, { grado: 5, letterSteps: 4, semitonos: 7 }, { grado: 7, letterSteps: 6, semitonos: 10 }]
  },
  "7": {
    cantidadNotas: 4,
    grados: [{ grado: 1, letterSteps: 0, semitonos: 0 }, { grado: 3, letterSteps: 2, semitonos: 4 }, { grado: 5, letterSteps: 4, semitonos: 7 }, { grado: 7, letterSteps: 6, semitonos: 10 }]
  },
  semidisminuido: {
    cantidadNotas: 4,
    grados: [{ grado: 1, letterSteps: 0, semitonos: 0 }, { grado: 3, letterSteps: 2, semitonos: 3 }, { grado: 5, letterSteps: 4, semitonos: 6 }, { grado: 7, letterSteps: 6, semitonos: 10 }]
  },
  dim7: {
    cantidadNotas: 4,
    grados: [{ grado: 1, letterSteps: 0, semitonos: 0 }, { grado: 3, letterSteps: 2, semitonos: 3 }, { grado: 5, letterSteps: 4, semitonos: 6 }, { grado: 7, letterSteps: 6, semitonos: 9 }]
  },
  "9na": {
    cantidadNotas: 4,
    grados: [{ grado: 1, letterSteps: 0, semitonos: 0 }, { grado: 3, letterSteps: 2, semitonos: 4 }, { grado: 7, letterSteps: 6, semitonos: 10 }, { grado: 9, letterSteps: 1, semitonos: 14 }]
  },
  "11na": {
    cantidadNotas: 4,
    grados: [{ grado: 1, letterSteps: 0, semitonos: 0 }, { grado: 3, letterSteps: 2, semitonos: 4 }, { grado: 7, letterSteps: 6, semitonos: 10 }, { grado: 11, letterSteps: 3, semitonos: 17 }]
  },
  "13na": {
    cantidadNotas: 4,
    grados: [{ grado: 1, letterSteps: 0, semitonos: 0 }, { grado: 3, letterSteps: 2, semitonos: 4 }, { grado: 7, letterSteps: 6, semitonos: 10 }, { grado: 13, letterSteps: 5, semitonos: 21 }]
  }
};

const nombresLegiblesAcordes = {
  mayor: "Mayor",
  menor: "Menor",
  aumentado: "Aumentado",
  disminuido: "Disminuido",
  sus2: "Suspendido 2 (sus2)",
  sus4: "Suspendido 4 (sus4)",
  maj7: "Maj7 (7ma mayor)",
  m7: "m7 (menor con 7ma menor)",
  "7": "7 (dominante)",
  semidisminuido: "Semidisminuido (m7b5)",
  dim7: "Disminuido 7 (dim7)",
  "9na": "9 (dominante, sin 5ta)",
  "11na": "11 (dominante, sin 5ta)",
  "13na": "13 (dominante, sin 5ta)"
};

// ==========================================================================
// Fórmula del acorde en números romanos (ej: menor -> "I - IIIb - V")
// ==========================================================================

const numeroRomanoPorGrado = { 1: "I", 2: "II", 3: "III", 4: "IV", 5: "V", 6: "VI", 7: "VII", 9: "IX", 11: "XI", 13: "XIII" };

// Semitonos "por defecto" de cada grado tomando la escala mayor como referencia (diatónico, sin alterar)
const semitonoDiatonicoPorGrado = { 1: 0, 2: 2, 3: 4, 4: 5, 5: 7, 6: 9, 7: 11, 9: 14, 11: 17, 13: 21 };

function alteracionFormulaASufijo(diferencia) {
  if (diferencia === 0) return "";
  return diferencia > 0 ? "#".repeat(diferencia) : "b".repeat(-diferencia);
}

// Devuelve la fórmula del acorde como string, ej: "I - IIIb - V" para menor
function obtenerFormulaAcorde(tipoAcorde) {
  const receta = recetasAcordes[tipoAcorde];
  if (!receta) return "";

  return receta.grados
    .map(({ grado, semitonos }) => {
      const diferencia = semitonos - semitonoDiatonicoPorGrado[grado];
      return `${numeroRomanoPorGrado[grado]}${alteracionFormulaASufijo(diferencia)}`;
    })
    .join(" - ");
}

const nombresInversion = {
  0: "Natural (posición fundamental)",
  1: "1ra inversión",
  2: "2da inversión",
  3: "3ra inversión"
};

// Devuelve los nombres de receta (keys de recetasAcordes) que tienen exactamente esa cantidad de notas
function obtenerTiposAcordePorCantidad(cantidadNotas) {
  return Object.keys(recetasAcordes).filter(
    (tipo) => recetasAcordes[tipo].cantidadNotas === cantidadNotas
  );
}

// Genera un acorde aleatorio (raíz siempre aleatoria; tipo e inversión aleatorios o fijados por parámetro).
// tipoAcorde: nombre de receta válido, o "aleatorio" para elegir uno al azar entre los de esa cantidad de notas
// inversion: número entre 0 y (cantidadNotas-1), o "aleatoria" para elegir una al azar
function generarAcordeAleatorio(cantidadNotas, tipoAcorde, inversion) {
  const tiposDisponibles = obtenerTiposAcordePorCantidad(cantidadNotas);
  if (tiposDisponibles.length === 0) {
    throw new Error(`No hay acordes definidos con ${cantidadNotas} notas.`);
  }

  const tipoElegido = tipoAcorde === "aleatorio"
    ? tiposDisponibles[Math.floor(Math.random() * tiposDisponibles.length)]
    : tipoAcorde;

  const receta = recetasAcordes[tipoElegido];
  if (!receta || receta.cantidadNotas !== cantidadNotas) {
    throw new Error(`Tipo de acorde inválido para ${cantidadNotas} notas: ${tipoElegido}`);
  }

  const inversionMaxima = receta.cantidadNotas - 1;
  const inversionElegida = inversion === "aleatoria"
    ? Math.floor(Math.random() * receta.cantidadNotas)
    : Number(inversion);

  if (!Number.isInteger(inversionElegida) || inversionElegida < 0 || inversionElegida > inversionMaxima) {
    throw new Error(`Inversión inválida (${inversion}) para un acorde de ${receta.cantidadNotas} notas.`);
  }

  const raizCanonica = obtenerNotaAleatoria(); // de diapason.js: Do, Do#, Re, Re#... (siempre natural o un sostenido)
  const raizDeletreada = separarNotaCanonica(raizCanonica);

  const notasEnPosicionFundamental = receta.grados.map(({ letterSteps, semitonos }) =>
    nombreNota(calcularNotaDeGrado(raizDeletreada, letterSteps, semitonos))
  );

  const notasSegunInversion = notasEnPosicionFundamental
    .slice(inversionElegida)
    .concat(notasEnPosicionFundamental.slice(0, inversionElegida));

  return {
    raiz: nombreNota(raizDeletreada),
    tipoAcorde: tipoElegido,
    nombreTipoAcorde: nombresLegiblesAcordes[tipoElegido],
    inversion: inversionElegida,
    nombreInversion: nombresInversion[inversionElegida],
    notasEnPosicionFundamental,
    notasEsperadas: notasSegunInversion
  };
}

// ==========================================================================
// Validación de la respuesta del usuario
// ==========================================================================

// Normaliza la respuesta COMPLETA antes de separarla en notas: sin tildes, minúsculas,
// "sostenido"->"#" y "bemol"->"b" aplicados sobre todo el texto (para que "Fa sostenido"
// se convierta en "fa#" antes de que el espacio interno se interprete como separador de notas).
// Separa la respuesta libre del usuario en notas individuales (acepta "-", "," o espacios como
// separador), fusionando las palabras sueltas "sostenido"/"bemol" con la nota anterior
// (ej: "Fa sostenido" -> "fa#"), sin importar cuántos espacios haya alrededor.
function parsearNotasRespuesta(texto) {
  const palabras = quitarAcentos(texto.trim().toLowerCase())
    .split(/[-,\s]+/)
    .map((palabra) => palabra.trim())
    .filter((palabra) => palabra.length > 0);

  const tokens = [];
  palabras.forEach((palabra) => {
    if (palabra === "sostenido" && tokens.length > 0) {
      tokens[tokens.length - 1] += "#";
    } else if (palabra === "bemol" && tokens.length > 0) {
      tokens[tokens.length - 1] += "b";
    } else {
      tokens.push(palabra);
    }
  });

  return tokens;
}

// Normaliza el nombre de una nota YA esperada (ej "Fa#") para comparación: sin tildes, minúsculas.
// A propósito NO aplica equivalencia enarmónica (a diferencia de esNotaCorrecta en diapason.js):
// en este ejercicio el deletreo exacto importa (Fa# y Solb no son intercambiables como respuesta).
function normalizarNombreNotaEstricto(nombreNota) {
  return quitarAcentos(nombreNota.trim().toLowerCase());
}

// Compara la respuesta del usuario contra las notas esperadas, en el mismo orden exacto,
// con deletreo exacto (no acepta equivalencias enarmónicas)
function esAcordeCorrecto(respuestaUsuario, notasEsperadas) {
  const tokensUsuario = parsearNotasRespuesta(respuestaUsuario);
  const tokensEsperados = notasEsperadas.map(normalizarNombreNotaEstricto);

  if (tokensUsuario.length !== tokensEsperados.length) return false;

  return tokensUsuario.every((token, indice) => token === tokensEsperados[indice]);
}

// ==========================================================================
// Reconocimiento de tipo de acorde a partir de texto libre (para el ejercicio
// de identificación, donde el usuario escribe el tipo con sus propias palabras)
// ==========================================================================

const aliasPorTipoAcorde = {
  mayor:          ["mayor", "maj", "major"],
  menor:          ["menor", "min", "minor"],
  aumentado:      ["aumentado", "aum", "aug", "augmented", "+"],
  disminuido:     ["disminuido", "dim", "diminished"],
  sus2:           ["sus2", "suspendido2", "suspendida2"],
  sus4:           ["sus4", "suspendido4", "suspendida4"],
  maj7:           ["maj7", "major7", "7maj", "7major"],
  m7:             ["m7", "min7", "menor7"],
  "7":            ["7", "dominante", "7dominante", "dominante7", "dom7"],
  semidisminuido: ["semidisminuido", "m7b5", "semidim", "mediodisminuido"],
  dim7:           ["dim7", "disminuido7", "diminished7"],
  "9na":          ["9", "9na", "novena"],
  "11na":         ["11", "11na", "oncena", "onceava"],
  "13na":         ["13", "13na", "trecena", "treceava"]
};

// Mapa inverso "alias normalizado" -> tipo canónico (key de recetasAcordes)
const aliasNormalizadoATipoAcorde = {};
Object.keys(aliasPorTipoAcorde).forEach((tipo) => {
  aliasPorTipoAcorde[tipo].forEach((alias) => {
    aliasNormalizadoATipoAcorde[alias] = tipo;
  });
});

function normalizarTipoAcordeTexto(texto) {
  return quitarAcentos(texto.trim().toLowerCase()).replace(/\s+/g, "");
}

// Reconoce el tipo de acorde (canónico) a partir de texto libre del usuario, o undefined si no matchea
function reconocerTipoAcorde(texto) {
  return aliasNormalizadoATipoAcorde[normalizarTipoAcordeTexto(texto)];
}

// Separa la respuesta "Re menor" / "Sol 7 dominante" en { notaTexto: "Re", tipoTexto: "menor" }.
// La nota se asume como el primer token; el resto de la respuesta es el tipo de acorde.
function parsearRespuestaIdentificacionAcorde(texto) {
  const limpio = texto.trim();
  const indicePrimerEspacio = limpio.search(/\s/);

  if (indicePrimerEspacio === -1) {
    return { notaTexto: limpio, tipoTexto: "" };
  }

  return {
    notaTexto: limpio.slice(0, indicePrimerEspacio),
    tipoTexto: limpio.slice(indicePrimerEspacio + 1)
  };
}

// Valida la respuesta de identificación de acorde: raíz correcta (acepta equivalencia
// enarmónica, como en los ejercicios 1-4) + tipo de acorde reconocido correctamente.
// No exige identificar la inversión, solo la raíz y el tipo del acorde.
function esIdentificacionAcordeCorrecta(respuestaUsuario, acorde) {
  const { notaTexto, tipoTexto } = parsearRespuestaIdentificacionAcorde(respuestaUsuario);
  if (!notaTexto || !tipoTexto) return false;

  const notaCorrecta = esNotaCorrecta(notaTexto, acorde.raiz);
  const tipoReconocido = reconocerTipoAcorde(tipoTexto);

  return notaCorrecta && tipoReconocido === acorde.tipoAcorde;
}