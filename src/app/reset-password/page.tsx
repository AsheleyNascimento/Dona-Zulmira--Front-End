'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { FaLock, FaCheckCircle, FaTimesCircle, FaArrowLeft } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

function ResetPasswordContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [token, setToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [passwordStrength, setPasswordStrength] = useState({ label: '', color: '', width: 0 });

    useEffect(() => {
        const urlToken = searchParams.get('token');
        if (urlToken) {
            setToken(urlToken);
        } else {
            setError('Token inválido ou ausente.');
        }
    }, [searchParams]);

    useEffect(() => {
        if (newPassword.length === 0) {
            setPasswordStrength({ label: '', color: '', width: 0 });
            return;
        }

        let strength = 0;
        const hasLower = /[a-z]/.test(newPassword);
        const hasUpper = /[A-Z]/.test(newPassword);
        const hasNumber = /\d/.test(newPassword);
        const hasSpecial = /[!@#$%^&*]/.test(newPassword);

        if (hasLower) strength++;
        if (hasUpper) strength++;
        if (hasNumber) strength++;
        if (hasSpecial) strength++;
        if (newPassword.length >= 8) strength++;

        if (strength <= 2) {
            setPasswordStrength({ label: 'Fraca', color: 'bg-red-500', width: 33 });
        } else if (strength <= 4) {
            setPasswordStrength({ label: 'Média', color: 'bg-yellow-500', width: 66 });
        } else {
            setPasswordStrength({ label: 'Forte', color: 'bg-green-500', width: 100 });
        }
    }, [newPassword]);

    // CORREÇÃO AQUI: Adicionado a tipagem React.FormEvent
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (newPassword !== confirmPassword) {
            setError('As senhas não correspondem.');
            toast.error('As senhas não correspondem.');
            return;
        }

        if (newPassword.length < 6) {
            setError('A senha deve ter no mínimo 6 caracteres.');
            toast.error('A senha deve ter no mínimo 6 caracteres.');
            return;
        }

        if (!token) {
            setError('Token inválido.');
            toast.error('Token inválido.');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('http://localhost:4000/auth/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token, newPassword }),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success('Senha redefinida com sucesso!');
                setTimeout(() => {
                    router.push('/login?reset=success');
                }, 2000);
            } else {
                setError(data.message || 'Erro ao redefinir senha.');
                toast.error(data.message || 'Erro ao redefinir senha.');
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
                Redefinir Senha
            </h2>

            <form onSubmit={handleSubmit} className="w-full max-w-sm">
                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm flex items-center gap-2">
                        <FaTimesCircle />
                        {error}
                    </div>
                )}

                <div className="relative w-full mb-3">
                    <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500" />
                    <Input
                        type="password"
                        placeholder="Nova senha..."
                        className="pl-10 bg-blue-50"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                    />
                </div>

                {newPassword && (
                    <div className="mb-4">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-xs text-gray-600">Força da senha:</span>
                            <span className={`text-xs font-semibold ${passwordStrength.label === 'Fraca' ? 'text-red-600' :
                                passwordStrength.label === 'Média' ? 'text-yellow-600' :
                                    'text-green-600'
                                }`}>
                                {passwordStrength.label}
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div
                                className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                                style={{ width: `${passwordStrength.width}%` }}
                            />
                        </div>
                    </div>
                )}

                <div className="relative w-full mb-6">
                    <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500" />
                    <Input
                        type="password"
                        placeholder="Confirmar nova senha..."
                        className="pl-10 bg-blue-50"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                    {confirmPassword && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            {newPassword === confirmPassword ? (
                                <FaCheckCircle className="text-green-500" />
                            ) : (
                                <FaTimesCircle className="text-red-500" />
                            )}
                        </div>
                    )}
                </div>

                <Button
                    type="submit"
                    className="w-full bg-red-600 hover:bg-red-700 text-white text-lg rounded-full py-6 shadow-md mb-4"
                    disabled={loading}
                >
                    {loading ? 'REDEFININDO...' : 'REDEFINIR SENHA'}
                </Button>
            </form>

            <div className="text-center mt-4">
                <Link href="/login" className="text-sm text-blue-600 hover:underline inline-flex items-center gap-2">
                    <FaArrowLeft />
                    Voltar ao Login
                </Link>
            </div>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center">Carregando...</div>}>
            <ResetPasswordContent />
        </Suspense>
    );
}