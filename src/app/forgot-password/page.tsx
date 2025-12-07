'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { FaEnvelope, FaArrowLeft } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');

        try {
            const response = await fetch('http://localhost:4000/auth/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage(data.message);
                toast.success('E-mail de recuperação enviado!');
                setEmail('');
            } else {
                setError(data.message || 'Erro ao solicitar recuperação de senha.');
                toast.error(data.message || 'Erro ao solicitar recuperação de senha.');
            }
        } catch {
            setError('Erro ao conectar com o servidor. Tente novamente.');
            toast.error('Erro ao conectar com o servidor. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-white p-6">
            <Image src="/logo-ssvp.png" alt="Logo" width={128} height={128} className="w-32 mb-4" priority />
            <h1 className="text-xl font-bold text-blue-900 mb-2 text-center">
                CASA DONA ZULMIRA
            </h1>
            <h2 className="text-lg text-gray-700 mb-6 text-center">
                Recuperação de Senha
            </h2>

            <form onSubmit={handleSubmit} className="w-full max-w-sm">
                {/* Mensagem de sucesso */}
                {message && (
                    <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md text-green-700 text-sm">
                        {message}
                    </div>
                )}

                {/* Mensagem de erro */}
                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                        {error}
                    </div>
                )}

                {/* Campo de e-mail */}
                <div className="relative w-full mb-6">
                    <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500" />
                    <Input
                        type="email"
                        placeholder="Digite seu e-mail..."
                        className="pl-10 bg-blue-50"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                {/* Botão enviar */}
                <Button
                    type="submit"
                    className="w-full bg-red-600 hover:bg-red-700 text-white text-lg rounded-full py-6 shadow-md mb-4"
                    disabled={loading}
                >
                    {loading ? 'ENVIANDO...' : 'ENVIAR INSTRUÇÕES'}
                </Button>
            </form>

            {/* Link voltar ao login */}
            <div className="text-center mt-4">
                <Link href="/login" className="text-sm text-blue-600 hover:underline inline-flex items-center gap-2">
                    <FaArrowLeft />
                    Voltar ao Login
                </Link>
            </div>
        </div>
    );
}
