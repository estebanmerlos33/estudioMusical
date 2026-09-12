const pregunta = document.getElementById("pregunta");
const inputRespuesta = document.getElementById("respuesta");
const btnValidar = document.getElementById("btn-validar");
const btnNueva = document.getElementById("btn-nueva");
const resultado = document.getElementById("resultado");

let cuerdaActual = null;
let trasteActual = null;

function generarPregunta() {
  cuerdaActual = Math.floor(Math.random() * 6) + 1; // 1 a 6
  trasteActual = Math.floor(Math.random() * 13); // 0 a 12

  pregunta.textContent = `Cuerda ${cuerdaActual}, traste ${trasteActual}`;
  inputRespuesta.value = "";
  resultado.textContent = "";
  resultado.className = "resultado";
  inputRespuesta.focus();
}

function validarRespuesta() {
  const valor = inputRespuesta.value.trim();

  if (valor === "") {
    resultado.textContent = "Escribe una nota antes de validar.";
    resultado.className = "resultado incorrecto";
    return;
  }

  const notaCorrecta = obtenerNotaEnPosicion(cuerdaActual, trasteActual);

  if (!notaCorrecta) {
    resultado.textContent = "Error interno: no se pudo determinar la nota. Recarga la página (Ctrl+Shift+R).";
    resultado.className = "resultado incorrecto";
    return;
  }

  const esCorrecta = esNotaCorrecta(valor, notaCorrecta);

  if (esCorrecta) {
    resultado.textContent = "¡Correcto!";
    resultado.className = "resultado correcto";
  } else {
    resultado.textContent = `Incorrecto. La nota era: ${notaCorrecta}`;
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