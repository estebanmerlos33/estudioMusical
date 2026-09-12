// Posiciones (cuerda+traste) de las notas naturales en los primeros 12 trastes
// cuerda 1 = Mi agudo ... cuerda 6 = Mi grave (afinación estándar)
const notasNaturales = {
  "Do":  [68, 53, 410, 35, 21, 18],
  "Re":  [610, 55, 40, 412, 37, 23, 110],
  "Mi":  [60, 612, 57, 42, 39, 25, 10, 112],
  "Fa":  [61, 58, 43, 310, 26, 11],
  "Sol": [63, 510, 45, 30, 312, 28, 13],
  "La":  [65, 50, 512, 47, 32, 210, 15],
  "Si":  [67, 52, 49, 34, 20, 212, 17]
};

// Posiciones de las notas alteradas, nombradas como sostenido (forma canónica)
const notasSostenidos = {
  "Do#":  [69, 54, 411, 36, 22, 19],
  "Re#":  [611, 56, 41, 38, 24, 111],
  "Fa#":  [62, 59, 44, 311, 27, 12],
  "Sol#": [64, 511, 46, 31, 29, 14],
  "La#":  [66, 51, 48, 33, 211, 16]
};

// Nombres equivalentes en bemol para cada nota sostenida (mismas posiciones, distinto nombre)
const notasBemoles = {
  "Reb":  notasSostenidos["Do#"],
  "Mib":  notasSostenidos["Re#"],
  "Solb": notasSostenidos["Fa#"],
  "Lab":  notasSostenidos["Sol#"],
  "Sib":  notasSostenidos["La#"]
};

// Mapa "sostenido normalizado" -> "bemol normalizado equivalente", para aceptar ambas respuestas
const equivalenciasBemolASostenido = {
  "reb":  "do#",
  "mib":  "re#",
  "solb": "fa#",
  "lab":  "sol#",
  "sib":  "la#"
};

// Tabla combinada (naturales + sostenidos) usada para determinar la nota en una posición.
// Los bemoles no se incluyen aquí porque son solo nombres alternativos de las mismas posiciones.
const notasTrastes = { ...notasNaturales, ...notasSostenidos };

// Mapa inverso "cuerdaTraste" -> nota (en su forma canónica, con sostenido)
const posicionANota = {};
for (const nota in notasTrastes) {
  notasTrastes[nota].forEach((posicion) => {
    posicionANota[posicion] = nota;
  });
}

function obtenerNotaEnPosicion(cuerda, traste) {
  const clave = Number(`${cuerda}${traste}`);
  return posicionANota[clave];
}

