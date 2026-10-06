const contenedorCheckboxesTipo = document.getElementById("checkboxes-tipo");
const contenedorCheckboxesInversion = document.getElementById("checkboxes-inversion");
const checkboxMostrarFormula = document.getElementById("mostrar-formula");
const pregunta = document.getElementById("pregunta");
const respuestaConstruida = document.getElementById("respuesta-construida");
const contenedorOpcionesNotas = document.getElementById("opciones-notas");
const btnBorrarUltima = document.getElementById("btn-borrar-ultima");
const btnNueva = document.getElementById("btn-nueva");
const resultado = document.getElementById("resultado");

let acordeActual = null;
let respuestaUsuario = [];

// Nombre alternativo en bemol para las notas alteradas (mismo patrón que el ejercicio 1)
const bemolEquivalente = {
  "Do#": "Reb",
  "Re#": "Mib",
  "Fa#": "Solb",
  "Sol#": "Lab",
  "La#": "Sib"
};

// ==========================================================================
// Checkboxes de tipo de acorde (triadas y tétradas juntas) e inversión
// ==========================================================================

function poblarCheckboxesTipo() {
  contenedorCheckboxesTipo.innerHTML = "";

  Object.keys(recetasAcordes).forEach((tipo) => {
    const id = `tipo-${tipo}`;
    const label = document.createElement("label");
    label.className = "checkbox-item";
    label.setAttribute("for", id);

    const input = document.createElement("input");
    input.type = "checkbox";
    input.id = id;
    input.checked = true;
    input.dataset.tipo = tipo;
    input.addEventListener("change", generarPregunta);

    label.appendChild(input);
    label.append(`${nombresLegiblesAcordes[tipo]} (${obtenerFormulaAcorde(tipo)})`);
    contenedorCheckboxesTipo.appendChild(label);
  });
}

function poblarCheckboxesInversion() {
  contenedorCheckboxesInversion.innerHTML = "";

  [0, 1, 2, 3].forEach((inv) => {
    const id = `inv-${inv}`;
    const label = document.createElement("label");
    label.className = "checkbox-item";
    label.setAttribute("for", id);

    const input = document.createElement("input");
    input.type = "checkbox";
    input.id = id;
    input.checked = true;
    input.dataset.inversion = String(inv);
    input.addEventListener("change", generarPregunta);

    label.appendChild(input);
    label.append(nombresInversion[inv]);
    contenedorCheckboxesInversion.appendChild(label);
  });
}

function obtenerTiposSeleccionados() {
  return [...contenedorCheckboxesTipo.querySelectorAll('input[type="checkbox"]:checked')].map(
    (input) => input.dataset.tipo
  );
}

function obtenerInversionesSeleccionadas() {
  return [...contenedorCheckboxesInversion.querySelectorAll('input[type="checkbox"]:checked')].map(
    (input) => Number(input.dataset.inversion)
  );
}

// Combina los tipos e inversiones marcados, descartando combinaciones imposibles
// (ej: "3ra inversión" marcada pero solo hay tríadas seleccionadas, que no llegan a esa inversión)
function obtenerCombinacionesValidas() {
  const tipos = obtenerTiposSeleccionados();
  const inversiones = obtenerInversionesSeleccionadas();
  const combinaciones = [];

  tipos.forEach((tipo) => {
    const cantidadNotas = recetasAcordes[tipo].cantidadNotas;
    inversiones.forEach((inversion) => {
      if (inversion < cantidadNotas) {
        combinaciones.push({ tipo, cantidadNotas, inversion });
      }
    });
  });

  return combinaciones;
}

// ==========================================================================
// Botones de nota (igual que el ejercicio 1): el usuario arma la respuesta
// seleccionando una nota a la vez, en orden.
// ==========================================================================

function crearBotonesNotas() {
  notasOrden.forEach((nota) => {
    const boton = document.createElement("button");
    boton.type = "button";
    boton.className = "opcion-boton";
    boton.dataset.nota = nota;

    const alt = bemolEquivalente[nota];
    boton.innerHTML = alt ? `${nota}<span class="nota-alt">${alt}</span>` : nota;

    boton.addEventListener("click", () => seleccionarNota(nota));
    contenedorOpcionesNotas.appendChild(boton);
  });
}

