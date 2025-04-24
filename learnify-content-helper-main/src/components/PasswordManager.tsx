import React, { useState } from 'react';
import { useMaintenanceContext } from '@/lib/context/MaintenanceContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

interface PasswordManagerProps {
  currentPassword: string;
  onPasswordChange: (newPassword: string) => void;
}

const PasswordManager: React.FC<PasswordManagerProps> = ({ currentPassword, onPasswordChange }) => {
  const { canViewPasswords, canEditPasswords } = useMaintenanceContext();
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currentPasswordInput, setCurrentPasswordInput] = useState('');

  const handleToggleView = () => {
    setShowPassword(!showPassword);
  };

  const handleStartEdit = () => {
    setIsEditing(true);
    setNewPassword('');
    setConfirmPassword('');
    setCurrentPasswordInput('');
  };

  const handleSavePassword = () => {
    if (currentPasswordInput !== currentPassword) {
      toast.error('Senha atual incorreta');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('A nova senha deve ter pelo menos 6 caracteres');
      return;
    }

    onPasswordChange(newPassword);
    setIsEditing(false);
    toast.success('Senha alterada com sucesso');
  };

  if (!canViewPasswords && !canEditPasswords) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Gerenciamento de Senha</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-500">Você não tem permissão para visualizar ou editar senhas.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gerenciamento de Senha</CardTitle>
      </CardHeader>
      <CardContent>
        {!isEditing ? (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Input
                type={showPassword ? 'text' : 'password'}
                value={currentPassword}
                readOnly
                className="flex-1"
              />
              {canViewPasswords && (
                <Button
                  variant="outline"
                  onClick={handleToggleView}
                >
                  {showPassword ? 'Ocultar' : 'Mostrar'}
                </Button>
              )}
            </div>
            {canEditPasswords && (
              <Button
                onClick={handleStartEdit}
                className="w-full"
              >
                Alterar Senha
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Senha Atual</label>
              <Input
                type="password"
                value={currentPasswordInput}
                onChange={(e) => setCurrentPasswordInput(e.target.value)}
                placeholder="Digite sua senha atual"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Nova Senha</label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Digite a nova senha"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Confirme a Nova Senha</label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirme a nova senha"
              />
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsEditing(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSavePassword}
                className="flex-1"
              >
                Salvar
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PasswordManager;