const DAYS_IN_MONTH = 30;
const DAYS_IN_YEAR = 365;

// ========== ELEMENTOS DOM ==========
const montoEl = document.getElementById("monto");
const tnaManualEl = document.getElementById("tnaManual");
const tnaUsadaEl = document.getElementById("tnaUsada");
const teaEl = document.getElementById("tea");
const tasaDiariaEl = document.getElementById("tasaDiaria");
const ganDiaEl = document.getElementById("gananciaDiaria");
const ganMesEl = document.getElementById("gananciaMensual");
const ganAnioEl = document.getElementById("gananciaAnual");
const chartCanvas = document.getElementById("chart");
const tablaBodyMensual = document.querySelector("#tablaBodyMensual");
const tablaBodyDiaria = document.querySelector("#tablaBodyDiaria");
const radiosTabla = document.querySelectorAll('input[name="tablaGran"]');
const tablaContMensual = document.getElementById("tablaContMensual");
const tablaContDiaria = document.getElementById("tablaContDiaria");
const radiosGran = document.querySelectorAll('input[name="granularidad"]');
const btnExport = document.getElementById("btnExport");
const btnReset = document.getElementById("btnReset");

// Modo Simulación Elements
const btnModeSimple = document.getElementById("btnModeSimple");
const btnModeSimulacion = document.getElementById("btnModeSimulacion");
const modoSimple = document.getElementById("modoSimple");
const modoSimulacion = document.getElementById("modoSimulacion");

const simDineroInicialEl = document.getElementById("simDineroInicial");
const simSueldoEl = document.getElementById("simSueldo");
const simGastosEl = document.getElementById("simGastos");
const simTNAEl = document.getElementById("simTNA");
const simGastoVacacionesEl = document.getElementById("simGastoVacaciones");
const simIncluirAguinaldoEl = document.getElementById("simIncluirAguinaldo");
const simMesesEl = document.getElementById("simMeses");
const simMesInicioEl = document.getElementById("simMesInicio");
const btnSimular = document.getElementById("btnSimular");
const btnExportSimulacion = document.getElementById("btnExportSimulacion");
const btnResetSimulacion = document.getElementById("btnResetSimulacion");

const simResultados = document.getElementById("simResultados");
const simGrafico = document.getElementById("simGrafico");
const simTabla = document.getElementById("simTabla");
const chartSimulacionCanvas = document.getElementById("chartSimulacion");
const tablaBodySimulacion = document.getElementById("tablaBodySimulacion");

let chart;
let chartSimulacion;
let datosSimulacion = null;

// ========== HELPERS VISUALES (NUEVO) ==========
// Animación de números tipo "rolling counter"
function animateValue(
  element,
  start,
  end,
  duration = 800,
  isMoney = true,
  isPct = false
) {
  if (!element) return;
  let startTimestamp = null;
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);

    // Easing function: easeOutQuart
    const easeProgress = 1 - Math.pow(1 - progress, 4);

    const currentVal = start + (end - start) * easeProgress;

    if (isMoney) element.textContent = fmtMoney(currentVal);
    else if (isPct) element.textContent = fmtPct(currentVal);
    else element.textContent = Math.floor(currentVal);

    if (progress < 1) {
      window.requestAnimationFrame(step);
    } else {
      // Asegurar valor final exacto
      if (isMoney) element.textContent = fmtMoney(end);
      else if (isPct) element.textContent = fmtPct(end);
      else element.textContent = end;
    }
  };
  window.requestAnimationFrame(step);
}

// Helper para obtener degradado en Chart.js
function getGradient(ctx, colorStart, colorEnd) {
  const gradient = ctx.createLinearGradient(0, 0, 0, 400);
  gradient.addColorStop(0, colorStart);
  gradient.addColorStop(1, colorEnd);
  return gradient;
}

