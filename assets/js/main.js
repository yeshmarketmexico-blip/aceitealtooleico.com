(function () {
  "use strict";
  var dl = (window.dataLayer = window.dataLayer || []);

  // Medición de clics a WhatsApp y teléfono
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("[data-track]");
    if (a) dl.push({ event: a.getAttribute("data-track"), cta_location: a.getAttribute("data-loc") || "" });
    var pre = e.target.closest && e.target.closest("[data-interes]");
    if (pre) {
      var msg = document.getElementById("f-mensaje");
      if (msg && !msg.value) msg.value = pre.getAttribute("data-interes");
    }
  });

  var form = document.getElementById("form-cotizacion");
  if (!form) return;
  var status = document.getElementById("form-status");
  var endpoint = form.getAttribute("data-endpoint") || "";
  var waNumber = form.getAttribute("data-wa") || "";

  function val(id) { var el = document.getElementById(id); return el ? el.value.trim() : ""; }
  function show(html, cls) { status.className = "form-status " + cls; status.innerHTML = html; status.hidden = false; status.focus(); }
  function esc(s) { return s.replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }
    if (val("f-web")) return; // honeypot

    var btn = form.querySelector("button[type=submit]");
    btn.disabled = true;

    var resumen =
      "Hola, quiero hacer un pedido de aceite de girasol alto oleico 20 L.\n" +
      "Nombre: " + val("f-nombre") + "\n" +
      "Empresa: " + val("f-empresa") + "\n" +
      "Teléfono/WhatsApp: " + val("f-telefono") + "\n" +
      (val("f-correo") ? "Correo: " + val("f-correo") + "\n" : "") +
      "Ciudad/Estado: " + val("f-ciudad") + "\n" +
      "Cantidad aproximada: " + val("f-cantidad") + "\n" +
      (val("f-mensaje") ? "Mensaje: " + val("f-mensaje") : "");
    var waUrl = "https://wa.me/" + waNumber + "?text=" + encodeURIComponent(resumen);

    function done() {
      dl.push({ event: "generate_lead", lead_channel: endpoint ? "form" : "form_whatsapp", cantidad: val("f-cantidad") });
      btn.disabled = false;
    }

    if (endpoint) {
      fetch(endpoint, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } })
        .then(function (r) {
          if (!r.ok) throw new Error(r.status);
          show("<strong>Solicitud recibida.</strong> Te contactaremos para confirmar total y hora de entrega. Si lo prefieres, <a href=\"" + esc(waUrl) + "\" target=\"_blank\" rel=\"noopener\">envíala también por WhatsApp</a>.", "ok");
          form.reset(); done();
        })
        .catch(function () {
          show("No pudimos enviar el formulario. <a href=\"" + esc(waUrl) + "\" target=\"_blank\" rel=\"noopener\">Envía tu solicitud por WhatsApp</a> con los datos ya capturados.", "err");
          btn.disabled = false;
        });
    } else {
      show("Tu solicitud está lista. <a href=\"" + esc(waUrl) + "\" target=\"_blank\" rel=\"noopener\">Ábrela en WhatsApp y envíala</a> para confirmar tu pedido.", "ok");
      var w = null;
      try { w = window.open(waUrl, "_blank", "noopener"); } catch (err) {}
      done();
    }
  });
})();

// Calculadora de costo semanal
(function () {
  var f = document.getElementById("calc"); if (!f) return;
  var out = f.querySelector(".calc-out"), ho = parseFloat(out.getAttribute("data-ho"));
  var fmt = function (n) { return "$" + Math.round(n).toLocaleString("es-MX"); };
  function g(id) { var v = parseFloat(document.getElementById(id).value); return isFinite(v) && v > 0 ? v : 0; }
  function upd() {
    var L = g("calc-litros"), C = g("calc-cambios"), P = g("calc-precio");
    if (!L || !C || !P) return;
    var fac = ho / P, dias = 7 / C;
    document.getElementById("calc-hoy").textContent = fmt(L * C * P);
    document.getElementById("calc-ho").textContent = fmt(L * C * ho);
    document.getElementById("calc-factor").textContent = fac.toFixed(1);
    document.getElementById("calc-dias").textContent = fac <= 1
      ? "Con tu precio actual, el alto oleico ya te sale igual o más barato."
      : "Cambiar cada " + (dias * fac).toFixed(1) + " días en lugar de cada " + dias.toFixed(1);
  }
  f.addEventListener("input", upd);
})();
