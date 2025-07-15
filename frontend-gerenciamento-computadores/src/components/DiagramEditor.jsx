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
import { Monitor, Save, RotateCcw, Grid3x3, Type, Minus, Edit, Trash2, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
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

// Componente customizado para texto personalizado
const TextNode = ({ data, selected, onResizeStart, onResizeEnd }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(data.text || 'Texto');

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      setIsEditing(false);
      data.text = text;
      data.onUpdate?.(data);
    }
    if (e.key === 'Escape') {
      setIsEditing(false);
      setText(data.text || 'Texto');
    }
  };

  const handleResizeStart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    onResizeStart?.();
    
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = data.width || 150;
    const startHeight = data.height || 40;

    const handleMouseMove = (e) => {
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;
      
      const newWidth = Math.max(50, startWidth + deltaX);
      const newHeight = Math.max(30, startHeight + deltaY);
      
      data.width = newWidth;
      data.height = newHeight;
      data.onUpdate?.(data);
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      onResizeEnd?.();
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div 
      className={`bg-transparent p-2 relative ${selected ? 'ring-2 ring-blue-500' : ''}`}
      style={{
        width: `${data.width || 150}px`,
        height: `${data.height || 40}px`,
        minWidth: '50px',
        minHeight: '30px'
      }}
    >
      {isEditing ? (
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => setIsEditing(false)}
          className="bg-white border rounded px-2 py-1 text-sm w-full h-full resize-none"
          autoFocus
        />
      ) : (
        <div 
          className="drag-handle text-sm font-medium bg-white px-2 py-1 rounded shadow-sm border w-full h-full overflow-hidden cursor-move flex items-center"
          onDoubleClick={handleDoubleClick}
          style={{ 
            fontSize: `${data.fontSize || 14}px`,
            color: data.color || '#000000',
            fontWeight: data.fontWeight || 'normal',
            textAlign: data.textAlign || 'left',
            justifyContent: data.textAlign === 'center' ? 'center' : data.textAlign === 'right' ? 'flex-end' : 'flex-start'
          }}
        >
          {data.text || 'Texto'}
        </div>
      )}
      
      {/* Handle de redimensionamento */}
      {selected && (
        <div
          className="absolute bottom-0 right-0 w-4 h-4 bg-blue-500 cursor-se-resize rounded-tl-lg opacity-80 hover:opacity-100 transition-opacity shadow-md border-2 border-white"
          style={{ transform: 'translate(50%, 50%)' }}
          onMouseDown={handleResizeStart}
          title="Arrastar para redimensionar"
        />
      )}
    </div>
  );
};

// Componente customizado para linha de separação
const LineNode = ({ data, selected, onResizeStart, onResizeEnd }) => {
  const handleResizeStart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    onResizeStart?.();
    
    const startX = e.clientX;
    const startWidth = data.width || 200;

    const handleMouseMove = (e) => {
      const deltaX = e.clientX - startX;
      const newWidth = Math.max(20, startWidth + deltaX);
      
      data.width = newWidth;
      data.onUpdate?.(data);
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      onResizeEnd?.();
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div 
      className={`relative ${selected ? 'ring-2 ring-blue-500' : ''}`}
      style={{
        width: `${data.width || 200}px`,
        height: '20px',
        display: 'flex',
        alignItems: 'center'
      }}
    >
      <div
        className="drag-handle flex-1 cursor-move"
        style={{
          borderTop: `${data.thickness || 2}px ${data.style || 'solid'} ${data.color || '#000000'}`,
          height: '1px',
          minHeight: '1px'
        }}
      />
      
      {/* Handle de redimensionamento */}
      {selected && (
        <div
          className="absolute right-0 top-1/2 w-4 h-4 bg-blue-500 cursor-ew-resize rounded-full opacity-80 hover:opacity-100 transition-opacity shadow-md border-2 border-white"
          style={{ transform: 'translate(50%, -50%)' }}
          onMouseDown={handleResizeStart}
          title="Arrastar para redimensionar largura"
        />
      )}
    </div>
  );
};