// ========== FORMATEO ==========
const nfPct = new Intl.NumberFormat("es-AR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const nfMoney = new Intl.NumberFormat("es-AR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const nfNum = new Intl.NumberFormat("es-AR", { maximumFractionDigits: 2 });

const fmtPct = (x) => nfPct.format(x);
const fmtMoney = (x) => nfMoney.format(x ?? 0);
const fmtNum = (x) => nfNum.format(x ?? 0);

function parseMonto(str) {
  if (!str) return 0;
  let s = String(str).replace(/\s|\$/g, "");
  s = s.replace(/\./g, "").replace(/,/g, ".");
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : 0;
}

function formatMontoInput(el) {
  const n = parseMonto(el.value);
  el.value = new Intl.NumberFormat("es-AR", {
    maximumFractionDigits: 2,
  }).format(n);
}

function formatMontoRealTime(el) {
  let value = el.value;
  let cursorPosition = el.selectionStart;
  let oldLength = value.length;
  let cleaned = value.replace(/[^\d,]/g, "");
  let parts = cleaned.split(",");
  if (parts.length > 2) cleaned = parts[0] + "," + parts.slice(1).join("");
  let [integerPart, decimalPart] = cleaned.split(",");
  if (integerPart)
    integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  let formatted = integerPart || "";
  if (cleaned.includes(",")) formatted += "," + (decimalPart || "");

  el.value = formatted;
  let newLength = formatted.length;
  let newPosition = cursorPosition + (newLength - oldLength);
  if (formatted[newPosition - 1] === ".") newPosition++;
  el.setSelectionRange(newPosition, newPosition);
}

function parseTNA(str) {
  if (!str) return 0;
  let s = String(str).replace(/\s/g, "").replace(/,/g, ".");
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : 0;
}

// ========== CAMBIO DE MODO ==========
// Agregamos animación de fade al cambiar
function switchTabAnimation(showEl, hideEl) {
  hideEl.style.opacity = "0";
  hideEl.style.transform = "translateY(10px)";
  setTimeout(() => {
    hideEl.style.display = "none";
    showEl.style.display = "block";
    // Trigger reflow
    void showEl.offsetWidth;
    showEl.style.opacity = "1";
    showEl.style.transform = "translateY(0)";
  }, 200);
}

// Inicializar estilos para animación manual
modoSimple.style.transition = "opacity 0.3s ease, transform 0.3s ease";
modoSimulacion.style.transition = "opacity 0.3s ease, transform 0.3s ease";

btnModeSimple.addEventListener("click", () => {
  btnModeSimple.classList.add("active");
  btnModeSimulacion.classList.remove("active");
  switchTabAnimation(modoSimple, modoSimulacion);
  saveMode("simple");
});

btnModeSimulacion.addEventListener("click", () => {
  btnModeSimple.classList.remove("active");
  btnModeSimulacion.classList.add("active");
  switchTabAnimation(modoSimulacion, modoSimple);
  saveMode("simulacion");
});

function saveMode(mode) {
  localStorage.setItem("calc_mode", mode);
}
function loadMode() {
  const mode = localStorage.getItem("calc_mode") || "simple";
  if (mode === "simulacion") {
    btnModeSimple.classList.remove("active");
    btnModeSimulacion.classList.add("active");
    modoSimple.style.display = "none";
    modoSimulacion.style.display = "block";
  }
}

// ========== MODO SIMPLE ==========
function calcularYRender() {
  const monto = parseMonto(montoEl.value);
  const tna = parseTNA(tnaManualEl.value || 0);
  const r_d = tna / 100 / DAYS_IN_YEAR;
  const tea = Math.pow(1 + r_d, DAYS_IN_YEAR) - 1;
  const ganDiaria = monto * r_d;
  const ganMensual = monto * (Math.pow(1 + r_d, DAYS_IN_MONTH) - 1);
  const ganAnual = monto * (Math.pow(1 + r_d, DAYS_IN_YEAR) - 1);

  // ANIMACIÓN DE VALORES
  // Nota: Para animar necesitamos parsear el valor actual del texto, si falla usamos 0
  const prevTNA = parseTNA(tnaUsadaEl.textContent) || 0;
  animateValue(tnaUsadaEl, prevTNA, tna, 500, false, true); // esPct = true

  // TEA
  // Parsear texto previo es complejo por el %, asumimos salto visual o 0
  animateValue(tasaDiariaEl, 0, r_d * 100, 600, false, true);
  animateValue(teaEl, 0, tea * 100, 600, false, true);

  // Montos
  const prevGanDia = parseMonto(ganDiaEl.textContent) || 0;
  animateValue(ganDiaEl, prevGanDia, ganDiaria, 600, true);

  const prevGanMes = parseMonto(ganMesEl.textContent) || 0;
  animateValue(ganMesEl, prevGanMes, ganMensual, 600, true);

  const prevGanAnio = parseMonto(ganAnioEl.textContent) || 0;
  animateValue(ganAnioEl, prevGanAnio, ganAnual, 600, true);

  const granularidad =
    [...radiosGran].find((r) => r.checked)?.value || "mensual";
  renderChart(monto, r_d, granularidad);

  const tablaGran = [...radiosTabla].find((r) => r.checked)?.value || "mensual";
  if (tablaGran === "diaria") {
    renderTablaDiaria(monto, r_d);
    tablaContMensual.style.display = "none";
    tablaContDiaria.style.display = "block";
  } else {
    renderTablaMensual(monto, r_d);
    tablaContMensual.style.display = "block";
    tablaContDiaria.style.display = "none";
  }
}

function renderChart(monto, r_d, granularidad) {
  const ctx = chartCanvas.getContext("2d");
  if (chart) chart.destroy();

  let labels = [],
    data = [];
  if (granularidad === "diaria") {
    labels = Array.from({ length: 366 }, (_, i) => `Día ${i}`);
    data = labels.map((_, i) => monto * Math.pow(1 + r_d, i));
  } else {
    labels = Array.from({ length: 13 }, (_, i) => `Mes ${i}`);
    data = labels.map((_, i) => monto * Math.pow(1 + r_d, DAYS_IN_MONTH * i));
  }

  // Estilo "Cyberpunk" para el gráfico
  const gradientFill = getGradient(
    ctx,
    "rgba(110, 231, 255, 0.5)",
    "rgba(110, 231, 255, 0)"
  );

  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Saldo proyectado",
          data,
          borderColor: "#6ee7ff",
          backgroundColor: gradientFill,
          borderWidth: 3,
          pointRadius: 0,
          pointHoverRadius: 6,
          pointBackgroundColor: "#fff",
          fill: true,
          tension: 0.4, // Curva suave
        },
      ],
    },
    options: {
      responsive: true,
      interaction: { intersect: false, mode: "index" },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "rgba(15, 18, 38, 0.9)",
          titleColor: "#fff",
          bodyColor: "#6ee7ff",
          borderColor: "rgba(110, 231, 255, 0.3)",
          borderWidth: 1,
          padding: 10,
          callbacks: { label: (c) => "$ " + fmtMoney(c.parsed.y) },
        },
      },
      scales: {
        x: {
          grid: { display: false, color: "#333" },
          ticks: { color: "#94a3b8" },
        },
        y: {
          grid: { color: "rgba(255,255,255,0.05)" },
          ticks: { color: "#94a3b8", callback: (v) => "$ " + fmtMoney(v) },
          border: { display: false },
        },
      },
    },
  });
}

