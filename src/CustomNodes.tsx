// CustomNodes.js
import React from "react";
import { Handle, Position, NodeResizer } from "@xyflow/react";
import { Tooltip } from "react-tooltip";
// import "reactflow/dist/style.css";

export const TableNode = ({ data }) => (
  <div
    style={{
      width: "150px",
      height: "150px",
      borderRadius: "100%",
      backgroundColor: "white",
      border: "1px solid black",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <strong>{data.label}</strong>
    <Handle type="target" position="top" style={{ background: "#555" }} />
  </div>
);

export const ChairNode = ({ data }) => (
  <div
    className="chair"
    data-tip
    data-for={data.id}
    style={{
      width: "70px",
      height: "40px",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#00CCFF",
      textAlign: "center",
    }}
  >
    <strong className="chair">{data.guestData?.name || data.label}</strong>
    <strong className="chair">{data.guestData?.lastname || null}</strong>
    <Handle type="source" position="right" style={{ background: "#555" }} />
    <Tooltip id={data.id} anchorSelect={".chair"} place="top">
      <p>Name: {data.guestData?.name || "N/A"}</p>
      <p>Lastname: {data.guestData?.lastname || "N/A"}</p>
      <p>Company: {data.guestData?.company || "N/A"}</p>
    </Tooltip>
  </div>
);

export const WallNode = ({ data, selected }) => {
  const [dimensions, setDimensions] = React.useState({
    width: 100,
    height: 20,
  });
  return (
    <div
      data-tip
      data-for={data.id}
      style={{
        width: dimensions.width,
        height: dimensions.height,
        backgroundColor: "grey",
        textAlign: "center",
        padding: "10px",
        border: "1px solid black",
        position: "relative", // Important pour le positionnement absolu du NodeResizer
      }}
    >
      <NodeResizer
        minWidth={20}
        minHeight={20}
        isVisible={selected}
        color="red"
        onResize={(event, { width, height }) =>
          setDimensions({ width, height })
        }
      />
    </div>
  );
};
