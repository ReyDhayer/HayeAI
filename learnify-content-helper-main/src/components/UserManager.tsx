import React, { useState } from 'react';
import { useMaintenanceContext } from '@/lib/context/MaintenanceContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import PasswordManager from './PasswordManager';

interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: string;
}

const UserManager: React.FC = () => {
  const { userRole } = useMaintenanceContext();
  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      name: 'Admin',
      email: 'admin@example.com',
      password: 'admin123',
      role: 'admin'
    },
    {
      id: '2',
      name: 'Gerente',
      email: 'gerente@example.com',
      password: 'gerente123',
      role: 'gerente'
    },
    {
      id: '3',
      name: 'Operador',
      email: 'operador@example.com',
      password: 'operador123',
      role: 'operador'
    }
  ]);

  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const handleUserSelect = (userId: string) => {
    const user = users.find(u => u.id === userId);
    setSelectedUser(user || null);
  };

  const handlePasswordChange = (newPassword: string) => {
    if (selectedUser) {
      setUsers(users.map(user =>
        user.id === selectedUser.id
          ? { ...user, password: newPassword }
          : user
      ));
      setSelectedUser({ ...selectedUser, password: newPassword });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Gerenciamento de Usuários</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Selecione um Usuário</label>
              <Select onValueChange={handleUserSelect} value={selectedUser?.id}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um usuário" />
                </SelectTrigger>
                <SelectContent>
                  {users.map(user => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedUser && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Nome</label>
                    <Input value={selectedUser.name} readOnly />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email</label>
                    <Input value={selectedUser.email} readOnly />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Função</label>
                  <Input value={selectedUser.role === 'admin' ? 'Administrador' : selectedUser.role === 'gerente' ? 'Gerente' : 'Operador'} readOnly />
                </div>
                <PasswordManager
                  currentPassword={selectedUser.password}
                  onPasswordChange={handlePasswordChange}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManager;