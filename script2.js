const pregunta = document.getElementById("pregunta");
const contenedorOpciones = document.getElementById("opciones-trastes");
const btnNueva = document.getElementById("btn-nueva");
const resultado = document.getElementById("resultado");

let cuerdaActual = null;
let notaActual = null;
let trastesValidosActuales = [];

// Devuelve todos los trastes (0 a 12) de una cuerda donde suena una nota dada.
// Puede haber más de uno: la cuerda al aire y su octava en el traste 12 son la misma nota,
// por eso los botones solo llegan hasta 11: el traste 0 siempre cubre también ese caso.
function obtenerTrastesValidos(cuerda, nota) {
  const trastes = [];
  for (let traste = 0; traste <= 12; traste++) {
    if (obtenerNotaEnPosicion(cuerda, traste) === nota) {
      trastes.push(traste);
    }
  }
  return trastes;
}

// Crea los 12 botones de traste (0 a 11) una sola vez (se reutilizan entre preguntas)
function crearBotonesTrastes() {
  for (let traste = 0; traste <= 11; traste++) {
    const boton = document.createElement("button");
    boton.type = "button";
    boton.className = "opcion-boton";
    boton.textContent = String(traste);
    boton.dataset.traste = String(traste);
    boton.addEventListener("click", () => seleccionarRespuesta(traste, boton));
    contenedorOpciones.appendChild(boton);
  }
}

function habilitarBotones() {
  contenedorOpciones.querySelectorAll(".opcion-boton").forEach((boton) => {
    boton.disabled = false;
    boton.classList.remove("correcta", "incorrecta");
  });
}

function deshabilitarBotones() {
  contenedorOpciones.querySelectorAll(".opcion-boton").forEach((boton) => {
    boton.disabled = true;
  });
}

function generarPregunta() {
  cuerdaActual = Math.floor(Math.random() * 6) + 1; // 1 a 6
  notaActual = obtenerNotaAleatoria();
  trastesValidosActuales = obtenerTrastesValidos(cuerdaActual, notaActual);

  pregunta.textContent = `Cuerda ${cuerdaActual}, nota ${notaActual}`;
  resultado.textContent = "";
  resultado.className = "resultado";
  habilitarBotones();
}

function seleccionarRespuesta(trasteElegido, botonElegido) {
  deshabilitarBotones();

  const esCorrecta = trastesValidosActuales.includes(trasteElegido);

  if (esCorrecta) {
    botonElegido.classList.add("correcta");
    resultado.textContent = "¡Correcto!";
    resultado.className = "resultado correcto";
  } else {
    botonElegido.classList.add("incorrecta");
    // Resaltar el/los traste(s) correcto(s) que estén visibles (0 a 11)
    trastesValidosActuales
      .filter((t) => t <= 11)
      .forEach((t) => {
        const botonCorrecto = contenedorOpciones.querySelector(`[data-traste="${t}"]`);
        if (botonCorrecto) botonCorrecto.classList.add("correcta");
      });
    const textoTrastes = trastesValidosActuales.join(" o ");
    resultado.textContent = `Incorrecto. El traste correcto era: ${textoTrastes}`;
    resultado.className = "resultado incorrecto";
  }
}

btnNueva.addEventListener("click", generarPregunta);

crearBotonesTrastes();
generarPregunta();