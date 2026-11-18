const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const visor = document.getElementById("visor");
const prePermiso = document.getElementById("pre-permiso");
const estadoCamara = document.getElementById("estado-camara");
const btnPermitir = document.getElementById("btn-permitir");
const btnCambiar = document.getElementById("btn-cambiar");
const btnCapturar = document.getElementById("btn-capturar");
const btnDetener = document.getElementById("btn-detener");
const galeria = document.getElementById("galeria");
const sinFotos = document.getElementById("sin-fotos");
const btnInstalar = document.getElementById("btn-instalar");
const instruccionesIOS = document.getElementById("instrucciones-ios");
const estadoInstalacion = document.getElementById("estado-instalacion");

let streamActual = null;
let facingActual = "environment";
let contadorFotos = 0;
let eventoInstalacion = null;
let iniciandoCamara = false;

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch((error) => {
      console.error("No se pudo registrar el service worker:", error);
    });
  });
}

const esIOS =
  /iphone|ipad|ipod/i.test(navigator.userAgent) ||
  (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
const esStandalone =
  window.matchMedia("(display-mode: standalone)").matches ||
  window.navigator.standalone === true;

if (esStandalone) {
  estadoInstalacion.textContent = "Ya estás usando la app instalada.";
  btnInstalar.classList.add("oculto");
} else if (esIOS) {
  instruccionesIOS.classList.remove("oculto");
  estadoInstalacion.textContent =
    "En iOS la instalación se hace manualmente desde Safari.";
} else {
  estadoInstalacion.textContent =
    "Si tu navegador lo permite, aparecerá el botón de instalación.";
}

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  eventoInstalacion = event;
  btnInstalar.classList.remove("oculto");
  estadoInstalacion.textContent = "La app está lista para instalarse.";
});

btnInstalar.addEventListener("click", async () => {
  if (!eventoInstalacion) {
    return;
  }

  btnInstalar.disabled = true;

  try {
    eventoInstalacion.prompt();
    const eleccion = await eventoInstalacion.userChoice;

    if (eleccion.outcome === "accepted") {
      estadoInstalacion.textContent = "Instalación aceptada.";
    } else {
      estadoInstalacion.textContent = "Instalación cancelada.";
    }
  } catch (error) {
    console.error("Error al instalar la app:", error);
    estadoInstalacion.textContent = "No se pudo completar la instalación.";
  } finally {
    eventoInstalacion = null;
    btnInstalar.classList.add("oculto");
    btnInstalar.disabled = false;
  }
});

window.addEventListener("appinstalled", () => {
  estadoInstalacion.textContent = "App instalada correctamente.";
  instruccionesIOS.classList.add("oculto");
  btnInstalar.classList.add("oculto");
  eventoInstalacion = null;
});

function mensajeErrorCamara(error) {
  if (!window.isSecureContext) {
    return "La cámara necesita HTTPS o localhost. Abre la app desde GitHub Pages (HTTPS).";
  }

  switch (error && error.name) {
    case "NotAllowedError":
    case "SecurityError":
      return "Permiso de cámara denegado. Habilítalo en los ajustes del navegador y vuelve a intentarlo.";
    case "NotFoundError":
    case "DevicesNotFoundError":
      return "No se encontró ninguna cámara en este dispositivo.";
    case "NotReadableError":
    case "TrackStartError":
      return "La cámara está siendo usada por otra aplicación. Ciérrala e inténtalo de nuevo.";
    case "OverconstrainedError":
      return "La cámara solicitada no está disponible en este dispositivo.";
    default:
      return "No se pudo iniciar la cámara. Inténtalo de nuevo.";
  }
}

function mostrarEstadoCamara(texto, tipo) {
  estadoCamara.textContent = texto;
  estadoCamara.className = "estado" + (tipo ? " " + tipo : "");
}

function detenerTracks() {
  if (streamActual) {
    streamActual.getTracks().forEach((track) => track.stop());
    streamActual = null;
  }

  video.pause();
  video.srcObject = null;
}

function volverAPrePermiso() {
  detenerTracks();
  visor.classList.add("oculto");
  prePermiso.classList.remove("oculto");
  btnCambiar.disabled = false;
  btnCapturar.disabled = false;
}

