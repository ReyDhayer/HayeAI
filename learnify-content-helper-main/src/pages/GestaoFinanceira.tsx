import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Table, Form, Modal, Card } from 'react-bootstrap';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { Pencil, Trash2 } from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import jsPDF from 'jspdf';
import 'bootstrap/dist/css/bootstrap.min.css';
import Header from '@/components/Header';

// Registrar componentes do Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

// Tipos de dados
interface Transacao {
  id: string;
  tipo: 'receita' | 'despesa';
  descricao: string;
  valor: number;
  categoria: string;
  data: Date;
}

const GestaoFinanceira: React.FC = () => {
  // Estados
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [showModalReceita, setShowModalReceita] = useState(false);
  const [showModalDespesa, setShowModalDespesa] = useState(false);
  const [showModalEdicao, setShowModalEdicao] = useState(false);
  const [filtroMes, setFiltroMes] = useState<number>(new Date().getMonth());
  const [filtroAno, setFiltroAno] = useState<number>(new Date().getFullYear());
  const [filtroCategoria, setFiltroCategoria] = useState<string>('todas');
  const [transacaoParaEditar, setTransacaoParaEditar] = useState<Transacao | null>(null);
  
  // Formulário
  const [novaTransacao, setNovaTransacao] = useState<Omit<Transacao, 'id'>>({ 
    tipo: 'receita',
    descricao: '',
    valor: 0,
    categoria: '',
    data: new Date()
  });

  // Categorias predefinidas
  const categoriasReceitas = ['Salário', 'Investimentos', 'Freelance', 'Outros'];
  const categoriasDespesas = ['Alimentação', 'Moradia', 'Transporte', 'Saúde', 'Educação', 'Lazer', 'Outros'];

  // Carregar dados do localStorage ao iniciar
  useEffect(() => {
    const dadosSalvos = localStorage.getItem('transacoes-financeiras');
    if (dadosSalvos) {
      try {
        const parsedData = JSON.parse(dadosSalvos, (key, value) => {
          if (key === 'data') return new Date(value);
          return value;
        });
        setTransacoes(parsedData);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      }
    }
  }, []);

  // Salvar dados no localStorage quando houver alterações
  useEffect(() => {
    if (transacoes.length > 0) {
      localStorage.setItem('transacoes-financeiras', JSON.stringify(transacoes));
    }
  }, [transacoes]);

  // Filtrar transações por mês, ano e categoria
  const transacoesFiltradas = transacoes.filter(transacao => {
    const mesTransacao = new Date(transacao.data).getMonth();
    const anoTransacao = new Date(transacao.data).getFullYear();
    const categoriaMatch = filtroCategoria === 'todas' || transacao.categoria === filtroCategoria;
    
    return mesTransacao === filtroMes && anoTransacao === filtroAno && categoriaMatch;
  });

  // Calcular totais
  const totalReceitas = transacoesFiltradas
    .filter(t => t.tipo === 'receita')
    .reduce((acc, curr) => acc + curr.valor, 0);

  const totalDespesas = transacoesFiltradas
    .filter(t => t.tipo === 'despesa')
    .reduce((acc, curr) => acc + curr.valor, 0);

  const saldo = totalReceitas - totalDespesas;

  // Adicionar nova transação
  const adicionarTransacao = (tipo: 'receita' | 'despesa') => {
    const novaTransacaoCompleta: Transacao = {
      ...novaTransacao,
      tipo,
      id: Date.now().toString(),
      data: new Date(novaTransacao.data) // Garantir que a data seja um objeto Date
    };

    setTransacoes(prevTransacoes => [...prevTransacoes, novaTransacaoCompleta]);
    setNovaTransacao({ 
      tipo: 'receita',
      descricao: '',
      valor: 0,
      categoria: '',
      data: new Date()
    });
    
    if (tipo === 'receita') {
      setShowModalReceita(false);
    } else {
      setShowModalDespesa(false);
    }
  };

  // Editar transação existente
  const editarTransacao = () => {
    if (!transacaoParaEditar) return;
    
    setTransacoes(prevTransacoes => 
      prevTransacoes.map(t => 
        t.id === transacaoParaEditar.id ? transacaoParaEditar : t
      )
    );
    
    setTransacaoParaEditar(null);
    setShowModalEdicao(false);
  };

  // Excluir transação
  const excluirTransacao = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta transação?')) {
      setTransacoes(prevTransacoes => prevTransacoes.filter(t => t.id !== id));
    }
  };

  // Abrir modal de edição
  const abrirModalEdicao = (transacao: Transacao) => {
    setTransacaoParaEditar({...transacao});
    setShowModalEdicao(true);
  };

  // Limpar dados do mês
  const limparDadosMes = () => {
    if (window.confirm('Tem certeza que deseja limpar todos os dados deste mês?')) {
      const transacoesRestantes = transacoes.filter(transacao => {
        const mesTransacao = new Date(transacao.data).getMonth();
        const anoTransacao = new Date(transacao.data).getFullYear();
        return mesTransacao !== filtroMes || anoTransacao !== filtroAno;
      });
      setTransacoes(transacoesRestantes);
    }
  };

  // Exportar para PDF
  const exportarPDF = () => {
    const doc = new jsPDF();
    
    // Título
    doc.setFontSize(18);
    doc.text('Relatório Financeiro', 105, 15, { align: 'center' });
    
    // Subtítulo com mês e ano
    const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    doc.setFontSize(14);
    doc.text(`${meses[filtroMes]} de ${filtroAno}`, 105, 25, { align: 'center' });
    
    // Resumo
    doc.setFontSize(12);
    doc.text(`Total de Receitas: R$ ${totalReceitas.toFixed(2)}`, 20, 40);
    doc.text(`Total de Despesas: R$ ${totalDespesas.toFixed(2)}`, 20, 50);
    doc.text(`Saldo: R$ ${saldo.toFixed(2)}`, 20, 60);
    
    // Tabela de transações
    doc.setFontSize(10);
    doc.text('Data', 20, 80);
    doc.text('Tipo', 50, 80);
    doc.text('Categoria', 80, 80);
    doc.text('Descrição', 120, 80);
    doc.text('Valor', 180, 80);
    
    let y = 90;
    transacoesFiltradas.forEach((transacao) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
        doc.text('Data', 20, y);
        doc.text('Tipo', 50, y);
        doc.text('Categoria', 80, y);
        doc.text('Descrição', 120, y);
        doc.text('Valor', 180, y);
        y += 10;
      }
      
      const data = new Date(transacao.data).toLocaleDateString();
      const tipo = transacao.tipo === 'receita' ? 'Receita' : 'Despesa';
      doc.text(data, 20, y);
      doc.text(tipo, 50, y);
      doc.text(transacao.categoria, 80, y);
      doc.text(transacao.descricao, 120, y);
      doc.text(`R$ ${transacao.valor.toFixed(2)}`, 180, y);
      
      y += 10;
    });
    
    // Salvar o PDF
    doc.save(`relatorio-financeiro-${meses[filtroMes]}-${filtroAno}.pdf`);
  };

  // Preparar dados para os gráficos
  const prepararDadosGraficoBarras = () => {
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const dadosReceitas = Array(12).fill(0);
    const dadosDespesas = Array(12).fill(0);
    
    // Filtrar apenas transações do ano atual
    const transacoesAnoAtual = transacoes.filter(t => new Date(t.data).getFullYear() === filtroAno);
    
    // Agrupar por mês
    transacoesAnoAtual.forEach(transacao => {
      const mes = new Date(transacao.data).getMonth();
      if (transacao.tipo === 'receita') {
        dadosReceitas[mes] += transacao.valor;
      } else {
        dadosDespesas[mes] += transacao.valor;
      }
    });
    
    return {
      labels: meses,
      datasets: [
        {
          label: 'Receitas',
          data: dadosReceitas,
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
        },
        {
          label: 'Despesas',
          data: dadosDespesas,
          backgroundColor: 'rgba(255, 99, 132, 0.6)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1,
        },
      ],
    };
  };

  const prepararDadosGraficoPie = () => {
    // Agrupar despesas por categoria
    const despesasPorCategoria: Record<string, number> = {};
    
    transacoesFiltradas
      .filter(t => t.tipo === 'despesa')
      .forEach(transacao => {
        if (!despesasPorCategoria[transacao.categoria]) {
          despesasPorCategoria[transacao.categoria] = 0;
        }
        despesasPorCategoria[transacao.categoria] += transacao.valor;
      });
    
    const categorias = Object.keys(despesasPorCategoria);
    const valores = Object.values(despesasPorCategoria);
    
    // Cores para o gráfico
    const cores = [
      'rgba(255, 99, 132, 0.6)',
      'rgba(54, 162, 235, 0.6)',
      'rgba(255, 206, 86, 0.6)',
      'rgba(75, 192, 192, 0.6)',
      'rgba(153, 102, 255, 0.6)',
      'rgba(255, 159, 64, 0.6)',
      'rgba(199, 199, 199, 0.6)',
    ];
    
    return {
      labels: categorias,
      datasets: [
        {
          data: valores,
          backgroundColor: cores.slice(0, categorias.length),
          borderColor: cores.map(cor => cor.replace('0.6', '1')),
          borderWidth: 1,
        },
      ],
    };
  };

  // Opções para os gráficos
  const opcoesGraficoBarras = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `Receitas e Despesas - ${filtroAno}`,
      },
    },
  };

  const opcoesGraficoPie = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right' as const,
      },
      title: {
        display: true,
        text: 'Despesas por Categoria',
      },
    },
  };

  // Renderizar blobs para decoração de fundo
  const renderBlobs = () => {
    return (
      <>
        <div className="fixed top-0 left-0 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="fixed bottom-0 right-0 w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
      </>
    );
  };

  // Gerar relatório mensal
  const gerarRelatorioMensal = () => {
    alert('Relatório mensal gerado com sucesso! Verifique a tabela abaixo para visualizar os dados.');
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {renderBlobs()}
      <div className="relative z-10">
        <Header />
        
        <Container className="py-5">
          <Row className="mb-4">
            <Col>
              <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4 animate-gradient">
                Gestão Financeira
              </h1>
              <div className="backdrop-blur-lg bg-white/30 rounded-xl p-4 border border-white/20 shadow-xl transition-all duration-300 mb-4">
                <p className="text-gray-700">
                  Bem-vindo ao seu painel de gestão financeira! Aqui você pode controlar suas receitas e despesas, 
                  visualizar relatórios e manter suas finanças organizadas.
                </p>
              </div>
            </Col>
          </Row>

          {/* Painel de Controle */}
          <Row className="mb-4">
            <Col>
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <Card.Header className="bg-primary text-white">
                  <h4 className="mb-0">Painel de Controle</h4>
                </Card.Header>
                <Card.Body>
                  <div className="d-flex flex-wrap gap-2 justify-content-between">
                    <Button variant="success" onClick={() => setShowModalReceita(true)} className="mb-2 mb-md-0">
                      <i className="bi bi-plus-circle me-2"></i> Adicionar Nova Receita
                    </Button>
                    <Button variant="danger" onClick={() => setShowModalDespesa(true)} className="mb-2 mb-md-0">
                      <i className="bi bi-dash-circle me-2"></i> Adicionar Nova Despesa
                    </Button>
                    <Button variant="info" onClick={() => window.location.reload()} className="mb-2 mb-md-0">
                      <i className="bi bi-arrow-clockwise me-2"></i> Atualizar Painel
                    </Button>
                    <Button variant="secondary" onClick={gerarRelatorioMensal} className="mb-2 mb-md-0">
                      <i className="bi bi-file-earmark-text me-2"></i> Gerar Relatório Mensal
                    </Button>
                    <Button variant="primary" onClick={exportarPDF} className="mb-2 mb-md-0">
                      <i className="bi bi-file-earmark-pdf me-2"></i> Exportar para PDF
                    </Button>
                    <Button variant="outline-danger" onClick={limparDadosMes} className="mb-2 mb-md-0">
                      <i className="bi bi-trash me-2"></i> Limpar Dados do Mês
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Resumo Financeiro */}
          <Row className="mb-4">
            <Col md={4} className="mb-3 mb-md-0">
              <Card className="h-100 shadow border-0 bg-white/80 backdrop-blur-sm">
                <Card.Body className="d-flex flex-column align-items-center justify-content-center">
                  <h5 className="card-title text-success">Total de Receitas</h5>
                  <h2 className="mb-0">R$ {totalReceitas.toFixed(2)}</h2>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} className="mb-3 mb-md-0">
              <Card className="h-100 shadow border-0 bg-white/80 backdrop-blur-sm">
                <Card.Body className="d-flex flex-column align-items-center justify-content-center">
                  <h5 className="card-title text-danger">Total de Despesas</h5>
                  <h2 className="mb-0">R$ {totalDespesas.toFixed(2)}</h2>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className={`h-100 shadow border-0 bg-white/80 backdrop-blur-sm ${saldo < 0 ? 'border-danger' : 'border-success'}`}>
                <Card.Body className="d-flex flex-column align-items-center justify-content-center">
                  <h5 className={`card-title ${saldo < 0 ? 'text-danger' : 'text-success'}`}>Saldo</h5>
                  <h2 className="mb-0">R$ {saldo.toFixed(2)}</h2>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Filtros */}
          <Row className="mb-4">
            <Col>
              <Card className="shadow-sm border-0 bg-white/80 backdrop-blur-sm">
                <Card.Body>
                  <Row>
                    <Col md={4} className="mb-3 mb-md-0">
                      <Form.Group>
                        <Form.Label>Mês</Form.Label>
                        <Form.Select 
                          value={filtroMes} 
                          onChange={(e) => setFiltroMes(Number(e.target.value))}
                        >
                          <option value={0}>Janeiro</option>
                          <option value={1}>Fevereiro</option>
                          <option value={2}>Março</option>
                          <option value={3}>Abril</option>
                          <option value={4}>Maio</option>
                          <option value={5}>Junho</option>
                          <option value={6}>Julho</option>
                          <option value={7}>Agosto</option>
                          <option value={8}>Setembro</option>
                          <option value={9}>Outubro</option>
                          <option value={10}>Novembro</option>
                          <option value={11}>Dezembro</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={4} className="mb-3 mb-md-0">
                      <Form.Group>
                        <Form.Label>Ano</Form.Label>
                        <Form.Select 
                          value={filtroAno} 
                          onChange={(e) => setFiltroAno(Number(e.target.value))}
                        >
                          {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(ano => (
                            <option key={ano} value={ano}>{ano}</option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group>
                        <Form.Label>Categoria</Form.Label>
                        <Form.Select 
                          value={filtroCategoria} 
                          onChange={(e) => setFiltroCategoria(e.target.value)}
                        >
                          <option value="todas">Todas</option>
                          {[...new Set([...categoriasReceitas, ...categoriasDespesas])].map(categoria => (
                            <option key={categoria} value={categoria}>{categoria}</option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Gráficos */}
          <Row className="mb-4">
            <Col lg={8} className="mb-4 mb-lg-0">
              <Card className="shadow h-100 border-0 bg-white/80 backdrop-blur-sm">
                <Card.Body>
                  <Bar data={prepararDadosGraficoBarras()} options={opcoesGraficoBarras} />
                </Card.Body>
              </Card>
            </Col>
            <Col lg={4}>
              <Card className="shadow h-100 border-0 bg-white/80 backdrop-blur-sm">
                <Card.Body>
                  {transacoesFiltradas.filter(t => t.tipo === 'despesa').length > 0 ? (
                    <Pie data={prepararDadosGraficoPie()} options={opcoesGraficoPie} />
                  ) : (
                    <div className="text-center py-5">
                      <p>Não há despesas registradas neste período</p>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Tabela de Transações */}
          <Row>
            <Col>
              <Card className="shadow border-0 bg-white/80 backdrop-blur-sm">
                <Card.Header className="bg-primary text-white">
                  <h4 className="mb-0">Transações</h4>
                </Card.Header>
                <Card.Body>
                  {transacoesFiltradas.length > 0 ? (
                    <div className="table-responsive">
                      <Table striped hover>
                        <thead>
                          <tr>
                            <th>Data</th>
                            <th>Tipo</th>
                            <th>Categoria</th>
                            <th>Descrição</th>
                            <th className="text-end">Valor</th>
                            <th className="text-center">Ações</th>
                          </tr>
                        </thead>
                        <tbody>
                          {transacoesFiltradas.map(transacao => (
                            <tr key={transacao.id}>
                              <td>{new Date(transacao.data).toLocaleDateString()}</td>
                              <td>
                                <span className={`badge ${transacao.tipo === 'receita' ? 'bg-success' : 'bg-danger'}`}>
                                  {transacao.tipo === 'receita' ? 'Receita' : 'Despesa'}
                                </span>
                              </td>
                              <td>{transacao.categoria}</td>
                              <td>{transacao.descricao}</td>
                              <td className="text-end">R$ {transacao.valor.toFixed(2)}</td>
                              <td className="text-center">
                                <Button variant="outline-primary" size="sm" className="me-2" onClick={() => abrirModalEdicao(transacao)}>
                                  <Pencil size={16} /> Editar
                                </Button>
                                <Button variant="outline-danger" size="sm" onClick={() => excluirTransacao(transacao.id)}>
                                  <Trash2 size={16} /> Excluir
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p>Não há transações registradas para este período</p>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Modal para adicionar receita */}
      <Modal show={showModalReceita} onHide={() => setShowModalReceita(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Adicionar Nova Receita</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Descrição</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="Ex: Salário, Freelance, etc" 
                value={novaTransacao.descricao}
                onChange={(e) => setNovaTransacao({...novaTransacao, descricao: e.target.value})}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Valor (R$)</Form.Label>
              <Form.Control 
                type="number" 
                min="0.01" 
                step="0.01" 
                placeholder="0.00" 
                value={novaTransacao.valor || ''}
                onChange={(e) => setNovaTransacao({...novaTransacao, valor: parseFloat(e.target.value) || 0})}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Categoria</Form.Label>
              <Form.Select 
                value={novaTransacao.categoria}
                onChange={(e) => setNovaTransacao({...novaTransacao, categoria: e.target.value})}
                required
              >
                <option value="">Selecione uma categoria</option>
                {categoriasReceitas.map(categoria => (
                  <option key={categoria} value={categoria}>{categoria}</option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Data</Form.Label>
              <Form.Control 
                type="date" 
                value={novaTransacao.data instanceof Date ? novaTransacao.data.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}
                onChange={(e) => setNovaTransacao({...novaTransacao, data: new Date(e.target.value)})}
                required
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModalReceita(false)}>
            Cancelar
          </Button>
          <Button 
            variant="success" 
            onClick={() => adicionarTransacao('receita')}
            disabled={!novaTransacao.descricao || !novaTransacao.valor || !novaTransacao.categoria}
          >
            Adicionar Receita
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal para adicionar despesa */}
      <Modal show={showModalDespesa} onHide={() => setShowModalDespesa(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Adicionar Nova Despesa</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Descrição</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="Ex: Aluguel, Mercado, etc" 
                value={novaTransacao.descricao}
                onChange={(e) => setNovaTransacao({...novaTransacao, descricao: e.target.value})}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Valor (R$)</Form.Label>
              <Form.Control 
                type="number" 
                min="0.01" 
                step="0.01" 
                placeholder="0.00" 
                value={novaTransacao.valor || ''}
                onChange={(e) => setNovaTransacao({...novaTransacao, valor: parseFloat(e.target.value) || 0})}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Categoria</Form.Label>
              <Form.Select 
                value={novaTransacao.categoria}
                onChange={(e) => setNovaTransacao({...novaTransacao, categoria: e.target.value})}
                required
              >
                <option value="">Selecione uma categoria</option>
                {categoriasDespesas.map(categoria => (
                  <option key={categoria} value={categoria}>{categoria}</option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Data</Form.Label>
              <Form.Control 
                type="date" 
                value={novaTransacao.data instanceof Date ? novaTransacao.data.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}
                onChange={(e) => setNovaTransacao({...novaTransacao, data: new Date(e.target.value)})}
                required
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModalDespesa(false)}>
            Cancelar
          </Button>
          <Button 
            variant="danger" 
            onClick={() => adicionarTransacao('despesa')}
            disabled={!novaTransacao.descricao || !novaTransacao.valor || !novaTransacao.categoria}
          >
            Adicionar Despesa
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal para editar transação */}
      <Modal show={showModalEdicao} onHide={() => setShowModalEdicao(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            Editar {transacaoParaEditar?.tipo === 'receita' ? 'Receita' : 'Despesa'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {transacaoParaEditar && (
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Descrição</Form.Label>
                <Form.Control 
                  type="text" 
                  placeholder="Descrição da transação" 
                  value={transacaoParaEditar.descricao}
                  onChange={(e) => setTransacaoParaEditar({...transacaoParaEditar, descricao: e.target.value})}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Valor (R$)</Form.Label>
                <Form.Control 
                  type="number" 
                  min="0.01" 
                  step="0.01" 
                  placeholder="0.00" 
                  value={transacaoParaEditar.valor || ''}
                  onChange={(e) => setTransacaoParaEditar({...transacaoParaEditar, valor: parseFloat(e.target.value) || 0})}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Categoria</Form.Label>
                <Form.Select 
                  value={transacaoParaEditar.categoria}
                  onChange={(e) => setTransacaoParaEditar({...transacaoParaEditar, categoria: e.target.value})}
                  required
                >
                  <option value="">Selecione uma categoria</option>
                  {(transacaoParaEditar.tipo === 'receita' ? categoriasReceitas : categoriasDespesas).map(categoria => (
                    <option key={categoria} value={categoria}>{categoria}</option>
                  ))}
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Data</Form.Label>
                <Form.Control 
                  type="date" 
                  value={transacaoParaEditar.data instanceof Date ? 
                    transacaoParaEditar.data.toISOString().split('T')[0] : 
                    new Date(transacaoParaEditar.data).toISOString().split('T')[0]}
                  onChange={(e) => setTransacaoParaEditar({...transacaoParaEditar, data: new Date(e.target.value)})}
                  required
                />
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModalEdicao(false)}>
            Cancelar
          </Button>
          <Button 
            variant={transacaoParaEditar?.tipo === 'receita' ? 'success' : 'danger'} 
            onClick={editarTransacao}
            disabled={!transacaoParaEditar?.descricao || !transacaoParaEditar?.valor || !transacaoParaEditar?.categoria}
          >
            Salvar Alterações
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default GestaoFinanceira;