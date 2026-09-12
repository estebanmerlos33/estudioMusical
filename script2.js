const pregunta = document.getElementById("pregunta");
const inputRespuesta = document.getElementById("respuesta");
const btnValidar = document.getElementById("btn-validar");
const btnNueva = document.getElementById("btn-nueva");
const resultado = document.getElementById("resultado");

let cuerdaActual = null;
let notaActual = null;
let trastesValidosActuales = [];

// Devuelve todos los trastes (0 a 12) de una cuerda donde suena una nota dada.
// Puede haber más de uno: la cuerda al aire y su octava en el traste 12 son la misma nota.
function obtenerTrastesValidos(cuerda, nota) {
  const trastes = [];
  for (let traste = 0; traste <= 12; traste++) {
    if (obtenerNotaEnPosicion(cuerda, traste) === nota) {
      trastes.push(traste);
    }
  }
  return trastes;
}

function generarPregunta() {
  cuerdaActual = Math.floor(Math.random() * 6) + 1; // 1 a 6
  notaActual = obtenerNotaAleatoria(); // una de las 12 notas (forma canónica)
  trastesValidosActuales = obtenerTrastesValidos(cuerdaActual, notaActual);

  pregunta.textContent = `Cuerda ${cuerdaActual}, nota ${notaActual}`;
  inputRespuesta.value = "";
  resultado.textContent = "";
  resultado.className = "resultado";
  inputRespuesta.focus();
}

function validarRespuesta() {
  const valor = inputRespuesta.value.trim();

  if (valor === "") {
    resultado.textContent = "Escribe un número de traste antes de validar.";
    resultado.className = "resultado incorrecto";
    return;
  }

  if (trastesValidosActuales.length === 0) {
    resultado.textContent = "Error interno: no se pudo determinar el traste. Recarga la página (Ctrl+Shift+R).";
    resultado.className = "resultado incorrecto";
    return;
  }

  const trasteIngresado = Number(valor);
  const esNumeroValido = Number.isInteger(trasteIngresado);
  const esCorrecta = esNumeroValido && trastesValidosActuales.includes(trasteIngresado);

  if (esCorrecta) {
    resultado.textContent = "¡Correcto!";
    resultado.className = "resultado correcto";
  } else {
    const textoTrastes = trastesValidosActuales.join(" o ");
    resultado.textContent = `Incorrecto. El traste correcto era: ${textoTrastes}`;
    resultado.className = "resultado incorrecto";
  }
}

btnValidar.addEventListener("click", validarRespuesta);
btnNueva.addEventListener("click", generarPregunta);

inputRespuesta.addEventListener("keydown", (evento) => {
  if (evento.key === "Enter") {
    validarRespuesta();
  }
});

generarPregunta();