import type { NodeData, EdgeData } from "src/types/graph";

type Outgoers = [NodeData[], string[]];

export const getOutgoers = (
  nodeId: string,
  nodes: NodeData[],
  edges: EdgeData[],
  parent: string[] = [],
  freqMap: any,
  isExpand: boolean,
  collapsedNodes: string[],
  collapsedEdges: string[]
): Outgoers => {
  let outgoerNodes: NodeData[] = [];
  const matchingNodes: string[] = [];

  if (parent.includes(nodeId)) {
    const initialParentNode = nodes.find(n => n.id === nodeId);

    if (initialParentNode) outgoerNodes.push(initialParentNode);
  }

  console.log("OUTGOERS FREQ MAP ", freqMap);
  const findOutgoers = (currentNodeId: string) => {
    const outgoerIds = edges.filter(e => e.from === currentNodeId && (!isExpand ? !collapsedEdges.includes(e.id) : true)).map(e => e.to);
    console.log("outgoerIds ", outgoerIds);
    
    const nodeList = nodes.filter(n => {
      if (parent.includes(n.id) && !matchingNodes.includes(n.id)) matchingNodes.push(n.id);
      
      if(outgoerIds.includes(n.id) && !parent.includes(n.id) && n.id !== nodeId) {
        return n;
      }
    });

    console.log("nodelist ", nodeList, edges.filter(e => e.from === currentNodeId));
    
    outgoerNodes.push(...nodeList);
    nodeList.forEach(node => {
      console.log("SINNODE ", node.id, freqMap[node.id]);
      console.log("MMM ", collapsedEdges.map(e => e.split("-")[0].slice(1)), currentNodeId, collapsedEdges.map(e => e.split("-")[1]), node.id);
      if(!isExpand) {
        freqMap[node.id].parents.delete(currentNodeId);
        freqMap[node.id].value = freqMap[node.id].parents.size;
        if(freqMap[node.id].value < 0) {
          freqMap[node.id].value = 0;
        }
      }

      if(freqMap[node.id].value <= 0) {
        findOutgoers(node.id);
      }
    });
  };

  console.log("FREQ MAP ", freqMap);

  findOutgoers(nodeId);

  if(!isExpand) {
    outgoerNodes = outgoerNodes.filter(node => {
      console.log("Here fMap: ", node.id);
      if(freqMap[node.id].value === 0) {
        console.log(node.id, freqMap[node.id]);
        return node;
      }
    });
  }

  return [outgoerNodes, matchingNodes];
};
