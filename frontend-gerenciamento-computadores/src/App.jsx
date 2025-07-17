import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.jsx'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Checkbox } from '@/components/ui/checkbox.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Computer, Building, Settings, Plus, Edit, Trash2, Monitor, ArrowUpDown, ArrowUp, ArrowDown, Layout, Users, Save } from 'lucide-react'
import DiagramEditor from '@/components/DiagramEditor.jsx'
import Login from '@/components/Login.jsx'
import './App.css'

      
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

// Função para formatar o número de patrimônio
const formatPatrimonio = (patrimonio) => {
  if (!patrimonio || patrimonio.length !== 12) return patrimonio
  
  // 99100XXXXX00 -> 99100.XXXXX.00
  const parte1 = patrimonio.substring(0, 5)    // 99100
  const parte2 = patrimonio.substring(5, 10)   // XXXXX
  const parte3 = patrimonio.substring(10, 12)  // 00
  
  return `${parte1}.${parte2}.${parte3}`
}

// Função para formatar o número de patrimônio com JSX (parte do meio em negrito)
const formatPatrimonioJSX = (patrimonio) => {
  if (!patrimonio || patrimonio.length !== 12) return patrimonio
  
  // 99100XXXXX00 -> 99100.XXXXX.00
  const parte1 = patrimonio.substring(0, 5)    // 99100
  const parte2 = patrimonio.substring(5, 10)   // XXXXX
  const parte3 = patrimonio.substring(10, 12)  // 00
  
  return (
    <span>
      {parte1}.<strong>{parte2}</strong>.{parte3}
    </span>
  )
}

    

