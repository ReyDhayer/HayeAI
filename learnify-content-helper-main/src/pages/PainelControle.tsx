import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import Header from '@/components/Header';
import { useMaintenanceContext } from '@/lib/context/MaintenanceContext';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import UserEditDialog from '@/components/UserEditDialog';
import {
  BarChart3,
  Settings,
  Tag,
  Users,
  Bell,
  Calendar,
  CreditCard,
  Layers,
  LifeBuoy,
  LogOut,
  Mail,
  MessageSquare,
  Plus,
  PlusCircle,
  UserPlus,
  Trash2,
  Save,
  Edit,
  Search,
  ChevronRight,
  ChevronDown,
  Sparkles,
  Zap,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

// Interfaces
interface Coupon {
  id: string;
  code: string;
  discount: number;
  type: 'percentage' | 'fixed';
  validUntil: string;
  usageLimit: number;
  usageCount: number;
  isActive: boolean;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
  joinDate: string;
}

interface SystemSetting {
  id: string;
  name: string;
  value: string | boolean;
  category: string;
  description: string;
}

const PainelControle: React.FC = () => {
  const { userRole, setMaintenanceMode, setMaintenanceMessage, logout } = useMaintenanceContext();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  // States
  const [activeTab, setActiveTab] = useState('dashboard');
  const [coupons, setCoupons] = useState<Coupon[]>([
    {
      id: '1',
      code: 'WELCOME20',
      discount: 20,
      type: 'percentage',
      validUntil: '2024-12-31',
      usageLimit: 100,
      usageCount: 45,
      isActive: true
    },
    {
      id: '2',
      code: 'SUMMER10',
      discount: 10,
      type: 'percentage',
      validUntil: '2024-09-30',
      usageLimit: 50,
      usageCount: 12,
      isActive: true
    },
    {
      id: '3',
      code: 'SPECIAL50',
      discount: 50,
      type: 'fixed',
      validUntil: '2024-08-15',
      usageLimit: 20,
      usageCount: 5,
      isActive: false
    }
  ]);
  
  const [users, setUsers] = useState<User[]>(() => {
    try {
      const stored = localStorage.getItem('users');
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Erro ao carregar usuários do localStorage:', e);
    }
    return [
      {
        id: '1',
        name: 'João Silva',
        email: 'joao@exemplo.com',
        role: 'admin',
        status: 'active',
        joinDate: '2023-05-12'
      },
      {
        id: '2',
        name: 'Maria Oliveira',
        email: 'maria@exemplo.com',
        role: 'instructor',
        status: 'active',
        joinDate: '2023-06-20'
      },
      {
        id: '3',
        name: 'Carlos Santos',
        email: 'carlos@exemplo.com',
        role: 'student',
        status: 'inactive',
        joinDate: '2023-07-15'
      }
    ];
  });

  useEffect(() => {
    // Sempre sincroniza localStorage quando users muda
    try {
      localStorage.setItem('users', JSON.stringify(users));
    } catch (e) {
      console.error('Erro ao sincronizar usuários no localStorage:', e);
    }
  }, [users]);

  const [settings, setSettings] = useState<SystemSetting[]>([
    {
      id: '1',
      name: 'enableRegistration',
      value: true,
      category: 'users',
      description: 'Permitir novos registros de usuários'
    },
    {
      id: '2',
      name: 'maintenanceMode',
      value: false,
      category: 'system',
      description: 'Ativar modo de manutenção'
    },
    {
      id: '3',
      name: 'emailNotifications',
      value: true,
      category: 'notifications',
      description: 'Enviar notificações por e-mail'
    }
  ]);
  
  // New coupon form state
  const [newCoupon, setNewCoupon] = useState<Omit<Coupon, 'id' | 'usageCount'>>({
    code: '',
    discount: 0,
    type: 'percentage',
    validUntil: '',
    usageLimit: 0,
    isActive: true
  });
  
  // Search states
  const [couponSearch, setCouponSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');

  // Funções de gerenciamento de usuários
  const handleCreateUser = () => {
    setSelectedUser(null);
    setDialogMode('create');
    setShowUserDialog(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setDialogMode('edit');
    setShowUserDialog(true);
  };

  const handleDeleteUser = (userId: string) => {
    const updatedUsers = users.filter(user => user.id !== userId);
    setUsers(updatedUsers);
    try {
      localStorage.setItem('users', JSON.stringify(updatedUsers));
    } catch (e) {
      toast.error('Erro ao remover usuário do localStorage.');
      console.error(e);
    }
    toast.success('Usuário removido com sucesso!');
  };

  const handleSaveUser = (userData: Partial<User>) => {
    if (dialogMode === 'create') {
      // Validação de e-mail único
      if (users.some(u => u.email === userData.email)) {
        toast.error('Já existe um usuário com este e-mail.');
        return;
      }
      const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        name: userData.name || '',
        email: userData.email || '',
        role: userData.role || 'student',
        status: userData.status || 'active',
        joinDate: new Date().toISOString()
      };
      const updatedUsers = [...users, newUser];
      setUsers(updatedUsers);
      try {
        localStorage.setItem('users', JSON.stringify(updatedUsers));
      } catch (e) {
        toast.error('Erro ao salvar usuário no localStorage.');
        console.error(e);
      }
      toast.success('Usuário criado com sucesso!');
    } else {
      // Validação de e-mail único ao editar (exceto o próprio)
      if (users.some(u => u.email === userData.email && u.id !== selectedUser?.id)) {
        toast.error('Já existe um usuário com este e-mail.');
        return;
      }
      const updatedUsers = users.map(user => 
        user.id === selectedUser?.id ? { ...user, ...userData } : user
      );
      setUsers(updatedUsers);
      try {
        localStorage.setItem('users', JSON.stringify(updatedUsers));
      } catch (e) {
        toast.error('Erro ao atualizar usuário no localStorage.');
        console.error(e);
      }
      toast.success('Usuário atualizado com sucesso!');
    }
    setShowUserDialog(false);
  };

  const handleToggleUserStatus = (userId: string) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, status: user.status === 'active' ? 'inactive' : 'active' } : user
    ));
    toast.success('Status do usuário atualizado!');
  };

  // Filtrar usuários
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    user.email.toLowerCase().includes(userSearch.toLowerCase())
  );
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: 'spring', stiffness: 100 }
    }
  };
  
  const fadeVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } }
  };
  
  // Handlers
  const handleAddCoupon = () => {
    if (!newCoupon.code || newCoupon.discount <= 0 || !newCoupon.validUntil) {
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }
    
    const coupon: Coupon = {
      ...newCoupon,
      id: Date.now().toString(),
      usageCount: 0
    };
    
    setCoupons([...coupons, coupon]);
    setNewCoupon({
      code: '',
      discount: 0,
      type: 'percentage',
      validUntil: '',
      usageLimit: 0,
      isActive: true
    });
    
    toast.success('Cupom adicionado com sucesso!');
  };
  
  const handleDeleteCoupon = (id: string) => {
    setCoupons(coupons.filter(coupon => coupon.id !== id));
    toast.success('Cupom removido com sucesso!');
  };
  
  const handleToggleCouponStatus = (id: string) => {
    setCoupons(coupons.map(coupon => 
      coupon.id === id ? { ...coupon, isActive: !coupon.isActive } : coupon
    ));
    toast.success('Status do cupom atualizado!');
  };
  
  const handleToggleSetting = (id: string) => {
    const setting = settings.find(s => s.id === id);
    if (setting?.name === 'maintenanceMode') {
      const newValue = !setting.value;
      setMaintenanceMode(newValue);
      if (newValue) {
        const message = prompt('Digite a mensagem de manutenção:') || 'Sistema em manutenção';
        setMaintenanceMessage(message);
      }
    }
    setSettings(settings.map(setting => 
      setting.id === id ? { ...setting, value: !setting.value } : setting
    ));
    toast.success('Configuração atualizada!');
  };
  
  // Filtered data
  const filteredCoupons = coupons.filter(coupon => 
    coupon.code.toLowerCase().includes(couponSearch.toLowerCase())
  );
  
  // Stats for dashboard
  const stats = [
    { title: 'Usuários Ativos', value: users.filter(u => u.status === 'active').length, icon: <Users className="h-5 w-5 text-blue-500" /> },
    { title: 'Cupons Ativos', value: coupons.filter(c => c.isActive).length, icon: <Tag className="h-5 w-5 text-green-500" /> },
    { title: 'Configurações', value: settings.length, icon: <Settings className="h-5 w-5 text-purple-500" /> },
    { title: 'Usos de Cupons', value: coupons.reduce((acc, curr) => acc + curr.usageCount, 0), icon: <BarChart3 className="h-5 w-5 text-orange-500" /> }
  ];
  
  return (
    <div className="min-h-screen bg-background">
      <UserEditDialog
        user={selectedUser}
        open={showUserDialog}
        onOpenChange={setShowUserDialog}
        onSave={handleSaveUser}
        mode={dialogMode}
      />
      <Header />
      <div className="flex">
        {/* Sidebar */}
        <motion.div 
          className="hidden md:block w-64 bg-card border-r h-[calc(100vh-64px)] p-4"
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="space-y-1">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Settings className="mr-2 h-5 w-5" /> Painel de Controle
            </h2>
            <Button 
              variant={activeTab === 'dashboard' ? 'default' : 'ghost'} 
              className="w-full justify-start" 
              onClick={() => setActiveTab('dashboard')}
            >
              <BarChart3 className="mr-2 h-5 w-5" />
              Dashboard
            </Button>
            {(userRole === 'admin' || userRole === 'gerente' || userRole === 'operador') && (
              <Button 
                variant={activeTab === 'coupons' ? 'default' : 'ghost'} 
                className="w-full justify-start" 
                onClick={() => setActiveTab('coupons')}
              >
                <Tag className="mr-2 h-5 w-5" />
                Cupons
              </Button>
            )}
            {(userRole === 'admin' || userRole === 'gerente') && (
              <Button 
                variant={activeTab === 'users' ? 'default' : 'ghost'} 
                className="w-full justify-start" 
                onClick={() => setActiveTab('users')}
              >
                <Users className="mr-2 h-5 w-5" />
                Usuários
              </Button>
            )}
            {userRole === 'admin' && (
              <Button 
                variant={activeTab === 'settings' ? 'default' : 'ghost'} 
                className="w-full justify-start" 
                onClick={() => setActiveTab('settings')}
              >
                <Settings className="mr-2 h-5 w-5" />
                Configurações
              </Button>
            )}
          </div>
          
          <Separator className="my-4" />
          
          <div className="space-y-1">
            <Button variant="ghost" className="w-full justify-start">
              <Bell className="mr-2 h-5 w-5" />
              Notificações
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <LifeBuoy className="mr-2 h-5 w-5" />
              Suporte
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-100"
              onClick={logout}
            >
              <LogOut className="mr-2 h-5 w-5" />
              Sair
            </Button>
          </div>
        </motion.div>
        
        {/* Main content */}
        <div className="flex-1 p-6 overflow-auto">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial="hidden"
                animate="visible"
                exit="hidden"
                variants={containerVariants}
                className="space-y-6"
              >
                <motion.div variants={itemVariants}>
                  <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {stats.map((stat, index) => (
                      <motion.div
                        key={index}
                        variants={itemVariants}
                        whileHover={{ scale: 1.03 }}
                        className="bg-card rounded-lg shadow-sm p-4 border"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">{stat.title}</p>
                            <h3 className="text-2xl font-bold">{stat.value}</h3>
                          </div>
                          <div className="bg-primary/10 p-2 rounded-full">
                            {stat.icon}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <motion.div variants={itemVariants} className="bg-card rounded-lg shadow-sm p-6 border">
                      <h3 className="text-xl font-semibold mb-4">Atividade Recente</h3>
                      <div className="space-y-4">
                        {[1, 2, 3, 4].map((_, index) => (
                          <div key={index} className="flex items-center gap-3 p-2 hover:bg-muted rounded-md transition-colors">
                            <div className={`p-2 rounded-full ${
                              index % 3 === 0 ? 'bg-blue-100 text-blue-600' : 
                              index % 3 === 1 ? 'bg-green-100 text-green-600' : 
                              'bg-amber-100 text-amber-600'
                            }`}>
                              {index % 3 === 0 ? <UserPlus size={16} /> : 
                               index % 3 === 1 ? <Tag size={16} /> : 
                               <Settings size={16} />}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium">
                                {index % 3 === 0 ? 'Novo usuário registrado' : 
                                 index % 3 === 1 ? 'Cupom utilizado' : 
                                 'Configuração alterada'}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {index % 3 === 0 ? 'Maria Oliveira' : 
                                 index % 3 === 1 ? 'WELCOME20' : 
                                 'Modo de manutenção'}
                              </p>
                            </div>
                            <p className="text-xs text-muted-foreground whitespace-nowrap">
                              {index === 0 ? 'Agora mesmo' : 
                               index === 1 ? '5 min atrás' : 
                               index === 2 ? '1 hora atrás' : 
                               '1 dia atrás'}
                            </p>
                          </div>
                        ))}
                      </div>
                      <Button variant="ghost" className="w-full mt-4">
                        Ver todas as atividades
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </motion.div>
                    
                    <motion.div variants={itemVariants} className="bg-card rounded-lg shadow-sm p-6 border">
                      <h3 className="text-xl font-semibold mb-4">Cupons Populares</h3>
                      <div className="space-y-4">
                        {coupons.slice(0, 3).map((coupon, index) => (
                          <div key={index} className="flex items-center justify-between p-2 hover:bg-muted rounded-md transition-colors">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-full ${coupon.isActive ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}>
                                <Tag size={16} />
                              </div>
                              <div>
                                <p className="text-sm font-medium">{coupon.code}</p>
                                <p className="text-xs text-muted-foreground">
                                  {coupon.type === 'percentage' ? `${coupon.discount}% de desconto` : `R$${coupon.discount} de desconto`}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium">{coupon.usageCount} usos</p>
                              <p className="text-xs text-muted-foreground">
                                Válido até {new Date(coupon.validUntil).toLocaleDateString('pt-BR')}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <Button variant="ghost" className="w-full mt-4" onClick={() => setActiveTab('coupons')}>
                        Gerenciar cupons
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </motion.div>
                  </div>
                </motion.div>
              </motion.div>
            )}
            
            {activeTab === 'coupons' && (
              <motion.div
                key="coupons"
                initial="hidden"
                animate="visible"
                exit="hidden"
                variants={containerVariants}
                className="space-y-6"
              >
                <motion.div variants={itemVariants}>
                  <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold">Gerenciar Cupons</h1>
                    <Button onClick={() => document.getElementById('addCouponForm')?.scrollIntoView({ behavior: 'smooth' })}>
                      <Plus className="mr-2 h-4 w-4" />
                      Novo Cupom
                    </Button>
                  </div>
                  
                  <Card className="mb-8">
                    <CardHeader>
                      <CardTitle>Cupons Ativos</CardTitle>
                      <CardDescription>Gerencie todos os cupons de desconto disponíveis</CardDescription>
                      <div className="mt-2">
                        <div className="relative">
                          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Buscar cupons..."
                            className="pl-8"
                            value={couponSearch}
                            onChange={(e) => setCouponSearch(e.target.value)}
                          />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="rounded-md border">
                        <div className="grid grid-cols-6 bg-muted p-3 text-sm font-medium">
                          <div className="col-span-2">Código</div>
                          <div>Desconto</div>
                          <div>Validade</div>
                          <div>Usos</div>
                          <div className="text-right">Ações</div>
                        </div>
                        <div className="divide-y">
                          {filteredCoupons.length > 0 ? (
                            filteredCoupons.map((coupon) => (
                              <motion.div 
                                key={coupon.id} 
                                className="grid grid-cols-6 p-3 text-sm items-center"
                                variants={itemVariants}
                                whileHover={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
                              >
                                <div className="col-span-2 font-medium flex items-center gap-2">
                                  {coupon.code}
                                  {coupon.isActive ? (
                                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                      Ativo
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                                      Inativo
                                    </Badge>
                                  )}
                                </div>
                                <div>
                                  {coupon.type === 'percentage' ? `${coupon.discount}%` : `R$${coupon.discount.toFixed(2)}`}
                                </div>
                                <div>
                                  {new Date(coupon.validUntil).toLocaleDateString('pt-BR')}
                                </div>
                                <div>
                                  {coupon.usageCount}/{coupon.usageLimit || '∞'}
                                </div>
                                <div className="flex justify-end gap-2">
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    onClick={() => handleToggleCouponStatus(coupon.id)}
                                    title={coupon.isActive ? "Desativar cupom" : "Ativar cupom"}
                                  >
                                    {coupon.isActive ? 
                                      <AlertCircle className="h-4 w-4 text-amber-500" /> : 
                                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                                    }
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    onClick={() => handleDeleteCoupon(coupon.id)}
                                    title="Excluir cupom"
                                  >
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                  </Button>
                                </div>
                              </motion.div>
                            ))
                          ) : (
                            <div className="p-4 text-center text-muted-foreground">
                              Nenhum cupom encontrado
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card id="addCouponForm">
                    <CardHeader>
                      <CardTitle>Adicionar Novo Cupom</CardTitle>
                      <CardDescription>Crie um novo cupom de desconto para seus clientes</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="grid gap-2">
                          <Label htmlFor="couponCode">Código do Cupom</Label>
                          <Input 
                            id="couponCode" 
                            placeholder="Ex: WELCOME20" 
                            value={newCoupon.code}
                            onChange={(e) => setNewCoupon({...newCoupon, code: e.target.value.toUpperCase()})}
                          />
                        </div>
                        
                        <div className="grid gap-2">
                          <Label htmlFor="discountType">Tipo de Desconto</Label>
                          <Select 
                            value={newCoupon.type} 
                            onValueChange={(value: 'percentage' | 'fixed') => 
                              setNewCoupon({...newCoupon, type: value})
                            }
                          >
                            <SelectTrigger id="discountType">
                              <SelectValue placeholder="Selecione o tipo" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="percentage">Porcentagem (%)</SelectItem>
                              <SelectItem value="fixed">Valor Fixo (R$)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="grid gap-2">
                          <Label htmlFor="discountValue">Valor do Desconto</Label>
                          <Input 
                            id="discountValue" 
                            type="number" 
                            placeholder={newCoupon.type === 'percentage' ? "Ex: 20" : "Ex: 50.00"}
                            value={newCoupon.discount || ''}
                            onChange={(e) => setNewCoupon({...newCoupon, discount: parseFloat(e.target.value)})}
                          />
                        </div>
                        
                        <div className="grid gap-2">
                          <Label htmlFor="validUntil">Válido Até</Label>
                          <Input 
                            id="validUntil" 
                            type="date" 
                            value={newCoupon.validUntil}
                            onChange={(e) => setNewCoupon({...newCoupon, validUntil: e.target.value})}
                          />
                        </div>
                        
                        <div className="grid gap-2">
                          <Label htmlFor="usageLimit">Limite de Usos</Label>
                          <Input 
                            id="usageLimit" 
                            type="number" 
                            placeholder="Deixe 0 para ilimitado"
                            value={newCoupon.usageLimit || ''}
                            onChange={(e) => setNewCoupon({...newCoupon, usageLimit: parseInt(e.target.value)})}
                          />
                        </div>
                        
                        <div className="grid gap-2 items-center">
                          <Label htmlFor="isActive">Status</Label>
                          <div className="flex items-center space-x-2">
                            <Switch 
                              id="isActive" 
                              checked={newCoupon.isActive}
                              onCheckedChange={(checked) => setNewCoupon({...newCoupon, isActive: checked})}
                            />
                            <Label htmlFor="isActive">{newCoupon.isActive ? 'Ativo' : 'Inativo'}</Label>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button variant="outline" onClick={() => setNewCoupon({
                        code: '',
                        discount: 0,
                        type: 'percentage',
                        validUntil: '',
                        usageLimit: 0,
                        isActive: true
                      })}>
                        Limpar
                      </Button>
                      <Button onClick={handleAddCoupon}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Adicionar Cupom
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              </motion.div>
            )}
            
            {activeTab === 'users' && (
              <motion.div
                key="users"
                initial="hidden"
                animate="visible"
                exit="hidden"
                variants={containerVariants}
                className="space-y-6"
              >
                <motion.div variants={itemVariants}>
                  <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold">Gerenciar Usuários</h1>
                    <Button onClick={handleCreateUser}>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Novo Usuário
                    </Button>
                  </div>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Usuários do Sistema</CardTitle>
                      <CardDescription>Visualize e gerencie todos os usuários cadastrados</CardDescription>
                      <div className="mt-2">
                        <div className="relative">
                          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Buscar usuários por nome ou email..."
                            className="pl-8"
                            value={userSearch}
                            onChange={(e) => setUserSearch(e.target.value)}
                          />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="rounded-md border">
                        <div className="grid grid-cols-6 bg-muted p-3 text-sm font-medium">
                          <div className="col-span-2">Usuário</div>
                          <div>Função</div>
                          <div>Status</div>
                          <div>Data de Cadastro</div>
                          <div className="text-right">Ações</div>
                        </div>
                        <div className="divide-y">
                          {filteredUsers.map((user) => (
                            <motion.div 
                              key={user.id} 
                              className="grid grid-cols-6 p-3 text-sm items-center"
                              variants={itemVariants}
                              whileHover={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
                            >
                              <div className="col-span-2 font-medium">
                                <div>{user.name}</div>
                                <div className="text-muted-foreground text-xs">{user.email}</div>
                              </div>
                              <div>
                                <Badge variant="outline" className={
                                  user.role === 'admin' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                  user.role === 'instructor' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                  'bg-gray-50 text-gray-700 border-gray-200'
                                }>
                                  {user.role === 'admin' ? 'Administrador' : 
                                   user.role === 'instructor' ? 'Instrutor' : 'Estudante'}
                                </Badge>
                              </div>
                              <div>
                                <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                                  {user.status === 'active' ? 'Ativo' : 'Inativo'}
                                </Badge>
                              </div>
                              <div>
                                {new Date(user.joinDate).toLocaleDateString('pt-BR')}
                              </div>
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleEditUser(user)}
                                  title="Editar usuário"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteUser(user.id)}
                                  title="Excluir usuário"
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            )}
            
            {activeTab === 'settings' && (
              <motion.div
                key="settings"
                initial="hidden"
                animate="visible"
                exit="hidden"
                variants={containerVariants}
                className="space-y-6"
              >
                <motion.div variants={itemVariants}>
                  <h1 className="text-3xl font-bold mb-6">Configurações do Sistema</h1>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Configurações Gerais</CardTitle>
                        <CardDescription>Gerencie as configurações básicas do sistema</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {settings.filter(s => s.category === 'system').map((setting) => (
                          <motion.div 
                            key={setting.id} 
                            className="flex items-center justify-between"
                            variants={itemVariants}
                          >
                            <div>
                              <Label htmlFor={setting.name} className="text-base font-medium">
                                {setting.description}
                              </Label>
                              <p className="text-sm text-muted-foreground">
                                {setting.name === 'maintenanceMode' ? 
                                  'Quando ativado, o site exibirá uma mensagem de manutenção para todos os usuários' : 
                                  'Configuração do sistema'}
                              </p>
                            </div>
                            <Switch 
                              id={setting.name} 
                              checked={setting.value === true}
                              onCheckedChange={() => handleToggleSetting(setting.id)}
                            />
                          </motion.div>
                        ))}
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Configurações de Usuários</CardTitle>
                        <CardDescription>Gerencie as configurações relacionadas aos usuários</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {settings.filter(s => s.category === 'users').map((setting) => (
                          <motion.div 
                            key={setting.id} 
                            className="flex items-center justify-between"
                            variants={itemVariants}
                          >
                            <div>
                              <Label htmlFor={setting.name} className="text-base font-medium">
                                {setting.description}
                              </Label>
                              <p className="text-sm text-muted-foreground">
                                {setting.name === 'enableRegistration' ? 
                                  'Quando desativado, novos usuários não poderão se registrar no sistema' : 
                                  'Configuração de usuários'}
                              </p>
                            </div>
                            <Switch 
                              id={setting.name} 
                              checked={setting.value === true}
                              onCheckedChange={() => handleToggleSetting(setting.id)}
                            />
                          </motion.div>
                        ))}
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Configurações de Notificações</CardTitle>
                        <CardDescription>Gerencie como as notificações são enviadas</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {settings.filter(s => s.category === 'notifications').map((setting) => (
                          <motion.div 
                            key={setting.id} 
                            className="flex items-center justify-between"
                            variants={itemVariants}
                          >
                            <div>
                              <Label htmlFor={setting.name} className="text-base font-medium">
                                {setting.description}
                              </Label>
                              <p className="text-sm text-muted-foreground">
                                {setting.name === 'emailNotifications' ? 
                                  'Enviar notificações por e-mail para os usuários' : 
                                  'Configuração de notificações'}
                              </p>
                            </div>
                            <Switch 
                              id={setting.name} 
                              checked={setting.value === true}
                              onCheckedChange={() => handleToggleSetting(setting.id)}
                            />
                          </motion.div>
                        ))}
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Adicionar Nova Configuração</CardTitle>
                        <CardDescription>Crie uma nova configuração personalizada</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="grid gap-2">
                            <Label htmlFor="settingName">Nome da Configuração</Label>
                            <Input id="settingName" placeholder="Ex: enableFeatureX" />
                          </div>
                          
                          <div className="grid gap-2">
                            <Label htmlFor="settingDescription">Descrição</Label>
                            <Input id="settingDescription" placeholder="Ex: Ativar o recurso X" />
                          </div>
                          
                          <div className="grid gap-2">
                            <Label htmlFor="settingCategory">Categoria</Label>
                            <Select defaultValue="system">
                              <SelectTrigger id="settingCategory">
                                <SelectValue placeholder="Selecione a categoria" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="system">Sistema</SelectItem>
                                <SelectItem value="users">Usuários</SelectItem>
                                <SelectItem value="notifications">Notificações</SelectItem>
                                <SelectItem value="custom">Personalizada</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="grid gap-2">
                            <Label htmlFor="settingType">Tipo de Valor</Label>
                            <Select defaultValue="boolean">
                              <SelectTrigger id="settingType">
                                <SelectValue placeholder="Selecione o tipo" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="boolean">Booleano (Sim/Não)</SelectItem>
                                <SelectItem value="text">Texto</SelectItem>
                                <SelectItem value="number">Número</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <Button className="w-full mt-2">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Adicionar Configuração
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <motion.div 
                    variants={fadeVariants}
                    className="mt-8 p-6 bg-card border rounded-lg"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-amber-100 text-amber-600 rounded-full">
                        <Sparkles className="h-5 w-5" />
                      </div>
                      <h3 className="text-xl font-semibold">Recursos Premium</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 border rounded-lg bg-card hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-2 mb-2">
                          <Zap className="h-4 w-4 text-purple-500" />
                          <h4 className="font-medium">Análise Avançada</h4>
                        </div>
                        <p className="text-sm text-muted-foreground">Acesse relatórios detalhados e análises avançadas de desempenho.</p>
                      </div>
                      
                      <div className="p-4 border rounded-lg bg-card hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-2 mb-2">
                          <Users className="h-4 w-4 text-blue-500" />
                          <h4 className="font-medium">Suporte Prioritário</h4>
                        </div>
                        <p className="text-sm text-muted-foreground">Obtenha suporte prioritário da nossa equipe especializada.</p>
                      </div>
                      
                      <div className="p-4 border rounded-lg bg-card hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="h-4 w-4 text-green-500" />
                          <h4 className="font-medium">Agendamento Automático</h4>
                        </div>
                        <p className="text-sm text-muted-foreground">Configure ações automáticas baseadas em cronogramas personalizados.</p>
                      </div>
                    </div>
                    
                    <div className="mt-4 text-center">
                      <Button variant="outline" className="mt-2">
                        Explorar Planos Premium
                      </Button>
                    </div>
                  </motion.div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default PainelControle;