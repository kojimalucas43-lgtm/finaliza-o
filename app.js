/** app.js — Interatividade da VigIA (versão simplificada) */

// ---------- Helpers ----------
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const setText = (map) => Object.entries(map).forEach(([id, txt]) => ($("#" + id).textContent = txt));
const setActive = (els, current) => els.forEach((el) => el.classList.toggle("active", el === current));
const brl = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

document.addEventListener("DOMContentLoaded", () => {
  initScrollAndReveal();
  initMobileNav();
  initPfCurve();
  initComparisonTable();
  initRcmMatrix();
  initRoiSimulator();
  initChecklist();
  initEmergencySteps();
});

// ---------- Scroll, reveal e menu ----------
function initScrollAndReveal() {
  const line = $("#scrollLine");
  window.addEventListener("scroll", () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    line.style.width = `${max > 0 ? Math.min(100, (scrollY / max) * 100) : 0}%`;
  }, { passive: true });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add("is-visible");
      observer.unobserve(e.target);
    });
  }, { threshold: 0.1 });
  $$(".reveal").forEach((el) => observer.observe(el));
}

function initMobileNav() {
  const btn = $("#menuToggle");
  const nav = $("#siteNav");
  const toggle = (open) => {
    nav.classList.toggle("open", open);
    btn.setAttribute("aria-expanded", open);
  };
  btn.addEventListener("click", () => toggle(!nav.classList.contains("open")));
  $$("a", nav).forEach((a) => a.addEventListener("click", () => toggle(false)));
}

// ---------- Curva P—F ----------
function initPfCurve() {
  const btns = $$(".pf-step-btn");

  function show(i) {
    const s = PF_STAGES[i];
    setActive(btns, btns[i]);
    setText({
      pfBadge: s.badge, pfCostTag: s.costTag, pfTitle: s.title,
      pfDescription: s.description, pfSignals: s.signals, pfAction: s.action, pfImpact: s.impact
    });
    $("#pfBadge").className = s.badgeClass;
  }

  $$(".pf-step-btn, .pf-node").forEach((el) =>
    el.addEventListener("click", () => show(Number(el.dataset.stage)))
  );
  show(0);
}

// ---------- Tabela comparativa ----------
function initComparisonTable() {
  $("#comparisonBody").innerHTML = COMPARISON_ROWS.map(
    ([criterio, reativa, preventiva, vigia]) => `
      <tr>
        <td>${criterio}</td>
        <td>${reativa}</td>
        <td class="cell-prev">${preventiva}</td>
        <td class="cell-prev">${vigia}</td>
      </tr>`
  ).join("");
}

// ---------- Matriz RCM ----------
function initRcmMatrix() {
  const state = { ...RCM_PRESETS.compressor };
  const options = $$(".seg-opt");

  function render() {
    options.forEach((b) =>
      b.classList.toggle("active", state[b.parentElement.dataset.question] === b.dataset.value)
    );

    const { safety, production, redundancy, costRatio } = state;
    const level =
      safety === "yes" || (production === "yes" && redundancy === "no") ? "A"
      : production === "yes" || costRatio === "high" ? "B"
      : "C";
    const r = RCM_LEVELS[level];

    setText({ rcmCriticality: r.tag, rcmDecisionTitle: r.title, rcmDecisionDesc: r.desc });
    $("#rcmCriticality").style.color = r.color;
    $("#rcmActionList").innerHTML = r.actions.map((a) => `<li>${a}</li>`).join("");
  }

  options.forEach((b) =>
    b.addEventListener("click", () => {
      state[b.parentElement.dataset.question] = b.dataset.value;
      render();
    })
  );
  $$(".preset").forEach((p) =>
    p.addEventListener("click", () => {
      Object.assign(state, RCM_PRESETS[p.dataset.preset]);
      render();
    })
  );
  render();
}

