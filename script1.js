const pregunta = document.getElementById("pregunta");
const contenedorOpciones = document.getElementById("opciones-notas");
const btnNueva = document.getElementById("btn-nueva");
const resultado = document.getElementById("resultado");

let cuerdaActual = null;
let trasteActual = null;
let notaCorrectaActual = null;

// Crea los 12 botones de nota una sola vez (se reutilizan entre preguntas)
function crearBotonesNotas() {
  notasOrden.forEach((nota) => {
    const boton = document.createElement("button");
    boton.type = "button";
    boton.className = "opcion-boton";
    boton.textContent = nota;
    boton.dataset.nota = nota;
    boton.addEventListener("click", () => seleccionarRespuesta(nota, boton));
    contenedorOpciones.appendChild(boton);
  });
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
  trasteActual = Math.floor(Math.random() * 13); // 0 a 12
  notaCorrectaActual = obtenerNotaEnPosicion(cuerdaActual, trasteActual);

  pregunta.textContent = `Cuerda ${cuerdaActual}, traste ${trasteActual}`;
  resultado.textContent = "";
  resultado.className = "resultado";
  habilitarBotones();
}

function seleccionarRespuesta(notaElegida, botonElegido) {
  deshabilitarBotones();

  const esCorrecta = notaElegida === notaCorrectaActual;

  if (esCorrecta) {
    botonElegido.classList.add("correcta");
    resultado.textContent = "¡Correcto!";
    resultado.className = "resultado correcto";
  } else {
    botonElegido.classList.add("incorrecta");
    const botonCorrecto = contenedorOpciones.querySelector(`[data-nota="${notaCorrectaActual}"]`);
    if (botonCorrecto) botonCorrecto.classList.add("correcta");
    resultado.textContent = `Incorrecto. La nota era: ${notaCorrectaActual}`;
    resultado.className = "resultado incorrecto";
  }
}

btnNueva.addEventListener("click", generarPregunta);

crearBotonesNotas();
generarPregunta();