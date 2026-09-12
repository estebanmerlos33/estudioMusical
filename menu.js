const opciones = document.querySelectorAll(".opcion-ejercicio");

opciones.forEach((opcion) => {
  opcion.addEventListener("click", () => {
    const destino = opcion.getAttribute("data-destino");
    window.location.href = destino;
  });
});