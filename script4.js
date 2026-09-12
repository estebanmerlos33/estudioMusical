const selectDificultad = document.getElementById("dificultad");
const checkboxInversion = document.getElementById("aceptar-inversion");
const inputMaxTrastes = document.getElementById("max-trastes");
const inputMaxCuerdas = document.getElementById("max-cuerdas");
const pregunta = document.getElementById("pregunta");
const contenedorOpciones = document.getElementById("opciones-intervalo");
const btnNueva = document.getElementById("btn-nueva");
const resultado = document.getElementById("resultado");

let semitonosActuales = null;

// Abreviaturas de intervalo: ver abreviaturaIntervaloPorSemitono en diapason.js

// Crea (o recrea) los botones de intervalo según el rango máximo elegido (0 hasta maxSemitonos)
function poblarBotonesIntervalo() {
  const maxSemitonos = Number(selectDificultad.value);
  contenedorOpciones.innerHTML = "";

  for (let semitonos = 0; semitonos <= maxSemitonos; semitonos++) {
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
  const maxTrastes = Number(inputMaxTrastes.value);
  const maxCuerdas = Number(inputMaxCuerdas.value);

  let par;
  try {
    par = generarParPosicionesAleatorio(maxSemitonos, maxTrastes, maxCuerdas);
  } catch (error) {
    pregunta.textContent = "—";
    if (typeof renderizarDiapason === "function") {
      renderizarDiapason("diapason-visual", []);
    }
    resultado.textContent = error.message;
    resultado.className = "resultado incorrecto";
    semitonosActuales = null;
    deshabilitarBotones();
    return;
  }

  semitonosActuales = par.semitonos;
  pregunta.textContent = `Cuerda ${par.cuerda1}, traste ${par.traste1}  →  Cuerda ${par.cuerda2}, traste ${par.traste2}`;
  if (typeof renderizarDiapason === "function") {
    renderizarDiapason("diapason-visual", [
      { cuerda: par.cuerda1, traste: par.traste1, grupo: 1 },
      { cuerda: par.cuerda2, traste: par.traste2, grupo: 2 }
    ]);
  }
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

  // Resaltar el/los botón(es) que sí eran válidos, si están visibles en el rango actual
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
  resultado.textContent = `Incorrecto. El intervalo era: ${nombreCorrecto}${sufijoInvertido} (${semitonosActuales} semitonos)`;
  resultado.className = "resultado incorrecto";
}

function actualizarPorCambioDeDificultad() {
  poblarBotonesIntervalo();
  generarPregunta();
}

btnNueva.addEventListener("click", generarPregunta);
selectDificultad.addEventListener("change", actualizarPorCambioDeDificultad);
inputMaxTrastes.addEventListener("change", generarPregunta);
inputMaxCuerdas.addEventListener("change", generarPregunta);

poblarBotonesIntervalo();
generarPregunta();