import type { NodeData, EdgeData } from "src/types/graph";

export const getChildrenEdges = (nodes: NodeData[], edges: EdgeData[], currNodeId?: string): EdgeData[] => {
  const nodeIds = nodes.map(node => node.id);

  // Edge bug fixed:
  // before: all edges from and to were removed
  // after: the childNodes outGoing edge and currNode outgoing has to be removed
  return edges.filter(
    // edge => nodeIds.includes(edge.from as string) || nodeIds.includes(edge.to as string)
    edge => nodeIds.includes(edge.from as string) || currNodeId === edge.from
  );
};
