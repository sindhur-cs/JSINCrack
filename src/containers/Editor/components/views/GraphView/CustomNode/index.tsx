import React from "react";
import type { NodeProps } from "reaflow";
import { Node } from "reaflow";
// import useGraph from "src/containers/Editor/components/views/GraphView/stores/useGraph";
// import useModal from "src/store/useModal";
import type { NodeData } from "src/types/graph";
import { ObjectNode } from "./ObjectNode";
import { TextNode } from "./TextNode";
import useHighlight from "src/store/useHighlight";

export interface CustomNodeProps {
  node: NodeData;
  x: number;
  y: number;
  hasCollapse?: boolean;
}

const rootProps = {
  rx: 50,
  ry: 50,
};

const CustomNodeWrapper = (nodeProps: NodeProps<NodeData["data"]>) => {
  const data = nodeProps.properties.data;
  const { highlightedNodes } = useHighlight();

  // const setSelectedNode = useGraph(state => state.setSelectedNode);
  // const setVisible = useModal(state => state.setVisible);

  // const handleNodeClick = React.useCallback(
  //   (_: React.MouseEvent<SVGGElement, MouseEvent>, data: NodeData) => {
  //     if (setSelectedNode) setSelectedNode(data);
  //     setVisible("node")(true);
  //   },
  //   [setSelectedNode, setVisible]
  // );

  console.log("highlightedNodes truth", highlightedNodes, nodeProps.id, highlightedNodes.has(nodeProps.id.slice(11)));
  const isPresent = highlightedNodes.has(nodeProps.id.slice(11)) || highlightedNodes.size === 0;
  console.log("isPresent", isPresent);

  return (
    <Node
      {...nodeProps}
      {...(data?.isEmpty && rootProps)}
      animated={false}
      label={null as any}
      style={{
        fill: "white",
        opacity: isPresent ? 1 : 0.4,
      }}
    >
      {({ node, x, y }) => {
        if (Array.isArray(nodeProps.properties.text)) {
          if (data?.isEmpty) return null;
          return <ObjectNode node={node as NodeData} x={x} y={y} />;
        }

        return <TextNode node={node as NodeData} hasCollapse={!!data?.childrenCount} x={x} y={y} />;
      }}
    </Node>
  );
};

export const CustomNode = React.memo(CustomNodeWrapper);
