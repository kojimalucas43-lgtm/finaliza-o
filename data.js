/** data.js — Dados da VigIA (Preventiva & Pós-Falha) */

const PF_STAGES = [
  {
    badge: "ESTÁGIO 01 • PREVENTIVA", badgeClass: "prev", costTag: "CUSTO: 1.0×",
    title: "Manutenção Preventiva Sistemática",
    description: "O ativo opera em regime nominal. Rotinas preventivas eliminam desgaste prematuro antes mesmo do surgimento de anomalias.",
    signals: "Temperatura, vibração e corrente dentro da linha-base VigIA.",
    action: "Lubrificação, limpeza, reaperto e inspeção preventiva programada.",
    impact: "Disponibilidade máxima e zero parada não planejada."
  },
  {
    badge: "ESTÁGIO 02 • ALERTA VIGIA (PONTO P)", badgeClass: "prev", costTag: "CUSTO: 1.5×",
    title: "Detecção Precoce pela VigIA",
    description: "A VigIA identifica microdesvios de vibração, temperatura ou corrente no início da falha potencial, gerando automaticamente uma Ordem Preventiva Condicional.",
    signals: "Picos de ultrassom, leve elevação térmica ou assinatura espectral.",
    action: "Agendar intervenção controlada em janela do PCP com peça reservada.",
    impact: "Parada curta e planejada, impedindo a quebra funcional."
  },
  {
    badge: "ESTÁGIO 03 • DEGRADAÇÃO ACELERADA", badgeClass: "muted", costTag: "CUSTO: 3.5×",
    title: "Avanço do Desgaste Sem Intervenção",
    description: "Caso o alerta preventivo seja ignorado, folgas crescem rapidamente e o equipamento se aproxima do colapso mecânico ou elétrico.",
    signals: "Ruído audível, aquecimento externo e oscilação de corrente.",
    action: "Redução imediata de carga e parada programada urgente.",
    impact: "Risco elevado de quebra súbita e compra emergencial."
  },
  {
    badge: "ESTÁGIO 04 • PÓS-FALHA (PONTO F)", badgeClass: "warn", costTag: "CUSTO: 5.0× — 10.0×",
    title: "Falha Funcional Consumada",
    description: "O equipamento para subitamente. A manutenção atua apenas após a falha sob urgência máxima e danos secundários.",
    signals: "Travamento, queima de enrolamento ou desarme crítico.",
    action: "Bloqueio LOTO, reparo emergencial e retroalimentação RCA na VigIA.",
    impact: "Lucro cessante severo, horas extras e risco operacional."
  }
];

// [critério, pós-falha, preventiva, preventiva + VigIA]
const COMPARISON_ROWS = [
  ["Gatilho", "Quebra súbita (após a falha).", "Tempo, horímetro ou ciclos fixos.", "Condição em tempo real + cronograma preventivo."],
  ["Planejamento", "0% — Urgência e improviso.", "Total — Integrado ao PCP.", "Preditivo — Antecipa a janela antes do Ponto F."],
  ["Custo Direto", "Muito alto (horas extras e danos em cascata).", "Baixo e previsível no orçamento.", "Otimizado — Intervém no momento exato."],
  ["Segurança (NR-12)", "Risco elevado de acidentes na falha.", "Proteções e freios testados periodicamente.", "Bloqueio preventivo de falhas catastróficas."],
  ["Disponibilidade (MTBF)", "Quedas bruscas e imprevisíveis.", "Alta estabilidade operacional.", "Máxima disponibilidade e rastreabilidade contínua."]
];

const RCM_PRESETS = {
  compressor: { safety: "yes", production: "yes", redundancy: "no", costRatio: "high" },
  bomba: { safety: "no", production: "no", redundancy: "yes", costRatio: "high" },
  lampada: { safety: "no", production: "no", redundancy: "yes", costRatio: "low" }
};

const RCM_LEVELS = {
  A: {
    tag: "CRITICIDADE A • PREVENTIVA + VIGIA", color: "#6ee7b7",
    title: "Preventiva Obrigatória + Monitoramento VigIA",
    desc: "Operar até a falha é inaceitável. Exige plano preventivo rigoroso e vigilância contínua VigIA para interceptar falhas no Ponto P.",
    actions: [
      "Rotina preventiva periódica de lubrificação, limpeza e inspeção.",
      "Monitoramento VigIA contínuo no intervalo P—F.",
      "Estoque mínimo garantido de sobressalentes críticos."
    ]
  },
  B: {
    tag: "CRITICIDADE B • PREVENTIVA PROGRAMADA", color: "#f4f1ea",
    title: "Manutenção Preventiva Baseada no Tempo",
    desc: "Mesmo com redundância, o alto custo de reparo pós-falha justifica plano preventivo estruturado e rodízio operacional.",
    actions: [
      "Executar preventivas por horímetro ou calendário.",
      "Alternar operação com o ativo reserva (stand-by)."
    ]
  },
  C: {
    tag: "CRITICIDADE C • PÓS-FALHA CONTROLADA", color: "#7d7a73",
    title: "Run-to-Failure Aceitável",
    desc: "Sem risco à segurança, sem impacto produtivo e com baixo custo de troca, a atuação pós-falha é viável.",
    actions: [
      "Manter item padronizado de troca rápida em estoque.",
      "Substituir imediatamente após a falha."
    ]
  }
};

