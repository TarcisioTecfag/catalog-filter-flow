import { machines, type Machine } from "@/data/machines";
import type { FagnerAction, FlowEdge, FlowNode } from "./useFagnerAgent";

/**
 * Lightweight intent parser. Translates a free-form Portuguese chat message
 * into a queue of FagnerActions plus a textual reply for the chat UI.
 *
 * No AI/back-end here: pure keyword + fuzzy matching. The shape (intent → reply
 * + action queue) is designed so the production system can drop a real LLM in
 * without touching the agent or the chat UI.
 */

export interface InterpretInput {
  text: string;
  nodes: FlowNode[];
  edges: FlowEdge[];
  // Layout helpers — agent needs to know where to drop the next machine.
  nodeWidth: number;
  nodeHeight: number;
  layoutOrigin: { x: number; y: number }; // top-left of first node
  layoutGapX: number;
}

export interface InterpretResult {
  reply: string;
  actions: FagnerAction[];
  /**
   * When true, the orchestrator should append `connect` actions linking each
   * newly-dropped node to the previous one, in the order they were dropped.
   * Used by "monte uma linha" since drop ids only exist at runtime.
   */
  autoConnectNewDrops?: boolean;
}

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

/** Very small tokenizer for fuzzy machine matching by name/model/tags. */
function findMachineByPhrase(phrase: string): Machine | null {
  const q = norm(phrase).trim();
  if (!q) return null;
  // Exact-ish: word-by-word presence.
  let best: { m: Machine; score: number } | null = null;
  for (const m of machines) {
    const haystack = norm(`${m.name} ${m.model} ${m.subcategory} ${m.tags.join(" ")}`);
    let score = 0;
    for (const word of q.split(/\s+/).filter(Boolean)) {
      if (haystack.includes(word)) score += word.length;
    }
    if (score > 0 && (!best || score > best.score)) best = { m, score };
  }
  return best?.m ?? null;
}

/** Pick a curated lineup for "monte uma linha de X" requests. */
function curatedLine(kind: "envase" | "embalagem" | "rotulagem"): Machine[] {
  const buckets: Record<typeof kind, RegExp[]> = {
    envase: [/esteira/i, /envasadora/i, /rosqu/i, /rotulad/i, /datad/i],
    embalagem: [/esteira/i, /encartuch/i, /embalad/i, /seladora/i, /termoencolh/i],
    rotulagem: [/esteira/i, /rotulad/i, /datad/i, /inspe/i],
  };
  const order = buckets[kind];
  const picked: Machine[] = [];
  const used = new Set<string>();
  for (const rx of order) {
    const m = machines.find((x) => rx.test(x.name) && !used.has(x.id));
    if (m) {
      picked.push(m);
      used.add(m.id);
    }
  }
  // Fallback: at least 3 machines.
  if (picked.length < 3) {
    for (const m of machines) {
      if (used.has(m.id)) continue;
      picked.push(m);
      used.add(m.id);
      if (picked.length >= 3) break;
    }
  }
  return picked.slice(0, 5);
}

/** Build the action queue to assemble a fresh line from a machine list. */
function buildAssembleActions(
  list: Machine[],
  origin: { x: number; y: number },
  nodeWidth: number,
  gapX: number,
): { actions: FagnerAction[]; tempIds: string[] } {
  const actions: FagnerAction[] = [];
  // We don't know real node ids until dropAt commits — but the agent assigns
  // ids based on Date.now/random. We can't reference them here. Instead we
  // emit a synthetic placeholder and resolve after each drop via a special
  // "connect last two" pattern: the agent runs sequentially, so we can rely
  // on the chat-side caller to query the latest nodes after each drop.
  // SIMPLER: emit drop actions tagged with a "tempId", then a separate pass
  // builds connect actions referencing those tempIds. The agent doesn't know
  // tempIds — so we transform here by deferring connect emission to the
  // caller using a sentinel. Approach: we just emit drops; the orchestrator
  // adds connects after each drop based on the resulting node ids.
  const tempIds: string[] = [];
  list.forEach((m, i) => {
    tempIds.push(m.id);
    if (i > 0) {
      // Brief human pause between machines: look at canvas, decide next step.
      actions.push({ kind: "wait", ms: 700 });
    }
    actions.push({
      kind: "say",
      text: i === 0 ? "Beleza, vou montar isso pra você." : `Agora a ${m.name.split(" ")[0]}…`,
      holdMs: i === 0 ? 1600 : 1200,
    });
    actions.push({ kind: "pickFromCatalog", machineId: m.id });
    actions.push({
      kind: "dropAt",
      machineId: m.id,
      x: origin.x + i * (nodeWidth + gapX),
      y: origin.y,
    });
  });
  return { actions, tempIds };
}