async function iniciarCamara(facing) {
  if (iniciandoCamara) {
    return;
  }

  if (!window.isSecureContext) {
    mostrarEstadoCamara(mensajeErrorCamara(null), "error");
    return;
  }

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    mostrarEstadoCamara("Este navegador no permite acceder a la cámara.", "error");
    return;
  }

  iniciandoCamara = true;
  btnPermitir.disabled = true;
  btnCambiar.disabled = true;
  btnCapturar.disabled = true;
  mostrarEstadoCamara("Solicitando permiso de cámara...");

  detenerTracks();

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: { facingMode: { ideal: facing } }
    });

    streamActual = stream;

    const pista = stream.getVideoTracks()[0];
    const ajustes = pista && pista.getSettings ? pista.getSettings() : {};
    facingActual =
      ajustes.facingMode === "user" || ajustes.facingMode === "environment"
        ? ajustes.facingMode
        : facing;

    video.srcObject = stream;
    prePermiso.classList.add("oculto");
    visor.classList.remove("oculto");

    try {
      await video.play();
    } catch (error) {
      console.warn("No se pudo reproducir el video automáticamente:", error);
    }

    if (facingActual === "environment") {
      mostrarEstadoCamara("Cámara trasera activa.", "exito");
    } else if (facingActual === "user") {
      mostrarEstadoCamara("Cámara frontal activa.", "exito");
    } else {
      mostrarEstadoCamara("Cámara activa.", "exito");
    }
  } catch (error) {
    console.error("Error al iniciar la cámara:", error);
    volverAPrePermiso();
    mostrarEstadoCamara(mensajeErrorCamara(error), "error");
  } finally {
    iniciandoCamara = false;
    btnPermitir.disabled = false;
    btnCambiar.disabled = false;
    btnCapturar.disabled = false;
  }
}

function agregarFoto(blob) {
  const url = URL.createObjectURL(blob);
  contadorFotos += 1;

  const figura = document.createElement("figure");
  figura.className = "foto";

  const imagen = document.createElement("img");
  imagen.src = url;
  imagen.alt = "Foto " + contadorFotos + " tomada con la cámara";
  imagen.loading = "lazy";

  const pie = document.createElement("figcaption");
  const texto = document.createElement("span");
  texto.textContent = "Foto " + contadorFotos;

  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = "foto-" + contadorFotos + ".jpg";
  enlace.textContent = "Descargar";

  pie.append(texto, enlace);
  figura.append(imagen, pie);
  galeria.prepend(figura);
  sinFotos.classList.add("oculto");
}

btnPermitir.addEventListener("click", () => {
  iniciarCamara(facingActual);
});

btnCambiar.addEventListener("click", () => {
  const siguiente = facingActual === "environment" ? "user" : "environment";
  iniciarCamara(siguiente);
});

btnCapturar.addEventListener("click", () => {
  if (!streamActual) {
    mostrarEstadoCamara("La cámara no está activa.", "error");
    return;
  }

  if (!video.videoWidth || !video.videoHeight) {
    mostrarEstadoCamara("La cámara aún se está iniciando. Espera un momento.", "error");
    return;
  }

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  const contexto = canvas.getContext("2d");

  if (!contexto) {
    mostrarEstadoCamara("Este navegador no pudo procesar la foto.", "error");
    return;
  }

  contexto.drawImage(video, 0, 0, canvas.width, canvas.height);

  canvas.toBlob(
    (blob) => {
      if (!blob) {
        mostrarEstadoCamara("No se pudo generar la foto.", "error");
        return;
      }

      agregarFoto(blob);
      mostrarEstadoCamara("Foto añadida a la galería.", "exito");
    },
    "image/jpeg",
    0.9
  );
});

btnDetener.addEventListener("click", () => {
  volverAPrePermiso();
  mostrarEstadoCamara("Cámara detenida. El sensor quedó liberado.");
});

function liberarAlSalir() {
  detenerTracks();
  visor.classList.add("oculto");
  prePermiso.classList.remove("oculto");
}

window.addEventListener("pagehide", liberarAlSalir);

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    liberarAlSalir();
  }
});
