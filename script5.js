const selectCantidadNotas = document.getElementById("cantidad-notas");
const contenedorCheckboxesTipoTriada = document.getElementById("checkboxes-tipo-triada");
const contenedorCheckboxesTipoTetrada = document.getElementById("checkboxes-tipo-tetrada");
const contenedorCheckboxesInversion = document.getElementById("checkboxes-inversion");
const checkboxMostrarFormula = document.getElementById("mostrar-formula");
const pregunta = document.getElementById("pregunta");
const respuestaConstruida = document.getElementById("respuesta-construida");
const contenedorLetras = document.getElementById("opciones-letras");
const contenedorAlteraciones = document.getElementById("opciones-alteraciones");
const btnValidar = document.getElementById("btn-validar");
const btnBorrarUltima = document.getElementById("btn-borrar-ultima");
const btnNueva = document.getElementById("btn-nueva");
const resultado = document.getElementById("resultado");

let acordeActual = null;
let respuestaUsuario = [];
let indicePendiente = null; // índice de la última nota agregada que todavía puede recibir una alteración

const TIPOS_TRIADA = ["mayor", "menor", "aumentado", "disminuido", "sus2", "sus4"];
const TIPOS_TETRADA = ["maj7", "m7", "7", "semidisminuido", "dim7", "9na", "11na", "13na"];
const TIPOS_TRIADA_DEFAULT = ["mayor", "menor", "aumentado", "disminuido"];
const TIPOS_TETRADA_DEFAULT = ["maj7", "m7", "7", "semidisminuido"];

const LETRAS = ["Do", "Re", "Mi", "Fa", "Sol", "La", "Si"];
const ALTERACIONES = [
  { simbolo: "♯", sufijo: "#", etiqueta: "Sostenido" },
  { simbolo: "♭", sufijo: "b", etiqueta: "Bemol" },
  { simbolo: "𝄪", sufijo: "##", etiqueta: "Doble sostenido" },
  { simbolo: "𝄫", sufijo: "bb", etiqueta: "Doble bemol" }
];

// ==========================================================================
// Checkboxes de tipo de acorde (según tríada/tétrada) e inversión
// ==========================================================================

function crearCheckboxesTipo(contenedor, tipos, marcadosPorDefecto) {
  contenedor.innerHTML = "";
  tipos.forEach((tipo) => {
    const id = `tipo-${tipo}`;
    const label = document.createElement("label");
    label.className = "checkbox-item";
    label.setAttribute("for", id);

    const input = document.createElement("input");
    input.type = "checkbox";
    input.id = id;
    input.checked = marcadosPorDefecto.includes(tipo);
    input.dataset.tipo = tipo;
    input.addEventListener("change", generarPregunta);

    label.appendChild(input);
    label.append(`${nombresLegiblesAcordes[tipo]} (${obtenerFormulaAcorde(tipo)})`);
    contenedor.appendChild(label);
  });
}

function poblarCheckboxesInversion() {
  contenedorCheckboxesInversion.innerHTML = "";
  [0, 1, 2, 3].forEach((inv) => {
    const id = `inv-${inv}`;
    const label = document.createElement("label");
    label.className = "checkbox-item";
    label.setAttribute("for", id);
    label.dataset.inversionItem = String(inv);

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

function actualizarVisibilidadPorCantidadNotas() {
  const cantidadNotas = Number(selectCantidadNotas.value);
  contenedorCheckboxesTipoTriada.classList.toggle("oculto", cantidadNotas !== 3);
  contenedorCheckboxesTipoTetrada.classList.toggle("oculto", cantidadNotas !== 4);

  // La "3ra inversión" solo existe para tétradas
  const itemInv3 = contenedorCheckboxesInversion.querySelector('[data-inversion-item="3"]');
  if (itemInv3) itemInv3.classList.toggle("oculto", cantidadNotas !== 4);
}

function obtenerTiposSeleccionados() {
  const cantidadNotas = Number(selectCantidadNotas.value);
  const contenedorActivo = cantidadNotas === 3 ? contenedorCheckboxesTipoTriada : contenedorCheckboxesTipoTetrada;
  return [...contenedorActivo.querySelectorAll('input[type="checkbox"]:checked')].map((input) => input.dataset.tipo);
}

function obtenerInversionesSeleccionadas() {
  const cantidadNotas = Number(selectCantidadNotas.value);
  return [...contenedorCheckboxesInversion.querySelectorAll('input[type="checkbox"]:checked')]
    .map((input) => Number(input.dataset.inversion))
    .filter((inv) => inv < cantidadNotas);
}

// ==========================================================================
// Botones de letra y de alteración
// ==========================================================================

function crearBotonesLetras() {
  LETRAS.forEach((letra) => {
    const boton = document.createElement("button");
    boton.type = "button";
    boton.className = "opcion-boton";
    boton.textContent = letra;
    boton.dataset.letra = letra;
    boton.addEventListener("click", () => seleccionarLetra(letra, boton));
    contenedorLetras.appendChild(boton);
  });
}

function crearBotonesAlteraciones() {
  ALTERACIONES.forEach((alt) => {
    const boton = document.createElement("button");
    boton.type = "button";
    boton.className = "opcion-boton";
    boton.title = alt.etiqueta;
    boton.textContent = alt.simbolo;
    boton.dataset.sufijo = alt.sufijo;
    boton.disabled = true;
    boton.addEventListener("click", () => seleccionarAlteracion(alt.sufijo));
    contenedorAlteraciones.appendChild(boton);
  });
}

function habilitarAlteraciones() {
  contenedorAlteraciones.querySelectorAll(".opcion-boton").forEach((boton) => {
    boton.disabled = false;
  });
}

function reiniciarGruposDeBotones() {
  // "Reinicia ambos tipos de botones": quita el resaltado de letras y vuelve a deshabilitar alteraciones
  contenedorLetras.querySelectorAll(".opcion-boton").forEach((boton) => boton.classList.remove("activa"));
  contenedorAlteraciones.querySelectorAll(".opcion-boton").forEach((boton) => {
    boton.disabled = true;
  });
}

function habilitarTodosLosBotones() {
  contenedorLetras.querySelectorAll(".opcion-boton").forEach((boton) => {
    boton.disabled = false;
    boton.classList.remove("activa");
  });
  contenedorAlteraciones.querySelectorAll(".opcion-boton").forEach((boton) => {
    boton.disabled = true;
  });
  btnValidar.disabled = false;
  btnBorrarUltima.disabled = false;
}

function deshabilitarTodosLosBotones() {
  contenedorLetras.querySelectorAll(".opcion-boton").forEach((boton) => {
    boton.disabled = true;
  });
  contenedorAlteraciones.querySelectorAll(".opcion-boton").forEach((boton) => {
    boton.disabled = true;
  });
  btnValidar.disabled = true;
  btnBorrarUltima.disabled = true;
}

// ==========================================================================
// Construcción de la respuesta
// ==========================================================================

function seleccionarLetra(letra, botonElegido) {
  if (!acordeActual) return;

  respuestaUsuario.push(letra);
  indicePendiente = respuestaUsuario.length - 1;

  contenedorLetras.querySelectorAll(".opcion-boton").forEach((boton) => boton.classList.remove("activa"));
  botonElegido.classList.add("activa");

  habilitarAlteraciones();
  actualizarRespuestaConstruida(false);
}

function seleccionarAlteracion(sufijo) {
  if (!acordeActual || indicePendiente === null) return;

  respuestaUsuario[indicePendiente] = respuestaUsuario[indicePendiente] + sufijo;
  indicePendiente = null;

  reiniciarGruposDeBotones();
  actualizarRespuestaConstruida(false);
}

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
      const coincide = esperada !== undefined && normalizarRespuestaNota(nota) === normalizarRespuestaNota(esperada);
      const clase = coincide ? "nota-correcta" : "nota-incorrecta";
      return `<span class="${clase}">${nota}</span>`;
    })
    .join(" - ");
}

