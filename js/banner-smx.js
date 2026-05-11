import { ciclesData } from './ciclesData.js';
import { templates } from './templates.js';

document.addEventListener("DOMContentLoaded", function () {
  const container = document.getElementById("dynamic-content");
  const titulo = document.querySelector('.title-animated');
  const tituloSpan = document.querySelector('.title-animated span');
  const alerta = document.getElementById('alerta-matricula');

  // Menús (según tu HTML)
  const menuCicles = document.getElementById("menu-cicles"); // arriba (ciclos)
  const menu = document.getElementById("menu");              // abajo (secciones)

  // "Pills" (opciones clicables) del menú de secciones
  const pills = menu ? menu.querySelectorAll("[data-content]") : [];

  // Ciclos que se mostrarán cuando NO haya hash
  const CICLES = ["SMX", "DAM", "DAW", "FPB Agrària", "CEIABD"];
  //vistors
  const visitorsBadge = document.getElementById("visitors-badge");

  function updateVisitorsBadge() {
    if (!visitorsBadge) return;

    const { cicle } = getCicleAndSectionFromHash(); // smx, dam, daw...
    const badgeKey = cicle ? cicle : "home";        // home cuando no hay hash
  
    const pathValue = `lorenasanchezsanchez/firaCicles|${badgeKey}`;
  
    const url =
      "https://api.visitorbadge.io/api/visitors" +
      `?path=${encodeURIComponent(pathValue)}` +
      "&countColor=%23263759";

    // cache-bust para forzar recarga del <img>
    visitorsBadge.src = url + `&cb=${Date.now()}`;
  }

 function setTitleFromHash() {
  const { cicle } = getCicleAndSectionFromHash();
  const base = "IES BENIGASLO";
  const abrev = (cicle && ciclesData[cicle]?.descripcio) || "Fira Cicles";
  document.title = `${abrev} · ${base}`;
}
  // Estado de qué se ve en "home" (sin hash)
  let homeSection = "coneixerns"; // "coneixerns" | "centre" | "calendari"

  // Logo => volver a home SIN hash (sin dejar #)
  const logo = document.querySelector(".logo-mini");
  if (logo) {
    logo.style.cursor = "pointer";
    logo.title = "Tornar a l'inici";
    logo.addEventListener("click", () => {
      history.pushState("", document.title, window.location.pathname + window.location.search);
      homeSection = "coneixerns";
      actualizarPagina();
    });
  }

  if (!container || !menu || !menuCicles || pills.length === 0) {
    console.error("No se han encontrado los elementos");
    return;
  }

 function getCicleAndSectionFromHash() {
  const raw = (window.location.hash || "").replace("#", ""); // "/smx/pla" o ""
  const clean = raw.startsWith("/") ? raw.slice(1) : raw;    // "smx/pla" o ""
  const parts = clean.split("/");

  return {
    cicle: (parts[0] || "").toLowerCase(),
    section: (parts[1] || "").toLowerCase(),
  };
}

  function cicloValido() {
    const { cicle } = getCicleAndSectionFromHash();
    return !!(cicle && ciclesData[cicle]);
  }

  function marcarPillActivo(key) {
    pills.forEach(p => {
      if (key && (p.dataset.content || '').toLowerCase() === key) p.classList.add("active");
      else p.classList.remove("active");
    });
  }

function renderMenuCicles() {
  if (!menuCicles) return;

  const GROUPS = [
    { key: "basic", title: "Grau Bàsic", items: ["FPB"] },
    { key: "gm", title: "Grau Mitjà", items: ["SMX"] },
    { key: "gs", title: "Grau Superior", items: ["DAM", "DAW"] },
    { key: "ce", title: "Curs d'especialització", items: ["CEIABD"] },
  ];

  menuCicles.innerHTML = `
    <div class="level-groups highlights highlights--cicles">
      ${GROUPS.map(g => `
        <div class="level-group level-group--${g.key}">
          <div class="level-group__legend">${g.title}</div>
          <div class="level-group__items">
            ${g.items.map(sigla =>
              `<span class="cicle-pill" data-cicle="${sigla.toLowerCase()}">${sigla}</span>`
            ).join("")}
          </div>
        </div>
      `).join("")}
    </div>
  `;

  menuCicles.querySelectorAll("[data-cicle]").forEach((el) => {
    el.addEventListener("click", () => {
      const cicle = el.dataset.cicle;          //
      window.location.hash = `/${cicle}/pla`;  // entrar siempre a PLA
    });
  });
}

  // Sin hash => se ven los 2 menús (ciclos + secciones)
  // Con hash => solo secciones
  function toggleMenusByHash() {
    const { cicle } = getCicleAndSectionFromHash();

    if (!cicle) {
      menuCicles.style.display = "";
      menu.style.display = "";
    } else {
      menuCicles.style.display = "none";
      menu.style.display = "";
    }
  }

// Sin ciclo seleccionado => ocultar Pla, Eixides, Continuïtat, Requisits, mesOferta
function togglePillsByHash() {
  const { cicle } = getCicleAndSectionFromHash();
  const ocultarSinCiclo = new Set(["pla", "eixides", "continu", "requisits", "mesoferta","horari"]);

  // ✅ Con ciclo seleccionado => ocultar Coneixerns y Centre
  const ocultarConCiclo = new Set(["coneixerns", "centre"]);

  pills.forEach((p) => {
    const key = ((p.dataset && p.dataset.content) || "").toLowerCase();

    // 1) ocultar opciones si no hay ciclo
    if (!cicle && ocultarSinCiclo.has(key)) {
      p.style.display = "none";
      return;
    }

    // ✅ 1b) si SÍ hay ciclo, ocultar coneixerns y centre
    if (cicle && ocultarConCiclo.has(key)) {
      p.style.display = "none";
      return;
    }

    // 2) ocultar "matricula" si el ciclo es CEIABD
    if (key === "matricula" && cicle === "ceiabd") {
      p.style.display = "none";
      return;
    }

    // si no, mostrar
    p.style.display = "";
  });
}

  function mostrarOcultarElementos() {
    if (titulo) titulo.style.display = '';
    if (container) container.style.display = '';

    const { cicle } = getCicleAndSectionFromHash();

    // Home (sin hash): ocultamos alerta y ya está
    if (!cicle) {
      if (alerta) alerta.style.display = 'none';
      return;
    }

    // Con hash
    if (!cicloValido()) {
      if (alerta) alerta.style.display = 'none';
      if (menu) menu.style.display = 'none';
    } else {
      if (alerta) alerta.style.display = '';
      if (menu) menu.style.display = '';
    }
  }

  function updateContent() {
    const { cicle, section } = getCicleAndSectionFromHash();
 
         // --- Tema/fondo de TODA la página según hash (en updateContent) ---
    if (cicle && ciclesData[cicle]?.accent) {
      document.body.style.setProperty("--page-accent", ciclesData[cicle].accent);
      document.body.dataset.hasTheme = "1";
      delete document.body.dataset.home;
    } else {
      document.body.style.removeProperty("--page-accent");
      delete document.body.dataset.hasTheme; // vuelve al fondo home
      document.body.dataset.home = "1";
    }
    // SIN HASH => mostrar lo que marque homeSection (vídeo/centre/calendari) SIN hash
    if (!cicle) {
      const key = homeSection || "coneixerns";
      container.innerHTML = templates[key] || templates["coneixerns"] || "<h3>Benvingut/da!</h3>";

      if (tituloSpan) tituloSpan.textContent = "Benvingut/da a l'oferta formativa de l'IES Benigasló";
      if (alerta) alerta.innerHTML = "";

      marcarPillActivo(key);
      enableVideoFullscreen();
      return;
    }

    // CON HASH y ciclo existente
    if (cicle && ciclesData[cicle]) {
      if (tituloSpan) tituloSpan.innerHTML  = ciclesData[cicle].titol || "";

      if (!section || section === "coneixerns") {
        container.innerHTML = templates["coneixerns"] || "<h3>Benvingut/da!</h3>";
        marcarPillActivo("coneixerns");
      } else if (section === "pla") {
        container.innerHTML = ciclesData[cicle].pla
          ? ciclesData[cicle].pla.join("")
          : "<p>No hi ha plan disponible.</p>";
        marcarPillActivo("pla");
      }
      
       else if (section === "eixides") {
  container.innerHTML = ciclesData[cicle].eixides ? ciclesData[cicle].eixides.join("")
    : "<p>No hi ha eixides disponibles.</p>";

    marcarPillActivo("eixides");
    }
         else if (section === "horari") {
  container.innerHTML = ciclesData[cicle].horari ? ciclesData[cicle].horari.join("")
    : "<p>No hi ha eixides disponibles.</p>";

    marcarPillActivo("horari");
    }
         else if (section === "continu") {
  container.innerHTML = ciclesData[cicle].continu
    ? ciclesData[cicle].continu.join("")
    : "<p>No hi ha continuïtat formativa disponible.</p>";

  marcarPillActivo("continu");
}
         else if (section === "requisits") {
  container.innerHTML = ciclesData[cicle].requisits
    ? ciclesData[cicle].requisits.join("")
    : "<p>No hi ha requisits disponibles.</p>";

  marcarPillActivo("requisits");
}
      
      else if (templates[section]) {
        container.innerHTML = templates[section];
        marcarPillActivo(section);
      } else {
        container.innerHTML = "<h3>Opció no disponible</h3>";
        marcarPillActivo(null);
      }

      if (alerta) alerta.innerHTML = ciclesData[cicle].alerta || "";
      enableVideoFullscreen();
      return;
    }

    // Ciclo inexistente => fallback a home
    history.pushState("", document.title, window.location.pathname + window.location.search);
    homeSection = "coneixerns";
    actualizarPagina();
  }

 // Click en menú de secciones
pills.forEach((pill) => {
  pill.addEventListener("click", () => {
    const pillKey = ((pill.dataset && pill.dataset.content) || "").toLowerCase();
    const { cicle } = getCicleAndSectionFromHash();

    // Matrícula: siempre abre link externo
    if (pillKey === "matricula") {
      window.open("https://portal.edu.gva.es/adminova/es/fp/", "_blank", "noopener,noreferrer");
      return;
    }

    // ✅ Més oferta formativa: volver a home (sin hash)
    if (pillKey === "mesoferta") {
      history.pushState("", document.title, window.location.pathname + window.location.search);
      homeSection = "coneixerns";
      actualizarPagina();
      return;
    }

    // SIN CICLO (sin hash): permitir coneixerns/centre/calendari SIN cambiar hash
    if (!cicle) {
      if (pillKey === "coneixerns" || pillKey === "centre" || pillKey === "calendari") {
        homeSection = pillKey;
        actualizarPagina();
      }
      return;
    }

    // CON CICLO: navegación por hash
    const nuevoHash = (pillKey === "coneixerns") ? `/${cicle}` : `/${cicle}/${pillKey}`;

    if (window.location.hash === "#" + nuevoHash) actualizarPagina();
    else window.location.hash = nuevoHash;
  });
});
  
  function actualizarPagina() {
     const { cicle, section } = getCicleAndSectionFromHash();

    // ✅ Si hay ciclo pero no hay sección, forzar /pla una sola vez
    if (cicle && !section) {
      window.location.hash = `/${cicle}/pla`;
      return; // importante para evitar doble render
    }
    toggleMenusByHash();
    togglePillsByHash();
    updateContent();
    mostrarOcultarElementos();
    updateVisitorsBadge();
    setTitleFromHash();
  }

  renderMenuCicles();
  window.addEventListener('hashchange', actualizarPagina);
  actualizarPagina();

  // --- Video fullscreen extra ---
  function enableVideoFullscreen() {
    const video = container.querySelector("video.video-panel");
    if (!video) return;
    if (video.dataset.fsBound === "1") return;
    video.dataset.fsBound = "1";
    video.style.cursor = "pointer";
    video.title = "Clica per veure en pantalla completa";
    video.addEventListener("click", async () => {
      try {
        if (document.fullscreenElement) {
          await document.exitFullscreen();
          return;
        }
        if (video.requestFullscreen) await video.requestFullscreen();
        else if (video.webkitRequestFullscreen) video.webkitRequestFullscreen();
        else if (video.msRequestFullscreen) video.msRequestFullscreen();
      } catch (e) {
        console.warn("No s'ha pogut activar pantalla completa:", e);
      }
    });
  }
});
