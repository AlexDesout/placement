import React, { useCallback, useState, useEffect } from "react";
import {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  ReactFlowProvider,
  ReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { TableNode, ChairNode } from "./CustomNodes"; // Importer les composants de nodes personnalisés
import InvisibleEdge from "./InvisibleEdge"; // Importer le composant d'edge personnalisé

const initialNodes = [];
const initialEdges = [];

export default function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState(null);

  const onNodeClick = (event, node) => {
    if (node.id) {
      setSelectedNode(node);
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
      position: { x: Math.random() * 400, y: Math.random() * 400 },
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
          x: tableNode.position.x + 50 * Math.cos(angle),
          y: tableNode.position.y + 50 * Math.sin(angle),
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
        data: { label: `C${i + 1}`, tableId: tableNode.id },
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

  const nodeTypes = React.useMemo(
    () => ({
      table: TableNode,
      chair: ChairNode,
    }),
    [],
  );

  const edgeTypes = React.useMemo(
    () => ({
      invisible: InvisibleEdge,
    }),
    [],
  );

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <div style={{ flex: 1, position: "relative" }}>
        <button onClick={addTable} style={{ position: "absolute", zIndex: 10 }}>
          Add Table
        </button>
        <ReactFlowProvider>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            onNodeClick={onNodeClick}
          >
            <Controls />
            <MiniMap />
            <Background variant="dots" gap={12} size={1} />
          </ReactFlow>
        </ReactFlowProvider>
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
            <h3>Node Detailsaaaaaaaaa</h3>
            <p>
              <strong>ID:</strong> {selectedNode.id}
            </p>
            <p>
              <strong>Label:</strong> {selectedNode.data.label}
            </p>
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
          </div>
        ) : (
          <p>Click on a node to see its details</p>
        )}
      </div>
    </div>
  );
}