function renderTablaMensual(monto, r_d) {
  const rows = [];
  let saldo = monto;
  for (let mes = 1; mes <= 12; mes++) {
    const saldoInicial = saldo;
    const saldoFinal = saldoInicial * Math.pow(1 + r_d, DAYS_IN_MONTH);
    const interesMes = saldoFinal - saldoInicial;
    rows.push({ mes, saldoInicial, interesMes, saldoFinal });
    saldo = saldoFinal;
  }
  tablaBodyMensual.innerHTML = rows
    .map(
      (r) => `
    <tr>
      <td>Mes ${r.mes}</td>
      <td>$ ${fmtMoney(r.saldoInicial)}</td>
      <td style="color: var(--success)">$ ${fmtMoney(r.interesMes)}</td>
      <td style="font-weight:bold; color: var(--accent)">$ ${fmtMoney(
        r.saldoFinal
      )}</td>
    </tr>
  `
    )
    .join("");
}

function renderTablaDiaria(monto, r_d) {
  const rows = [];
  let saldo = monto;
  for (let dia = 1; dia <= DAYS_IN_MONTH; dia++) {
    const saldoInicial = saldo;
    const interesDia = saldoInicial * r_d;
    const saldoFinal = saldoInicial + interesDia;
    rows.push({ dia, saldoInicial, interesDia, saldoFinal });
    saldo = saldoFinal;
  }
  tablaBodyDiaria.innerHTML = rows
    .map(
      (r) => `
    <tr>
      <td>Día ${r.dia}</td>
      <td>$ ${fmtMoney(r.saldoInicial)}</td>
      <td style="color: var(--success)">$ ${fmtMoney(r.interesDia)}</td>
      <td style="font-weight:bold; color: var(--accent)">$ ${fmtMoney(
        r.saldoFinal
      )}</td>
    </tr>
  `
    )
    .join("");
}