function habilitarBotonesNotas() {
  contenedorOpcionesNotas.querySelectorAll(".opcion-boton").forEach((boton) => {
    boton.disabled = false;
  });
  btnBorrarUltima.disabled = false;
}

function deshabilitarBotonesNotas() {
  contenedorOpcionesNotas.querySelectorAll(".opcion-boton").forEach((boton) => {
    boton.disabled = true;
  });
  btnBorrarUltima.disabled = true;
}

// ==========================================================================
// Flujo de pregunta/respuesta
// ==========================================================================

function actualizarTextoPregunta() {
  if (!acordeActual) {
    pregunta.textContent = "—";
    return;
  }
  const formula = obtenerFormulaAcorde(acordeActual.tipoAcorde);
  const sufijoFormula = checkboxMostrarFormula.checked ? `  (${formula})` : "";
  pregunta.textContent = `${acordeActual.raiz} ${acordeActual.nombreTipoAcorde}${sufijoFormula} — ${acordeActual.nombreInversion}`;
}

function actualizarRespuestaConstruida(coloreada) {
  if (respuestaUsuario.length === 0) {
    respuestaConstruida.textContent = "—";
    return;
  }

  if (!coloreada) {
    respuestaConstruida.textContent = respuestaUsuario.join(" - ");
    return;
  }

  respuestaConstruida.innerHTML = respuestaUsuario
    .map((nota, indice) => {
      const esperada = acordeActual.notasEsperadas[indice];
      const coincide = esNotaCorrecta(nota, esperada);
      const clase = coincide ? "nota-correcta" : "nota-incorrecta";
      return `<span class="${clase}">${nota}</span>`;
    })
    .join(" - ");
}

function generarPregunta() {
  const combinaciones = obtenerCombinacionesValidas();

  if (combinaciones.length === 0) {
    acordeActual = null;
    pregunta.textContent = "—";
    resultado.textContent = "Marca al menos un tipo de acorde y una inversión compatibles entre sí.";
    resultado.className = "resultado incorrecto";
    deshabilitarBotonesNotas();
    respuestaUsuario = [];
    actualizarRespuestaConstruida(false);
    return;
  }

  const elegida = combinaciones[Math.floor(Math.random() * combinaciones.length)];
  acordeActual = generarAcordeAleatorio(elegida.cantidadNotas, elegida.tipo, elegida.inversion);
  respuestaUsuario = [];

  actualizarTextoPregunta();
  actualizarRespuestaConstruida(false);
  resultado.textContent = "";
  resultado.className = "resultado";
  habilitarBotonesNotas();
}

function seleccionarNota(nota) {
  if (!acordeActual) return;

  respuestaUsuario.push(nota);
  actualizarRespuestaConstruida(false);

  if (respuestaUsuario.length === acordeActual.notasEsperadas.length) {
    validarRespuestaCompleta();
  }
}

function validarRespuestaCompleta() {
  deshabilitarBotonesNotas();

  const esCorrecta = respuestaUsuario.every((nota, indice) =>
    esNotaCorrecta(nota, acordeActual.notasEsperadas[indice])
  );

  actualizarRespuestaConstruida(true);

  if (esCorrecta) {
    resultado.textContent = "¡Correcto!";
    resultado.className = "resultado correcto";
  } else {
    resultado.textContent = `Incorrecto. Las notas eran: ${acordeActual.notasEsperadas.join("-")}`;
    resultado.className = "resultado incorrecto";
  }
}

btnBorrarUltima.addEventListener("click", () => {
  if (respuestaUsuario.length === 0) return;
  respuestaUsuario.pop();
  actualizarRespuestaConstruida(false);
});

btnNueva.addEventListener("click", generarPregunta);
checkboxMostrarFormula.addEventListener("change", actualizarTextoPregunta);

poblarCheckboxesTipo();
poblarCheckboxesInversion();
crearBotonesNotas();
generarPregunta();