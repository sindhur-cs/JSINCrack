import React, { useState } from "react";
import dynamic from "next/dynamic";
import styled from "styled-components";
import { Allotment } from "allotment";
import "allotment/dist/style.css";
import useGraph from "src/containers/Editor/components/views/GraphView/stores/useGraph";
import { FullscreenDropzone } from "./components/FullscreenDropzone";
import Sidebar from "../Sidebar";
import { Code, TriangleAlert } from "lucide-react";
import useJsonEditor from "src/store/useJsonEditor";
import useToggleStatusIcon from "src/store/useToggleStatusIcon";
import Select from "./components/Select";

export const StyledEditor = styled(Allotment)`
  position: relative !important;
  display: flex;
  background: ${({ theme }) => theme.BACKGROUND_SECONDARY};
  height: calc(100vh - 67px);

  @media only screen and (max-width: 320px) {
    height: 100vh;
  }
`;

const TextEditor = dynamic(() => import("src/containers/Editor/components/TextEditor"), {
  ssr: false,
});

const LiveEditor = dynamic(() => import("src/containers/Editor/components/LiveEditor"), {
  ssr: false,
});

export const Editor = () => {
  const fullscreen = useGraph(state => state.fullscreen);
  const { onOpen, isOpen } = useJsonEditor();
  const { open, setToggle } = useToggleStatusIcon();
  const { detectCycles } = useGraph();
  const [showTooltip, setShowTooltip] = useState(false);

  const handleJsonEditor = () => {
    onOpen();
  }

  return (
    <>
      {!isOpen && <div className="flex gap-10 items-center absolute top-20 left-10 z-50">
          <div className="h-10 w-10 text-white bg-black flex items-center justify-center rounded-full cursor-pointer" onClick={handleJsonEditor}>
          <Code/>
        </div>
        <div className="flex gap-4 items-center">
          {detectCycles && <TriangleAlert className="text-red-500 h-6 w-6 cursor-pointer" onMouseOver={() => { setShowTooltip(true) }} onMouseLeave={() => { setShowTooltip(false) }}/>}
          {showTooltip && <div className="bg-red-500 text-white p-2 rounded-md">Cycle has been detected in the graph</div>}
        </div>
      </div>}
      <div className="flex gap-4 items-center absolute top-20 right-10 z-10 ">
        <Select
          options={[{ value: "", label: "Select Locale" }, { value: "EN", label: "English (EN)" }, { value: "FR", label: "French (FR)" }, { value: "ES", label: "Spanish (ES)" }]}
        />
        <button className="h-10 w-40 p-6 text-lg rounded-lg text-white bg-black flex items-center justify-center cursor-pointer" onClick={() => setToggle()}>{open ? "Close" : "Validate"}</button>
      </div>
      <StyledEditor proportionalLayout={false}>
        {isOpen && <Allotment.Pane
          preferredSize={450}
          minSize={fullscreen ? 0 : 300}
          maxSize={800}
          visible={!fullscreen}
        >
          <TextEditor />
        </Allotment.Pane>}
        <Allotment.Pane minSize={0}>
          <LiveEditor />
          <Sidebar/>
        </Allotment.Pane>
      </StyledEditor>
      <FullscreenDropzone />
    </>
  );
};
