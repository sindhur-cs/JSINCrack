import type { NodeData, EdgeData } from "src/types/graph";

type Outgoers = [NodeData[], string[]];

export const getOutgoers = (
  nodeId: string,
  nodes: NodeData[],
  edges: EdgeData[],
  parent: string[] = [],
  // collapsedEdges?: string[]
): Outgoers => {
  let outgoerNodes: NodeData[] = [];
  const matchingNodes: string[] = [];
  let actualNodeList: NodeData[] = [];
  const actualOutgoerNodes: NodeData[] = [];
  const freqMap = {};

  if (parent.includes(nodeId)) {
    const initialParentNode = nodes.find(n => n.id === nodeId);

    if (initialParentNode) outgoerNodes.push(initialParentNode);
  }

  const findActualOutgoers = (currentNodeId: string) => {
    const outgoerEdges = edges.filter(e => {
      if(freqMap[e.to] && freqMap[e.to].parent !== e.from) {
        freqMap[e.to].value++;
      }
      else {
        freqMap[e.to] = {
          value: 1,
          parent: e.from
        };
      }
      return e.from === currentNodeId;
    });
    const outgoerIds = outgoerEdges.map(e => e.to);
    console.log("outgoerIds ", outgoerIds);
    
    actualNodeList = nodes.filter(n => {
      if (parent.includes(n.id) && !matchingNodes.includes(n.id)) matchingNodes.push(n.id);

      // incoming edges lesser or equal to 1 add to nodelist so that it is removed
      return (outgoerIds.includes(n.id) && !parent.includes(n.id));
    });
    console.log("actualNodelist ", actualNodeList, edges.filter(e => e.from === currentNodeId));
    
    actualOutgoerNodes.push(...actualNodeList);
    actualNodeList.forEach(node => {
      // go through this 
      console.log(nodeId, node.id);
      if(node.id !== nodeId) {
        findActualOutgoers(node.id);
      }
    });
  };

  findActualOutgoers(nodeId);
  console.log("actualOutgoersNodes ", actualOutgoerNodes);

  // incoming nodes
  const incomingEdgesGreaterThanOne = (nodeId: string) => {
    freqMap[nodeId].value--;
    return freqMap[nodeId].value > 0;
  };

  const findOutgoers = (currentNodeId: string) => {
    const outgoerIds = edges.filter(e => e.from === currentNodeId).map(e => e.to);
    console.log("outgoerIds ", outgoerIds);
    
    const nodeList = nodes.filter(n => {
      if (parent.includes(n.id) && !matchingNodes.includes(n.id)) matchingNodes.push(n.id);
      
      // incoming edges lesser or equal to 1 add to nodelist so that it is removed
      return (outgoerIds.includes(n.id) && !parent.includes(n.id) && !incomingEdgesGreaterThanOne(n.id));
    });
    console.log("nodelist ", nodeList, edges.filter(e => e.from === currentNodeId));
    
    outgoerNodes.push(...nodeList);
    nodeList.forEach(node => {
      // go through this 
      console.log(nodeId, node.id);
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
  console.log("Map ", freqMap);
  return [outgoerNodes, matchingNodes];
};