function exportCSV() {
  // (Misma función original)
  const tablaGran = [...radiosTabla].find((r) => r.checked)?.value || "mensual";
  const tablaId = tablaGran === "diaria" ? "#tablaDiaria" : "#tablaMensual";
  const filename =
    tablaGran === "diaria"
      ? "proyeccion_30_dias.csv"
      : "proyeccion_12_meses.csv";
  const ths = Array.from(document.querySelectorAll(`${tablaId} thead th`)).map(
    (th) => th.textContent.trim()
  );
  const trs = Array.from(document.querySelectorAll(`${tablaId} tbody tr`));
  const rows = [ths];
  trs.forEach((tr) => {
    const tds = Array.from(tr.querySelectorAll("td")).map((td) =>
      td.textContent.replace(/\u00A0/g, " ").trim()
    );
    rows.push(tds);
  });
  const csv = rows
    .map((r) => r.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function saveState() {
  const state = {
    monto: parseMonto(montoEl.value),
    tna: parseTNA(tnaManualEl.value || 0),
    granularidad: [...radiosGran].find((r) => r.checked)?.value || "mensual",
    tablaGran: [...radiosTabla].find((r) => r.checked)?.value || "mensual",
  };
  localStorage.setItem("calc_mp_state", JSON.stringify(state));
}

function loadState() {
  try {
    const raw = localStorage.getItem("calc_mp_state");
    if (!raw) return;
    const s = JSON.parse(raw);
    if (typeof s.monto === "number")
      montoEl.value = new Intl.NumberFormat("es-AR", {
        maximumFractionDigits: 2,
      }).format(s.monto);
    if (typeof s.tna === "number")
      tnaManualEl.value = String(s.tna).replace(".", ",");
    if (s.granularidad) {
      const r = [...radiosGran].find((x) => x.value === s.granularidad);
      if (r) r.checked = true;
    }
    if (s.tablaGran) {
      const r = [...radiosTabla].find((x) => x.value === s.tablaGran);
      if (r) r.checked = true;
    }
  } catch (_) {}
}

// ========== EVENTOS MODO SIMPLE ==========
montoEl.addEventListener("input", () => formatMontoRealTime(montoEl));
montoEl.addEventListener("blur", () => {
  calcularYRender();
  saveState();
});
montoEl.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    calcularYRender();
    saveState();
  }
});
tnaManualEl.addEventListener("input", () => {
  calcularYRender();
  saveState();
});
radiosGran.forEach((r) =>
  r.addEventListener("change", () => {
    calcularYRender();
    saveState();
  })
);
radiosTabla.forEach((r) =>
  r.addEventListener("change", () => {
    calcularYRender();
    saveState();
  })
);
btnExport.addEventListener("click", exportCSV);
btnReset.addEventListener("click", () => {
  montoEl.value = "100.000";
  tnaManualEl.value = "36";
  document.querySelector(
    'input[name="granularidad"][value="mensual"]'
  ).checked = true;
  document.querySelector(
    'input[name="tablaGran"][value="mensual"]'
  ).checked = true;
  calcularYRender();
  saveState();
});

