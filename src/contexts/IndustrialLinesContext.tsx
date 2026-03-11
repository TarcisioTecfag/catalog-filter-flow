import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { industrialLines as defaultLines, IndustrialLine, LineModule, LineMachine } from "@/data/industrialLines";

interface LinesContextType {
  lines: IndustrialLine[];
  addLine: (line: IndustrialLine) => void;
  updateLine: (lineId: string, updates: Partial<Pick<IndustrialLine, "name" | "description" | "image">>) => void;
  deleteLine: (lineId: string) => void;
  addModule: (lineId: string, module: LineModule) => void;
  updateModule: (lineId: string, moduleId: string, updates: Partial<Pick<LineModule, "title" | "description">>) => void;
  deleteModule: (lineId: string, moduleId: string) => void;
  addMachine: (lineId: string, moduleId: string, machine: LineMachine) => void;
  updateMachine: (lineId: string, moduleId: string, machineIndex: number, machine: LineMachine) => void;
  deleteMachine: (lineId: string, moduleId: string, machineIndex: number) => void;
}

const STORAGE_KEY = "industrial_lines_data";

function loadLines(): IndustrialLine[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as IndustrialLine[];
      // Merge: keep stored customizations, add any new default lines not in storage
      const storedIds = new Set(parsed.map((l) => l.id));
      const merged = [...parsed];
      for (const dl of defaultLines) {
        if (!storedIds.has(dl.id)) merged.push(dl);
      }
      return merged;
    }
  } catch {}
  return [...defaultLines];
}

function saveLines(lines: IndustrialLine[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
}

const LinesContext = createContext<LinesContextType>({} as LinesContextType);

export const IndustrialLinesProvider = ({ children }: { children: ReactNode }) => {
  const [lines, setLines] = useState<IndustrialLine[]>(loadLines);

  const persist = useCallback((updated: IndustrialLine[]) => {
    setLines(updated);
    saveLines(updated);
  }, []);

  const addLine = useCallback((line: IndustrialLine) => {
    persist([...lines, line]);
  }, [lines, persist]);

  const updateLine = useCallback((lineId: string, updates: Partial<Pick<IndustrialLine, "name" | "description" | "image">>) => {
    persist(lines.map((l) => (l.id === lineId ? { ...l, ...updates } : l)));
  }, [lines, persist]);

  const deleteLine = useCallback((lineId: string) => {
    persist(lines.filter((l) => l.id !== lineId));
  }, [lines, persist]);

  const addModule = useCallback((lineId: string, module: LineModule) => {
    persist(lines.map((l) => l.id === lineId ? { ...l, modules: [...l.modules, module] } : l));
  }, [lines, persist]);

  const updateModule = useCallback((lineId: string, moduleId: string, updates: Partial<Pick<LineModule, "title" | "description">>) => {
    persist(lines.map((l) => l.id === lineId ? {
      ...l,
      modules: l.modules.map((m) => m.id === moduleId ? { ...m, ...updates } : m),
    } : l));
  }, [lines, persist]);

  const deleteModule = useCallback((lineId: string, moduleId: string) => {
    persist(lines.map((l) => l.id === lineId ? {
      ...l,
      modules: l.modules.filter((m) => m.id !== moduleId),
    } : l));
  }, [lines, persist]);

  const addMachine = useCallback((lineId: string, moduleId: string, machine: LineMachine) => {
    persist(lines.map((l) => l.id === lineId ? {
      ...l,
      modules: l.modules.map((m) => m.id === moduleId ? { ...m, machines: [...m.machines, machine] } : m),
    } : l));
  }, [lines, persist]);

  const updateMachine = useCallback((lineId: string, moduleId: string, machineIndex: number, machine: LineMachine) => {
    persist(lines.map((l) => l.id === lineId ? {
      ...l,
      modules: l.modules.map((m) => m.id === moduleId ? {
        ...m,
        machines: m.machines.map((mc, i) => i === machineIndex ? machine : mc),
      } : m),
    } : l));
  }, [lines, persist]);

  const deleteMachine = useCallback((lineId: string, moduleId: string, machineIndex: number) => {
    persist(lines.map((l) => l.id === lineId ? {
      ...l,
      modules: l.modules.map((m) => m.id === moduleId ? {
        ...m,
        machines: m.machines.filter((_, i) => i !== machineIndex),
      } : m),
    } : l));
  }, [lines, persist]);

  return (
    <LinesContext.Provider value={{ lines, addLine, updateLine, deleteLine, addModule, updateModule, deleteModule, addMachine, updateMachine, deleteMachine }}>
      {children}
    </LinesContext.Provider>
  );
};

export const useIndustrialLines = () => useContext(LinesContext);
