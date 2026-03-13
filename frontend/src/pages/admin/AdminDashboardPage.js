import React, { useState, useEffect } from 'react';
import { Link, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
    Shield, LayoutDashboard, Users, UserPlus, FileText, 
    LogOut, Plus, Trash2, Edit, X, Loader2, Check, Eye, EyeOff, Tag
} from 'lucide-react';
import { toast } from 'sonner';

// Overview Tab
const OverviewTab = ({ adminApi }) => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await adminApi.get('/admin/overview');
            setStats(response.data);
        } catch (error) {
            toast.error('Erro ao carregar estatísticas');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-[#1D9E75]" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-[#085041]" style={{ fontFamily: 'Fraunces, serif' }}>
                Visão Geral
            </h2>
            
            <div className="grid md:grid-cols-3 gap-6">
                <Card className="bg-white rounded-2xl border border-[#EBE9E1]">
                    <CardContent className="p-6">
                        <p className="text-sm text-[#787875]">Total de Tenants</p>
                        <p className="text-3xl font-bold text-[#085041]" data-testid="stat-tenants">
                            {stats?.total_tenants || 0}
                        </p>
                    </CardContent>
                </Card>
                <Card className="bg-white rounded-2xl border border-[#EBE9E1]">
                    <CardContent className="p-6">
                        <p className="text-sm text-[#787875]">Assinaturas Ativas</p>
                        <p className="text-3xl font-bold text-[#1D9E75]" data-testid="stat-subscriptions">
                            {stats?.active_subscriptions || 0}
                        </p>
                    </CardContent>
                </Card>
                <Card className="bg-white rounded-2xl border border-[#EBE9E1]">
                    <CardContent className="p-6">
                        <p className="text-sm text-[#787875]">Exames este mês</p>
                        <p className="text-3xl font-bold text-[#085041]" data-testid="stat-exams">
                            {stats?.exams_this_month || 0}
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

// Tenants Tab
const TenantsTab = ({ adminApi }) => {
    const [tenants, setTenants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        fetchTenants();
    }, []);

    const fetchTenants = async () => {
        try {
            const response = await adminApi.get('/admin/tenants');
            setTenants(response.data);
        } catch (error) {
            toast.error('Erro ao carregar tenants');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setCreating(true);
        try {
            await adminApi.post('/admin/tenants', formData);
            toast.success('Tenant criado com sucesso!');
            setShowCreate(false);
            setFormData({ name: '', email: '', password: '' });
            fetchTenants();
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Erro ao criar tenant');
        } finally {
            setCreating(false);
        }
    };

    const handleToggleActive = async (tenantId, currentActive) => {
        try {
            await adminApi.patch(`/admin/tenants/${tenantId}`, { active: !currentActive });
            toast.success(`Tenant ${!currentActive ? 'ativado' : 'desativado'}`);
            fetchTenants();
        } catch (error) {
            toast.error('Erro ao atualizar tenant');
        }
    };

    const handleDelete = async (tenantId) => {
        if (!window.confirm('Tem certeza? Esta ação é irreversível.')) return;
        try {
            await adminApi.delete(`/admin/tenants/${tenantId}`);
            toast.success('Tenant excluído');
            fetchTenants();
        } catch (error) {
            toast.error('Erro ao excluir tenant');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-[#085041]" style={{ fontFamily: 'Fraunces, serif' }}>
                    Tenants
                </h2>
                <Button
                    onClick={() => setShowCreate(true)}
                    className="bg-[#1D9E75] hover:bg-[#168561] text-white rounded-full"
                    data-testid="create-tenant-btn"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Tenant
                </Button>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-[#1D9E75]" />
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-[#EBE9E1] overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-[#F1EFE8]">
                            <tr>
                                <th className="px-4 py-3 text-left text-sm font-medium text-[#787875]">Nome</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-[#787875]">Email</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-[#787875]">Plano</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-[#787875]">Créditos</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-[#787875]">Status</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-[#787875]">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tenants.map((tenant) => (
                                <tr key={tenant.id} className="border-t border-[#EBE9E1]">
                                    <td className="px-4 py-3 text-[#085041]">{tenant.name}</td>
                                    <td className="px-4 py-3 text-[#444441]">{tenant.user_email}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded-full text-xs ${
                                            tenant.plan === 'pro' ? 'bg-[#1D9E75]/10 text-[#1D9E75]' : 'bg-gray-100 text-gray-600'
                                        }`}>
                                            {tenant.plan}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-[#444441]">{tenant.exam_credits}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded-full text-xs ${
                                            tenant.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                        }`}>
                                            {tenant.active ? 'Ativo' : 'Inativo'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleToggleActive(tenant.id, tenant.active)}
                                                className="p-1 hover:bg-[#F1EFE8] rounded"
                                                title={tenant.active ? 'Desativar' : 'Ativar'}
                                            >
                                                {tenant.active ? (
                                                    <EyeOff className="w-4 h-4 text-[#787875]" />
                                                ) : (
                                                    <Eye className="w-4 h-4 text-[#787875]" />
                                                )}
                                            </button>
                                            <button
                                                onClick={() => handleDelete(tenant.id)}
                                                className="p-1 hover:bg-red-50 rounded"
                                                title="Excluir"
                                            >
                                                <Trash2 className="w-4 h-4 text-red-500" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {tenants.length === 0 && (
                        <p className="text-center py-8 text-[#787875]">Nenhum tenant cadastrado</p>
                    )}
                </div>
            )}

            {/* Create Modal */}
            {showCreate && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <Card className="bg-white rounded-2xl max-w-md w-full">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-lg text-[#085041]">Novo Tenant</CardTitle>
                            <button onClick={() => setShowCreate(false)}>
                                <X className="w-5 h-5 text-[#787875]" />
                            </button>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleCreate} className="space-y-4">
                                <div>
                                    <Label>Nome</Label>
                                    <Input
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                        className="rounded-xl"
                                    />
                                </div>
                                <div>
                                    <Label>Email</Label>
                                    <Input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        required
                                        className="rounded-xl"
                                    />
                                </div>
                                <div>
                                    <Label>Senha</Label>
                                    <Input
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        required
                                        className="rounded-xl"
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    disabled={creating}
                                    className="w-full bg-[#1D9E75] hover:bg-[#168561] text-white rounded-full"
                                >
                                    {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Criar Tenant'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
};

// Specialists Tab
const SpecialistsTab = ({ adminApi }) => {
    const [specialists, setSpecialists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [formData, setFormData] = useState({
        name: '', specialty: '', type: 'medico', city: '', state: '',
        phone: '', website: '', email: '', description: ''
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchSpecialists();
    }, []);

    const fetchSpecialists = async () => {
        try {
            const response = await adminApi.get('/specialists');
            setSpecialists(response.data);
        } catch (error) {
            toast.error('Erro ao carregar especialistas');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (editing) {
                await adminApi.patch(`/admin/specialists/${editing}`, formData);
                toast.success('Especialista atualizado!');
            } else {
                await adminApi.post('/admin/specialists', formData);
                toast.success('Especialista criado!');
            }
            setShowForm(false);
            setEditing(null);
            setFormData({
                name: '', specialty: '', type: 'medico', city: '', state: '',
                phone: '', website: '', email: '', description: ''
            });
            fetchSpecialists();
        } catch (error) {
            toast.error('Erro ao salvar especialista');
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (specialist) => {
        setFormData({
            name: specialist.name,
            specialty: specialist.specialty,
            type: specialist.type,
            city: specialist.city || '',
            state: specialist.state || '',
            phone: specialist.phone || '',
            website: specialist.website || '',
            email: specialist.email || '',
            description: specialist.description || ''
        });
        setEditing(specialist.id);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Excluir este especialista?')) return;
        try {
            await adminApi.delete(`/admin/specialists/${id}`);
            toast.success('Especialista excluído');
            fetchSpecialists();
        } catch (error) {
            toast.error('Erro ao excluir especialista');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-[#085041]" style={{ fontFamily: 'Fraunces, serif' }}>
                    Especialistas
                </h2>
                <Button
                    onClick={() => { setShowForm(true); setEditing(null); }}
                    className="bg-[#1D9E75] hover:bg-[#168561] text-white rounded-full"
                    data-testid="create-specialist-btn"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Especialista
                </Button>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-[#1D9E75]" />
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {specialists.map((specialist) => (
                        <Card key={specialist.id} className="bg-white rounded-2xl border border-[#EBE9E1]">
                            <CardContent className="p-4">
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <h3 className="font-medium text-[#085041]">{specialist.name}</h3>
                                        <p className="text-sm text-[#1D9E75]">{specialist.specialty}</p>
                                    </div>
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => handleEdit(specialist)}
                                            className="p-1 hover:bg-[#F1EFE8] rounded"
                                        >
                                            <Edit className="w-4 h-4 text-[#787875]" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(specialist.id)}
                                            className="p-1 hover:bg-red-50 rounded"
                                        >
                                            <Trash2 className="w-4 h-4 text-red-500" />
                                        </button>
                                    </div>
                                </div>
                                <p className="text-xs text-[#787875]">
                                    {specialist.city}{specialist.city && specialist.state ? ', ' : ''}{specialist.state}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {specialists.length === 0 && !loading && (
                <p className="text-center py-8 text-[#787875]">Nenhum especialista cadastrado</p>
            )}

            {/* Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <Card className="bg-white rounded-2xl max-w-lg w-full my-8">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-lg text-[#085041]">
                                {editing ? 'Editar Especialista' : 'Novo Especialista'}
                            </CardTitle>
                            <button onClick={() => { setShowForm(false); setEditing(null); }}>
                                <X className="w-5 h-5 text-[#787875]" />
                            </button>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Nome *</Label>
                                        <Input
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            required
                                            className="rounded-xl"
                                        />
                                    </div>
                                    <div>
                                        <Label>Especialidade *</Label>
                                        <Input
                                            value={formData.specialty}
                                            onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                                            required
                                            className="rounded-xl"
                                            placeholder="Ex: Hematologista"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <Label>Tipo *</Label>
                                    <Select
                                        value={formData.type}
                                        onValueChange={(value) => setFormData({ ...formData, type: value })}
                                    >
                                        <SelectTrigger className="rounded-xl">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="medico">Médico</SelectItem>
                                            <SelectItem value="clinica">Clínica</SelectItem>
                                            <SelectItem value="hospital">Hospital</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Cidade</Label>
                                        <Input
                                            value={formData.city}
                                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                            className="rounded-xl"
                                        />
                                    </div>
                                    <div>
                                        <Label>Estado</Label>
                                        <Input
                                            value={formData.state}
                                            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                            className="rounded-xl"
                                            placeholder="Ex: SP"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <Label>Telefone</Label>
                                    <Input
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="rounded-xl"
                                    />
                                </div>
                                <div>
                                    <Label>Website</Label>
                                    <Input
                                        value={formData.website}
                                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                        className="rounded-xl"
                                        type="url"
                                    />
                                </div>
                                <div>
                                    <Label>Email</Label>
                                    <Input
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="rounded-xl"
                                        type="email"
                                    />
                                </div>
                                <div>
                                    <Label>Descrição</Label>
                                    <Textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="rounded-xl"
                                        rows={3}
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    disabled={saving}
                                    className="w-full bg-[#1D9E75] hover:bg-[#168561] text-white rounded-full"
                                >
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : (editing ? 'Salvar' : 'Criar')}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
};

// Audit Log Tab
const AuditLogTab = ({ adminApi }) => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            const response = await adminApi.get('/admin/audit-log');
            setLogs(response.data);
        } catch (error) {
            toast.error('Erro ao carregar logs');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-[#085041]" style={{ fontFamily: 'Fraunces, serif' }}>
                Log de Auditoria
            </h2>
            
            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-[#1D9E75]" />
                </div>
            ) : logs.length === 0 ? (
                <p className="text-center py-8 text-[#787875]">Nenhum evento registrado</p>
            ) : (
                <div className="bg-white rounded-2xl border border-[#EBE9E1] overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-[#F1EFE8]">
                            <tr>
                                <th className="px-4 py-3 text-left text-sm font-medium text-[#787875]">Data</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-[#787875]">Evento</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-[#787875]">Registros afetados</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.map((log) => (
                                <tr key={log.id} className="border-t border-[#EBE9E1]">
                                    <td className="px-4 py-3 text-[#444441]">
                                        {new Date(log.created_at).toLocaleString('pt-BR')}
                                    </td>
                                    <td className="px-4 py-3 text-[#085041]">{log.event_type}</td>
                                    <td className="px-4 py-3 text-[#444441]">{log.affected_count}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

// Coupons Tab
const CouponsTab = ({ adminApi }) => {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        code: '',
        discount_type: 'percent',
        discount_value: '',
        max_redemptions: '',
        expires_at: ''
    });

    useEffect(() => {
        fetchCoupons();
    }, []);

    const fetchCoupons = async () => {
        try {
            const response = await adminApi.get('/admin/coupons');
            setCoupons(response.data);
        } catch (error) {
            toast.error('Erro ao carregar cupons');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCoupon = async (e) => {
        e.preventDefault();
        try {
            await adminApi.post('/admin/coupons', {
                code: formData.code.toUpperCase(),
                discount_type: formData.discount_type,
                discount_value: parseFloat(formData.discount_value),
                max_redemptions: formData.max_redemptions ? parseInt(formData.max_redemptions) : null,
                expires_at: formData.expires_at || null
            });
            toast.success('Cupom criado com sucesso!');
            setShowForm(false);
            setFormData({ code: '', discount_type: 'percent', discount_value: '', max_redemptions: '', expires_at: '' });
            fetchCoupons();
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Erro ao criar cupom');
        }
    };

    const handleToggleCoupon = async (id, currentActive) => {
        try {
            await adminApi.patch(`/admin/coupons/${id}?active=${!currentActive}`);
            toast.success(currentActive ? 'Cupom desativado' : 'Cupom ativado');
            fetchCoupons();
        } catch (error) {
            toast.error('Erro ao atualizar cupom');
        }
    };

    const handleDeleteCoupon = async (id) => {
        if (!window.confirm('Tem certeza que deseja excluir este cupom?')) return;
        try {
            await adminApi.delete(`/admin/coupons/${id}`);
            toast.success('Cupom excluído');
            fetchCoupons();
        } catch (error) {
            toast.error('Erro ao excluir cupom');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-[#085041]" style={{ fontFamily: 'Fraunces, serif' }}>
                    Cupons de Desconto
                </h2>
                <Button 
                    onClick={() => setShowForm(true)} 
                    className="bg-[#1D9E75] hover:bg-[#168561] text-white rounded-full"
                    data-testid="add-coupon-btn"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Cupom
                </Button>
            </div>

            {/* Create Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <Card className="bg-white rounded-2xl max-w-md w-full">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-lg text-[#085041]">Criar Cupom</CardTitle>
                            <button onClick={() => setShowForm(false)} className="text-[#787875]">
                                <X className="w-5 h-5" />
                            </button>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleCreateCoupon} className="space-y-4">
                                <div>
                                    <Label>Código do Cupom</Label>
                                    <Input
                                        value={formData.code}
                                        onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                                        placeholder="Ex: DESCONTO10"
                                        className="mt-1"
                                        required
                                        data-testid="coupon-code-input"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Tipo de Desconto</Label>
                                        <Select 
                                            value={formData.discount_type}
                                            onValueChange={(value) => setFormData({...formData, discount_type: value})}
                                        >
                                            <SelectTrigger className="mt-1">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="percent">Percentual (%)</SelectItem>
                                                <SelectItem value="fixed">Valor Fixo (R$)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label>Valor do Desconto</Label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={formData.discount_value}
                                            onChange={(e) => setFormData({...formData, discount_value: e.target.value})}
                                            placeholder={formData.discount_type === 'percent' ? '10' : '5.00'}
                                            className="mt-1"
                                            required
                                            data-testid="coupon-value-input"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Máximo de Usos</Label>
                                        <Input
                                            type="number"
                                            min="1"
                                            value={formData.max_redemptions}
                                            onChange={(e) => setFormData({...formData, max_redemptions: e.target.value})}
                                            placeholder="Ilimitado"
                                            className="mt-1"
                                        />
                                    </div>
                                    <div>
                                        <Label>Expira em</Label>
                                        <Input
                                            type="datetime-local"
                                            value={formData.expires_at}
                                            onChange={(e) => setFormData({...formData, expires_at: e.target.value})}
                                            className="mt-1"
                                        />
                                    </div>
                                </div>
                                <Button 
                                    type="submit" 
                                    className="w-full bg-[#1D9E75] hover:bg-[#168561] text-white rounded-full"
                                    data-testid="create-coupon-btn"
                                >
                                    Criar Cupom
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            )}

            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-[#1D9E75]" />
                </div>
            ) : coupons.length === 0 ? (
                <Card className="bg-white rounded-2xl border border-[#EBE9E1]">
                    <CardContent className="p-12 text-center">
                        <p className="text-[#787875]">Nenhum cupom cadastrado</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="bg-white rounded-2xl border border-[#EBE9E1] overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-[#F1EFE8]">
                            <tr>
                                <th className="px-4 py-3 text-left text-sm font-medium text-[#787875]">Código</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-[#787875]">Desconto</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-[#787875]">Uso</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-[#787875]">Status</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-[#787875]">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {coupons.map((coupon) => (
                                <tr key={coupon.id} className="border-t border-[#EBE9E1]">
                                    <td className="px-4 py-3">
                                        <span className="font-mono font-bold text-[#085041]">{coupon.code}</span>
                                    </td>
                                    <td className="px-4 py-3 text-[#444441]">
                                        {coupon.discount_type === 'percent' 
                                            ? `${coupon.discount_value}%`
                                            : `R$ ${coupon.discount_value.toFixed(2).replace('.', ',')}`
                                        }
                                    </td>
                                    <td className="px-4 py-3 text-[#444441]">
                                        {coupon.times_redeemed}{coupon.max_redemptions ? `/${coupon.max_redemptions}` : ''}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                                            coupon.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                        }`}>
                                            {coupon.active ? 'Ativo' : 'Inativo'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-2">
                                            <Button
                                                onClick={() => handleToggleCoupon(coupon.id, coupon.active)}
                                                variant="outline"
                                                size="sm"
                                                className="rounded-full"
                                            >
                                                {coupon.active ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                            </Button>
                                            <Button
                                                onClick={() => handleDeleteCoupon(coupon.id)}
                                                variant="outline"
                                                size="sm"
                                                className="rounded-full text-red-500 hover:text-red-600"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

// Main Admin Dashboard
export default function AdminDashboardPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { admin, adminApi, adminLogout } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        const path = location.pathname.split('/admin/')[1] || 'overview';
        setActiveTab(path);
    }, [location]);

    const handleLogout = () => {
        adminLogout();
        navigate('/admin/login');
    };

    const tabs = [
        { id: 'overview', label: 'Visão Geral', icon: LayoutDashboard },
        { id: 'tenants', label: 'Tenants', icon: Users },
        { id: 'specialists', label: 'Especialistas', icon: UserPlus },
        { id: 'coupons', label: 'Cupons', icon: Tag },
        { id: 'audit', label: 'Auditoria', icon: FileText }
    ];

    return (
        <div className="min-h-screen bg-[#F1EFE8]">
            {/* Sidebar */}
            <aside className="fixed left-0 top-0 h-full w-64 bg-[#085041] text-white p-6 hidden lg:block">
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 bg-[#1D9E75] rounded-full flex items-center justify-center">
                        <Shield className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <p className="font-semibold" style={{ fontFamily: 'Fraunces, serif' }}>Exagram</p>
                        <p className="text-xs text-white/60">Administração</p>
                    </div>
                </div>

                <nav className="space-y-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => { setActiveTab(tab.id); navigate(`/admin/${tab.id === 'overview' ? '' : tab.id}`); }}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                                activeTab === tab.id ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white hover:bg-white/5'
                            }`}
                            data-testid={`admin-tab-${tab.id}`}
                        >
                            <tab.icon className="w-5 h-5" />
                            {tab.label}
                        </button>
                    ))}
                </nav>

                <div className="absolute bottom-6 left-6 right-6">
                    <div className="p-4 bg-white/5 rounded-xl mb-4">
                        <p className="text-sm text-white/60">Logado como</p>
                        <p className="text-sm truncate">{admin?.email}</p>
                    </div>
                    <Button
                        onClick={handleLogout}
                        variant="ghost"
                        className="w-full text-white/60 hover:text-white hover:bg-white/10"
                        data-testid="admin-logout-btn"
                    >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sair
                    </Button>
                </div>
            </aside>

            {/* Mobile Header */}
            <header className="lg:hidden bg-[#085041] text-white p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Shield className="w-6 h-6" />
                    <span className="font-semibold">Admin</span>
                </div>
                <Button onClick={handleLogout} variant="ghost" size="sm" className="text-white">
                    <LogOut className="w-4 h-4" />
                </Button>
            </header>

            {/* Mobile Tabs */}
            <div className="lg:hidden bg-white border-b border-[#EBE9E1] px-4 overflow-x-auto">
                <div className="flex gap-4 py-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap ${
                                activeTab === tab.id ? 'bg-[#1D9E75] text-white' : 'text-[#787875]'
                            }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <main className="lg:ml-64 p-6 lg:p-8">
                {activeTab === 'overview' && <OverviewTab adminApi={adminApi} />}
                {activeTab === 'tenants' && <TenantsTab adminApi={adminApi} />}
                {activeTab === 'specialists' && <SpecialistsTab adminApi={adminApi} />}
                {activeTab === 'audit' && <AuditLogTab adminApi={adminApi} />}
            </main>
        </div>
    );
}