// ========== MODO SIMULACIÓN ==========
[simDineroInicialEl, simSueldoEl, simGastosEl, simGastoVacacionesEl].forEach(
  (el) => {
    el.addEventListener("input", () => formatMontoRealTime(el));
    el.addEventListener("blur", () => saveSimulacionState());
  }
);
simTNAEl.addEventListener("input", saveSimulacionState);
simMesesEl.addEventListener("input", saveSimulacionState);
simMesInicioEl.addEventListener("input", saveSimulacionState);
simIncluirAguinaldoEl.addEventListener("change", saveSimulacionState);

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function simular() {
  const dineroInicial = parseMonto(simDineroInicialEl.value);
  const sueldo = parseMonto(simSueldoEl.value);
  const gastoPromedio = parseMonto(simGastosEl.value);
  const tna = parseTNA(simTNAEl.value || 0);
  const gastoVacaciones = parseMonto(simGastoVacacionesEl.value);
  const incluirAguinaldo = simIncluirAguinaldoEl.checked;
  const cantidadMeses = Number(simMesesEl.value || 12);

  const rendimientoDiario = tna / 100 / DAYS_IN_YEAR;

  let fechaInicio;
  if (simMesInicioEl.value) {
    const [year, month] = simMesInicioEl.value.split("-").map(Number);
    fechaInicio = new Date(year, month - 1, 1);
  } else {
    const hoy = new Date();
    fechaInicio = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 1);
  }

  let dineroAhorrado = dineroInicial;
  const meses = [];
  let totalIntereses = 0;
  let totalIngresos = 0;
  let totalGastos = 0;
  let cantidadAguinaldos = 0;
  let totalGastoVacaciones = 0;

  for (let i = 0; i < cantidadMeses; i++) {
    const fechaMes = new Date(fechaInicio);
    fechaMes.setMonth(fechaMes.getMonth() + i);
    const mes = fechaMes.getMonth() + 1;
    const anio = fechaMes.getFullYear();
    const esAguinaldo = incluirAguinaldo && (mes === 6 || mes === 12);
    const ingresoMes = sueldo + (esAguinaldo ? sueldo * 0.5 : 0);
    let gastoMes = gastoPromedio;
    const esEnero = mes === 1;
    if (esEnero && gastoVacaciones > 0) {
      gastoMes += gastoVacaciones;
      totalGastoVacaciones += gastoVacaciones;
    }

    totalIngresos += ingresoMes;
    totalGastos += gastoMes;
    if (esAguinaldo) cantidadAguinaldos++;
    const saldoInicialMes = dineroAhorrado;
    dineroAhorrado += ingresoMes - gastoMes;
    const diasMes = getDaysInMonth(anio, mes - 1);
    let plusMensual = 0;
    for (let d = 0; d < diasMes; d++) {
      const interesDia = dineroAhorrado * rendimientoDiario;
      dineroAhorrado += interesDia;
      plusMensual += interesDia;
    }
    totalIntereses += plusMensual;
    const eventos = [];
    if (esAguinaldo) eventos.push("Aguinaldo");
    if (esEnero && gastoVacaciones > 0) eventos.push("Vacaciones");

    meses.push({
      numeroMes: i + 1,
      fecha: fechaMes,
      saldoInicial: saldoInicialMes,
      ingresos: ingresoMes,
      gastos: gastoMes,
      intereses: plusMensual,
      saldoFinal: dineroAhorrado,
      eventos: eventos.join(", ") || "-",
    });
  }

  datosSimulacion = {
    meses,
    saldoInicial: dineroInicial,
    saldoFinal: dineroAhorrado,
    totalIntereses,
    totalAhorro: totalIngresos - totalGastos,
    cantidadAguinaldos,
    gastoVacaciones: totalGastoVacaciones,
    cantidadMeses,
  };

  renderSimulacion();
}

