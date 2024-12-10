import type { Node, NodeType } from "jsonc-parser";
import type {
  Graph,
  States,
} from "src/containers/Editor/components/views/GraphView/lib/jsonParser";
import { calculateNodeSize } from "src/containers/Editor/components/views/GraphView/lib/utils/calculateNodeSize";
import { addEdgeToGraph } from "./addEdgeToGraph";
import { addNodeToGraph } from "./addNodeToGraph";
import { generateRandomColor, getContrastColor } from "src/lib/utils/generateColors";

type PrimitiveOrNullType = "boolean" | "string" | "number" | "null";

type Traverse = {
  states: States;
  objectToTraverse: Node;
  parentType?: string;
  myParentId?: string;
  nextType?: string;
  selectedLocale?: string;
  referenceMap: Map<string, string>
};

const colorMap = new Map();

const isPrimitiveOrNullType = (type: unknown): type is PrimitiveOrNullType => {
  return ["boolean", "string", "number", "null"].includes(type as string);
};

const alignChildren = (nodeA: Node, nodeB: Node): number => {
  const aChildType = nodeA?.children?.[1]?.type;
  const bChildType = nodeB?.children?.[1]?.type;

  if (isPrimitiveOrNullType(aChildType) && !isPrimitiveOrNullType(bChildType)) {
    return -1;
  }

  return 0;
};

function handleNoChildren(
  value: string | undefined,
  states: States,
  graph: Graph,
  myParentId?: string,
  parentType?: string,
  nextType?: string
) {
  if (value === undefined) return;

  if (parentType === "property" && nextType !== "object" && nextType !== "array") {
    console.log("Hey I am here in handleNoChildren ", nextType);
    states.brothersParentId = myParentId;
    if (nextType === undefined && Array.isArray(states.brothersNode)) {
      states.brothersNode.push([states.brotherKey, value]);
    } else {
      states.brotherKey = value;
    }
  } else if (parentType === "array") {
    console.log("Hey I am here in handleNoChildren ", parentType);
    const nodeFromArrayId = addNodeToGraph({ graph, text: String(value) });

    console.log("Redundant Block", String(value));

    if (myParentId) {
      addEdgeToGraph(graph, myParentId, nodeFromArrayId);
    }
  }

  if (nextType && parentType !== "array" && (nextType === "object" || nextType === "array")) {
    console.log("Hey I am here in handleNoChildren ", parentType, nextType);
    states.parentName = value;
  }
}

