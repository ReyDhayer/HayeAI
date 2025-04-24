import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMaintenanceContext } from '@/lib/context/MaintenanceContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useMaintenanceContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    // Buscar usuários cadastrados no localStorage
    const storedUsers = localStorage.getItem('users');
    let users = [];
    try {
      users = storedUsers ? JSON.parse(storedUsers) : [];
    } catch {
      users = [];
    }

    // Procurar usuário pelo email
    const foundUser = users.find((user: any) => user.email === email);
    if (!foundUser) {
      toast.error('Usuário não encontrado');
      return;
    }
    if (foundUser.password !== password) {
      toast.error('Senha incorreta');
      return;
    }
    if (foundUser.status !== 'active') {
      toast.error('Usuário inativo. Entre em contato com o administrador.');
      return;
    }
    // Login
    login(foundUser.role);
    toast.success(`Login realizado com sucesso como ${foundUser.role.charAt(0).toUpperCase() + foundUser.role.slice(1)}!`);
    navigate('/painel-controle');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Login Administrativo</CardTitle>
          <CardDescription>Acesse o painel de controle</CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">Email</label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">Senha</label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full">Entrar</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default Login;