function renderSimulacion() {
  if (!datosSimulacion) return;
  const d = datosSimulacion;

  simResultados.style.display = "block";
  simGrafico.style.display = "block";
  simTabla.style.display = "block";

  // Scroll suave hacia los resultados
  simResultados.scrollIntoView({ behavior: "smooth", block: "start" });

  // Animación de números en Resumen
  animateValue(document.getElementById("simSaldoInicial"), 0, d.saldoInicial);
  animateValue(document.getElementById("simSaldoFinal"), 0, d.saldoFinal);
  document.getElementById("simMesesTotal").textContent = d.cantidadMeses;
  animateValue(
    document.getElementById("simTotalIntereses"),
    0,
    d.totalIntereses
  );
  animateValue(document.getElementById("simTotalAhorro"), 0, d.totalAhorro);
  document.getElementById("simAguinaldos").textContent = d.cantidadAguinaldos;
  animateValue(document.getElementById("simVacaciones"), 0, d.gastoVacaciones);

  // Gráfico Simulación
  if (chartSimulacion) chartSimulacion.destroy();
  const ctx = chartSimulacionCanvas.getContext("2d");

  const labels = d.meses.map((m) => {
    const fecha = m.fecha;
    return `${String(fecha.getMonth() + 1).padStart(
      2,
      "0"
    )}/${fecha.getFullYear()}`;
  });
  const data = d.meses.map((m) => m.saldoFinal);

  const gradientFill = getGradient(
    ctx,
    "rgba(59, 130, 246, 0.5)",
    "rgba(59, 130, 246, 0)"
  );

  chartSimulacion = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Saldo acumulado",
          data,
          borderColor: "#3b82f6",
          backgroundColor: gradientFill,
          fill: true,
          tension: 0.4,
          borderWidth: 3,
          pointBackgroundColor: "#fff",
        },
      ],
    },
    options: {
      responsive: true,
      interaction: { mode: "index", intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "rgba(15, 18, 38, 0.9)",
          titleColor: "#fff",
          bodyColor: "#60a5fa",
          borderColor: "rgba(59, 130, 246, 0.3)",
          borderWidth: 1,
          callbacks: { label: (c) => "$ " + fmtMoney(c.parsed.y) },
        },
      },
      scales: {
        y: {
          ticks: { color: "#94a3b8", callback: (v) => "$ " + fmtMoney(v) },
          grid: { color: "rgba(255,255,255,0.05)" },
        },
        x: {
          ticks: { color: "#94a3b8" },
          grid: { display: false },
        },
      },
    },
  });

  tablaBodySimulacion.innerHTML = d.meses
    .map(
      (m) => `
    <tr>
      <td>Mes ${m.numeroMes}</td>
      <td>${String(m.fecha.getMonth() + 1).padStart(
        2,
        "0"
      )}/${m.fecha.getFullYear()}</td>
      <td>$ ${fmtMoney(m.saldoInicial)}</td>
      <td style="color: var(--success)">+ $ ${fmtMoney(m.ingresos)}</td>
      <td style="color: #ff6b6b">- $ ${fmtMoney(m.gastos)}</td>
      <td style="color: var(--accent)">+ $ ${fmtMoney(m.intereses)}</td>
      <td style="font-weight:bold; color: #fff">$ ${fmtMoney(m.saldoFinal)}</td>
      <td>${
        m.eventos !== "-"
          ? '<span style="background:rgba(255,204,102,0.2); color:#ffcc66; padding:2px 6px; border-radius:4px; font-size:0.8em">' +
            m.eventos +
            "</span>"
          : "-"
      }</td>
    </tr>
  `
    )
    .join("");
}