function App() {
  const [user, setUser] = useState(null)
  const [patrimonios, setPatrimonios] = useState([])
  const [modelos, setModelos] = useState([])
  const [gerencias, setGerencias] = useState([])
  const [baixaPatrimonial, setBaixaPatrimonial] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingItem, setEditingItem] = useState(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [dialogType, setDialogType] = useState('')

    // 2. Estado para os filtros da tabela de patrimônios
  const [filters, setFilters] = useState({
    patrimonio: '',
    responsavel: '',
    gerencia: 'all',
    modelo: 'all',
    processador: '',
    ram: '',
    so: 'all',
    ssd: 'all',
  })

  // Estados para filtros das outras abas
  const [modelosFilters, setModelosFilters] = useState({
    nome: '',
    processador: '',
    ram: '',
    so: '',
    ssd: 'all'
  })

  const [gerenciasFilters, setGerenciasFilters] = useState({
    nome: ''
  })

  const [baixaFilters, setBaixaFilters] = useState({
    patrimonio: '',
    responsavel: '',
    modelo: '',
    gerencia: '',
    motivo: ''
  })

  // Estado para ordenação
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'asc'
  })

  // Estados para ordenação das outras abas
  const [modelosSortConfig, setModelosSortConfig] = useState({
    key: null,
    direction: 'asc'
  })

  const [gerenciasSortConfig, setGerenciasSortConfig] = useState({
    key: null,
    direction: 'asc'
  })

  const [baixaSortConfig, setBaixaSortConfig] = useState({
    key: null,
    direction: 'asc'
  })

  // Estado para layouts das gerências
  const [layouts, setLayouts] = useState({})
  const [selectedGerencia, setSelectedGerencia] = useState(null)
  const [draggedComputer, setDraggedComputer] = useState(null)
  const [contextMenu, setContextMenu] = useState({ show: false, x: 0, y: 0, computer: null })
  const [gridConfigs, setGridConfigs] = useState({}) // {gerencia_id: {cols: 4, rows: 4}}
  
  // Estados para backup/cancelar alterações
  const [originalLayouts, setOriginalLayouts] = useState({}) // Backup do layout original
  const [originalGridConfigs, setOriginalGridConfigs] = useState({}) // Backup da config de grid original

  // Estados para formulários
  const [patrimonioForm, setPatrimonioForm] = useState({
    patrimonio: '',
    nome_servidor_responsavel: '',
    modelo_id: '',
    gerencia_id: ''
  })

  const [modeloForm, setModeloForm] = useState({
    nome: '', // <-- ADICIONADO
    processador: '',
    quantidade_ram: '',
    tipo_ram: '',
    sistema_operacional: '',
    ssd: false
  })

  const [gerenciaForm, setGerenciaForm] = useState({
    nome: ''
  })

  useEffect(() => {
    // Verificar se há token válido no localStorage
    const token = localStorage.getItem('authToken')
    const userData = localStorage.getItem('user')
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData)
        setUser(parsedUser)
        fetchData()
        testAPIConnection()
      } catch (error) {
        console.error('Erro ao parsing dos dados do usuário:', error)
        localStorage.removeItem('authToken')
        localStorage.removeItem('user')
      }
    } else {
      setLoading(false)
    }
  }, [])

  const testAPIConnection = async () => {
    try {
      console.log('Testando conexão da API...')
      const response = await fetch(`${API_BASE_URL}/patrimonios`)
      console.log('Teste API patrimonios - Status:', response.status)
      if (response.ok) {
        console.log('✅ API patrimonios funcionando normalmente')
      } else {
        console.log('❌ API patrimonios com problemas:', response.status)
      }

      // Testar rota de layouts especificamente
      console.log('Testando rota de layouts...')
      const layoutResponse = await fetch(`${API_BASE_URL}/layouts`)
      console.log('Teste API layouts - Status:', layoutResponse.status)
      const layoutResponseText = await layoutResponse.text()
      console.log('Resposta layouts (primeiros 200 chars):', layoutResponseText.substring(0, 200))
      
      if (layoutResponse.ok) {
        console.log('✅ API layouts funcionando')
      } else {
        console.log('❌ API layouts com problemas:', layoutResponse.status)
      }
    } catch (error) {
      console.error('❌ Erro de conexão com API:', error)
    }
  }

  // Carregar layout quando gerência for selecionada
  useEffect(() => {
    if (selectedGerencia) {
      fetchLayout(selectedGerencia)
      
      // Inicializar configuração de grid se não existir
      if (!gridConfigs[selectedGerencia]) {
        const computersCount = getComputersForGerencia(selectedGerencia).length
        const defaultGrid = getGridDimensions(computersCount, selectedGerencia)
        setGridConfigs(prev => ({
          ...prev,
          [selectedGerencia]: defaultGrid
        }))
      }
    }
  }, [selectedGerencia, patrimonios])

  // Validar e limpar layouts quando patrimônios mudarem
  useEffect(() => {
    if (patrimonios.length > 0) {
      validateAndCleanLayouts()
    }
  }, [patrimonios])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [patrimoniosRes, modelosRes, gerenciasRes, baixaRes] = await Promise.all([
        fetch(`${API_BASE_URL}/patrimonios`),
        fetch(`${API_BASE_URL}/modelos`),
        fetch(`${API_BASE_URL}/gerencias`),
        fetch(`${API_BASE_URL}/baixa-patrimonial`)
      ])

      const patrimoniosData = await patrimoniosRes.json()
      const modelosData = await modelosRes.json()
      const gerenciasData = await gerenciasRes.json()
      const baixaData = await baixaRes.json()

      setPatrimonios(patrimoniosData)
      setModelos(modelosData)
      setGerencias(gerenciasData)
      setBaixaPatrimonial(baixaData)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchLayout = async (gerenciaId) => {
    try {
      console.log('Tentando buscar layout para gerência:', gerenciaId)
      console.log('URL:', `${API_BASE_URL}/layouts/${gerenciaId}`)
      
      const response = await fetch(`${API_BASE_URL}/layouts/${gerenciaId}`)
      console.log('Status da resposta:', response.status)
      console.log('Headers da resposta:', Object.fromEntries(response.headers.entries()))
      
      // Verificar se a resposta é válida
      if (!response.ok) {
        if (response.status === 404) {
          // Layout não existe ainda, usar valores padrão
          console.log('Layout não encontrado, usando valores padrão')
          const emptyLayout = {}
          setLayouts(prev => ({ ...prev, [gerenciaId]: emptyLayout }))
          setOriginalLayouts(prev => ({ ...prev, [gerenciaId]: emptyLayout }))
          return
        }
        const errorText = await response.text()
        console.error('Erro HTTP:', response.status, errorText)
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      // Verificar se a resposta tem conteúdo
      const responseText = await response.text()
      if (!responseText.trim()) {
        console.log('Resposta vazia do servidor, usando valores padrão')
        const emptyLayout = {}
        setLayouts(prev => ({ ...prev, [gerenciaId]: emptyLayout }))
        setOriginalLayouts(prev => ({ ...prev, [gerenciaId]: emptyLayout }))
        return
      }
      
      // Tentar fazer parse do JSON
      let data
      try {
        data = JSON.parse(responseText)
      } catch (parseError) {
        console.error('Erro ao fazer parse do JSON:', parseError)
        console.error('Resposta recebida:', responseText)
        throw new Error('Resposta inválida do servidor')
      }
      
      const layoutData = data.layout_data || {}
      const gridConfig = data.grid_cols && data.grid_rows ? 
        { cols: data.grid_cols, rows: data.grid_rows } : 
        null
      
      // Atualizar layouts atuais
      setLayouts(prev => ({
        ...prev,
        [gerenciaId]: layoutData
      }))
      
      // Fazer backup do layout original
      setOriginalLayouts(prev => ({
        ...prev,
        [gerenciaId]: { ...layoutData }
      }))
      
      // Carregar configuração de grid se disponível
      if (gridConfig) {
        setGridConfigs(prev => ({
          ...prev,
          [gerenciaId]: gridConfig
        }))
        
        // Fazer backup da configuração de grid original
        setOriginalGridConfigs(prev => ({
          ...prev,
          [gerenciaId]: { ...gridConfig }
        }))
      }
    } catch (error) {
      console.error('Erro ao carregar layout:', error)
      // Se houver erro, inicializa com layout vazio
      const emptyLayout = {}
      setLayouts(prev => ({
        ...prev,
        [gerenciaId]: emptyLayout
      }))
      setOriginalLayouts(prev => ({
        ...prev,
        [gerenciaId]: emptyLayout
      }))
    }
  }

  const uniqueOsOptions = useMemo(() => {
    const osSet = new Set(patrimonios.map(p => p.modelo?.sistema_operacional).filter(Boolean));
    return Array.from(osSet).sort((a, b) => b - a); // Ordena do mais novo para o mais antigo
  }, [patrimonios]);

  // Componente auxiliar para cabeçalhos ordenáveis
  const SortableHeader = ({ column, children }) => {
    const getSortIcon = () => {
      if (sortConfig.key !== column) {
        return <ArrowUpDown className="ml-2 h-4 w-4" />
      }
      return sortConfig.direction === 'asc' ? 
        <ArrowUp className="ml-2 h-4 w-4" /> : 
        <ArrowDown className="ml-2 h-4 w-4" />
    }

    return (
      <div 
        className="flex items-center cursor-pointer select-none hover:text-gray-900"
        onClick={() => handleSort(column)}
      >
        {children}
        {getSortIcon()}
      </div>
    )
  }

  // Componente para cabeçalhos ordenáveis dos modelos
  const ModelosSortableHeader = ({ column, children }) => {
    const getSortIcon = () => {
      if (modelosSortConfig.key !== column) {
        return <ArrowUpDown className="ml-2 h-4 w-4" />
      }
      return modelosSortConfig.direction === 'asc' ? 
        <ArrowUp className="ml-2 h-4 w-4" /> : 
        <ArrowDown className="ml-2 h-4 w-4" />
    }

    return (
      <div 
        className="flex items-center cursor-pointer select-none hover:text-gray-900"
        onClick={() => handleModelosSort(column)}
      >
        {children}
        {getSortIcon()}
      </div>
    )
  }

  // Componente para cabeçalhos ordenáveis das gerências
  const GerenciasSortableHeader = ({ column, children }) => {
    const getSortIcon = () => {
      if (gerenciasSortConfig.key !== column) {
        return <ArrowUpDown className="ml-2 h-4 w-4" />
      }
      return gerenciasSortConfig.direction === 'asc' ? 
        <ArrowUp className="ml-2 h-4 w-4" /> : 
        <ArrowDown className="ml-2 h-4 w-4" />
    }

    return (
      <div 
        className="flex items-center cursor-pointer select-none hover:text-gray-900"
        onClick={() => handleGerenciasSort(column)}
      >
        {children}
        {getSortIcon()}
      </div>
    )
  }

  // Componente para cabeçalhos ordenáveis da baixa patrimonial
  const BaixaSortableHeader = ({ column, children }) => {
    const getSortIcon = () => {
      if (baixaSortConfig.key !== column) {
        return <ArrowUpDown className="ml-2 h-4 w-4" />
      }
      return baixaSortConfig.direction === 'asc' ? 
        <ArrowUp className="ml-2 h-4 w-4" /> : 
        <ArrowDown className="ml-2 h-4 w-4" />
    }

    return (
      <div 
        className="flex items-center cursor-pointer select-none hover:text-gray-900"
        onClick={() => handleBaixaSort(column)}
      >
        {children}
        {getSortIcon()}
      </div>
    )
  }

    // 3. Função para atualizar o estado dos filtros
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  // Função para lidar com a ordenação
  const handleSort = (key) => {
    let direction = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  // Funções para filtros das outras abas
  const handleModelosFilterChange = (key, value) => {
    setModelosFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleGerenciasFilterChange = (key, value) => {
    setGerenciasFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleBaixaFilterChange = (key, value) => {
    setBaixaFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  // Funções para ordenação das outras abas
  const handleModelosSort = (key) => {
    let direction = 'asc'
    if (modelosSortConfig.key === key && modelosSortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setModelosSortConfig({ key, direction })
  }

  const handleGerenciasSort = (key) => {
    let direction = 'asc'
    if (gerenciasSortConfig.key === key && gerenciasSortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setGerenciasSortConfig({ key, direction })
  }

  const handleBaixaSort = (key) => {
    let direction = 'asc'
    if (baixaSortConfig.key === key && baixaSortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setBaixaSortConfig({ key, direction })
  }

  // 4. Lógica para filtrar e ordenar os patrimônios
  const filteredPatrimonios = useMemo(() => {
    // Primeiro filtra
    let filtered = patrimonios.filter(p => {
      // Busca tanto no número original quanto no formatado
      const searchTerm = filters.patrimonio.toLowerCase()
      const originalPatrimonio = p.patrimonio.toLowerCase()
      const formattedPatrimonio = formatPatrimonio(p.patrimonio).toLowerCase()
      const patrimonioMatch = originalPatrimonio.includes(searchTerm) || formattedPatrimonio.includes(searchTerm)
      const responsavelMatch = p.nome_servidor_responsavel.toLowerCase().includes(filters.responsavel.toLowerCase())
      const gerenciaMatch = filters.gerencia === 'all' || p.gerencia_id.toString() === filters.gerencia
      const modeloMatch = filters.modelo === 'all' || p.modelo_id.toString() === filters.modelo
      const processadorMatch = p.modelo?.processador.toLowerCase().includes(filters.processador.toLowerCase())
      const ramMatch = `${p.modelo?.quantidade_ram} ${p.modelo?.tipo_ram}`.toLowerCase().includes(filters.ram.toLowerCase())
      const soMatch = filters.so === 'all' || p.modelo?.sistema_operacional === filters.so;
      
      let ssdMatch = true
      if (filters.ssd === 'sim') {
        ssdMatch = p.modelo?.ssd === true
      } else if (filters.ssd === 'nao') {
        ssdMatch = p.modelo?.ssd === false
      }

      return patrimonioMatch && responsavelMatch && gerenciaMatch && modeloMatch && processadorMatch && ramMatch && soMatch && ssdMatch
    })

    // Depois ordena
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue = a[sortConfig.key]
        let bValue = b[sortConfig.key]

        // Lidar com valores aninhados
        if (sortConfig.key === 'gerencia') {
          aValue = a.gerencia?.nome || ''
          bValue = b.gerencia?.nome || ''
        } else if (sortConfig.key === 'modelo') {
          aValue = a.modelo?.nome || ''
          bValue = b.modelo?.nome || ''
        } else if (sortConfig.key === 'processador') {
          aValue = a.modelo?.processador || ''
          bValue = b.modelo?.processador || ''
        } else if (sortConfig.key === 'ram') {
          aValue = `${a.modelo?.quantidade_ram} ${a.modelo?.tipo_ram}` || ''
          bValue = `${b.modelo?.quantidade_ram} ${b.modelo?.tipo_ram}` || ''
        } else if (sortConfig.key === 'so') {
          aValue = a.modelo?.sistema_operacional || ''
          bValue = b.modelo?.sistema_operacional || ''
        } else if (sortConfig.key === 'ssd') {
          aValue = a.modelo?.ssd ? 1 : 0
          bValue = b.modelo?.ssd ? 1 : 0
        }

        // Comparação
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1
        }
        return 0
      })
    }

    return filtered
  }, [patrimonios, filters, sortConfig])

  // Lógica para filtrar e ordenar modelos
  const filteredModelos = useMemo(() => {
    let filtered = modelos.filter(modelo => {
      if (modelosFilters.nome && !modelo.nome.toLowerCase().includes(modelosFilters.nome.toLowerCase())) return false
      if (modelosFilters.processador && !modelo.processador.toLowerCase().includes(modelosFilters.processador.toLowerCase())) return false
      if (modelosFilters.ram && !modelo.quantidade_ram.toLowerCase().includes(modelosFilters.ram.toLowerCase())) return false
      if (modelosFilters.so && !modelo.sistema_operacional.toLowerCase().includes(modelosFilters.so.toLowerCase())) return false
      if (modelosFilters.ssd !== 'all') {
        if (modelosFilters.ssd === 'sim' && !modelo.ssd) return false
        if (modelosFilters.ssd === 'nao' && modelo.ssd) return false
      }
      return true
    })

    // Ordenar
    if (modelosSortConfig.key) {
      filtered.sort((a, b) => {
        let aValue = a[modelosSortConfig.key]
        let bValue = b[modelosSortConfig.key]
        
        if (typeof aValue === 'string') {
          aValue = aValue.toLowerCase()
          bValue = bValue.toLowerCase()
        }
        
        if (aValue < bValue) return modelosSortConfig.direction === 'asc' ? -1 : 1
        if (aValue > bValue) return modelosSortConfig.direction === 'asc' ? 1 : -1
        return 0
      })
    }

    return filtered
  }, [modelos, modelosFilters, modelosSortConfig])

  // Lógica para filtrar e ordenar gerências
  const filteredGerencias = useMemo(() => {
    let filtered = gerencias.filter(gerencia => {
      if (gerenciasFilters.nome && !gerencia.nome.toLowerCase().includes(gerenciasFilters.nome.toLowerCase())) return false
      return true
    })

    // Ordenar
    if (gerenciasSortConfig.key) {
      filtered.sort((a, b) => {
        let aValue = a[gerenciasSortConfig.key]
        let bValue = b[gerenciasSortConfig.key]
        
        if (typeof aValue === 'string') {
          aValue = aValue.toLowerCase()
          bValue = bValue.toLowerCase()
        }
        
        if (aValue < bValue) return gerenciasSortConfig.direction === 'asc' ? -1 : 1
        if (aValue > bValue) return gerenciasSortConfig.direction === 'asc' ? 1 : -1
        return 0
      })
    }

    return filtered
  }, [gerencias, gerenciasFilters, gerenciasSortConfig])

  // Lógica para filtrar e ordenar baixa patrimonial
  const filteredBaixaPatrimonial = useMemo(() => {
    let filtered = baixaPatrimonial.filter(item => {
      if (baixaFilters.patrimonio && !item.patrimonio.includes(baixaFilters.patrimonio)) return false
      if (baixaFilters.responsavel && !item.nome_servidor_responsavel.toLowerCase().includes(baixaFilters.responsavel.toLowerCase())) return false
      if (baixaFilters.modelo && !item.modelo?.nome.toLowerCase().includes(baixaFilters.modelo.toLowerCase())) return false
      if (baixaFilters.gerencia && !item.gerencia?.nome.toLowerCase().includes(baixaFilters.gerencia.toLowerCase())) return false
      if (baixaFilters.motivo && !item.motivo_baixa?.toLowerCase().includes(baixaFilters.motivo.toLowerCase())) return false
      return true
    })

    // Ordenar
    if (baixaSortConfig.key) {
      filtered.sort((a, b) => {
        let aValue, bValue
        
        if (baixaSortConfig.key === 'modelo') {
          aValue = a.modelo?.nome || ''
          bValue = b.modelo?.nome || ''
        } else if (baixaSortConfig.key === 'gerencia') {
          aValue = a.gerencia?.nome || ''
          bValue = b.gerencia?.nome || ''
        } else if (baixaSortConfig.key === 'data_baixa') {
          aValue = new Date(a.data_baixa)
          bValue = new Date(b.data_baixa)
        } else {
          aValue = a[baixaSortConfig.key] || ''
          bValue = b[baixaSortConfig.key] || ''
        }
        
        if (typeof aValue === 'string') {
          aValue = aValue.toLowerCase()
          bValue = bValue.toLowerCase()
        }
        
        if (aValue < bValue) return baixaSortConfig.direction === 'asc' ? -1 : 1
        if (aValue > bValue) return baixaSortConfig.direction === 'asc' ? 1 : -1
        return 0
      })
    }

    return filtered
  }, [baixaPatrimonial, baixaFilters, baixaSortConfig])

  const openDialog = (type, item = null) => {
    setDialogType(type)
    setEditingItem(item)
    
    if (type === 'patrimonio') {
      setPatrimonioForm(item ? {
        nome: item.nome, // <-- ADICIONADO
        patrimonio: item.patrimonio,
        nome_servidor_responsavel: item.nome_servidor_responsavel,
        modelo_id: item.modelo_id.toString(),
        gerencia_id: item.gerencia_id.toString()
      } : {
        nome: '', // <-- ADICIONADO
        patrimonio: '',
        nome_servidor_responsavel: '',
        modelo_id: '',
        gerencia_id: ''
      })
    } else if (type === 'modelo') {
      setModeloForm(item ? {
        nome: item.nome,
        processador: item.processador,
        quantidade_ram: item.quantidade_ram,
        tipo_ram: item.tipo_ram,
        sistema_operacional: item.sistema_operacional,
        ssd: item.ssd
      } : {
        nome: '',
        processador: '',
        quantidade_ram: '',
        tipo_ram: '',
        sistema_operacional: '',
        ssd: false
      })
    } else if (type === 'gerencia') {
      setGerenciaForm(item ? {
        nome: item.nome
      } : {
        nome: ''
      })
    }
    
    setIsDialogOpen(true)
  }

  const closeDialog = () => {
    setIsDialogOpen(false)
    setEditingItem(null)
    setDialogType('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      let url = `${API_BASE_URL}/${dialogType}s`
      let method = 'POST'
      let body = {}

      if (editingItem) {
        url += `/${editingItem.id}`
        method = 'PUT'
      }

      if (dialogType === 'patrimonio') {
        body = {
          ...patrimonioForm,
          modelo_id: parseInt(patrimonioForm.modelo_id),
          gerencia_id: parseInt(patrimonioForm.gerencia_id)
        }
      } else if (dialogType === 'modelo') {
        body = modeloForm
      } else if (dialogType === 'gerencia') {
        body = gerenciaForm
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      })

      if (response.ok) {
        const updatedItem = await response.json()
        
        if (dialogType === 'patrimonio') {
          if (editingItem) {
            setPatrimonios(prev => prev.map(item => 
              item.id === editingItem.id ? updatedItem : item
            ))
          } else {
            setPatrimonios(prev => [...prev, updatedItem])
          }
        } else if (dialogType === 'modelo') {
          if (editingItem) {
            setModelos(prev => prev.map(item => 
              item.id === editingItem.id ? updatedItem : item
            ))
          } else {
            setModelos(prev => [...prev, updatedItem])
          }
        } else if (dialogType === 'gerencia') {
          if (editingItem) {
            setGerencias(prev => prev.map(item => 
              item.id === editingItem.id ? updatedItem : item
            ))
          } else {
            setGerencias(prev => [...prev, updatedItem])
          }
        }
        
        closeDialog()
      }
    } catch (error) {
      console.error('Erro ao salvar:', error)
    }
  }

  const handleDelete = async (type, id) => {
    const message = type === 'patrimonio' 
      ? 'Você irá enviar esse computador para baixa patrimonial, tem certeza?'
      : 'Tem certeza que deseja excluir este item?'
    
    if (confirm(message)) {
      try {
        const response = await fetch(`${API_BASE_URL}/${type}s/${id}`, {
          method: 'DELETE'
        })

        if (response.ok) {
          if (type === 'patrimonio') {
            setPatrimonios(prev => prev.filter(item => item.id !== id))
            // Recarregar baixa patrimonial para mostrar o item movido
            fetchBaixaPatrimonial()
          } else if (type === 'modelo') {
            setModelos(prev => prev.filter(item => item.id !== id))
          } else if (type === 'gerencia') {
            setGerencias(prev => prev.filter(item => item.id !== id))
          }
        }
      } catch (error) {
        console.error('Erro ao excluir:', error)
      }
    }
  }

  const fetchBaixaPatrimonial = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/baixa-patrimonial`)
      const data = await response.json()
      setBaixaPatrimonial(data)
    } catch (error) {
      console.error('Erro ao carregar baixa patrimonial:', error)
    }
  }

  const handleRestaurar = async (item) => {
    if (confirm(`Tem certeza que deseja restaurar o patrimônio ${formatPatrimonio(item.patrimonio)}?`)) {
      try {
        console.log('Restaurando patrimônio:', item)
        
        const response = await fetch(`${API_BASE_URL}/baixa-patrimonial/${item.id}/restaurar`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        })

        console.log('Response status:', response.status)
        const responseText = await response.text()
        console.log('Response text:', responseText)

        if (response.ok) {
          try {
            const patrimonioRestaurado = JSON.parse(responseText)
            console.log('Patrimônio restaurado:', patrimonioRestaurado)
            
            // Atualizar estado local imediatamente
            setPatrimonios(prev => [...prev, patrimonioRestaurado])
            setBaixaPatrimonial(prev => prev.filter(b => b.id !== item.id))
            
            alert(`Patrimônio ${formatPatrimonio(item.patrimonio)} restaurado com sucesso!`)
          } catch (parseError) {
            console.error('Erro ao fazer parse da resposta:', parseError)
            // Recarregar dados mesmo se houver erro de parse
            fetchData()
            alert('Patrimônio restaurado com sucesso!')
          }
        } else {
          try {
            const errorData = JSON.parse(responseText)
            console.error('Erro da API:', errorData)
            
            // Se o patrimônio já existe, remover da baixa patrimonial localmente
            if (errorData.error && errorData.error.includes('já existe na tabela ativa')) {
              setBaixaPatrimonial(prev => prev.filter(b => b.id !== item.id))
              fetchData() // Recarregar para sincronizar
              alert('Patrimônio já estava restaurado. Lista atualizada.')
            } else {
              alert(`Erro ao restaurar: ${errorData.error}`)
            }
          } catch (parseError) {
            console.error('Erro ao fazer parse do erro:', parseError)
            alert(`Erro ao restaurar: ${responseText}`)
          }
        }
      } catch (error) {
        console.error('Erro ao restaurar patrimônio:', error)
        alert('Erro de conexão ao restaurar patrimônio. Verifique se o servidor está rodando.')
      }
    }
  }


  // Funções para o layout visual
  const isComputerInLayout = (computerId) => {
    if (!selectedGerencia || !layouts[selectedGerencia]) return false
    return Object.values(layouts[selectedGerencia]).some(id => id === computerId)
  }

  const getComputerAtPosition = (position) => {
    if (!selectedGerencia || !layouts[selectedGerencia]) return null
    const computerId = layouts[selectedGerencia][position]
    if (!computerId) return null
    
    // Validar se o computador ainda existe e pertence à gerência correta
    const computer = patrimonios.find(p => p.id === computerId && p.gerencia_id === selectedGerencia)
    
    // Se não encontrar, remover da posição (limpeza automática)
    if (!computer && computerId) {
      setLayouts(prev => ({
        ...prev,
        [selectedGerencia]: Object.fromEntries(
          Object.entries(prev[selectedGerencia] || {}).filter(([pos, id]) => 
            pos !== position.toString()
          )
        )
      }))
    }
    
    return computer || null
  }

  const handleDropOnPosition = (e, position) => {
    e.preventDefault()
    if (!draggedComputer || !selectedGerencia) return

    setLayouts(prev => ({
      ...prev,
      [selectedGerencia]: {
        ...prev[selectedGerencia],
        // Remove o computador de qualquer posição anterior
        ...Object.fromEntries(
          Object.entries(prev[selectedGerencia] || {}).filter(([_, id]) => id !== draggedComputer.id)
        ),
        // Adiciona na nova posição
        [position]: draggedComputer.id
      }
    }))
  }

  const handleDropOnLayout = (e) => {
    // Apenas previne o comportamento padrão
    // O drop real é tratado em handleDropOnPosition
    e.preventDefault()
  }

  const handleDropOnPanel = (e) => {
    e.preventDefault()
    // Remover classes visuais de drag
    e.currentTarget.classList.remove('border-blue-400', 'bg-blue-50')
    
    if (!draggedComputer || !selectedGerencia) return

    // Remover computador do layout (voltar para disponíveis)
    setLayouts(prev => ({
      ...prev,
      [selectedGerencia]: Object.fromEntries(
        Object.entries(prev[selectedGerencia] || {}).filter(([_, id]) => id !== draggedComputer.id)
      )
    }))
  }

  const saveLayout = async (diagramLayoutData = null) => {
    if (!selectedGerencia) return

    try {
      // Se recebeu dados do diagrama, usar eles; senão usar o layout de grid atual
      const currentLayout = diagramLayoutData || layouts[selectedGerencia] || {}
      
      console.log('Salvando layout:', {
        gerencia_id: selectedGerencia,
        layout_data: currentLayout,
        is_diagram: !!diagramLayoutData
      })
      
      const response = await fetch(`${API_BASE_URL}/layouts/${selectedGerencia}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          layout_data: currentLayout,
          is_diagram: !!diagramLayoutData
        })
      })

      console.log('Resposta do servidor:', response.status, response.statusText)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Erro do servidor:', errorText)
        throw new Error(`Erro HTTP ${response.status}: ${errorText}`)
      }

      // Tentar fazer parse da resposta
      const responseText = await response.text()
      console.log('Resposta recebida:', responseText)
      
      let responseData
      if (responseText.trim()) {
        try {
          responseData = JSON.parse(responseText)
          console.log('Dados da resposta:', responseData)
        } catch (parseError) {
          console.error('Erro ao fazer parse da resposta:', parseError)
          // Continuar mesmo com erro de parse se o status foi ok
        }
      }

      // Atualizar backups após salvar com sucesso
      setOriginalLayouts(prev => ({
        ...prev,
        [selectedGerencia]: { ...currentLayout }
      }))
      
      alert('Layout salvo com sucesso!')
    } catch (error) {
      console.error('Erro ao salvar layout:', error)
      alert(`Erro ao salvar layout: ${error.message}`)
    }
  }

  const handleRightClick = (e, computer) => {
    e.preventDefault()
    setContextMenu({
      show: true,
      x: e.clientX,
      y: e.clientY,
      computer
    })
  }

  const removeFromLayout = (computer) => {
    if (!selectedGerencia) return
    
    setLayouts(prev => ({
      ...prev,
      [selectedGerencia]: Object.fromEntries(
        Object.entries(prev[selectedGerencia] || {}).filter(([_, id]) => id !== computer.id)
      )
    }))
    setContextMenu({ show: false, x: 0, y: 0, computer: null })
  }

  const editComputerInLayout = (computer) => {
    openDialog('patrimonio', computer)
    setContextMenu({ show: false, x: 0, y: 0, computer: null })
  }

  // Função para cancelar alterações (reverter ao estado original)
  const cancelChanges = () => {
    if (!selectedGerencia) return
    
    if (confirm('Tem certeza que deseja cancelar todas as alterações? Isso irá reverter o layout para o estado original.')) {
      // Restaurar layout original
      if (originalLayouts[selectedGerencia]) {
        setLayouts(prev => ({
          ...prev,
          [selectedGerencia]: { ...originalLayouts[selectedGerencia] }
        }))
      }
      
      // Restaurar configuração de grid original
      if (originalGridConfigs[selectedGerencia]) {
        setGridConfigs(prev => ({
          ...prev,
          [selectedGerencia]: { ...originalGridConfigs[selectedGerencia] }
        }))
      }
    }
  }

  // Função para resetar todo o layout (limpar tudo)
  const resetLayout = () => {
    if (!selectedGerencia) return
    
    if (confirm('Tem certeza que deseja resetar completamente o layout? Todos os computadores serão removidos do layout e voltarão para a lista de disponíveis.')) {
      // Limpar layout
      setLayouts(prev => ({
        ...prev,
        [selectedGerencia]: {}
      }))
      
      // Resetar para configuração automática
      const computersCount = getComputersForGerencia(selectedGerencia).length
      const options = generateGridOptions(computersCount)
      const defaultOption = options[0] || { cols: 4, rows: 4 }
      
      setGridConfigs(prev => ({
        ...prev,
        [selectedGerencia]: defaultOption
      }))
    }
  }

  // Função para validar e limpar layouts (remove computadores que não existem mais ou mudaram de gerência)
  const validateAndCleanLayouts = () => {
    setLayouts(prev => {
      const updatedLayouts = { ...prev }
      let hasChanges = false

      // Para cada gerência que tem layout
      Object.keys(updatedLayouts).forEach(gerenciaId => {
        const gerenciaIdNum = parseInt(gerenciaId)
        const layout = updatedLayouts[gerenciaId]
        const computersInGerencia = patrimonios.filter(p => p.gerencia_id === gerenciaIdNum)
        const validComputerIds = new Set(computersInGerencia.map(p => p.id))

        // Filtrar posições que referenciam computadores válidos
        const cleanedLayout = Object.fromEntries(
          Object.entries(layout).filter(([position, computerId]) => {
            return validComputerIds.has(computerId)
          })
        )

        // Se o layout mudou, atualizar
        if (Object.keys(cleanedLayout).length !== Object.keys(layout).length) {
          updatedLayouts[gerenciaId] = cleanedLayout
          hasChanges = true
          
          // Log para debug (pode remover em produção)
          const removedCount = Object.keys(layout).length - Object.keys(cleanedLayout).length
          console.log(`Removidos ${removedCount} computadores inválidos do layout da gerência ${gerenciaId}`)
        }
      })

      return hasChanges ? updatedLayouts : prev
    })
  }

  // Função para verificar se há alterações não salvas
  const hasUnsavedChanges = (gerenciaId) => {
    if (!gerenciaId) return false
    
    // Verificar se layout mudou
    const currentLayout = layouts[gerenciaId] || {}
    const originalLayout = originalLayouts[gerenciaId] || {}
    const layoutChanged = JSON.stringify(currentLayout) !== JSON.stringify(originalLayout)
    
    // Verificar se grid config mudou
    const currentGrid = gridConfigs[gerenciaId]
    const originalGrid = originalGridConfigs[gerenciaId]
    const gridChanged = JSON.stringify(currentGrid) !== JSON.stringify(originalGrid)
    
    return layoutChanged || gridChanged
  }

  // Função para calcular número de slots baseado nas máquinas da gerência
  const getComputersForGerencia = (gerenciaId) => {
    // Obter lista de patrimônios que estão na baixa patrimonial
    const patrimoniosNaBaixa = baixaPatrimonial.map(b => b.patrimonio)
    
    // Filtrar patrimônios ativos da gerência que não estão na baixa
    return patrimonios.filter(p => 
      p.gerencia_id === gerenciaId && 
      !patrimoniosNaBaixa.includes(p.patrimonio)
    )
  }

  // Função para gerar opções de grid baseadas no número de computadores
  const generateGridOptions = (numComputers) => {
    if (numComputers === 0) return [{ cols: 1, rows: 1, label: '1x1' }]
    
    const options = []
    const factors = []
    
    // Encontrar todos os divisores do número
    for (let i = 1; i <= numComputers; i++) {
      if (numComputers % i === 0) {
        factors.push(i)
      }
    }
    
    // Gerar opções baseadas nos divisores
    factors.forEach(cols => {
      const rows = numComputers / cols
      if (rows >= 1) {
        options.push({
          cols,
          rows,
          label: `${cols}x${rows}`,
          aspect: cols / rows
        })
      }
    })
    
    // Adicionar opções com slots extras (mais flexibilidade)
    const extraOptions = [
      { cols: Math.ceil(Math.sqrt(numComputers)), rows: Math.ceil(numComputers / Math.ceil(Math.sqrt(numComputers))) },
      { cols: Math.ceil(Math.sqrt(numComputers * 1.5)), rows: Math.ceil(numComputers / Math.ceil(Math.sqrt(numComputers * 1.5))) },
      { cols: numComputers <= 4 ? numComputers : 4, rows: Math.ceil(numComputers / (numComputers <= 4 ? numComputers : 4)) },
      { cols: 2, rows: Math.ceil(numComputers / 2) },
      { cols: 3, rows: Math.ceil(numComputers / 3) },
      { cols: 5, rows: Math.ceil(numComputers / 5) },
      { cols: 6, rows: Math.ceil(numComputers / 6) },
    ]
    
    extraOptions.forEach(option => {
      const totalSlots = option.cols * option.rows
      if (totalSlots >= numComputers && totalSlots <= numComputers + 3) {
        const existing = options.find(opt => opt.cols === option.cols && opt.rows === option.rows)
        if (!existing) {
          options.push({
            ...option,
            label: `${option.cols}x${option.rows} (${totalSlots - numComputers} extras)`,
            aspect: option.cols / option.rows
          })
        }
      }
    })
    
    // Remover duplicatas e ordenar
    const uniqueOptions = options.filter((option, index, self) => 
      index === self.findIndex(opt => opt.cols === option.cols && opt.rows === option.rows)
    )
    
    return uniqueOptions.sort((a, b) => {
      // Priorizar opções exatas, depois por aspect ratio
      const aExact = (a.cols * a.rows) === numComputers
      const bExact = (b.cols * b.rows) === numComputers
      
      if (aExact && !bExact) return -1
      if (!aExact && bExact) return 1
      
      return Math.abs(a.aspect - 1.33) - Math.abs(b.aspect - 1.33) // Preferir aspect ratio próximo a 4:3
    })
  }

  const getGridDimensions = (numComputers, gerenciaId) => {
    // Se há configuração salva para esta gerência, usar ela
    if (gridConfigs[gerenciaId]) {
      const config = gridConfigs[gerenciaId]
      // Validar que os valores são válidos
      const cols = Math.max(1, Math.min(20, config.cols || 1))
      const rows = Math.max(1, Math.min(20, config.rows || 1))
      return { cols, rows }
    }
    
    // Senão, usar a primeira opção das opções geradas
    const options = generateGridOptions(numComputers)
    return options[0] || { cols: 4, rows: Math.ceil(numComputers / 4) }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Monitor className="h-12 w-12 animate-spin mx-auto mb-4" />
          <p>Carregando dados...</p>
        </div>
      </div>
    )
  }

  const handleLogin = (userData) => {
    setUser(userData)
    fetchData()
    testAPIConnection()
  }

  const handleLogout = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
    setUser(null)
  }

  // Se não há usuário logado, mostrar tela de login
  if (!user) {
    return <Login onLogin={handleLogin} />
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="w-full mx-auto px-4">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Computer className="h-8 w-8" />
                Sistema de Gerenciamento de Computadores
              </h1>
              <p className="text-gray-600 mt-2">Gerencie o patrimônio de computadores da empresa</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Olá, {user.username}!</span>
              <Button onClick={handleLogout} variant="outline" size="sm">
                Sair
              </Button>
            </div>
          </div>
        </div>

        <Tabs defaultValue="patrimonios" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="patrimonios" className="flex items-center gap-2">
              <Monitor className="h-4 w-4" />
              Patrimônios
            </TabsTrigger>
            <TabsTrigger value="modelos" className="flex items-center gap-2">
              <Computer className="h-4 w-4" />
              Modelos de Computador
            </TabsTrigger>
            <TabsTrigger value="gerencias" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              Gerências
            </TabsTrigger>
            <TabsTrigger value="layout" className="flex items-center gap-2">
              <Layout className="h-4 w-4" />
              Layout Visual
            </TabsTrigger>
            <TabsTrigger value="baixa" className="flex items-center gap-2 text-xs">
              <Trash2 className="h-3 w-3" />
              Baixa
            </TabsTrigger>
          </TabsList>

          <TabsContent value="patrimonios">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Patrimônios</CardTitle>
                    <CardDescription>
                      Exibindo {filteredPatrimonios.length} de {patrimonios.length} computadores.
                    </CardDescription>
                  </div>
                  <Button onClick={() => openDialog('patrimonio')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Patrimônio
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead><SortableHeader column="patrimonio">Patrimônio</SortableHeader></TableHead>
                      <TableHead><SortableHeader column="nome_servidor_responsavel">Responsável</SortableHeader></TableHead>
                      <TableHead><SortableHeader column="gerencia">Gerência</SortableHeader></TableHead>
                      <TableHead><SortableHeader column="modelo">Modelo</SortableHeader></TableHead>
                      <TableHead><SortableHeader column="processador">Processador</SortableHeader></TableHead>
                      <TableHead><SortableHeader column="ram">RAM</SortableHeader></TableHead>
                      <TableHead><SortableHeader column="so">SO</SortableHeader></TableHead>
                      <TableHead><SortableHeader column="ssd">SSD</SortableHeader></TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                    <TableRow>
                      <TableHead><Input placeholder="Filtrar..." value={filters.patrimonio} onChange={(e) => handleFilterChange('patrimonio', e.target.value)} /></TableHead>
                      <TableHead><Input placeholder="Filtrar..." value={filters.responsavel} onChange={(e) => handleFilterChange('responsavel', e.target.value)} /></TableHead>
                      <TableHead>
                        <Select value={filters.gerencia} onValueChange={(value) => handleFilterChange('gerencia', value)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Todas</SelectItem>
                            {gerencias.map(g => <SelectItem key={g.id} value={g.id.toString()}>{g.nome}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </TableHead>
                      <TableHead>
                        <Select value={filters.modelo} onValueChange={(value) => handleFilterChange('modelo', value)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Todos</SelectItem>
                            {modelos.map(m => <SelectItem key={m.id} value={m.id.toString()}>{m.nome}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </TableHead>
                      <TableHead><Input placeholder="Filtrar..." value={filters.processador} onChange={(e) => handleFilterChange('processador', e.target.value)} /></TableHead>
                      <TableHead><Input placeholder="Filtrar..." value={filters.ram} onChange={(e) => handleFilterChange('ram', e.target.value)} /></TableHead>
                       <TableHead>
                        <Select value={filters.so} onValueChange={(value) => handleFilterChange('so', value)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Todos</SelectItem>
                            {uniqueOsOptions.map(os => (
                              <SelectItem key={os} value={os}>{os}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableHead>
                      <TableHead>
                        <Select value={filters.ssd} onValueChange={(value) => handleFilterChange('ssd', value)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Todos</SelectItem>
                            <SelectItem value="sim">Sim</SelectItem>
                            <SelectItem value="nao">Não</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableHead>
                      <TableHead className="w-24">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPatrimonios.map((patrimonio) => (
                      <TableRow key={patrimonio.id}>
                        <TableCell className="font-medium">{formatPatrimonioJSX(patrimonio.patrimonio)}</TableCell>
                        <TableCell>{patrimonio.nome_servidor_responsavel}</TableCell>
                        <TableCell>{patrimonio.gerencia?.nome}</TableCell>
                        <TableCell>{patrimonio.modelo?.nome}</TableCell>
                        <TableCell>{patrimonio.modelo?.processador}</TableCell>
                        <TableCell>{patrimonio.modelo?.quantidade_ram} {patrimonio.modelo?.tipo_ram}</TableCell>
                        <TableCell>{patrimonio.modelo?.sistema_operacional}</TableCell>
                        <TableCell>
                          <Badge variant={patrimonio.modelo?.ssd ? "default" : "secondary"}>
                            {patrimonio.modelo?.ssd ? "Sim" : "Não"}
                          </Badge>
                        </TableCell>
                        <TableCell className="w-24">
                          <div className="flex gap-1 min-w-fit">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openDialog('patrimonio', patrimonio)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete('patrimonio', patrimonio.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="modelos">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Modelos de Computador</CardTitle>
                    <CardDescription>
                      Exibindo {filteredModelos.length} de {modelos.length} modelos.
                    </CardDescription>
                  </div>
                  <Button onClick={() => openDialog('modelo')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Modelo
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead><ModelosSortableHeader column="nome">Nome</ModelosSortableHeader></TableHead>
                      <TableHead><ModelosSortableHeader column="processador">Processador</ModelosSortableHeader></TableHead>
                      <TableHead><ModelosSortableHeader column="quantidade_ram">Quantidade RAM</ModelosSortableHeader></TableHead>
                      <TableHead><ModelosSortableHeader column="tipo_ram">Tipo RAM</ModelosSortableHeader></TableHead>
                      <TableHead><ModelosSortableHeader column="sistema_operacional">Sistema Operacional</ModelosSortableHeader></TableHead>
                      <TableHead><ModelosSortableHeader column="ssd">SSD</ModelosSortableHeader></TableHead>
                      <TableHead className="w-24">Ações</TableHead>
                    </TableRow>
                    <TableRow>
                      <TableHead><Input placeholder="Filtrar..." value={modelosFilters.nome} onChange={(e) => handleModelosFilterChange('nome', e.target.value)} /></TableHead>
                      <TableHead><Input placeholder="Filtrar..." value={modelosFilters.processador} onChange={(e) => handleModelosFilterChange('processador', e.target.value)} /></TableHead>
                      <TableHead><Input placeholder="Filtrar..." value={modelosFilters.ram} onChange={(e) => handleModelosFilterChange('ram', e.target.value)} /></TableHead>
                      <TableHead></TableHead>
                      <TableHead><Input placeholder="Filtrar..." value={modelosFilters.so} onChange={(e) => handleModelosFilterChange('so', e.target.value)} /></TableHead>
                      <TableHead>
                        <Select value={modelosFilters.ssd} onValueChange={(value) => handleModelosFilterChange('ssd', value)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Todos</SelectItem>
                            <SelectItem value="sim">Sim</SelectItem>
                            <SelectItem value="nao">Não</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableHead>
                      <TableHead className="w-24">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredModelos.map((modelo) => (
                      <TableRow key={modelo.id}>
                        <TableCell className="font-medium">{modelo.nome}</TableCell>
                        <TableCell>{modelo.processador}</TableCell>
                        <TableCell>{modelo.quantidade_ram}</TableCell>
                        <TableCell>{modelo.tipo_ram}</TableCell>
                        <TableCell>{modelo.sistema_operacional}</TableCell>
                        <TableCell>
                          <Badge variant={modelo.ssd ? "default" : "secondary"}>
                            {modelo.ssd ? "Sim" : "Não"}
                          </Badge>
                        </TableCell>
                        <TableCell className="w-24">
                          <div className="flex gap-1 min-w-fit">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openDialog('modelo', modelo)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete('modelo', modelo.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="gerencias">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Gerências</CardTitle>
                    <CardDescription>
                      Exibindo {filteredGerencias.length} de {gerencias.length} gerências.
                    </CardDescription>
                  </div>
                  <Button onClick={() => openDialog('gerencia')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Gerência
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead><GerenciasSortableHeader column="nome">Nome</GerenciasSortableHeader></TableHead>
                      <TableHead className="w-24">Ações</TableHead>
                    </TableRow>
                    <TableRow>
                      <TableHead><Input placeholder="Filtrar..." value={gerenciasFilters.nome} onChange={(e) => handleGerenciasFilterChange('nome', e.target.value)} /></TableHead>
                      <TableHead className="w-24">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredGerencias.map((gerencia) => (
                      <TableRow key={gerencia.id}>
                        <TableCell className="font-medium">{gerencia.nome}</TableCell>
                        <TableCell className="w-24">
                          <div className="flex gap-1 min-w-fit">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openDialog('gerencia', gerencia)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete('gerencia', gerencia.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="layout">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Editor de Diagrama</CardTitle>
                    <CardDescription>
                      Crie diagramas personalizados posicionando computadores livremente
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Select value={selectedGerencia?.toString() || ''} onValueChange={(value) => setSelectedGerencia(parseInt(value))}>
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Selecione uma gerência" />
                      </SelectTrigger>
                      <SelectContent>
                        {gerencias.map(g => (
                          <SelectItem key={g.id} value={g.id.toString()}>{g.nome}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {selectedGerencia ? (
                  <DiagramEditor
                    computers={patrimonios}
                    selectedGerencia={selectedGerencia}
                    layouts={layouts}
                    onSaveLayout={saveLayout}
                    hasUnsavedChanges={hasUnsavedChanges(selectedGerencia)}
                    onCancelChanges={cancelChanges}
                    onResetLayout={resetLayout}
                  />
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    Selecione uma gerência para visualizar e editar o layout
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="baixa">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Baixa Patrimonial</CardTitle>
                    <CardDescription>
                      Exibindo {filteredBaixaPatrimonial.length} de {baixaPatrimonial.length} patrimônios na baixa.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="w-full overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead><BaixaSortableHeader column="patrimonio">Patrimônio</BaixaSortableHeader></TableHead>
                        <TableHead><BaixaSortableHeader column="nome_servidor_responsavel">Responsável</BaixaSortableHeader></TableHead>
                        <TableHead><BaixaSortableHeader column="modelo">Modelo</BaixaSortableHeader></TableHead>
                        <TableHead><BaixaSortableHeader column="gerencia">Gerência Original</BaixaSortableHeader></TableHead>
                        <TableHead><BaixaSortableHeader column="data_baixa">Data da Baixa</BaixaSortableHeader></TableHead>
                        <TableHead><BaixaSortableHeader column="motivo_baixa">Motivo</BaixaSortableHeader></TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                      <TableRow>
                        <TableHead><Input placeholder="Filtrar..." value={baixaFilters.patrimonio} onChange={(e) => handleBaixaFilterChange('patrimonio', e.target.value)} /></TableHead>
                        <TableHead><Input placeholder="Filtrar..." value={baixaFilters.responsavel} onChange={(e) => handleBaixaFilterChange('responsavel', e.target.value)} /></TableHead>
                        <TableHead><Input placeholder="Filtrar..." value={baixaFilters.modelo} onChange={(e) => handleBaixaFilterChange('modelo', e.target.value)} /></TableHead>
                        <TableHead><Input placeholder="Filtrar..." value={baixaFilters.gerencia} onChange={(e) => handleBaixaFilterChange('gerencia', e.target.value)} /></TableHead>
                        <TableHead></TableHead>
                        <TableHead><Input placeholder="Filtrar..." value={baixaFilters.motivo} onChange={(e) => handleBaixaFilterChange('motivo', e.target.value)} /></TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredBaixaPatrimonial.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            {formatPatrimonioJSX(item.patrimonio)}
                          </TableCell>
                          <TableCell>{item.nome_servidor_responsavel}</TableCell>
                          <TableCell>{item.modelo?.nome || 'N/A'}</TableCell>
                          <TableCell>{item.gerencia?.nome || 'N/A'}</TableCell>
                          <TableCell>
                            {item.data_baixa ? new Date(item.data_baixa).toLocaleDateString('pt-BR') : 'N/A'}
                          </TableCell>
                          <TableCell>{item.motivo_baixa || 'N/A'}</TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRestaurar(item)}
                              className="text-green-600 hover:text-green-700"
                            >
                              Restaurar
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {filteredBaixaPatrimonial.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      {baixaPatrimonial.length === 0 ? 'Nenhum patrimônio na baixa patrimonial' : 'Nenhum patrimônio encontrado com os filtros aplicados'}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Menu de contexto */}
        {contextMenu.show && (
          <div
            className="fixed bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50"
            style={{ left: contextMenu.x, top: contextMenu.y }}
            onClick={() => setContextMenu({ show: false, x: 0, y: 0, computer: null })}
          >
            <button
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
              onClick={() => editComputerInLayout(contextMenu.computer)}
            >
              <Edit className="h-4 w-4" />
              Editar Computador
            </button>
            <button
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2 text-red-600"
              onClick={() => removeFromLayout(contextMenu.computer)}
            >
              <Trash2 className="h-4 w-4" />
              Remover do Layout
            </button>
            <div className="border-t border-gray-200 my-1"></div>
            <div className="px-4 py-2 text-xs text-gray-500">
              Dica: Arraste para o painel lateral para remover
            </div>
          </div>
        )}

        {/* Overlay para fechar o menu de contexto */}
        {contextMenu.show && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setContextMenu({ show: false, x: 0, y: 0, computer: null })}
          />
        )}

        {/* Dialog para formulários */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingItem ? 'Editar' : 'Adicionar'} {
                  dialogType === 'patrimonio' ? 'Patrimônio' :
                  dialogType === 'modelo' ? 'Modelo' : 'Gerência'
                }
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                {dialogType === 'patrimonio' && (
                  <>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="patrimonio" className="text-right">
                        Patrimônio
                      </Label>
                      <Input
                        id="patrimonio"
                        value={patrimonioForm.patrimonio}
                        onChange={(e) => setPatrimonioForm({...patrimonioForm, patrimonio: e.target.value})}
                        className="col-span-3"
                        required
                        disabled={editingItem !== null}
                        placeholder={editingItem ? "Número de patrimônio não pode ser alterado" : "Digite o número do patrimônio"}
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="responsavel" className="text-right">
                        Responsável
                      </Label>
                      <Input
                        id="responsavel"
                        value={patrimonioForm.nome_servidor_responsavel}
                        onChange={(e) => setPatrimonioForm({...patrimonioForm, nome_servidor_responsavel: e.target.value})}
                        className="col-span-3"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="gerencia" className="text-right">
                        Gerência
                      </Label>
                      <Select
                        value={patrimonioForm.gerencia_id}
                        onValueChange={(value) => setPatrimonioForm({...patrimonioForm, gerencia_id: value})}
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Selecione uma gerência" />
                        </SelectTrigger>
                        <SelectContent>
                          {gerencias.map((gerencia) => (
                            <SelectItem key={gerencia.id} value={gerencia.id.toString()}>
                              {gerencia.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="modelo" className="text-right">
                        Modelo
                      </Label>
                      <Select
                        value={patrimonioForm.modelo_id}
                        onValueChange={(value) => setPatrimonioForm({...patrimonioForm, modelo_id: value})}
                        disabled={editingItem !== null}
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder={editingItem ? "Modelo não pode ser alterado" : "Selecione um modelo"} />
                        </SelectTrigger>
                        <SelectContent>
                          {modelos.map((modelo) => (
                            <SelectItem key={modelo.id} value={modelo.id.toString()}>
                              {modelo.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                {dialogType === 'modelo' && (
                  <>
                  <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="nome" className="text-right">
                        Nome
                      </Label>
                      <Input
                        id="nome"
                        value={modeloForm.nome}
                        onChange={(e) => setModeloForm({...modeloForm, nome: e.target.value})}
                        className="col-span-3"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="processador" className="text-right">
                        Processador
                      </Label>
                      <Input
                        id="processador"
                        value={modeloForm.processador}
                        onChange={(e) => setModeloForm({...modeloForm, processador: e.target.value})}
                        className="col-span-3"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="quantidade_ram" className="text-right">
                        Quantidade RAM
                      </Label>
                      <Input
                        id="quantidade_ram"
                        value={modeloForm.quantidade_ram}
                        onChange={(e) => setModeloForm({...modeloForm, quantidade_ram: e.target.value})}
                        className="col-span-3"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="tipo_ram" className="text-right">
                        Tipo RAM
                      </Label>
                      <Input
                        id="tipo_ram"
                        value={modeloForm.tipo_ram}
                        onChange={(e) => setModeloForm({...modeloForm, tipo_ram: e.target.value})}
                        className="col-span-3"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="sistema_operacional" className="text-right">
                        Sistema Operacional
                      </Label>
                      <Input
                        id="sistema_operacional"
                        value={modeloForm.sistema_operacional}
                        onChange={(e) => setModeloForm({...modeloForm, sistema_operacional: e.target.value})}
                        className="col-span-3"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="ssd" className="text-right">
                        SSD
                      </Label>
                      <div className="col-span-3">
                        <Checkbox
                          id="ssd"
                          checked={modeloForm.ssd}
                          onCheckedChange={(checked) => setModeloForm({...modeloForm, ssd: checked})}
                        />
                      </div>
                    </div>
                  </>
                )}

                {dialogType === 'gerencia' && (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="nome" className="text-right">
                      Nome
                    </Label>
                    <Input
                      id="nome"
                      value={gerenciaForm.nome}
                      onChange={(e) => setGerenciaForm({...gerenciaForm, nome: e.target.value})}
                      className="col-span-3"
                      required
                    />
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={closeDialog}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingItem ? 'Salvar' : 'Adicionar'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

export default App

