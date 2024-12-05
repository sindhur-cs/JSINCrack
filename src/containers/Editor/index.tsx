import React from "react";
import dynamic from "next/dynamic";
import styled from "styled-components";
import { Allotment } from "allotment";
import "allotment/dist/style.css";
import useGraph from "src/containers/Editor/components/views/GraphView/stores/useGraph";
import { FullscreenDropzone } from "./components/FullscreenDropzone";
import Sidebar from "../Sidebar";
import { Code } from "lucide-react";
import useJsonEditor from "src/store/useJsonEditor";
import useToggleStatusIcon from "src/store/useToggleStatusIcon";

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

  const handleJsonEditor = () => {
    onOpen();
  }

  return (
    <>
      {!isOpen && <div className="absolute top-20 left-10 z-50 h-10 w-10 text-white bg-black flex items-center justify-center rounded-full cursor-pointer" onClick={handleJsonEditor}>
        <Code/>
      </div>}
      <button className="absolute top-20 right-10 z-10 h-10 w-40 p-6 text-lg rounded-lg text-white bg-black flex items-center justify-center cursor-pointer" onClick={() => setToggle()}>{open ? "Close" : "Validate"}</button>
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
