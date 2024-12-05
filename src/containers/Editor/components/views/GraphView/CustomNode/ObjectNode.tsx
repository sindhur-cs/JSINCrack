import React from "react";
import type { CustomNodeProps } from "src/containers/Editor/components/views/GraphView/CustomNode";
import { TextRenderer } from "./TextRenderer";
import * as Styled from "./styles";
import { CheckCircle, TriangleAlert } from "lucide-react";
import useToggleStatusIcon from "src/store/useToggleStatusIcon";
import useClose from "src/store/useClose";
import { getHighlightedPath } from "../lib/utils/getHighlightedPath";
import useGraph from "../stores/useGraph";

type Value = [string, string];

type RowProps = {
  val: Value;
  x: number;
  y: number;
  index: number;
};

const Row = ({ val, x, y, index }: RowProps) => {
  const key = JSON.stringify(val);
  const rowKey = JSON.stringify(val[0]).replaceAll('"', "");
  const rowValue = JSON.stringify(val[1]);

  return (
    <Styled.StyledRow $value={rowValue} data-key={key} data-x={x} data-y={y + index * 17.8}>
      <Styled.StyledKey $type="object">{rowKey}: </Styled.StyledKey>
      <TextRenderer>{rowValue}</TextRenderer>
    </Styled.StyledRow>
  );
};

const Node = ({ node, x, y }: CustomNodeProps) => {
  const { open } = useToggleStatusIcon();
  const { onOpen } = useClose();
  const nodes = useGraph(state => state.nodes);
  const edges = useGraph(state => state.edges);

  const handleNodeClick = () => {
    console.log("Highlighted Paths ", getHighlightedPath(node.id, nodes, edges));
    console.log("NODE DATA ", node);
  };

  const handleIconClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    onOpen();
  };

  return (
    <Styled.StyledForeignObject width={node.width} height={node.height} x={0} y={0} $isObject onClick={handleNodeClick}>
      {open ? 
        (!(node.isError) ? <div className="flex items-center justify-center absolute -top-2 -right-2 z-50 bg-green-500 rounded-full w-8 h-8 cursor-pointer" onClick={handleIconClick}>
            <CheckCircle className="text-white w-5 h-5" />
          </div> 
          : 
          <div className="flex items-center justify-center absolute -top-2 -right-2 z-50 bg-red-500 rounded-full w-8 h-8 cursor-pointer" onClick={handleIconClick}>
            <TriangleAlert className="text-white w-5 h-5" />
          </div>) 
          : 
        null}
      {(node.text as Value[]).map((val, idx) => (
        <Row val={val} index={idx} x={x} y={y} key={idx} />
      ))}
    </Styled.StyledForeignObject>
  );
};

function propsAreEqual(prev: CustomNodeProps, next: CustomNodeProps) {
  return String(prev.node.text) === String(next.node.text) && prev.node.width === next.node.width;
}

export const ObjectNode = React.memo(Node, propsAreEqual);