// ---------- Simulador de ROI ----------
function initRoiSimulator() {
  const sliders = ["downtimeCost", "failuresPerYear", "mttrHours", "preventiveMonthly"].map((id) => $("#" + id));

  function update() {
    const [costH, fails, mttr, prevMonth] = sliders.map((s) => Number(s.value));

    // Cenário 100% pós-falha
    const reactiveHours = fails * mttr;
    const reactiveTotal = reactiveHours * costH + fails * 4500;

    // Cenário preventiva + VigIA (35% das falhas restantes, reparo 35% mais rápido)
    const residualFails = fails * 0.35;
    const residualHours = residualFails * (mttr * 0.65);
    const prevAnnual = prevMonth * 12;
    const prevTotal = prevAnnual + residualHours * costH + residualFails * 2200;

    const savings = reactiveTotal - prevTotal;
    const max = Math.max(reactiveTotal, prevTotal, 1);

    setText({
      downtimeCostVal: `${brl(costH)} / h`,
      failuresPerYearVal: `${fails} falhas`,
      mttrHoursVal: `${mttr} horas`,
      preventiveMonthlyVal: `${brl(prevMonth)} / mês`,
      reactiveAnnualCost: brl(reactiveTotal),
      reactiveDowntimeInfo: `${reactiveHours}h paradas/ano`,
      preventiveAnnualCost: brl(prevTotal),
      preventiveDowntimeInfo: `Plano (${brl(prevAnnual)}) + residual`,
      annualSavings: `${brl(savings)} / ano`,
      roiPercent: `ROI: ${Math.round((savings / prevAnnual) * 100)}%`,
      hoursRecovered: `+${Math.max(0, Math.round(reactiveHours - residualHours))}h produtivas`
    });
    $("#barReactive").style.width = `${Math.round((reactiveTotal / max) * 100)}%`;
    $("#barPreventive").style.width = `${Math.round((prevTotal / max) * 100)}%`;
  }

  sliders.forEach((s) => s.addEventListener("input", update));
  update();
}

// ---------- Abas + Checklist preventivo ----------
function initChecklist() {
  // Abas (checklist / protocolo pós-falha)
  const tabs = $$(".work-tab");
  const panels = $$(".work-panel");
  tabs.forEach((t) =>
    t.addEventListener("click", () => {
      setActive(tabs, t);
      setActive(panels, $("#" + t.dataset.tab));
    })
  );

  // Checklist
  let asset = "motores";
  const done = new Set(); // guarda ids no formato "motores-0"
  const assetBtns = $$(".asset-opt");
  const feedback = $("#copyFeedback");

  function render() {
    const items = PREVENTIVE_CHECKLISTS[asset];
    const total = items.length;
    const count = items.filter((_, i) => done.has(`${asset}-${i}`)).length;

    $("#checklistItems").innerHTML = items.map(([title, freq, desc], i) => {
      const id = `${asset}-${i}`;
      const checked = done.has(id);
      return `
        <label class="check-row ${checked ? "done" : ""}">
          <input type="checkbox" data-id="${id}" ${checked ? "checked" : ""} />
          <div class="check-main">
            <div class="check-top">
              <span class="check-title">${title}</span>
              <span class="check-freq">${freq}</span>
            </div>
            <p class="check-desc">${desc}</p>
          </div>
        </label>`;
    }).join("");

    $("#checklistProgressText").textContent = `${count} / ${total} (${Math.round((count / total) * 100)}%)`;
  }

  // Delegação de evento: um único listener para todos os checkboxes
  $("#checklistItems").addEventListener("change", (e) => {
    done[e.target.checked ? "add" : "delete"](e.target.dataset.id);
    render();
  });

  assetBtns.forEach((b) =>
    b.addEventListener("click", () => {
      asset = b.dataset.asset;
      setActive(assetBtns, b);
      feedback.textContent = "";
      render();
    })
  );

  $("#resetChecklistBtn").addEventListener("click", () => {
    PREVENTIVE_CHECKLISTS[asset].forEach((_, i) => done.delete(`${asset}-${i}`));
    feedback.textContent = "";
    render();
  });

  $("#copyChecklistBtn").addEventListener("click", async () => {
    const label = $(".asset-opt.active").textContent.toUpperCase();
    const lines = PREVENTIVE_CHECKLISTS[asset].map(
      ([title, freq], i) => `${i + 1}. [${done.has(`${asset}-${i}`) ? "X" : " "}] (${freq}) ${title}`
    );
    try {
      await navigator.clipboard.writeText([`ORDEM PREVENTIVA VIGIA — ${label}`, ...lines].join("\n"));
      feedback.textContent = "Copiado.";
    } catch {
      feedback.textContent = "Não foi possível copiar.";
    }
  });

  render();
}

// ---------- Protocolo pós-falha ----------
function initEmergencySteps() {
  const btns = $$(".step-opt");

  function show(i) {
    const s = EMERGENCY_STEPS[i];
    setActive(btns, btns[i]);
    $("#stepCard").innerHTML = `
      <span class="item-tag warn">${s.code}</span>
      <h4>${s.title}</h4>
      <p>${s.summary}</p>
      <ul>${s.bullets.map((b) => `<li>${b}</li>`).join("")}</ul>`;
  }

  btns.forEach((b, i) => b.addEventListener("click", () => show(i)));
  show(0);
}
