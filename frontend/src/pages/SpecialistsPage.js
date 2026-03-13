import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Heart, Search, MapPin, Phone, Globe, Mail, ArrowLeft, Loader2 } from 'lucide-react';
import axios from 'axios';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

const SPECIALTIES = [
    'Todos',
    'Hematologista',
    'Infectologista',
    'Clínico Geral',
    'Alergologista',
    'Cardiologista',
    'Endocrinologista'
];

const STATES = [
    { value: 'all', label: 'Todos os estados' },
    { value: 'SP', label: 'São Paulo' },
    { value: 'RJ', label: 'Rio de Janeiro' },
    { value: 'MG', label: 'Minas Gerais' },
    { value: 'RS', label: 'Rio Grande do Sul' },
    { value: 'PR', label: 'Paraná' },
    { value: 'SC', label: 'Santa Catarina' },
    { value: 'BA', label: 'Bahia' },
    { value: 'PE', label: 'Pernambuco' },
    { value: 'CE', label: 'Ceará' },
    { value: 'DF', label: 'Distrito Federal' }
];

export default function SpecialistsPage() {
    const [specialists, setSpecialists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        specialty: '',
        city: '',
        state: ''
    });

    useEffect(() => {
        fetchSpecialists();
    }, []);

    const fetchSpecialists = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filters.specialty && filters.specialty !== 'Todos') {
                params.append('specialty', filters.specialty);
            }
            if (filters.city) params.append('city', filters.city);
            if (filters.state && filters.state !== 'all') params.append('state', filters.state);
            
            const response = await axios.get(`${API_URL}/specialists?${params.toString()}`);
            setSpecialists(response.data);
        } catch (error) {
            console.error('Failed to fetch specialists:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        fetchSpecialists();
    };

    return (
        <div className="min-h-screen bg-[#F1EFE8]">
            {/* Header */}
            <header className="bg-white border-b border-[#EBE9E1]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <Link to="/" className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-[#1D9E75] rounded-full flex items-center justify-center">
                                <Heart className="w-4 h-4 text-white" />
                            </div>
                            <span className="font-semibold text-xl text-[#085041]" style={{ fontFamily: 'Fraunces, serif' }}>
                                Exagram
                            </span>
                        </Link>
                        <div className="flex items-center gap-4">
                            <Link to="/login">
                                <Button variant="ghost" className="text-[#444441] hover:text-[#1D9E75]">
                                    Entrar
                                </Button>
                            </Link>
                            <Link to="/register">
                                <Button className="bg-[#1D9E75] hover:bg-[#168561] text-white rounded-full">
                                    Criar conta
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Link to="/" className="inline-flex items-center gap-2 text-[#787875] hover:text-[#1D9E75] mb-6">
                    <ArrowLeft className="w-4 h-4" />
                    Voltar ao início
                </Link>

                <div className="mb-8">
                    <h1 className="text-3xl font-semibold text-[#085041]" style={{ fontFamily: 'Fraunces, serif' }}>
                        Encontre especialistas
                    </h1>
                    <p className="text-[#787875] mt-2">
                        Busque médicos e clínicas especializadas
                    </p>
                </div>

                {/* Filters */}
                <Card className="bg-white rounded-3xl border border-[#EBE9E1] shadow-sm mb-8">
                    <CardContent className="p-6">
                        <div className="grid md:grid-cols-4 gap-4">
                            <div>
                                <label className="text-sm text-[#787875] mb-2 block">Especialidade</label>
                                <Select
                                    value={filters.specialty}
                                    onValueChange={(value) => setFilters(prev => ({ ...prev, specialty: value }))}
                                >
                                    <SelectTrigger className="rounded-xl border-[#EBE9E1]">
                                        <SelectValue placeholder="Selecione" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {SPECIALTIES.map((spec) => (
                                            <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <label className="text-sm text-[#787875] mb-2 block">Cidade</label>
                                <Input
                                    placeholder="Ex: São Paulo"
                                    value={filters.city}
                                    onChange={(e) => setFilters(prev => ({ ...prev, city: e.target.value }))}
                                    className="rounded-xl border-[#EBE9E1]"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-[#787875] mb-2 block">Estado</label>
                                <Select
                                    value={filters.state}
                                    onValueChange={(value) => setFilters(prev => ({ ...prev, state: value }))}
                                >
                                    <SelectTrigger className="rounded-xl border-[#EBE9E1]">
                                        <SelectValue placeholder="Selecione" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {STATES.map((state) => (
                                            <SelectItem key={state.value} value={state.value}>{state.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-end">
                                <Button 
                                    onClick={handleSearch}
                                    className="w-full bg-[#1D9E75] hover:bg-[#168561] text-white rounded-full"
                                    data-testid="search-specialists-btn"
                                >
                                    <Search className="w-4 h-4 mr-2" />
                                    Buscar
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Results */}
                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-[#1D9E75]" />
                    </div>
                ) : specialists.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-[#787875]">Nenhum especialista encontrado</p>
                        <p className="text-sm text-[#787875] mt-1">Tente ajustar os filtros de busca</p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {specialists.map((specialist) => (
                            <Card key={specialist.id} className="bg-white rounded-3xl border border-[#EBE9E1] shadow-sm hover:-translate-y-1 transition-transform">
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <h3 className="font-semibold text-[#085041]">{specialist.name}</h3>
                                            <p className="text-[#1D9E75]">{specialist.specialty}</p>
                                        </div>
                                        <span className="text-xs bg-[#F1EFE8] px-2 py-1 rounded-full text-[#787875]">
                                            {specialist.type === 'medico' ? 'Médico' : 
                                             specialist.type === 'clinica' ? 'Clínica' : 'Hospital'}
                                        </span>
                                    </div>
                                    
                                    {specialist.description && (
                                        <p className="text-sm text-[#444441] mb-4 line-clamp-2">
                                            {specialist.description}
                                        </p>
                                    )}
                                    
                                    <div className="space-y-2 text-sm text-[#787875]">
                                        {(specialist.city || specialist.state) && (
                                            <div className="flex items-center gap-2">
                                                <MapPin className="w-4 h-4" />
                                                {specialist.city}{specialist.city && specialist.state ? ', ' : ''}{specialist.state}
                                            </div>
                                        )}
                                        {specialist.phone && (
                                            <a href={`tel:${specialist.phone}`} className="flex items-center gap-2 hover:text-[#1D9E75]">
                                                <Phone className="w-4 h-4" />
                                                {specialist.phone}
                                            </a>
                                        )}
                                        {specialist.email && (
                                            <a href={`mailto:${specialist.email}`} className="flex items-center gap-2 hover:text-[#1D9E75]">
                                                <Mail className="w-4 h-4" />
                                                {specialist.email}
                                            </a>
                                        )}
                                        {specialist.website && (
                                            <a href={specialist.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-[#1D9E75]">
                                                <Globe className="w-4 h-4" />
                                                Visitar site
                                            </a>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="py-8 px-4 border-t border-[#EBE9E1] mt-12">
                <div className="max-w-7xl mx-auto text-center text-sm text-[#787875]">
                    <p>© {new Date().getFullYear()} Exagram. Todos os direitos reservados.</p>
                    <div className="flex justify-center gap-4 mt-2">
                        <Link to="/termos" className="hover:text-[#1D9E75]">Termos</Link>
                        <Link to="/privacidade" className="hover:text-[#1D9E75]">Privacidade</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
