import React, { useCallback, useEffect, useState } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Monitor, Save, RotateCcw, Grid3x3 } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';

// Componente customizado para representar um computador
const ComputerNode = ({ data }) => {
  return (
    <div className="bg-white border-2 border-blue-500 rounded-lg p-3 min-w-[200px] shadow-lg hover:shadow-xl transition-shadow cursor-move">
      <div className="flex items-center gap-2 mb-2">
        <Monitor className="h-5 w-5 text-blue-600" />
        <span className="font-bold text-sm">{data.patrimonio}</span>
      </div>
      <div className="space-y-1">
        <div className="text-xs text-gray-600">{data.responsavel}</div>
        <div className="text-xs text-gray-500">{data.modelo}</div>
        {data.gerencia && data.gerencia !== 'N/A' && (
          <Badge variant="outline" className="text-xs">
            {data.gerencia}
          </Badge>
        )}
      </div>
    </div>
  );
};

const nodeTypes = {
  computer: ComputerNode,
};

const DiagramEditor = ({ 
  computers, 
  selectedGerencia, 
  layouts, 
  onSaveLayout,
  hasUnsavedChanges,
  onCancelChanges,
  onResetLayout 
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [showGrid, setShowGrid] = useState(true);
  const [gridType, setGridType] = useState('dots'); // 'dots' ou 'lines'
  const [isDragging, setIsDragging] = useState(false);

  // Converter computadores em nodes do React Flow
  useEffect(() => {
    if (!selectedGerencia || !computers) return;

    const layoutData = layouts[selectedGerencia] || {};
    const newNodes = computers
      .filter(computer => computer.gerencia_id === selectedGerencia)
      .map(computer => {
        // Verificar se há posição salva para este computador
        const savedPosition = layoutData[computer.id];
        const position = savedPosition 
          ? { x: savedPosition.x, y: savedPosition.y }
          : { 
              // Posição inicial aleatória se não houver posição salva
              x: Math.random() * 500, 
              y: Math.random() * 400 
            };

        // Função para formatar patrimônio (string simples)
        const formatPatrimonio = (patrimonio) => {
          if (!patrimonio || patrimonio.length !== 12) return patrimonio
          const parte1 = patrimonio.substring(0, 5)
          const parte2 = patrimonio.substring(5, 10)
          const parte3 = patrimonio.substring(10, 12)
          return `${parte1}.${parte2}.${parte3}`
        }

        return {
          id: computer.id.toString(),
          type: 'computer',
          position,
          data: {
            patrimonio: formatPatrimonio(computer.patrimonio),
            responsavel: computer.nome_servidor_responsavel,
            modelo: computer.modelo?.nome || 'N/A',
            gerencia: computer.gerencia?.nome || 'N/A',
            computerId: computer.id
          },
        };
      });

    setNodes(newNodes);
  }, [selectedGerencia, computers, layouts]);

  // Callback para quando um node é movido
  const onNodeDragStop = useCallback(() => {
    setIsDragging(false);
  }, []);

  const onNodeDragStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  // Callback para mudanças nos nodes (incluindo posição)
  const onNodesChangeWithPosition = useCallback((changes) => {
    onNodesChange(changes);
  }, [onNodesChange]);

  // Salvar layout
  const handleSaveLayout = useCallback(() => {
    const layoutData = {};
    nodes.forEach(node => {
      layoutData[node.id] = {
        x: node.position.x,
        y: node.position.y
      };
    });
    console.log('DiagramEditor: Salvando layout com dados:', layoutData);
    console.log('DiagramEditor: Nodes atuais:', nodes.map(n => ({id: n.id, position: n.position})));
    onSaveLayout(layoutData);
  }, [nodes, onSaveLayout]);

  // Resetar layout
  const handleResetLayout = useCallback(() => {
    if (confirm('Tem certeza que deseja resetar o layout? Todos os computadores voltarão para posições aleatórias.')) {
      const resetNodes = nodes.map(node => ({
        ...node,
        position: {
          x: Math.random() * 500,
          y: Math.random() * 400
        }
      }));
      setNodes(resetNodes);
      onResetLayout();
    }
  }, [nodes, setNodes, onResetLayout]);

  // Auto-organizar em grid
  const autoOrganize = useCallback(() => {
    const gridCols = Math.ceil(Math.sqrt(nodes.length));
    const spacing = 250;
    const startX = 50;
    const startY = 50;

    const organizedNodes = nodes.map((node, index) => {
      const row = Math.floor(index / gridCols);
      const col = index % gridCols;
      
      return {
        ...node,
        position: {
          x: startX + col * spacing,
          y: startY + row * spacing
        }
      };
    });

    setNodes(organizedNodes);
  }, [nodes, setNodes]);

  // Painel lateral com computadores disponíveis
  const AvailableComputers = () => {
    const availableComputers = computers.filter(
      c => c.gerencia_id === selectedGerencia && 
      !nodes.find(n => n.id === c.id.toString())
    );

    if (availableComputers.length === 0) return null;

    return (
      <Panel position="top-left" className="bg-white p-4 rounded-lg shadow-lg m-2 max-w-xs">
        <h3 className="font-semibold mb-2 text-sm">Computadores Disponíveis</h3>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {availableComputers.map(computer => {
            const formatPatrimonio = (patrimonio) => {
              if (!patrimonio || patrimonio.length !== 12) return patrimonio
              const parte1 = patrimonio.substring(0, 5)
              const parte2 = patrimonio.substring(5, 10)
              const parte3 = patrimonio.substring(10, 12)
              return `${parte1}.${parte2}.${parte3}`
            }
            
            return (
              <div
                key={computer.id}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('computerId', computer.id);
                  e.dataTransfer.effectAllowed = 'copy';
                }}
                className="bg-gray-50 p-2 rounded cursor-move hover:bg-gray-100 transition-colors"
              >
                <div className="text-xs font-medium">{formatPatrimonio(computer.patrimonio)}</div>
                <div className="text-xs text-gray-600">{computer.nome_servidor_responsavel}</div>
              </div>
            )
          })}
        </div>
      </Panel>
    );
  };

  return (
    <div className="h-[600px] w-full relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChangeWithPosition}
        onEdgesChange={onEdgesChange}
        onNodeDragStart={onNodeDragStart}
        onNodeDragStop={onNodeDragStop}
        nodeTypes={nodeTypes}
        fitView
        className="bg-gray-50"
      >
        {showGrid && (
          <Background 
            variant={gridType} 
            gap={25} 
            size={gridType === 'dots' ? 2 : 1} 
            color="#d1d5db"
          />
        )}
        
        <MiniMap 
          nodeColor="#3b82f6"
          className="bg-white border-2 border-gray-200"
          zoomable
          pannable
        />
        
        <Controls />
        
        {/* Painel de controles */}
        <Panel position="top-right" className="bg-white p-3 rounded-lg shadow-lg m-2 space-y-2">
          <div className="flex gap-2">
            <Button
              onClick={handleSaveLayout}
              size="sm"
              variant={hasUnsavedChanges ? "default" : "outline"}
              className="text-xs"
            >
              <Save className="h-3 w-3 mr-1" />
              {hasUnsavedChanges ? 'Salvar*' : 'Salvar'}
            </Button>
            
            <Button
              onClick={onCancelChanges}
              size="sm"
              variant="outline"
              disabled={!hasUnsavedChanges}
              className="text-xs"
            >
              Cancelar
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={autoOrganize}
              size="sm"
              variant="outline"
              className="text-xs"
            >
              <Grid3x3 className="h-3 w-3 mr-1" />
              Auto-organizar
            </Button>
            
            <Button
              onClick={handleResetLayout}
              size="sm"
              variant="destructive"
              className="text-xs"
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Resetar
            </Button>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="showGrid"
                checked={showGrid}
                onChange={(e) => setShowGrid(e.target.checked)}
                className="h-3 w-3"
              />
              <label htmlFor="showGrid" className="text-xs">Mostrar grade</label>
            </div>
            
            {showGrid && (
              <div className="flex items-center gap-2">
                <label className="text-xs">Tipo:</label>
                <select
                  value={gridType}
                  onChange={(e) => setGridType(e.target.value)}
                  className="text-xs border rounded px-1"
                >
                  <option value="dots">Pontos</option>
                  <option value="lines">Linhas</option>
                </select>
              </div>
            )}
          </div>
        </Panel>

        <AvailableComputers />
        
        {/* Indicador de status */}
        {isDragging && (
          <Panel position="bottom-center" className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs">
            Arrastando...
          </Panel>
        )}
      </ReactFlow>
    </div>
  );
};

export default DiagramEditor;