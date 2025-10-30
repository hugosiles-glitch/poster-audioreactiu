let borrarEnCadaFrame = true;
let paletasColores = [
  ["#111827", "#2563EB", "#10B981", "#F59E0B", "#EF4444"],
  ["#0F172A", "#22D3EE", "#A78BFA", "#34D399", "#F472B6"],
  ["#1F2937", "#60A5FA", "#FBBF24", "#F87171", "#34D399"]
];
let indicePaleta = 0;
let modoMultiplicar = false;

let mic, amp, nivel = 0;
let grabando = false; // estado ON/OFF
let diametro = 40;

function setup() {
  const lienzo = createCanvas(windowWidth, windowHeight - 130); // deja hueco para los controles
  lienzo.parent("contenedor-p5");
  noStroke();
  background(250);

  // Botones DOM
  document.getElementById("botonCambiarPaleta").addEventListener("click", cambiarPaleta);
  document.getElementById("botonLimpiar").addEventListener("click", limpiarLienzo);
  document.getElementById("botonGuardar").addEventListener("click", guardarPNG);
  document.getElementById("botonGrabar").addEventListener("click", alternarGrabacion);

  // Inicializamos mic y amplitud
  mic = new p5.AudioIn();
  amp = new p5.Amplitude();
}

function alternarGrabacion() {
  const estadoSpan = document.getElementById("estadoGrabar");

  if (!grabando) {
    // Iniciar micrófono (requiere interacción del usuario)
    userStartAudio().then(() => {
      mic.start(() => {
        amp.setInput(mic);
        grabando = true;
        estadoSpan.textContent = " ON";
        estadoSpan.style.color = "limegreen";
      }, err => {
        console.warn("Error mic:", err);
        alert("No se pudo acceder al micrófono. Usa HTTPS o localhost y revisa permisos.");
      });
    });
  } else {
    // Detener micrófono
    mic.stop();
    grabando = false;
    estadoSpan.textContent = " OFF";
    estadoSpan.style.color = "red";
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight - 130);
  background(250);
}

function draw() {
  // === 🔊 Añadido al principio de draw() ===
  // 1) recoger volumen (si no hay amp aún, 0)
  nivel = amp ? amp.getLevel() : 0;

  // 2) convertir volumen → refuerzo visual (0...50 px)
  let boost = map(nivel, 0, 0.3, 0, 50);
  // ==========================================

  if (borrarEnCadaFrame) background(245, 245, 245, 25);

  // círculo principal
  fill(250, 40, 150);
  circle(mouseX, mouseY, 35);

  // anillos
  for (let i = 0; i < 8; i++) {
    let angulo = frameCount * 0.02 + i * TAU / 8;

    // 💫 Opción radio de las órbitas (muy vistoso)
    let radio  = 60 + boost + 20 * sin(frameCount * 0.03 + i);

    let x = mouseX + cos(angulo) * radio;
    let y = mouseY + sin(angulo) * radio;

    fill(paletasColores[indicePaleta][i % paletasColores[indicePaleta].length] + "CC");
    circle(x, y, 18);
  }
}

function keyPressed() {
  if (key === 'B' || key === 'b') borrarEnCadaFrame = !borrarEnCadaFrame;
  if (key === 'M' || key === 'm') {
    modoMultiplicar = !modoMultiplicar;
    blendMode(modoMultiplicar ? MULTIPLY : BLEND);
  }
  if (key === 'S' || key === 's') guardarPNG();
}

function mouseWheel(e) {
  diametro = constrain(diametro + (e.deltaY > 0 ? -4 : 4), 10, 140);
}

function guardarPNG() {
  let f = new Date();
  let nombre = `poster-${f.getHours()}${f.getMinutes()}${f.getSeconds()}`;
  saveCanvas(nombre, 'png');
}

function cambiarPaleta() {
  indicePaleta = (indicePaleta + 1) % paletasColores.length;
}

function limpiarLienzo() {
  background(245);
}