// Quita tildes/acentos para que "séptima" y "septima" se traten igual
function quitarAcentos(texto) {
  return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

// Mapa de ordinal en palabra completa -> abreviatura usada en intervalosPorSemitono
// Ordenado de más larga a más corta para evitar coincidencias parciales incorrectas
const ordinalesPalabraAAbreviatura = [
  ["decimocuarta", "14na"],
  ["decimotercera", "13na"],
  ["duodecima", "12ma"],
  ["undecima", "11na"],
  ["catorceava", "14na"],
  ["doceava", "12ma"],
  ["trecena", "13na"],
  ["oncena", "11na"],
  ["septima", "7ma"],
  ["decima", "10ma"],
  ["novena", "9na"],
  ["octava", "8va"],
  ["sexta", "6ta"],
  ["quinta", "5ta"],
  ["cuarta", "4ta"],
  ["tercera", "3ra"],
  ["segunda", "2da"]
].sort((a, b) => b[0].length - a[0].length);

// Reemplaza cada ordinal en palabra completa por su abreviatura (respetando límites de palabra)
function reemplazarOrdinalesPorAbreviatura(texto) {
  let resultado = texto;
  ordinalesPalabraAAbreviatura.forEach(([palabra, abreviatura]) => {
    const patron = new RegExp(`\\b${palabra}\\b`, "g");
    resultado = resultado.replace(patron, abreviatura);
  });
  return resultado;
}

// Normaliza texto libre: sin tildes, minúsculas, ordinales en palabra -> abreviatura,
// "sostenido"->"#", "bemol"->"b", sin espacios
function normalizarTexto(texto) {
  let resultado = texto.trim().toLowerCase();
  resultado = quitarAcentos(resultado);
  resultado = reemplazarOrdinalesPorAbreviatura(resultado);
  resultado = resultado
    .replace("sostenido", "#")
    .replace("bemol", "b")
    .replace(/\s+/g, "");
  return resultado;
}

// Compara la respuesta del usuario contra la nota correcta (forma canónica con sostenido),
// aceptando también el nombre equivalente en bemol (ej: "Do#" === "Reb")
function esNotaCorrecta(respuestaUsuario, notaCorrecta) {
  const valor = normalizarTexto(respuestaUsuario);
  const correcta = normalizarTexto(notaCorrecta);

  if (valor === correcta) return true;

  const valorComoSostenido = equivalenciasBemolASostenido[valor];
  return valorComoSostenido === correcta;
}

// ==========================================================================
// Intervalos musicales
// ==========================================================================

// Nombre(s) del intervalo según la distancia en semitonos.
// Algunos semitonos aceptan más de un nombre válido (equivalencia enarmónica).
// Cubre hasta 24 semitonos (dos octavas) para permitir ejercicios con intervalos compuestos.
const intervalosPorSemitono = {
  0:  ["Unísono"],
  1:  ["2da menor"],
  2:  ["2da mayor"],
  3:  ["3ra menor"],
  4:  ["3ra mayor"],
  5:  ["4ta justa"],
  6:  ["4ta aumentada", "5ta disminuida"],
  7:  ["5ta justa"],
  8:  ["6ta menor"],
  9:  ["6ta mayor"],
  10: ["7ma menor"],
  11: ["7ma mayor"],
  12: ["8va justa"],
  13: ["9na menor"],
  14: ["9na mayor"],
  15: ["10ma menor", "9na aumentada"],
  16: ["10ma mayor"],
  17: ["11na justa"],
  18: ["11na aumentada", "12ma disminuida"],
  19: ["12ma justa"],
  20: ["13na menor"],
  21: ["13na mayor"],
  22: ["14na menor"],
  23: ["14na mayor"],
  24: ["Doble octava"]
};

// Máximo de semitonos que la tabla soporta actualmente
const SEMITONOS_MAXIMO_DISPONIBLE = Math.max(
  ...Object.keys(intervalosPorSemitono).map(Number)
);

// Devuelve todos los nombres válidos para un intervalo dado (por su distancia en semitonos)
function obtenerNombresIntervalo(semitonos) {
  return intervalosPorSemitono[semitonos];
}

// Devuelve el nombre "canónico" (el primero de la lista) de un intervalo
function obtenerNombreIntervalo(semitonos) {
  const nombres = obtenerNombresIntervalo(semitonos);
  return nombres ? nombres[0] : undefined;
}

// Genera un intervalo aleatorio dentro de un rango de semitonos parametrizable.
// maxSemitonos: distancia máxima a preguntar (ej: 11 = hasta 7ma mayor, 13 = hasta 9na menor)
// minSemitonos: distancia mínima a preguntar (por defecto 1, para excluir el unísono)
function generarIntervaloAleatorio(maxSemitonos, minSemitonos = 1) {
  const limiteSuperior = Math.min(maxSemitonos, SEMITONOS_MAXIMO_DISPONIBLE);
  const limiteInferior = Math.max(minSemitonos, 0);

  if (limiteInferior > limiteSuperior) {
    throw new Error(`Rango de semitonos inválido: ${limiteInferior} a ${limiteSuperior}`);
  }

  const semitonos = Math.floor(Math.random() * (limiteSuperior - limiteInferior + 1)) + limiteInferior;

  return {
    semitonos,
    nombre: obtenerNombreIntervalo(semitonos),
    nombresAceptados: obtenerNombresIntervalo(semitonos)
  };
}

// Devuelve la distancia en semitonos del intervalo "invertido" (si se toma la otra nota como referencia).
// Solo aplica a intervalos simples (0 a 12 semitonos): la inversión de un intervalo simple es
// siempre 12 - semitonos (ej: 2da menor(1) <-> 7ma mayor(11), unísono(0) <-> 8va justa(12)).
// Para intervalos compuestos (>12 semitonos) no se ofrece inversión, ya que es ambiguo cuántas
// octavas de por medio corresponden invertir.
function obtenerSemitonosInvertidos(semitonos) {
  if (semitonos < 0 || semitonos > 12) return undefined;
  return 12 - semitonos;
}

// Devuelve el nombre canónico del intervalo invertido (o undefined si no aplica)
function obtenerNombreIntervaloInvertido(semitonos) {
  const invertido = obtenerSemitonosInvertidos(semitonos);
  return invertido === undefined ? undefined : obtenerNombreIntervalo(invertido);
}

// Valida si el nombre de intervalo ingresado por el usuario corresponde a la distancia en semitonos dada,
// aceptando cualquiera de sus nombres equivalentes (ej: "4ta aumentada" o "5ta disminuida" para 6 semitonos).
// Si aceptarInversion=true, también acepta el nombre del intervalo invertido (tomando la otra nota como
// referencia), ej: para 1 semitono también aceptaría "7ma mayor" además de "2da menor".
function esIntervaloCorrecto(respuestaUsuario, semitonos, aceptarInversion = false) {
  const valorNormalizado = normalizarTexto(respuestaUsuario);

  const nombresAceptados = obtenerNombresIntervalo(semitonos);
  if (nombresAceptados && nombresAceptados.some((nombre) => normalizarTexto(nombre) === valorNormalizado)) {
    return true;
  }

  if (!aceptarInversion) return false;

  const semitonosInvertidos = obtenerSemitonosInvertidos(semitonos);
  if (semitonosInvertidos === undefined) return false;

  const nombresInvertidos = obtenerNombresIntervalo(semitonosInvertidos);
  if (!nombresInvertidos) return false;

  return nombresInvertidos.some((nombre) => normalizarTexto(nombre) === valorNormalizado);
}

// Orden cromático de las 12 notas en su forma canónica (con sostenidos)
const notasOrden = ["Do", "Do#", "Re", "Re#", "Mi", "Fa", "Fa#", "Sol", "Sol#", "La", "La#", "Si"];

// Devuelve la nota resultante de sumar una cantidad de semitonos a una nota base (forma canónica, cíclico)
function sumarSemitonos(notaBase, semitonos) {
  const indiceBase = notasOrden.indexOf(notaBase);
  if (indiceBase === -1) return undefined;

  const indiceResultado = ((indiceBase + semitonos) % 12 + 12) % 12;
  return notasOrden[indiceResultado];
}

// Devuelve una nota aleatoria (forma canónica) entre las 12 disponibles
function obtenerNotaAleatoria() {
  return notasOrden[Math.floor(Math.random() * notasOrden.length)];
}

// ==========================================================================
// Posiciones físicas del diapasón (para el ejercicio de intervalo por trastes)
// ==========================================================================

// Semitonos de la nota al aire de cada cuerda respecto a la cuerda 6 (Mi grave), afinación estándar
const semitonosAperturaCuerda = { 6: 0, 5: 5, 4: 10, 3: 15, 2: 19, 1: 24 };

// Semitono absoluto (altura real, no clase de nota) de una posición cuerda+traste
function obtenerSemitonoAbsoluto(cuerda, traste) {
  return semitonosAperturaCuerda[cuerda] + traste;
}

// Genera un par de posiciones aleatorias (cuerda+traste) válidas según tres límites:
// - maxSemitonos: intervalo máximo permitido entre ambas posiciones (igual que en generarIntervaloAleatorio)
// - maxDistanciaTrastes: cantidad máxima de trastes que puede abarcar el par (a lo ancho).
//   Ej: 3 permite diferencias de 0, 1 o 2 trastes (abarca hasta 3 columnas), pero no una diferencia de 3.
// - maxDistanciaCuerdas: cantidad máxima de cuerdas que puede abarcar el par (a lo alto), misma lógica.
// Enumera todas las combinaciones válidas del diapasón (78x78, computacionalmente trivial) y elige una al azar.
function generarParPosicionesAleatorio(maxSemitonos, maxDistanciaTrastes, maxDistanciaCuerdas) {
  const semitonosTope = Math.min(maxSemitonos, SEMITONOS_MAXIMO_DISPONIBLE);
  const candidatos = [];

  for (let cuerda1 = 1; cuerda1 <= 6; cuerda1++) {
    for (let traste1 = 0; traste1 <= 12; traste1++) {
      for (let cuerda2 = 1; cuerda2 <= 6; cuerda2++) {
        for (let traste2 = 0; traste2 <= 12; traste2++) {
          if (cuerda1 === cuerda2 && traste1 === traste2) continue; // misma posición exacta

          const diferenciaCuerdas = Math.abs(cuerda1 - cuerda2);
          const diferenciaTrastes = Math.abs(traste1 - traste2);
          if (diferenciaCuerdas >= maxDistanciaCuerdas) continue;
          if (diferenciaTrastes >= maxDistanciaTrastes) continue;

          const semitonos = Math.abs(
            obtenerSemitonoAbsoluto(cuerda1, traste1) - obtenerSemitonoAbsoluto(cuerda2, traste2)
          );
          if (semitonos > semitonosTope) continue;

          candidatos.push({ cuerda1, traste1, cuerda2, traste2, semitonos });
        }
      }
    }
  }

  if (candidatos.length === 0) {
    throw new Error("No hay combinaciones válidas con estos parámetros. Prueba aumentar los límites.");
  }

  return candidatos[Math.floor(Math.random() * candidatos.length)];
}