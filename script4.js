const selectDificultad = document.getElementById("dificultad");
const checkboxInversion = document.getElementById("aceptar-inversion");
const inputMaxTrastes = document.getElementById("max-trastes");
const inputMaxCuerdas = document.getElementById("max-cuerdas");
const pregunta = document.getElementById("pregunta");
const inputRespuesta = document.getElementById("respuesta");
const btnValidar = document.getElementById("btn-validar");
const btnNueva = document.getElementById("btn-nueva");
const resultado = document.getElementById("resultado");

let semitonosActuales = null;

function generarPregunta() {
  const maxSemitonos = Number(selectDificultad.value);
  const maxTrastes = Number(inputMaxTrastes.value);
  const maxCuerdas = Number(inputMaxCuerdas.value);

  let par;
  try {
    par = generarParPosicionesAleatorio(maxSemitonos, maxTrastes, maxCuerdas);
  } catch (error) {
    pregunta.textContent = "—";
    resultado.textContent = error.message;
    resultado.className = "resultado incorrecto";
    semitonosActuales = null;
    return;
  }

  semitonosActuales = par.semitonos;
  pregunta.textContent = `Cuerda ${par.cuerda1}, traste ${par.traste1}  →  Cuerda ${par.cuerda2}, traste ${par.traste2}`;
  inputRespuesta.value = "";
  resultado.textContent = "";
  resultado.className = "resultado";
  inputRespuesta.focus();
}

function validarRespuesta() {
  if (semitonosActuales === null) {
    resultado.textContent = "Ajusta los parámetros y genera una nueva pregunta primero.";
    resultado.className = "resultado incorrecto";
    return;
  }

  const valor = inputRespuesta.value.trim();

  if (valor === "") {
    resultado.textContent = "Escribe un intervalo antes de validar.";
    resultado.className = "resultado incorrecto";
    return;
  }

  const aceptarInversion = checkboxInversion.checked;
  const nombreCorrecto = obtenerNombreIntervalo(semitonosActuales);
  const esCorrecta = esIntervaloCorrecto(valor, semitonosActuales, aceptarInversion);

  if (esCorrecta) {
    resultado.textContent = "¡Correcto!";
    resultado.className = "resultado correcto";
  } else {
    const nombreInvertido = obtenerNombreIntervaloInvertido(semitonosActuales);
    const sufijoInvertido = aceptarInversion && nombreInvertido
      ? ` (o ${nombreInvertido}, según el orden)`
      : "";
    resultado.textContent = `Incorrecto. El intervalo era: ${nombreCorrecto}${sufijoInvertido} (${semitonosActuales} semitonos)`;
    resultado.className = "resultado incorrecto";
  }
}

btnValidar.addEventListener("click", validarRespuesta);
btnNueva.addEventListener("click", generarPregunta);
selectDificultad.addEventListener("change", generarPregunta);
inputMaxTrastes.addEventListener("change", generarPregunta);
inputMaxCuerdas.addEventListener("change", generarPregunta);

inputRespuesta.addEventListener("keydown", (evento) => {
  if (evento.key === "Enter") {
    validarRespuesta();
  }
});

generarPregunta();