// Comparación estricta: misma letra y misma alteración exacta (sin equivalencia enarmónica)
function normalizarRespuestaNota(nota) {
  return quitarAcentos(nota.trim().toLowerCase());
}

function generarPregunta() {
  const cantidadNotas = Number(selectCantidadNotas.value);
  const tipos = obtenerTiposSeleccionados();
  const inversiones = obtenerInversionesSeleccionadas();

  const combinaciones = [];
  tipos.forEach((tipo) => {
    inversiones.forEach((inversion) => combinaciones.push({ tipo, inversion }));
  });

  if (combinaciones.length === 0) {
    acordeActual = null;
    pregunta.textContent = "—";
    resultado.textContent = "Marca al menos un tipo de acorde y una inversión.";
    resultado.className = "resultado incorrecto";
    deshabilitarTodosLosBotones();
    respuestaUsuario = [];
    indicePendiente = null;
    actualizarRespuestaConstruida(false);
    return;
  }

  const elegida = combinaciones[Math.floor(Math.random() * combinaciones.length)];
  acordeActual = generarAcordeAleatorio(cantidadNotas, elegida.tipo, elegida.inversion);
  respuestaUsuario = [];
  indicePendiente = null;

  actualizarTextoPregunta();
  actualizarRespuestaConstruida(false);
  resultado.textContent = "";
  resultado.className = "resultado";
  habilitarTodosLosBotones();
}

function validarRespuesta() {
  if (!acordeActual) return;

  if (respuestaUsuario.length !== acordeActual.notasEsperadas.length) {
    const diferencia = acordeActual.notasEsperadas.length - respuestaUsuario.length;
    resultado.textContent = diferencia > 0
      ? `Te faltan ${diferencia} nota(s) antes de validar.`
      : `Sobran ${-diferencia} nota(s): borralas antes de validar.`;
    resultado.className = "resultado incorrecto";
    return;
  }

  deshabilitarTodosLosBotones();

  const esCorrecta = respuestaUsuario.every(
    (nota, indice) => normalizarRespuestaNota(nota) === normalizarRespuestaNota(acordeActual.notasEsperadas[indice])
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

btnValidar.addEventListener("click", validarRespuesta);

btnBorrarUltima.addEventListener("click", () => {
  if (respuestaUsuario.length === 0) return;
  respuestaUsuario.pop();
  indicePendiente = null;
  reiniciarGruposDeBotones();
  actualizarRespuestaConstruida(false);
});

btnNueva.addEventListener("click", generarPregunta);
checkboxMostrarFormula.addEventListener("change", actualizarTextoPregunta);
selectCantidadNotas.addEventListener("change", () => {
  actualizarVisibilidadPorCantidadNotas();
  generarPregunta();
});

crearCheckboxesTipo(contenedorCheckboxesTipoTriada, TIPOS_TRIADA, TIPOS_TRIADA_DEFAULT);
crearCheckboxesTipo(contenedorCheckboxesTipoTetrada, TIPOS_TETRADA, TIPOS_TETRADA_DEFAULT);
poblarCheckboxesInversion();
actualizarVisibilidadPorCantidadNotas();
crearBotonesLetras();
crearBotonesAlteraciones();
generarPregunta();