function exportSimulacionCSV() {
  // (Igual al original)
  if (!datosSimulacion) return;
  const headers = [
    "Mes",
    "Fecha",
    "Saldo inicial",
    "Ingresos",
    "Gastos",
    "Intereses",
    "Saldo final",
    "Eventos",
  ];
  const rows = [headers];
  datosSimulacion.meses.forEach((m) => {
    rows.push([
      `Mes ${m.numeroMes}`,
      `${String(m.fecha.getMonth() + 1).padStart(
        2,
        "0"
      )}/${m.fecha.getFullYear()}`,
      `$ ${fmtMoney(m.saldoInicial)}`,
      `$ ${fmtMoney(m.ingresos)}`,
      `$ ${fmtMoney(m.gastos)}`,
      `$ ${fmtMoney(m.intereses)}`,
      `$ ${fmtMoney(m.saldoFinal)}`,
      m.eventos,
    ]);
  });
  const csv = rows
    .map((r) =>
      r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
    )
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "simulacion_ahorros.csv";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function resetSimulacion() {
  simDineroInicialEl.value = "0";
  simSueldoEl.value = "500.000";
  simGastosEl.value = "300.000";
  simTNAEl.value = "36";
  simGastoVacacionesEl.value = "800.000";
  simIncluirAguinaldoEl.checked = true;
  simMesesEl.value = 12;
  simMesInicioEl.value = "";
  simResultados.style.display = "none";
  simGrafico.style.display = "none";
  simTabla.style.display = "none";
  datosSimulacion = null;
  saveSimulacionState();
}

function saveSimulacionState() {
  const state = {
    dineroInicial: parseMonto(simDineroInicialEl.value),
    sueldo: parseMonto(simSueldoEl.value),
    gastos: parseMonto(simGastosEl.value),
    tna: parseTNA(simTNAEl.value || 0),
    gastoVacaciones: parseMonto(simGastoVacacionesEl.value),
    incluirAguinaldo: simIncluirAguinaldoEl.checked,
    meses: Number(simMesesEl.value || 12),
    mesInicio: simMesInicioEl.value,
  };
  localStorage.setItem("calc_sim_state", JSON.stringify(state));
}

function loadSimulacionState() {
  try {
    const raw = localStorage.getItem("calc_sim_state");
    if (!raw) return;
    const s = JSON.parse(raw);
    if (typeof s.dineroInicial === "number")
      simDineroInicialEl.value = new Intl.NumberFormat("es-AR", {
        maximumFractionDigits: 2,
      }).format(s.dineroInicial);
    if (typeof s.sueldo === "number")
      simSueldoEl.value = new Intl.NumberFormat("es-AR", {
        maximumFractionDigits: 2,
      }).format(s.sueldo);
    if (typeof s.gastos === "number")
      simGastosEl.value = new Intl.NumberFormat("es-AR", {
        maximumFractionDigits: 2,
      }).format(s.gastos);
    if (typeof s.tna === "number")
      simTNAEl.value = String(s.tna).replace(".", ",");
    if (typeof s.gastoVacaciones === "number")
      simGastoVacacionesEl.value = new Intl.NumberFormat("es-AR", {
        maximumFractionDigits: 2,
      }).format(s.gastoVacaciones);
    if (typeof s.incluirAguinaldo === "boolean")
      simIncluirAguinaldoEl.checked = s.incluirAguinaldo;
    if (typeof s.meses === "number") simMesesEl.value = s.meses;
    if (s.mesInicio) simMesInicioEl.value = s.mesInicio;
  } catch (_) {}
}

// ========== EVENTOS SIMULACIÓN ==========
btnSimular.addEventListener("click", simular);
btnExportSimulacion.addEventListener("click", exportSimulacionCSV);
btnResetSimulacion.addEventListener("click", resetSimulacion);

// ========== INICIALIZACIÓN ==========
window.addEventListener("DOMContentLoaded", () => {
  loadMode();
  loadState();
  loadSimulacionState();
  montoEl.value = new Intl.NumberFormat("es-AR", {
    maximumFractionDigits: 2,
  }).format(parseMonto(montoEl.value));
  calcularYRender();
});
