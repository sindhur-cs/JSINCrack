import type { NodeData, EdgeData } from "src/types/graph";

type Outgoers = [NodeData[], EdgeData[]];

export const getHighlightedPath = (
  nodeId: string,
  nodes: NodeData[],
  edges: EdgeData[],
  parent: string[] = [],
): Outgoers => {
  let outgoerNodes: NodeData[] = [];
  const matchingNodes: string[] = [];
  const outgoerEdges: EdgeData[] = [];

  if (parent.includes(nodeId)) {
    const initialParentNode = nodes.find(n => n.id === nodeId);

    if (initialParentNode) outgoerNodes.push(initialParentNode);
  }

  // incoming nodes
  // const incomingEdgesGreaterThanOne = (nodeId: string) => {
  //   return fMap[nodeId].value > 1;
  // };

  const findOutgoers = (currentNodeId: string) => {
    console.log("Highlighted path edges ", edges.filter(e => e.from === currentNodeId));
    outgoerEdges.push(...edges.filter(e => e.from === currentNodeId));
    const outgoerIds = edges.filter(e => e.from === currentNodeId).map(e => e.to);
    console.log("outgoerIds ", outgoerIds);
    
    const nodeList = nodes.filter(n => {
      if (parent.includes(n.id) && !matchingNodes.includes(n.id)) matchingNodes.push(n.id);
      
      // const incomingEdges = incomingEdgesGreaterThanOne(n.id);

      // incoming edges lesser or equal to 1 add to nodelist so that it is removed
      if(outgoerIds.includes(n.id) && !parent.includes(n.id)) {
        return n;
      }
    });
    console.log("nodelist ", nodeList, edges.filter(e => e.from === currentNodeId));
    
    outgoerNodes.push(...nodeList);
    nodeList.forEach(node => {
      // go through this 
      if(node.id !== nodeId) {
        findOutgoers(node.id);
      }
      else {
        // set outgoerNodes without the nodeId to avoid cyclic dependency recursion
        outgoerNodes = outgoerNodes.filter(node => node.id !== nodeId);
      }
    });
  };

  findOutgoers(nodeId);

  console.log("outgoerNodes ", outgoerNodes);
  
  return [outgoerNodes, outgoerEdges];
};