const nodeTypes = {
  computer: ComputerNode,
  text: TextNode,
  line: LineNode,
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
  const [creationMode, setCreationMode] = useState(null); // null, 'text', 'line'
  const [selectedNode, setSelectedNode] = useState(null);
  const [isResizing, setIsResizing] = useState(false);

  // Converter computadores em nodes do React Flow
  useEffect(() => {
    if (!selectedGerencia || !computers) return;

    const layoutData = layouts[selectedGerencia] || {};
    
    // Processar computadores
    const computerNodes = computers
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

    // Processar elementos personalizados (texto e linhas)
    const customNodes = [];
    Object.keys(layoutData).forEach(key => {
      const item = layoutData[key];
      if (item && typeof item === 'object' && item.type && (item.type === 'text' || item.type === 'line')) {
        customNodes.push({
          id: key,
          type: item.type,
          position: { x: item.x, y: item.y },
          dragHandle: '.drag-handle',
          data: {
            ...item.data,
            onUpdate: (updatedData) => {
              // Callback para atualizar dados do node
              setNodes(nodes => 
                nodes.map(node => 
                  node.id === key ? { ...node, data: updatedData } : node
                )
              );
            },
            onResizeStart: () => setIsResizing(true),
            onResizeEnd: () => setIsResizing(false)
          }
        });
      }
    });

    setNodes([...computerNodes, ...customNodes]);
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

  // Função para criar novo elemento personalizado
  const createCustomElement = useCallback((type, position) => {
    const id = `custom_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    
    const newNode = {
      id,
      type,
      position,
      dragHandle: '.drag-handle',
      data: type === 'text' ? {
        text: 'Novo texto',
        fontSize: 14,
        color: '#000000',
        fontWeight: 'normal',
        textAlign: 'left',
        width: 150,
        height: 40,
        onUpdate: (updatedData) => {
          setNodes(nodes => 
            nodes.map(node => 
              node.id === id ? { ...node, data: updatedData } : node
            )
          );
        },
        onResizeStart: () => setIsResizing(true),
        onResizeEnd: () => setIsResizing(false)
      } : {
        width: 200,
        color: '#000000',
        style: 'solid',
        thickness: 2,
        onUpdate: (updatedData) => {
          setNodes(nodes => 
            nodes.map(node => 
              node.id === id ? { ...node, data: updatedData } : node
            )
          );
        },
        onResizeStart: () => setIsResizing(true),
        onResizeEnd: () => setIsResizing(false)
      }
    };

    setNodes(nodes => [...nodes, newNode]);
    setCreationMode(null);
  }, [setNodes]);

  // Função para deletar elemento selecionado
  const deleteSelectedNode = useCallback(() => {
    if (selectedNode) {
      setNodes(nodes => nodes.filter(node => node.id !== selectedNode.id));
      setSelectedNode(null);
    }
  }, [selectedNode, setNodes]);

  // Listener para tecla DEL
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Delete' && selectedNode && selectedNode.type !== 'computer') {
        deleteSelectedNode();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedNode, deleteSelectedNode]);

  // Callback para clique no canvas
  const onPaneClick = useCallback((event) => {
    if (creationMode) {
      const rect = event.currentTarget.getBoundingClientRect();
      const position = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      };
      createCustomElement(creationMode, position);
    } else {
      setSelectedNode(null);
    }
  }, [creationMode, createCustomElement]);

  // Callback para seleção de node
  const onNodeClick = useCallback((_, node) => {
    setSelectedNode(node);
  }, []);

  // Salvar layout
  const handleSaveLayout = useCallback(() => {
    const layoutData = {};
    nodes.forEach(node => {
      if (node.type === 'computer') {
        // Para computadores, salvar apenas posição
        layoutData[node.id] = {
          x: node.position.x,
          y: node.position.y
        };
      } else if (node.type === 'text' || node.type === 'line') {
        // Para elementos personalizados, salvar posição e dados
        layoutData[node.id] = {
          type: node.type,
          x: node.position.x,
          y: node.position.y,
          data: {
            ...node.data,
            onUpdate: undefined // Remover função do save
          }
        };
      }
    });
    console.log('DiagramEditor: Salvando layout com dados:', layoutData);
    console.log('DiagramEditor: Nodes atuais:', nodes.map(n => ({id: n.id, type: n.type, position: n.position})));
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
        onPaneClick={onPaneClick}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        nodesDraggable={!isResizing}
        fitView
        className={`bg-gray-50 ${creationMode ? 'cursor-crosshair' : ''}`}
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
          
          {/* Ferramentas de criação */}
          <div className="border-t pt-2">
            <div className="text-xs font-medium mb-2">Ferramentas:</div>
            <div className="flex gap-2">
              <Button
                onClick={() => setCreationMode(creationMode === 'text' ? null : 'text')}
                size="sm"
                variant={creationMode === 'text' ? "default" : "outline"}
                className="text-xs"
              >
                <Type className="h-3 w-3 mr-1" />
                Texto
              </Button>
              
              <Button
                onClick={() => setCreationMode(creationMode === 'line' ? null : 'line')}
                size="sm"
                variant={creationMode === 'line' ? "default" : "outline"}
                className="text-xs"
              >
                <Minus className="h-3 w-3 mr-1" />
                Linha
              </Button>
            </div>
            
            {creationMode && (
              <div className="text-xs text-gray-600 mt-1">
                Clique no diagrama para criar {creationMode === 'text' ? 'texto' : 'linha'}
              </div>
            )}
          </div>
          
          {/* Controles do elemento selecionado */}
          {selectedNode && selectedNode.type !== 'computer' && (
            <div className="border-t pt-2">
              <div className="text-xs font-medium mb-2">Elemento selecionado:</div>
              
              {/* Controles para texto */}
              {selectedNode.type === 'text' && (
                <div className="space-y-2 mb-2">
                  <div className="flex items-center gap-2">
                    <label className="text-xs">Largura:</label>
                    <input
                      type="number"
                      min="50"
                      max="500"
                      value={selectedNode.data.width || 150}
                      onChange={(e) => {
                        const width = parseInt(e.target.value) || 150;
                        selectedNode.data.width = width;
                        selectedNode.data.onUpdate?.(selectedNode.data);
                      }}
                      className="text-xs border rounded px-1 w-16"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-xs">Altura:</label>
                    <input
                      type="number"
                      min="30"
                      max="300"
                      value={selectedNode.data.height || 40}
                      onChange={(e) => {
                        const height = parseInt(e.target.value) || 40;
                        selectedNode.data.height = height;
                        selectedNode.data.onUpdate?.(selectedNode.data);
                      }}
                      className="text-xs border rounded px-1 w-16"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-xs">Fonte:</label>
                    <input
                      type="number"
                      min="8"
                      max="32"
                      value={selectedNode.data.fontSize || 14}
                      onChange={(e) => {
                        const fontSize = parseInt(e.target.value) || 14;
                        selectedNode.data.fontSize = fontSize;
                        selectedNode.data.onUpdate?.(selectedNode.data);
                      }}
                      className="text-xs border rounded px-1 w-16"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-xs">Cor:</label>
                    <input
                      type="color"
                      value={selectedNode.data.color || '#000000'}
                      onChange={(e) => {
                        selectedNode.data.color = e.target.value;
                        selectedNode.data.onUpdate?.(selectedNode.data);
                      }}
                      className="w-8 h-6 border rounded"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs">Alinhamento:</label>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant={selectedNode.data.textAlign === 'left' ? 'default' : 'outline'}
                        onClick={() => {
                          selectedNode.data.textAlign = 'left';
                          selectedNode.data.onUpdate?.(selectedNode.data);
                        }}
                        className="p-1 h-6"
                      >
                        <AlignLeft className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant={selectedNode.data.textAlign === 'center' ? 'default' : 'outline'}
                        onClick={() => {
                          selectedNode.data.textAlign = 'center';
                          selectedNode.data.onUpdate?.(selectedNode.data);
                        }}
                        className="p-1 h-6"
                      >
                        <AlignCenter className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant={selectedNode.data.textAlign === 'right' ? 'default' : 'outline'}
                        onClick={() => {
                          selectedNode.data.textAlign = 'right';
                          selectedNode.data.onUpdate?.(selectedNode.data);
                        }}
                        className="p-1 h-6"
                      >
                        <AlignRight className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Controles para linha */}
              {selectedNode.type === 'line' && (
                <div className="space-y-2 mb-2">
                  <div className="flex items-center gap-2">
                    <label className="text-xs">Largura:</label>
                    <input
                      type="number"
                      min="20"
                      max="800"
                      value={selectedNode.data.width || 200}
                      onChange={(e) => {
                        const width = parseInt(e.target.value) || 200;
                        selectedNode.data.width = width;
                        selectedNode.data.onUpdate?.(selectedNode.data);
                      }}
                      className="text-xs border rounded px-1 w-16"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-xs">Espessura:</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={selectedNode.data.thickness || 2}
                      onChange={(e) => {
                        const thickness = parseInt(e.target.value) || 2;
                        selectedNode.data.thickness = thickness;
                        selectedNode.data.onUpdate?.(selectedNode.data);
                      }}
                      className="text-xs border rounded px-1 w-16"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-xs">Cor:</label>
                    <input
                      type="color"
                      value={selectedNode.data.color || '#000000'}
                      onChange={(e) => {
                        selectedNode.data.color = e.target.value;
                        selectedNode.data.onUpdate?.(selectedNode.data);
                      }}
                      className="w-8 h-6 border rounded"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-xs">Estilo:</label>
                    <select
                      value={selectedNode.data.style || 'solid'}
                      onChange={(e) => {
                        selectedNode.data.style = e.target.value;
                        selectedNode.data.onUpdate?.(selectedNode.data);
                      }}
                      className="text-xs border rounded px-1"
                    >
                      <option value="solid">Sólida</option>
                      <option value="dashed">Tracejada</option>
                      <option value="dotted">Pontilhada</option>
                    </select>
                  </div>
                </div>
              )}
              
              <div className="space-y-1">
                <Button
                  onClick={deleteSelectedNode}
                  size="sm"
                  variant="destructive"
                  className="text-xs w-full"
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Deletar
                </Button>
                <div className="text-xs text-gray-500 text-center">
                  ou pressione <kbd className="px-1 py-0.5 bg-gray-100 border rounded">DEL</kbd>
                </div>
              </div>
            </div>
          )}
          
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