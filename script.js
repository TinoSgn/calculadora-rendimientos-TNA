const DAYS_IN_MONTH = 30;
const DAYS_IN_YEAR = 365;

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

let chart;

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

function formatMontoInput() {
  const n = parseMonto(montoEl.value);
  montoEl.value = new Intl.NumberFormat("es-AR", {
    maximumFractionDigits: 2,
  }).format(n);
  calcularYRender();
  saveState();
}

function calcularYRender() {
  const monto = parseMonto(montoEl.value);
  const tna = Number(tnaManualEl.value || 0);

  const r_d = tna / 100 / DAYS_IN_YEAR;
  const tea = Math.pow(1 + r_d, DAYS_IN_YEAR) - 1;

  const ganDiaria = monto * r_d;
  const ganMensual = monto * (Math.pow(1 + r_d, DAYS_IN_MONTH) - 1);
  const ganAnual = monto * (Math.pow(1 + r_d, DAYS_IN_YEAR) - 1);

  tnaUsadaEl.textContent = fmtPct(tna);
  tasaDiariaEl.textContent = fmtPct(r_d * 100);
  teaEl.textContent = fmtPct(tea * 100);
  ganDiaEl.textContent = fmtMoney(ganDiaria);
  ganMesEl.textContent = fmtMoney(ganMensual);
  ganAnioEl.textContent = fmtMoney(ganAnual);

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

  chart = new Chart(chartCanvas, {
    type: "line",
    data: { labels, datasets: [{ label: "Saldo proyectado", data }] },
    options: {
      responsive: true,
      tension: 0.3,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: (c) => "$ " + fmtMoney(c.parsed.y) } },
      },
      scales: { y: { ticks: { callback: (v) => "$ " + fmtMoney(v) } } },
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
    rows.push({
      mes,
      saldoInicial,
      interesMes,
      saldoFinal,
    });
    saldo = saldoFinal;
  }

  tablaBodyMensual.innerHTML = rows
    .map(
      (r) => `
    <tr>
      <td>Mes ${r.mes}</td>
      <td>$ ${fmtMoney(r.saldoInicial)}</td>
      <td>$ ${fmtMoney(r.interesMes)}</td>
      <td>$ ${fmtMoney(r.saldoFinal)}</td>
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
    rows.push({
      dia,
      saldoInicial,
      interesDia,
      saldoFinal,
    });
    saldo = saldoFinal;
  }

  tablaBodyDiaria.innerHTML = rows
    .map(
      (r) => `
    <tr>
      <td>Día ${r.dia}</td>
      <td>$ ${fmtMoney(r.saldoInicial)}</td>
      <td>$ ${fmtMoney(r.interesDia)}</td>
      <td>$ ${fmtMoney(r.saldoFinal)}</td>
    </tr>
  `
    )
    .join("");
}

function exportCSV() {
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
    tna: Number(tnaManualEl.value || 0),
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
    if (typeof s.monto === "number") {
      montoEl.value = new Intl.NumberFormat("es-AR", {
        maximumFractionDigits: 2,
      }).format(s.monto);
    }
    if (typeof s.tna === "number") tnaManualEl.value = s.tna;
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

montoEl.addEventListener("input", formatMontoInput);
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
  tnaManualEl.value = 30;
  document.querySelector(
    'input[name="granularidad"][value="mensual"]'
  ).checked = true;
  document.querySelector(
    'input[name="tablaGran"][value="mensual"]'
  ).checked = true;
  calcularYRender();
  saveState();
});

window.addEventListener("DOMContentLoaded", () => {
  loadState();
  montoEl.value = new Intl.NumberFormat("es-AR", {
    maximumFractionDigits: 2,
  }).format(parseMonto(montoEl.value));
  calcularYRender();
});
