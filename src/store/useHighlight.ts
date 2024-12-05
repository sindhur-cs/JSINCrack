import { create } from "zustand";

interface HighlightState {
    highlighedPaths: Set<string>;
    highlightedNodes: Set<string>;
    currNode: string;
    setHighlightedPaths: (paths: string[], nodes: string[], nodeId: string) => void;
}

const useHighlight = create<HighlightState>((set, get) => ({
    highlighedPaths: new Set([]),
    highlightedNodes: new Set([]),
    currNode: "",
    setHighlightedPaths: (paths: string[], nodes: string[], nodeId: string) => {
        if(nodeId === get().currNode) {
            set({ highlighedPaths: new Set([]), highlightedNodes: new Set([]), currNode: "" });
        }
        else {
            set({ highlighedPaths: new Set([...paths]), highlightedNodes: new Set([...nodes]), currNode: nodeId });
        }
    }
}));

export default useHighlight;