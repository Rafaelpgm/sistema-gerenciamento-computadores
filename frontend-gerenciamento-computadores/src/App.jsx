import { useState, useEffect } from 'react'
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
import { Computer, Building, Settings, Plus, Edit, Trash2, Monitor } from 'lucide-react'
import './App.css'

const API_BASE_URL = 'http://localhost:5000/api'

function App() {
  const [patrimonios, setPatrimonios] = useState([])
  const [modelos, setModelos] = useState([])
  const [gerencias, setGerencias] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingItem, setEditingItem] = useState(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [dialogType, setDialogType] = useState('')

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
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [patrimoniosRes, modelosRes, gerenciasRes] = await Promise.all([
        fetch(`${API_BASE_URL}/patrimonios`),
        fetch(`${API_BASE_URL}/modelos`),
        fetch(`${API_BASE_URL}/gerencias`)
      ])

      const patrimoniosData = await patrimoniosRes.json()
      const modelosData = await modelosRes.json()
      const gerenciasData = await gerenciasRes.json()

      setPatrimonios(patrimoniosData)
      setModelos(modelosData)
      setGerencias(gerenciasData)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

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
        await fetchData()
        closeDialog()
      }
    } catch (error) {
      console.error('Erro ao salvar:', error)
    }
  }

  const handleDelete = async (type, id) => {
    if (confirm('Tem certeza que deseja excluir este item?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/${type}s/${id}`, {
          method: 'DELETE'
        })

        if (response.ok) {
          await fetchData()
        }
      } catch (error) {
        console.error('Erro ao excluir:', error)
      }
    }
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

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Computer className="h-8 w-8" />
            Sistema de Gerenciamento de Computadores
          </h1>
          <p className="text-gray-600 mt-2">Gerencie o patrimônio de computadores da empresa</p>
        </div>

        <Tabs defaultValue="patrimonios" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="patrimonios" className="flex items-center gap-2">
              <Monitor className="h-4 w-4" />
              Patrimônios
            </TabsTrigger>
            <TabsTrigger value="modelos" className="flex items-center gap-2">
              <Computer className="h-4 w-4" />
              Modelos
            </TabsTrigger>
            <TabsTrigger value="gerencias" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              Gerências
            </TabsTrigger>
          </TabsList>

          <TabsContent value="patrimonios">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Patrimônios</CardTitle>
                    <CardDescription>
                      Lista completa dos computadores da empresa
                    </CardDescription>
                  </div>
                  <Button onClick={() => openDialog('patrimonio')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Patrimônio
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Patrimônio</TableHead>
                      <TableHead>Responsável</TableHead>
                      <TableHead>Gerência</TableHead>
                      <TableHead>Modelo</TableHead>
                      <TableHead>Processador</TableHead>
                      <TableHead>RAM</TableHead>
                      <TableHead>SO</TableHead>
                      <TableHead>SSD</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {patrimonios.map((patrimonio) => (
                      <TableRow key={patrimonio.id}>
                        <TableCell className="font-medium">{patrimonio.patrimonio}</TableCell>
                        <TableCell>{patrimonio.nome_servidor_responsavel}</TableCell>
                        <TableCell>{patrimonio.gerencia?.nome}</TableCell>
                        <TableCell>{patrimonio.modelo?.nome}</TableCell>
                        <TableCell>{patrimonio.modelo?.processador}</TableCell>
                        <TableCell>{patrimonio.modelo?.quantidade_ram} {patrimonio.modelo?.tipo_ram}</TableCell>
                        <TableCell>Windows {patrimonio.modelo?.sistema_operacional}</TableCell>
                        <TableCell>
                          <Badge variant={patrimonio.modelo?.ssd ? "default" : "secondary"}>
                            {patrimonio.modelo?.ssd ? "Sim" : "Não"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
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
                      Configurações de hardware disponíveis
                    </CardDescription>
                  </div>
                  <Button onClick={() => openDialog('modelo')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Modelo
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead> {/* <-- NOVO CABEÇALHO */}
                      <TableHead>Processador</TableHead>
                      <TableHead>Quantidade RAM</TableHead>
                      <TableHead>Tipo RAM</TableHead>
                      <TableHead>Sistema Operacional</TableHead>
                      <TableHead>SSD</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {modelos.map((modelo) => (
                      <TableRow key={modelo.id}>
                        <TableCell className="font-medium">{modelo.nome}</TableCell>
                        <TableCell>{modelo.processador}</TableCell>
                        <TableCell>{modelo.quantidade_ram}</TableCell>
                        <TableCell>{modelo.tipo_ram}</TableCell>
                        <TableCell>Windows {modelo.sistema_operacional}</TableCell>
                        <TableCell>
                          <Badge variant={modelo.ssd ? "default" : "secondary"}>
                            {modelo.ssd ? "Sim" : "Não"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
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
                      Setores e departamentos da empresa
                    </CardDescription>
                  </div>
                  <Button onClick={() => openDialog('gerencia')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Gerência
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {gerencias.map((gerencia) => (
                      <TableRow key={gerencia.id}>
                        <TableCell className="font-medium">{gerencia.nome}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
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
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

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
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Selecione um modelo" />
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