export function interpretChat(input: InterpretInput): InterpretResult {
  const { text, nodes, edges, nodeWidth, nodeHeight: _nh, layoutOrigin, layoutGapX } = input;
  const q = norm(text);

  // ===== Greeting =====
  if (/^(oi|ola|bom dia|boa tarde|boa noite|opa|eai)\b/.test(q)) {
    return {
      reply:
        "Olá! 👋 Sou o Fagner. Posso montar uma linha pra você (ex.: \"monte uma linha de envase\"), adicionar uma máquina (\"adicione uma esteira\"), conectar (\"conecte a esteira na envasadora\"), mover, remover ou consertar conexões. Manda aí.",
      actions: [],
    };
  }

  // ===== Build a full line =====
  const buildMatch = q.match(/\b(monte|criar?|montar|fazer|fa[cç]a|gera|gere)\b.*\b(linha|fluxo|processo)\b/);
  if (buildMatch) {
    let kind: "envase" | "embalagem" | "rotulagem" = "envase";
    if (/embala/.test(q)) kind = "embalagem";
    else if (/rotul/.test(q)) kind = "rotulagem";
    const list = curatedLine(kind);
    const { actions } = buildAssembleActions(list, layoutOrigin, nodeWidth, layoutGapX);
    return {
      reply: `Vou montar uma linha de ${kind} com ${list.length} máquinas: ${list
        .map((m) => m.name)
        .join(" → ")}. Pode acompanhar no canvas.`,
      actions,
      autoConnectNewDrops: true,
    };
  }

  // ===== Add a single machine =====
  const addMatch = q.match(/\b(adicion[ae]|coloca|coloque|inseri|insere|p[oõ]e|poe)\b\s+(?:uma?\s+)?(.+)/);
  if (addMatch) {
    const phrase = addMatch[2].replace(/\b(no|na|do|da|para|pro|pra|aqui|canvas|fluxo|linha)\b.*$/, "").trim();
    const m = findMachineByPhrase(phrase);
    if (!m) {
      return {
        reply: `Não achei nenhuma máquina parecida com "${phrase}" no catálogo. Tenta um termo mais específico (ex.: "envasadora", "rotuladora", "esteira").`,
        actions: [],
      };
    }
    const slot = nodes.length;
    return {
      reply: `Adicionando ${m.name} ao fluxo.`,
      actions: [
        { kind: "say", text: `${m.name}, deixa comigo.`, holdMs: 900 },
        { kind: "pickFromCatalog", machineId: m.id },
        {
          kind: "dropAt",
          machineId: m.id,
          x: layoutOrigin.x + slot * (nodeWidth + layoutGapX),
          y: layoutOrigin.y,
        },
      ],
    };
  }

  // ===== Connect A com B =====
  const connectMatch = q.match(/\b(conecte|conecta|liga|ligue|une|junte|junta)\b\s+(.+?)\s+(?:com|na|no|ao|à|a|em)\s+(.+)/);
  if (connectMatch) {
    const aPhrase = connectMatch[2].trim();
    const bPhrase = connectMatch[3].trim();
    const findNode = (phrase: string) => {
      const target = norm(phrase);
      for (const n of nodes) {
        const m = machines.find((x) => x.id === n.machineId);
        if (!m) continue;
        const hay = norm(`${m.name} ${m.model} ${m.subcategory}`);
        if (target.split(/\s+/).every((w) => hay.includes(w))) return n;
      }
      return null;
    };
    const a = findNode(aPhrase);
    const b = findNode(bPhrase);
    if (!a || !b) {
      return {
        reply: `Não encontrei ${!a ? `"${aPhrase}"` : `"${bPhrase}"`} no canvas. Adiciona primeiro com "adicione ..."`,
        actions: [],
      };
    }
    return {
      reply: `Conectando ${aPhrase} → ${bPhrase}.`,
      actions: [
        { kind: "say", text: "Conectando…", holdMs: 700 },
        { kind: "connect", sourceId: a.id, targetId: b.id },
      ],
    };
  }

  // ===== Remove =====
  const removeMatch = q.match(/\b(remov[ae]|delet[ae]|exclu[ai]|tira|tire|apaga|apague)\b\s+(?:a\s+|o\s+)?(.+)/);
  if (removeMatch) {
    const phrase = removeMatch[2].trim();
    if (/\b(conex[aã]o|liga[cç][aã]o|seta|edge)\b/.test(phrase)) {
      // Try to find an edge by mentioning its endpoints.
      const subs = phrase.split(/\b(entre|de|para|com|na)\b/);
      const target = norm(subs.join(" "));
      for (const e of edges) {
        const src = nodes.find((n) => n.id === e.source);
        const tgt = nodes.find((n) => n.id === e.target);
        if (!src || !tgt) continue;
        const sm = machines.find((m) => m.id === src.machineId);
        const tm = machines.find((m) => m.id === tgt.machineId);
        if (!sm || !tm) continue;
        const hay = norm(`${sm.name} ${tm.name}`);
        const words = target.split(/\s+/).filter((w) => w.length > 3);
        if (words.length && words.some((w) => hay.includes(w))) {
          return {
            reply: `Removendo conexão ${sm.name} → ${tm.name}.`,
            actions: [
              { kind: "say", text: "Vou desfazer essa.", holdMs: 800 },
              { kind: "deleteEdge", edgeId: e.id },
            ],
          };
        }
      }
      // Fallback: remove last edge.
      const last = edges[edges.length - 1];
      if (last) {
        return {
          reply: "Removendo a última conexão.",
          actions: [
            { kind: "say", text: "Tirando essa conexão.", holdMs: 700 },
            { kind: "deleteEdge", edgeId: last.id },
          ],
        };
      }
      return { reply: "Não há conexões para remover.", actions: [] };
    }
    // Otherwise try to match a node by machine name.
    const target = norm(phrase);
    const hit = nodes.find((n) => {
      const m = machines.find((x) => x.id === n.machineId);
      if (!m) return false;
      const hay = norm(`${m.name} ${m.model} ${m.subcategory}`);
      return target.split(/\s+/).every((w) => hay.includes(w));
    });
    if (!hit) {
      return { reply: `Não encontrei "${phrase}" no canvas.`, actions: [] };
    }
    const m = machines.find((x) => x.id === hit.machineId);
    return {
      reply: `Removendo ${m?.name ?? "máquina"}.`,
      actions: [
        { kind: "say", text: "Removendo…", holdMs: 700 },
        { kind: "deleteNode", nodeId: hit.id },
      ],
    };
  }

  // ===== Conserte / refaça =====
  if (/\b(conserta|conserte|arruma|arrume|refa[cç]a|corrige|corrija)\b/.test(q)) {
    if (nodes.length < 2) {
      return {
        reply: "Preciso de pelo menos duas máquinas no canvas pra reconstruir o fluxo. Manda \"monte uma linha\" ou adiciona algumas máquinas.",
        actions: [],
      };
    }
    // Strategy: clear all edges, then re-link in left-to-right order.
    const sorted = [...nodes].sort((a, b) => a.x - b.x);
    const actions: FagnerAction[] = [
      { kind: "say", text: "Vou reorganizar as conexões.", holdMs: 900 },
    ];
    for (const e of edges) actions.push({ kind: "deleteEdge", edgeId: e.id });
    for (let i = 0; i < sorted.length - 1; i++) {
      actions.push({ kind: "connect", sourceId: sorted[i].id, targetId: sorted[i + 1].id });
    }
    actions.push({ kind: "say", text: "Pronto, fluxo reconstruído. ✨", holdMs: 1200 });
    return {
      reply: `Reconstruindo o fluxo: vou apagar as ${edges.length} conexão(ões) atuais e religar as ${sorted.length} máquinas em ordem da esquerda pra direita.`,
      actions,
    };
  }

  // ===== Analyze (no actions, just text) =====
  if (/\b(analis|revis|verific)\w*/.test(q)) {
    if (nodes.length === 0) {
      return {
        reply: "Canvas vazio. Manda \"monte uma linha de envase\" pra eu começar.",
        actions: [],
      };
    }
    const names = nodes.map((n) => machines.find((m) => m.id === n.machineId)?.name).filter(Boolean);
    return {
      reply: `Você tem ${nodes.length} máquina(s) e ${edges.length} conexão(ões):\n\n${names
        .map((n, i) => `${i + 1}. ${n}`)
        .join("\n")}\n\n${
        edges.length < nodes.length - 1
          ? "⚠️ Algumas máquinas ainda não estão conectadas. Quer que eu reorganize? (\"conserte o fluxo\")"
          : "✅ O fluxo parece consistente."
      }`,
      actions: [],
    };
  }

  // ===== Default =====
  return {
    reply:
      "Posso fazer várias coisas pra você:\n• \"monte uma linha de envase\"\n• \"adicione uma rotuladora\"\n• \"conecte a esteira na envasadora\"\n• \"remova a datadora\" / \"remova a conexão\"\n• \"conserte o fluxo\"\n• \"analise meu fluxo\"",
    actions: [],
  };
}
