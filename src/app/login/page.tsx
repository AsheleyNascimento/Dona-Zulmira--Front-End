'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
// removed unused Card imports
import Image from 'next/image';
import { FaUser, FaLock } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { API_BASE } from '@/lib/api';

interface LoginData {
  email: string;
  senha: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<LoginData>({
    email: '',
    senha: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        // Tenta extrair mensagem do backend
        let message = 'Falha no login. Verifique suas credenciais.';
        try {
          const errBody = await response.json();
          const msg = errBody?.message;
          if (Array.isArray(msg)) message = msg.join(', ');
          else if (typeof msg === 'string') message = msg;
        } catch { }

        if (response.status === 401) {
          message = 'Credenciais inválidas.';
        }

        toast.error(message);
        return; // não prossegue
      }

      const data = await response.json();
      // Store tokens and funcao in localStorage
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('funcao', data.funcao);

      // Feedback de sucesso
      toast.success('Logado com sucesso!');

      // Redireciona conforme a função do usuário
      if (data.funcao === 'Administrador') {
        router.push('/usuarios');
      } else if (data.funcao === 'Cuidador' || data.funcao === 'Enfermeiro' || data.funcao === 'Tecnico de Enfermagem' || data.funcao === 'Farmaceutico') {
        router.push("/morador");
      } else {
        toast.error('Função de usuário não reconhecida.');
      }

    } catch (error) {
      console.error('Login failed:', error);
      toast.error('Erro ao conectar ao servidor. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-6">
      <Image src="/logo-ssvp.png" alt="Logo" width={128} height={128} className="w-32 mb-4" priority />
      <h1 className="text-xl font-bold text-blue-900 mb-6 text-center">
        CASA DONA ZULMIRA
      </h1>
      <form onSubmit={handleSubmit} className="w-full max-w-sm">
        {/* Campo usuário */}
        <div className="relative w-full mb-4">
          <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500" />
          <Input
            name="email"
            type="email"
            placeholder="Digite seu e-mail..."
            className="pl-10 bg-blue-50"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        {/* Campo senha */}
        <div className="relative w-full mb-6">
          <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500" />
          <Input
            name="senha"
            type="password"
            placeholder="Digite sua senha..."
            className="pl-10 bg-blue-50"
            value={formData.senha}
            onChange={handleChange}
            required
          />
        </div>

        {/* Botão entrar */}
        <Button
          type="submit"
          className="w-full bg-red-600 hover:bg-red-700 text-white text-lg rounded-full py-6 shadow-md"
          disabled={loading}
        >
          {loading ? 'ENTRANDO...' : 'ENTRAR'}
        </Button>
      </form>
      <div className="text-center mt-4">
        <Link href="/forgot-password" className="text-sm text-blue-600 hover:underline">

          Esqueci minha senha

        </Link>
      </div>
    </div>
  );
}