import { EdgeData } from "reaflow";

export const detectCycles = (edges: EdgeData[], setDetectCycles: (detectCycles: boolean) => void) => {
    const inRecursion = new Set();

    edges.forEach(edge => {
        inRecursion.add(edge.from);
        if(inRecursion.has(edge.to)) {
            setDetectCycles(true);
            return;
        }
    });
}