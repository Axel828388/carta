// Abrir carta
const sobre = document.getElementById('sobre');
const boton = document.getElementById('abrir');

boton.addEventListener('click', () => {
  sobre.classList.toggle('abierta');
});

// Corazones flotando
function crearCorazon() {
  const corazon = document.createElement("div");
  corazon.classList.add("corazon");
  corazon.innerText = "❤️";

  // Posición y tamaño aleatorio
  corazon.style.left = Math.random() * 100 + "vw";
  corazon.style.fontSize = (20 + Math.random() * 30) + "px";
  corazon.style.animationDuration = (5 + Math.random() * 5) + "s";

  document.getElementById("corazones").appendChild(corazon);

  setTimeout(() => corazon.remove(), 10000);
}

setInterval(crearCorazon, 500);
