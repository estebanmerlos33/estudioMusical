const selectDificultad = document.getElementById("dificultad");
const checkboxInversion = document.getElementById("aceptar-inversion");
const pregunta = document.getElementById("pregunta");
const inputRespuesta = document.getElementById("respuesta");
const btnValidar = document.getElementById("btn-validar");
const btnNueva = document.getElementById("btn-nueva");
const resultado = document.getElementById("resultado");

let notaBaseActual = null;
let notaDestinoActual = null;
let semitonosActuales = null;

function generarPregunta() {
  const maxSemitonos = Number(selectDificultad.value);
  const intervalo = generarIntervaloAleatorio(maxSemitonos);

  semitonosActuales = intervalo.semitonos;
  notaBaseActual = obtenerNotaAleatoria();
  notaDestinoActual = sumarSemitonos(notaBaseActual, semitonosActuales);

  pregunta.textContent = `${notaBaseActual}  →  ${notaDestinoActual}`;
  inputRespuesta.value = "";
  resultado.textContent = "";
  resultado.className = "resultado";
  inputRespuesta.focus();
}

function validarRespuesta() {
  const valor = inputRespuesta.value.trim();

  if (valor === "") {
    resultado.textContent = "Escribe un intervalo antes de validar.";
    resultado.className = "resultado incorrecto";
    return;
  }

  const aceptarInversion = checkboxInversion.checked;
  const nombreCorrecto = obtenerNombreIntervalo(semitonosActuales);

  if (!nombreCorrecto) {
    resultado.textContent = "Error interno: no se pudo determinar el intervalo. Recarga la página (Ctrl+Shift+R).";
    resultado.className = "resultado incorrecto";
    return;
  }

  const esCorrecta = esIntervaloCorrecto(valor, semitonosActuales, aceptarInversion);

  if (esCorrecta) {
    resultado.textContent = "¡Correcto!";
    resultado.className = "resultado correcto";
  } else {
    const nombreInvertido = obtenerNombreIntervaloInvertido(semitonosActuales);
    const sufijoInvertido = aceptarInversion && nombreInvertido
      ? ` (o ${nombreInvertido}, según el orden)`
      : "";
    resultado.textContent = `Incorrecto. El intervalo era: ${nombreCorrecto}${sufijoInvertido}`;
    resultado.className = "resultado incorrecto";
  }
}

btnValidar.addEventListener("click", validarRespuesta);
btnNueva.addEventListener("click", generarPregunta);
selectDificultad.addEventListener("change", generarPregunta);

inputRespuesta.addEventListener("keydown", (evento) => {
  if (evento.key === "Enter") {
    validarRespuesta();
  }
});

generarPregunta();