function handleHasChildren(
  type: NodeType,
  states: States,
  graph: Graph,
  children: Node[],
  referenceMap: Map<string, string>,
  myParentId?: string,
  parentType?: string,
  selectedLocale?: string
) {
  let parentId: string | undefined;
  console.log("Traversed children", children);

console.log("SELECTED LOCALE", selectedLocale);

  if (type !== "property" && states.parentName !== "") {
    // add last brothers node and add parent node

    if (states.brothersNode.length > 0) {
      console.log("Hey I am here in handleHasChildren - >0", states.brothersNode);

      const findBrothersNode = states.brothersNodeProps.find(
        e =>
          e.parentId === states.brothersParentId &&
          e.objectsFromArrayId === states.objectsFromArray[states.objectsFromArray.length - 1]
      );

      if (findBrothersNode) {
        console.log("Hey I am here in handleHasChildren - findBrotherNodes", findBrothersNode);

        const findNodeIndex = graph.nodes.findIndex(e => e.id === findBrothersNode?.id);

        if (findNodeIndex !== -1) {
          const modifyNodes = [...graph.nodes];
          const foundNode = modifyNodes[findNodeIndex];

          foundNode.text = foundNode.text.concat(states.brothersNode as any);
          const { width, height } = calculateNodeSize(foundNode.text, false);

          foundNode.width = width;
          foundNode.height = height;

          graph.nodes = modifyNodes;
          states.brothersNode = [];
        }
      } else {
        console.log("Hey I am here in handleHasChildren - else no findBrotherNodes", states.brothersNode);
        if (Array.isArray(states.brothersNode)) {
          console.log("Locale BROTHERS NODE", states.brothersNode);
          const entryUid = states.brothersNode.find(brother => brother[0] === "entry_uid");
          const contentTypeUid = states.brothersNode.find(brother => brother[0] === "content_type_uid");
          console.log(entryUid);
          
          console.log("Locale referenceMap", selectedLocale, referenceMap, referenceMap.has(entryUid?.[1] as string));
          if (!referenceMap.has(entryUid?.[1] as string)) {
            let bgColor = generateRandomColor();
            let textColor = getContrastColor(bgColor);

            if(!colorMap.has(contentTypeUid?.[1])) {
              colorMap.set(contentTypeUid?.[1], [bgColor, textColor]);
            }
            else {
              bgColor = colorMap.get(contentTypeUid?.[1])?.[0];
              textColor = colorMap.get(contentTypeUid?.[1])?.[1];
            }

            const brothersNodeId = addNodeToGraph({ graph, text: states.brothersNode, color: [bgColor, textColor] });
            console.log("BROTHER LOCALE", brothersNodeId);
            states.brothersNode = [];
            
            if (states.brothersParentId) {
              addEdgeToGraph(graph, states.brothersParentId, brothersNodeId);
            } else {
              states.notHaveParent.push(brothersNodeId);
            }
            
            states.brothersNodeProps.push({
              id: brothersNodeId,
              parentId: states.brothersParentId,
              objectsFromArrayId: states.objectsFromArray[states.objectsFromArray.length - 1],
            });

            referenceMap.set(entryUid?.[1] as string, brothersNodeId);
          }
          // else {
          //   states.brothersNode = [];
          //   addEdgeToGraph(graph, states.brothersParentId as string, referenceMap.get(entryUid?.[1]));
          //   console.log("Same ", entryUid?.[1]);
          // }
        }
      }
    }

    // Add parent node
    parentId = addNodeToGraph({ graph, type, text: states.parentName });
    states.bracketOpen.push({ id: parentId, type });
    console.log("Hey I am here in handleHasChildren - parentId", parentId, states.bracketOpen);
    states.parentName = "";

    // Add edges from parent node
    const brothersProps = states.brothersNodeProps.filter(
      e =>
        e.parentId === myParentId &&
        e.objectsFromArrayId === states.objectsFromArray[states.objectsFromArray.length - 1]
    );

    console.log("Hey I am here in handleHasChildren -brotherProps", states.brothersNodeProps.filter, brothersProps);

    if (
      (brothersProps.length > 0 &&
        states.bracketOpen[states.bracketOpen.length - 2]?.type !== "object") ||
      (brothersProps.length > 0 && states.bracketOpen.length === 1)
    ) {
      console.log("Hey I am here in brotherProps", brothersProps);
      addEdgeToGraph(graph, brothersProps[brothersProps.length - 1].id, parentId);
    } else if (myParentId) {
      console.log("Hey I am here in handleHasChildren - myParentId and add edge", myParentId);
      addEdgeToGraph(graph, myParentId, parentId);
    } else {
      states.notHaveParent.push(parentId);
    }
  } else if (parentType === "array") {
    console.log("Hey I am here in parentType array - has children");
    states.objectsFromArray = [...states.objectsFromArray, states.objectsFromArrayId++];
  }
  const traverseObject = (objectToTraverse: Node, nextType: string) => {
    traverse({
      states,
      objectToTraverse,
      parentType: type,
      referenceMap,
      myParentId: states.bracketOpen[states.bracketOpen.length - 1]?.id,
      nextType,
      selectedLocale,
    });
  };

  const traverseArray = () => {
    children.forEach((objectToTraverse, index, array) => {
      const nextType = array[index + 1]?.type;
      console.log("Here traversing ", objectToTraverse.value, objectToTraverse);
      const entryUid = objectToTraverse.children?.filter(child => child.children?.[0]?.value === "entry_uid" && referenceMap.has(child.children?.[1]?.value));
      const locale = objectToTraverse.children?.filter(child => child.children?.[0]?.value === "locale" && child.children?.[1]?.value);

      if(selectedLocale && locale?.[0]?.children?.[1]) {
        console.log("LOCALE", locale[0].children[1].value, selectedLocale);
        if(locale[0].children[1].value.toLowerCase() !== selectedLocale.toLowerCase()) {
          console.log("Hey I am here in locale", locale);
          return;
        }
      }

      // when the entryUid is already in the referenceMap, we need to add an edge to the graph
      if(entryUid && entryUid.length > 0) {
        entryUid.forEach(e => {
          addEdgeToGraph(graph, states.bracketOpen[states.bracketOpen.length - 1]?.id, referenceMap.get(e.children?.[1]?.value) as string);
        });
        // skip recursive call
        return;
      }

      traverseObject(objectToTraverse, nextType);
    });
  };

  if (type === "object") {
    children.sort(alignChildren);
    console.log("Traverse array in object");
    traverseArray();
  } else {
    console.log("Traverse array");
    traverseArray();
  }

  if (type !== "property") {
    // Add or concatenate brothers node when it is the last parent node
    if (states.brothersNode.length > 0) {
      console.log("Hey I am here in handleHasChildren - >0 2.0", states.brothersNode);

      const findBrothersNode = states.brothersNodeProps.find(
        e =>
          e.parentId === states.brothersParentId &&
          e.objectsFromArrayId === states.objectsFromArray[states.objectsFromArray.length - 1]
      );

      if (findBrothersNode) {
        console.log("Hey I am here in handleHasChildren - findBrotherNodes 2.0", findBrothersNode);

        const modifyNodes = [...graph.nodes];
        const findNodeIndex = modifyNodes.findIndex(e => e.id === findBrothersNode?.id);

        if (modifyNodes[findNodeIndex] && typeof states.brothersNode === "string") {
          modifyNodes[findNodeIndex].text += states.brothersNode;

          const { width, height } = calculateNodeSize(modifyNodes[findNodeIndex].text, false);

          modifyNodes[findNodeIndex].width = width;
          modifyNodes[findNodeIndex].height = height;

          graph.nodes = modifyNodes;
          states.brothersNode = [];
        }
      } else {
        console.log("Hey I am here in handleHasChildren - else no findBrotherNodes 2.0", states.brothersNode);
        if (Array.isArray(states.brothersNode)) {
          console.log("Locale BROTHERS NODE", states.brothersNode);

          const entryUid = states.brothersNode.find(brother => brother[0] === "entry_uid");
          const contentTypeUid = states.brothersNode.find(brother => brother[0] === "content_type_uid");
          console.log(entryUid);
          
          if (!referenceMap.has(entryUid?.[1] as string)) {
            let bgColor = generateRandomColor();
            let textColor = getContrastColor(bgColor);

            if(!colorMap.has(contentTypeUid?.[1])) {
              colorMap.set(contentTypeUid?.[1], [bgColor, textColor]);
            }
            else {
              bgColor = colorMap.get(contentTypeUid?.[1])?.[0];
              textColor = colorMap.get(contentTypeUid?.[1])?.[1];
            }

            const brothersNodeId = addNodeToGraph({ graph, text: states.brothersNode, color: [bgColor, textColor] });
            
            states.brothersNode = [];
            
            if (states.brothersParentId) {
              addEdgeToGraph(graph, states.brothersParentId, brothersNodeId);
            } else {
              states.notHaveParent = [...states.notHaveParent, brothersNodeId];
            }
            
            const brothersNodeProps = {
              id: brothersNodeId,
              parentId: states.brothersParentId,
              objectsFromArrayId: states.objectsFromArray[states.objectsFromArray.length - 1],
            };
            
            states.brothersNodeProps = [...states.brothersNodeProps, brothersNodeProps];
            referenceMap.set(entryUid?.[1] as string, brothersNodeId);
          }
          // else {
          //   states.brothersNode = [];
          //   addEdgeToGraph(graph, states.brothersParentId as string, referenceMap.get(entryUid?.[1]));
          //   console.log("Same ", entryUid?.[1]);
          // }
        }
      }
    }

    // Close brackets
    if (parentType === "array") {
      if (states.objectsFromArray.length > 0) {
        states.objectsFromArray.pop();
      }
    } else {
      if (states.bracketOpen.length > 0) {
        states.bracketOpen.pop();
      }
    }

    if (parentId) {
      console.log("here i am with a parentId ", parentId);
      const myChildren = graph.edges.filter(edge => edge.from === parentId);
      const parentIndex = graph.nodes.findIndex(node => node.id === parentId);

      graph.nodes = graph.nodes.map((node, index) => {
        if (index === parentIndex) {
          const childrenCount = myChildren.length;

          return { ...node, data: { ...node.data, childrenCount } };
        }
        return node;
      });
    }
  }
}

export const traverse = ({
  objectToTraverse,
  states,
  myParentId,
  nextType,
  parentType,
  selectedLocale,
  referenceMap
}: Traverse) => {
  const graph = states.graph;
  const { type, children, value } = objectToTraverse;

  console.log("HERE JSON", selectedLocale, objectToTraverse);

  if (!children) {
    handleNoChildren(value, states, graph, myParentId, parentType, nextType);
  } else if (children) {
    handleHasChildren(type, states, graph, children, referenceMap, myParentId, parentType, selectedLocale);
  }
};
