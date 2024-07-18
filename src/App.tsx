import React, { useCallback, useState, useEffect } from "react";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  ReactFlowProvider,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
// import useExportToPDF from "./useExportToPdf";
import { TableNode, ChairNode, WallNode } from "./CustomNodes"; // Importer les composants de nodes personnalisés
import ChairModal from "./ChairModal";
import InvisibleEdge from "./InvisibleEdge"; // Importer le composant d'edge personnalisé
import * as htmlToImage from "html-to-image";
import { jsPDF } from "jspdf";
import download from "downloadjs";

const initialNodes = [];
const initialEdges = [];

export default function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const reactFlowWrapper = React.useRef(null);

  const guestsList = [
    { id: 1, name: "Michel", lastname: "Mirabel", company: "Company A" },
    { id: 2, name: "Alice", lastname: "Dupont", company: "Company B" },
    { id: 3, name: "Jean", lastname: "Durand", company: "Company C" },
    { id: 4, name: "Marie", lastname: "Lefevre", company: "Company D" },
    { id: 5, name: "Pierre", lastname: "Martin", company: "Company E" },
    { id: 6, name: "Sophie", lastname: "Bernard", company: "Company F" },
    { id: 7, name: "Antoine", lastname: "Petit", company: "Company G" },
    { id: 8, name: "Claire", lastname: "Rousseau", company: "Company H" },
    { id: 9, name: "Luc", lastname: "Garcia", company: "Company I" },
    { id: 10, name: "Isabelle", lastname: "Moreau", company: "Company J" },
    { id: 11, name: "Thomas", lastname: "Roux", company: "Company K" },
    { id: 12, name: "Nathalie", lastname: "Fournier", company: "Company L" },
    { id: 13, name: "David", lastname: "Girard", company: "Company M" },
    { id: 14, name: "Sandrine", lastname: "Francois", company: "Company N" },
    { id: 15, name: "Julien", lastname: "Legrand", company: "Company O" },
    { id: 16, name: "Elisabeth", lastname: "Gauthier", company: "Company P" },
    { id: 17, name: "Xavier", lastname: "Perrin", company: "Company Q" },
    { id: 18, name: "Patricia", lastname: "Morin", company: "Company R" },
    { id: 19, name: "Philippe", lastname: "Schneider", company: "Company S" },
    { id: 20, name: "Caroline", lastname: "Simon", company: "Company T" },
    { id: 21, name: "Laurent", lastname: "Meyer", company: "Company U" },
    { id: 22, name: "Emilie", lastname: "Dumas", company: "Company V" },
    { id: 23, name: "Victor", lastname: "Blanc", company: "Company W" },
    { id: 24, name: "Charlotte", lastname: "Nguyen", company: "Company X" },
    { id: 25, name: "Benoit", lastname: "Lemoine", company: "Company Y" },
    { id: 26, name: "Camille", lastname: "Renard", company: "Company Z" },
    { id: 27, name: "Georges", lastname: "Picard", company: "Company AA" },
    { id: 28, name: "Catherine", lastname: "Dubois", company: "Company BB" },
    { id: 29, name: "Mathieu", lastname: "Fabre", company: "Company CC" },
    { id: 30, name: "Christine", lastname: "Bourgeois", company: "Company DD" },
  ];

  const onNodeClick = (event, node) => {
    if (node.id) {
      setSelectedNode(node);
      console.log(nodes);
      console.log(edges);
    }
  };

  const onNodeDoubleClick = (event, node) => {
    if (node.id && node.type === "chair") {
      setSelectedNode(node);
      setIsModalOpen(true);
    }
  };

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  // Fonction pour ajouter une table avec des chaises
  const addTable = () => {
    const tableId = `table-${nodes.length + 1}`;
    const tableNode = {
      id: tableId,
      position: { x: Math.random() * 400, y: Math.random() },
      data: {
        label: `Table ${nodes.length + 1}`,
        relatedChairs: [],
      },
      type: "table",
    };

    const chairNodes = [];
    const newEdges = [];
    const numChairs = 4; // Nombre initial de chaises
    const angleStep = (2 * Math.PI) / numChairs;

    for (let i = 0; i < numChairs; i++) {
      const angle = i * angleStep;
      const chairId = `${tableId}-chair-${i + 1}`;
      tableNode.data.relatedChairs.push(chairId);
      chairNodes.push({
        id: chairId,
        position: {
          x: tableNode.position.x + 150 * Math.cos(angle),
          y: tableNode.position.y + 150 * Math.sin(angle),
        },
        data: { label: `C${i + 1}`, tableId: tableId },
        type: "chair",
      });

      newEdges.push({
        id: `edge-${tableId}-${chairId}`,
        source: tableId,
        target: chairId,
        type: "invisible",
      });
    }

    setNodes((nds) => [...nds, tableNode, ...chairNodes]);
    setEdges((eds) => [...eds, ...newEdges]);
  };

  // Fonction pour ajouter un mur
  const addWall = () => {
    const wallId = `wall-${nodes.length + 1}`;
    const wallNode = {
      id: wallId,
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      data: { label: `Wall ${nodes.length + 1}` },
      type: "wall",
    };
    setNodes((nds) => [...nds, wallNode]);
  };

  const updateChairs = (tableNode, numChairs) => {
    const updatedNodes = nodes.filter(
      (node) =>
        node.id !== tableNode.id &&
        !tableNode.data.relatedChairs.includes(node.id),
    );
    const updatedEdges = edges.filter(
      (edge) => edge.source !== tableNode.id && edge.target !== tableNode.id,
    );

    const chairNodes = [];
    const newEdges = [];
    const angleStep = (2 * Math.PI) / numChairs;
    const tablePosition = nodes.find(
      (node) => node.id === tableNode.id,
    ).position;

    for (let i = 0; i < numChairs; i++) {
      const angle = i * angleStep;
      const chairId = `${tableNode.id}-chair-${i + 1}`;
      chairNodes.push({
        id: chairId,
        position: {
          x: tablePosition.x + 50 * Math.cos(angle),
          y: tablePosition.y + 50 * Math.sin(angle),
        },
        data: { label: `C${i + 1}`, tableId: tableNode.id, guestData: {} },
        type: "chair",
      });

      newEdges.push({
        id: `edge-${tableNode.id}-${chairId}`,
        source: tableNode.id,
        target: chairId,
        type: "invisible",
      });
    }

    tableNode.data.relatedChairs = chairNodes.map((chair) => chair.id);

    setNodes([...updatedNodes, tableNode, ...chairNodes]);
    setEdges([...updatedEdges, ...newEdges]);
  };

  const handleNumChairsChange = (e) => {
    const numChairs = parseInt(e.target.value, 10);
    if (selectedNode && selectedNode.type === "table" && numChairs > 0) {
      updateChairs(selectedNode, numChairs);
    }
  };

  const changeLabel = (e) => {
    const newLabel = e.target.value;
    if (newLabel !== "") {
      // Mettre à jour le label du nœud sélectionné
      setNodes((nds) =>
        nds.map((node) =>
          node.id === selectedNode.id
            ? { ...node, data: { ...node.data, label: newLabel } }
            : node,
        ),
      );

      // Mettre à jour le nœud sélectionné avec le nouveau label
      setSelectedNode((prevNode) => ({
        ...prevNode,
        data: { ...prevNode.data, label: newLabel },
      }));
    }
  };

  const exportToJson = () => {
    const data = {
      nodes: nodes,
      edges: edges,
    };

    const jsonData = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonData], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "flow-data.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Fonction pour exporter le graph en image
  const exportToImage = useCallback(() => {
    console.log("test");
    if (reactFlowWrapper.current) {
      setIsExporting(true);
      htmlToImage
        .toPng(reactFlowWrapper.current)
        .then((dataUrl) => {
          download(dataUrl, "react-flow.png");
          setIsExporting(false);
        })
        .catch((err) => {
          console.error("Could not export to image", err);
        });
    }
  }, []);

  const exportToPDF = useCallback(() => {
    if (reactFlowWrapper.current) {
      setIsExporting(true);
      htmlToImage
        .toPng(reactFlowWrapper.current)
        .then((dataUrl) => {
          const pdf = new jsPDF();
          const imgProps = pdf.getImageProperties(dataUrl);
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = pdf.internal.pageSize.getHeight();

          // Define the width and height you want for the image
          const imgWidth = pdfWidth * 0.9; // 80% of the page width
          const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

          // Center the image
          const x = (pdfWidth - imgWidth) / 2;
          const y = (pdfHeight - imgHeight) / 4;

          pdf.addImage(dataUrl, "PNG", x, y, imgWidth, imgHeight);
          pdf.save("react-flow.pdf");
          setIsExporting(false);
        })
        .catch((err) => {
          console.error("Could not export to PDF", err);
          setIsExporting(false);
        });
    }
  }, []);

  const nodeTypes = React.useMemo(
    () => ({
      table: TableNode,
      chair: ChairNode,
      wall: WallNode,
    }),
    [],
  );

  const edgeTypes = React.useMemo(
    () => ({
      invisible: InvisibleEdge,
    }),
    [],
  );

  // Fonction pour mettre à jour un node
  const updateNode = (updatedNode) => {
    setNodes((nds) =>
      nds.map((node) => (node.id === updatedNode.id ? updatedNode : node)),
    );
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <div style={{ flex: 1, position: "relative" }}>
        <div className="dropdown">
          <button className="dropbtn">Actions</button>
          <div className="dropdown-content">
            <button onClick={addTable}>Add Table</button>
            <button onClick={addWall}>Add Wall</button>
            <button onClick={exportToImage}>Export to Image</button>
            <button onClick={exportToPDF} disabled={isExporting}>
              Export to PDF
            </button>
          </div>
        </div>
        <ReactFlowProvider>
          <div ref={reactFlowWrapper} style={{ width: "100%", height: "100%" }}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              onNodeClick={onNodeClick}
              onNodeDoubleClick={onNodeDoubleClick}
              className="react-flow-node-resizer-example"
              fitView
            >
              <Controls
                showZoom={!isExporting}
                showFitView={!isExporting}
                showInteractive={!isExporting}
              />
              {isExporting ? null : <MiniMap />}
              <Background
                variant={isExporting ? "dots" : "dots"}
                gap={12}
                size={1}
              />
            </ReactFlow>
          </div>
        </ReactFlowProvider>
        <ChairModal
          isOpen={isModalOpen}
          onRequestClose={() => setIsModalOpen(false)}
          node={selectedNode}
          guestsList={guestsList}
          updateNode={updateNode}
        />
      </div>
      <div
        style={{
          width: 300,
          padding: 20,
          background: "#f5f5f5",
          borderLeft: "1px solid #ddd",
        }}
      >
        {selectedNode ? (
          <div>
            <h3>Node Details</h3>
            <p>
              <strong>ID:</strong> {selectedNode.id}
            </p>
            {selectedNode.type === "table" ? (
              <p>
                <label>
                  Label:
                  <input
                    type="text"
                    value={selectedNode.data.label || ""}
                    onChange={changeLabel}
                  />
                </label>
              </p>
            ) : null}
            <p>
              <strong>Position:</strong>{" "}
              {`(${selectedNode.position.x}, ${selectedNode.position.y})`}
            </p>
            <label>
              Number of Chairs:
              <input
                type="number"
                value={selectedNode.data?.relatedChairs?.length || 4}
                onChange={handleNumChairsChange}
                min={1}
                max={20}
              />
            </label>
            <button
              onClick={exportToJson}
              style={{ position: "absolute", zIndex: 10, top: 40 }}
            >
              Export JSON
            </button>
          </div>
        ) : (
          <p>Click on a node to see its details</p>
        )}
      </div>
    </div>
  );
}