// [título, frequência, descrição]
const PREVENTIVE_CHECKLISTS = {
  motores: [
    ["Inspeção térmica e vibracional de mancais", "SEMANAL", "Validar temperatura (< 75 °C) e espectro na linha-base VigIA."],
    ["Limpeza de aletas e sistema de ventilação", "MENSAL", "Garantir troca térmica e evitar sobreaquecimento do estator."],
    ["Relubrificação controlada dos rolamentos", "TRIMESTRAL", "Aplicar graxa especificada na dosagem exata."],
    ["Medição de corrente e equilíbrio entre fases", "MENSAL", "Verificar desequilíbrio inferior a 2%."],
    ["Reaperto torquimétrico na caixa de ligação", "SEMESTRAL", "Prevenir pontos quentes e mau contato."],
    ["Teste de isolação (Megômetro) e alinhamento a laser", "ANUAL", "Assegurar rigidez dielétrica e alinhamento de eixo."]
  ],
  bombas: [
    ["Inspeção de selo mecânico ou gaxeta", "SEMANAL", "Checar vazamentos e linhas de selagem."],
    ["Leitura de pressão de sucção e recalque", "SEMANAL", "Prevenir cavitação e erosão do rotor."],
    ["Conferência de nível e aspecto do óleo", "QUINZENAL", "Verificar ausência de contaminação por água."],
    ["Limpeza do filtro Y de sucção", "MENSAL", "Evitar perda de carga e operação a seco."],
    ["Inspeção de acoplamento e proteção NR-12", "TRIMESTRAL", "Checar elastômero e fixação de proteções."],
    ["Troca de óleo e análise de vibração VigIA", "SEMESTRAL", "Renovar lubrificante e validar saúde dos rolamentos."]
  ],
  compressores: [
    ["Drenagem de condensado e purgadores", "DIÁRIA", "Evitar corrosão interna (NR-13) e umidade na rede."],
    ["Checagem de nível de óleo e temperatura de descarga", "DIÁRIA", "Manter regime térmico dentro do projeto."],
    ["Limpeza externa do resfriador e pré-filtro", "SEMANAL", "Evitar desarme por alta temperatura."],
    ["Inspeção de tensão e desgaste de correias", "MENSAL", "Prevenir patinação e perda de vazão."],
    ["Troca preventiva de filtros e separador ar/óleo", "TRIMESTRAL", "Substituir por horímetro monitorado pela VigIA."],
    ["Calibração de válvula de segurança (NR-13)", "ANUAL", "Conformidade legal obrigatória de vasos de pressão."]
  ],
  paineis: [
    ["Verificação de ventiladores e filtros de porta", "SEMANAL", "Manter dissipação térmica interna."],
    ["Termografia infravermelha em barramentos", "TRIMESTRAL", "Detectar aquecimento antes de falha elétrica."],
    ["Teste de botões de emergência e relés NR-12", "MENSAL", "Garantir atuação imediata de segurança."],
    ["Aspiração técnica interna e vedação IP", "SEMESTRAL", "Remover poeira condutiva."],
    ["Reaperto torquimétrico de bornes", "SEMESTRAL", "Corrigir folgas por dilatação térmica."],
    ["Conferência de DPS, aterramento e diagramas", "ANUAL", "Manter proteção contra surtos e documentação fiel."]
  ]
};

const EMERGENCY_STEPS = [
  {
    code: "01 / BLOQUEIO LOTO", title: "Isolamento de Energias Perigosas",
    summary: "Nenhuma intervenção pós-falha começa sem bloqueio físico completo e teste de energia zero.",
    bullets: [
      "Desenergizar disjuntores e bloquear válvulas pneumáticas/hidráulicas.",
      "Aplicar cadeado individual e etiqueta de identificação.",
      "Executar teste de energia zero antes de acessar o ativo."
    ]
  },
  {
    code: "02 / TRIAGEM TÉCNICA", title: "Diagnóstico & Danos Secundários",
    summary: "Identificar a causa imediata e inspecionar componentes acoplados afetados pela parada brusca.",
    bullets: [
      "Coletar relato operacional e últimos logs da VigIA.",
      "Inspecionar eixos, acoplamentos, fusíveis e sensores.",
      "Informar estimativa realista de MTTR ao PCP."
    ]
  },
  {
    code: "03 / MOBILIZAÇÃO MRO", title: "Sobressalentes & Ferramental",
    summary: "Requisitar peças pelo cadastro técnico (BOM) e separar instrumentos calibrados.",
    bullets: [
      "Retirar vedações, rolamentos e lubrificantes especificados.",
      "Evitar reparos improvisados sem torquímetro ou alinhador."
    ]
  },
  {
    code: "04 / COMISSIONAMENTO", title: "Reparo Controlado & Partida Assistida",
    summary: "Restabelecer tolerâncias nominais e validar comportamento sob carga.",
    bullets: [
      "Reinstalar todas as proteções NR-12 antes de liberar o LOTO.",
      "Acompanhar corrente, temperatura e vibração nos primeiros minutos."
    ]
  },
  {
    code: "05 / RETROALIMENTAÇÃO VIGIA (RCA)", title: "Análise de Causa Raiz & Ajuste Preventivo",
    summary: "Converter toda ocorrência pós-falha em regra preventiva permanente na VigIA.",
    bullets: [
      "Aplicar os 5 Porquês para identificar a lacuna preventiva.",
      "Atualizar periodicidade, checklist e limites de alerta na VigIA."
    ]
  }
];
