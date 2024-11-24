import type { NodeData, EdgeData } from "src/types/graph";

type Outgoers = [NodeData[], string[]];

export const getOutgoers = (
  nodeId: string,
  nodes: NodeData[],
  edges: EdgeData[],
  parent: string[] = [],
  freqMap: any,
  expandedNodes: string[],
  isExpand: boolean
): Outgoers => {
  let outgoerNodes: NodeData[] = [];
  const matchingNodes: string[] = [];
  let actualNodeList: NodeData[] = [];
  const actualOutgoerNodes: NodeData[] = [];
  console.log(isExpand, expandedNodes);

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

  if(Object.keys(freqMap).length === 0) {
    findActualOutgoers(nodeId);
    console.log("actualOutgoersNodes ", actualOutgoerNodes);
  }

  const fMap = freqMap;

  // incoming nodes
  // const incomingEdgesGreaterThanOne = (nodeId: string) => {
  //   return fMap[nodeId].value > 1;
  // };

  const findOutgoers = (currentNodeId: string) => {
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
      console.log(nodeId, node.id);
      if(node.id !== nodeId) {
        console.log("Option id ", node.id);
        if(isExpand) {
          fMap[node.id].value++;
        }
        else {
          fMap[node.id].value--;
        }
        findOutgoers(node.id);
      }
      else {
        // set outgoerNodes without the nodeId to avoid cyclic dependency recursion
        outgoerNodes = outgoerNodes.filter(node => node.id !== nodeId);
      }
    });
  };

  const recurseNodes = (nodeId: string) => {
    const outgoerEdges = edges.filter(e => e.from === nodeId).map(e => e.to);

    console.log("Recurse outgoerEdges ", outgoerEdges);

    outgoerEdges.forEach(nodeId => {
      // if the value is 0, it means that we need to increment a new edge recursively
      // if not, it means that we already have edges
      if(fMap[nodeId].value === 0) {
        fMap[nodeId].value++;
      }
      console.log("Recursive nodes ", nodeId);
      recurseNodes(nodeId);
    });
  };

  findOutgoers(nodeId);
  console.log("Map ", fMap);
  console.log("Matching Nodes ", matchingNodes);

  if(!isExpand) {
    outgoerNodes = outgoerNodes.filter(node => {
      if(fMap[node.id].value <= 0) {
        console.log(node.id, fMap[node.id].value);
        return node;
      }
      else {
        recurseNodes(node.id);
      }
    });
  }

  return [outgoerNodes, matchingNodes];
};
