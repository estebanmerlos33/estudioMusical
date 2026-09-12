const selectCantidadNotas = document.getElementById("cantidad-notas");
const selectTipoAcorde = document.getElementById("tipo-acorde");
const selectInversion = document.getElementById("inversion");
const pregunta = document.getElementById("pregunta");
const inputRespuesta = document.getElementById("respuesta");
const btnValidar = document.getElementById("btn-validar");
const btnNueva = document.getElementById("btn-nueva");
const resultado = document.getElementById("resultado");

let acordeActual = null;

// Llena el <select> de tipo de acorde según la cantidad de notas elegida (3 o 4)
function poblarSelectTipoAcorde() {
  const cantidadNotas = Number(selectCantidadNotas.value);
  const tipos = obtenerTiposAcordePorCantidad(cantidadNotas);

  selectTipoAcorde.innerHTML = "";

  const opcionAleatoria = document.createElement("option");
  opcionAleatoria.value = "aleatorio";
  opcionAleatoria.textContent = "Aleatorio";
  selectTipoAcorde.appendChild(opcionAleatoria);

  tipos.forEach((tipo) => {
    const opcion = document.createElement("option");
    opcion.value = tipo;
    opcion.textContent = `${nombresLegiblesAcordes[tipo]}  (${obtenerFormulaAcorde(tipo)})`;
    selectTipoAcorde.appendChild(opcion);
  });
}

// Llena el <select> de inversión según la cantidad de notas elegida (0..2 o 0..3)
function poblarSelectInversion() {
  const cantidadNotas = Number(selectCantidadNotas.value);

  selectInversion.innerHTML = "";

  const opcionAleatoria = document.createElement("option");
  opcionAleatoria.value = "aleatoria";
  opcionAleatoria.textContent = "Aleatoria";
  selectInversion.appendChild(opcionAleatoria);

  for (let inv = 0; inv < cantidadNotas; inv++) {
    const opcion = document.createElement("option");
    opcion.value = String(inv);
    opcion.textContent = nombresInversion[inv];
    selectInversion.appendChild(opcion);
  }
}

function actualizarOpcionesPorCantidadNotas() {
  poblarSelectTipoAcorde();
  poblarSelectInversion();
  generarPregunta();
}

function generarPregunta() {
  const cantidadNotas = Number(selectCantidadNotas.value);
  const tipoAcorde = selectTipoAcorde.value;
  const inversion = selectInversion.value;

  try {
    acordeActual = generarAcordeAleatorio(cantidadNotas, tipoAcorde, inversion);
  } catch (error) {
    pregunta.textContent = "—";
    resultado.textContent = error.message;
    resultado.className = "resultado incorrecto";
    acordeActual = null;
    return;
  }

  pregunta.textContent = acordeActual.notasEsperadas.join(" - ");
  inputRespuesta.value = "";
  resultado.textContent = "";
  resultado.className = "resultado";
  inputRespuesta.focus();
}

function validarRespuesta() {
  if (!acordeActual) {
    resultado.textContent = "Ajusta los parámetros y genera una nueva pregunta primero.";
    resultado.className = "resultado incorrecto";
    return;
  }

  const valor = inputRespuesta.value.trim();

  if (valor === "") {
    resultado.textContent = "Escribe la raíz y el tipo de acorde antes de validar.";
    resultado.className = "resultado incorrecto";
    return;
  }

  const esCorrecta = esIdentificacionAcordeCorrecta(valor, acordeActual);

  if (esCorrecta) {
    resultado.textContent = "¡Correcto!";
    resultado.className = "resultado correcto";
  } else {
    const formula = obtenerFormulaAcorde(acordeActual.tipoAcorde);
    resultado.textContent = `Incorrecto. Era: ${acordeActual.raiz} ${acordeActual.nombreTipoAcorde} (${formula})`;
    resultado.className = "resultado incorrecto";
  }
}

btnValidar.addEventListener("click", validarRespuesta);
btnNueva.addEventListener("click", generarPregunta);
selectCantidadNotas.addEventListener("change", actualizarOpcionesPorCantidadNotas);
selectTipoAcorde.addEventListener("change", generarPregunta);
selectInversion.addEventListener("change", generarPregunta);

inputRespuesta.addEventListener("keydown", (evento) => {
  if (evento.key === "Enter") {
    validarRespuesta();
  }
});

poblarSelectTipoAcorde();
poblarSelectInversion();
generarPregunta();