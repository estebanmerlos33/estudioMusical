const selectDificultad = document.getElementById("dificultad");
const checkboxInversion = document.getElementById("aceptar-inversion");
const pregunta = document.getElementById("pregunta");
const contenedorOpciones = document.getElementById("opciones-intervalo");
const btnNueva = document.getElementById("btn-nueva");
const resultado = document.getElementById("resultado");

let notaBaseActual = null;
let notaDestinoActual = null;
let semitonosActuales = null;

// Crea (o recrea) los botones de intervalo según el rango máximo elegido.
// Empieza en 1 (no en 0/Unísono), ya que generarIntervaloAleatorio nunca genera un unísono aquí.
function poblarBotonesIntervalo() {
  const maxSemitonos = Number(selectDificultad.value);
  contenedorOpciones.innerHTML = "";

  for (let semitonos = 1; semitonos <= maxSemitonos; semitonos++) {
    const [principal, alterna] = abreviaturaIntervaloPorSemitono[semitonos];

    const boton = document.createElement("button");
    boton.type = "button";
    boton.className = "opcion-boton";
    boton.dataset.semitonos = String(semitonos);
    boton.innerHTML = alterna
      ? `${principal}<span class="nota-alt">${alterna}</span>`
      : principal;

    boton.addEventListener("click", () => seleccionarRespuesta(semitonos, boton));
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
  const maxSemitonos = Number(selectDificultad.value);
  const intervalo = generarIntervaloAleatorio(maxSemitonos);

  semitonosActuales = intervalo.semitonos;
  notaBaseActual = obtenerNotaAleatoria();
  notaDestinoActual = sumarSemitonos(notaBaseActual, semitonosActuales);

  pregunta.textContent = `${notaBaseActual}  →  ${notaDestinoActual}`;
  resultado.textContent = "";
  resultado.className = "resultado";
  habilitarBotones();
}

function seleccionarRespuesta(semitonosElegidos, botonElegido) {
  deshabilitarBotones();

  const aceptarInversion = checkboxInversion.checked;
  const semitonosInvertidos = obtenerSemitonosInvertidos(semitonosActuales);
  const esCorrecta =
    semitonosElegidos === semitonosActuales ||
    (aceptarInversion && semitonosElegidos === semitonosInvertidos);

  if (esCorrecta) {
    botonElegido.classList.add("correcta");
    resultado.textContent = "¡Correcto!";
    resultado.className = "resultado correcto";
    return;
  }

  botonElegido.classList.add("incorrecta");

  const botonPrincipal = contenedorOpciones.querySelector(`[data-semitonos="${semitonosActuales}"]`);
  if (botonPrincipal) botonPrincipal.classList.add("correcta");

  if (aceptarInversion && semitonosInvertidos !== undefined && semitonosInvertidos !== semitonosActuales) {
    const botonInvertido = contenedorOpciones.querySelector(`[data-semitonos="${semitonosInvertidos}"]`);
    if (botonInvertido) botonInvertido.classList.add("correcta");
  }

  const nombreCorrecto = obtenerNombreIntervalo(semitonosActuales);
  const nombreInvertido = obtenerNombreIntervaloInvertido(semitonosActuales);
  const sufijoInvertido = aceptarInversion && nombreInvertido
    ? ` (o ${nombreInvertido}, según el orden)`
    : "";
  resultado.textContent = `Incorrecto. El intervalo era: ${nombreCorrecto}${sufijoInvertido}`;
  resultado.className = "resultado incorrecto";
}

function actualizarPorCambioDeDificultad() {
  poblarBotonesIntervalo();
  generarPregunta();
}

btnNueva.addEventListener("click", generarPregunta);
selectDificultad.addEventListener("change", actualizarPorCambioDeDificultad);

poblarBotonesIntervalo();
generarPregunta();