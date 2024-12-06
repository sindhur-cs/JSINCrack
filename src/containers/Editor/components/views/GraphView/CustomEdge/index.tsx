import React from "react";
import type { EdgeProps } from "reaflow";
import { Edge } from "reaflow";
import useHighlight from "src/store/useHighlight";

const CustomEdgeWrapper = (props: EdgeProps) => {
  const { highlighedPaths, highlightedNodes } = useHighlight();
  console.log("Custom props id", props.id.slice(11));

  console.log("Encountered Path", props.id.slice(11));

  return <Edge containerClassName={`edge-${props.id}`} {...props} style={{
    stroke: highlighedPaths.has(props.id.slice(11)) ? "darkblue" : !(highlighedPaths.size === 0) && "gray",
    opacity: highlighedPaths.has(props.id.slice(11)) || ((highlighedPaths.size === 0) && highlightedNodes.size === 0) ? 1 : 0.2
  }}/>;
};

export const CustomEdge = React.memo(CustomEdgeWrapper);
