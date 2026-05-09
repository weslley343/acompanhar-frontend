'use client';

import { useState, useEffect } from 'react';
import { 
  RiLightbulbLine, 
  RiSendPlane2Line, 
  RiHistoryLine, 
  RiTimeLine, 
  RiCheckboxCircleLine, 
  RiDeleteBin7Line,
  RiQuestionAnswerLine,
  RiUserStarLine,
  RiChat1Line,
  RiGlobalLine
} from 'react-icons/ri';
import { suggestionService } from '@/lib/api/suggestions';
import { Suggestion } from '@/types/suggestion';
import { useAuthStore } from '@/lib/stores/store';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type SuggestionTab = 'me' | 'all';

export default function Suggestions() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<SuggestionTab>('me');
  const [content, setContent] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Admin response state
  const [respondingTo, setRespondingTo] = useState<number | null>(null);
  const [adminResponse, setAdminResponse] = useState('');

  const fetchSuggestions = async () => {
    try {
      setLoading(true);
      if (activeTab === 'all' || user?.role === 'admin') {
        const response = await suggestionService.getSuggestions();
        setSuggestions(Array.isArray(response.data) ? response.data : (Array.isArray(response) ? response : []));
      } else {
        const response: any = await suggestionService.getMySuggestions();
        const data = response.data || response;
        setSuggestions(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to fetch suggestions', err);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, [user, activeTab]);

  const handleSubmit = async () => {
    if (content.length < 5) {
      setError('A sugestão deve ter pelo menos 5 caracteres.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await suggestionService.createSuggestion({ content });
      setContent('');
      setActiveTab('me'); // Switch to my suggestions after sending
      fetchSuggestions();
    } catch (err) {
      setError('Erro ao enviar sugestão. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja remover esta sugestão?')) return;
    try {
      await suggestionService.deleteSuggestion(id);
      setSuggestions(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      console.error('Error deleting suggestion', err);
    }
  };

  const handleRespond = async (id: number) => {
    if (!adminResponse.trim()) return;
    try {
      await suggestionService.respondToSuggestion(id, { response: adminResponse });
      setRespondingTo(null);
      setAdminResponse('');
      fetchSuggestions();
    } catch (err) {
      console.error('Error responding to suggestion', err);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tighter uppercase">FAC</h2>
          <p className="text-white/40 text-sm font-medium">Feedback e Apoio Clínico para melhoria do sistema.</p>
        </div>
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-lg shadow-primary/5">
          <RiLightbulbLine size={28} />
        </div>
      </div>

      {/* Creation form (only for professionals and responsibles) */}
      {user?.role !== 'admin' && (
        <div className="bg-tertiary border border-white/5 p-8 rounded-[2.5rem] space-y-6 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 text-primary/5 -rotate-12 translate-x-4 -translate-y-4">
            <RiChat1Line size={120} />
          </div>
          
          <div className="relative space-y-4">
            <textarea 
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-3xl py-6 px-6 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all resize-none placeholder:text-white/20"
              placeholder="Descreva seu feedback, dúvida ou relate um problema clínico..."
            />
            
            {error && <p className="text-red-400 text-xs font-bold pl-2 uppercase tracking-widest">{error}</p>}

            <button 
              onClick={handleSubmit}
              disabled={submitting || !content.trim()}
              className="w-full py-5 bg-primary text-secondary-dark font-black rounded-2xl transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2 group active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
            >
              <RiSendPlane2Line size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              {submitting ? 'ENVIANDO...' : 'ENVIAR FEEDBACK'}
            </button>
          </div>
        </div>
      )}

      {/* Tabs section */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
          <div className="flex items-center gap-1.5 p-1 bg-white/5 border border-white/5 rounded-2xl">
            <button
              onClick={() => setActiveTab('me')}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                activeTab === 'me' ? "bg-white/10 text-white shadow-lg" : "text-white/30 hover:text-white/50"
              )}
            >
              <RiHistoryLine size={14} />
              {user?.role === 'admin' ? 'Recentes' : 'Meus Envios'}
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                activeTab === 'all' ? "bg-white/10 text-white shadow-lg" : "text-white/30 hover:text-white/50"
              )}
            >
              <RiGlobalLine size={14} />
              Mural da Comunidade
            </button>
          </div>
          {loading && <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin self-center md:self-auto" />}
        </div>
        
        <div className="space-y-4">
          {suggestions.length === 0 && !loading ? (
            <div className="text-center py-12 bg-white/5 border border-dashed border-white/10 rounded-[2rem]">
              <p className="text-white/20 text-xs font-bold uppercase tracking-widest">Nenhum registro no FAC encontrado</p>
            </div>
          ) : (
            suggestions.map((suggestion) => (
              <div 
                key={suggestion.id} 
                className={cn(
                  "bg-tertiary/40 border border-white/5 p-6 rounded-[2rem] space-y-4 transition-all hover:border-white/10",
                  suggestion.status === 'responded' ? "border-l-4 border-l-green-500/50" : "border-l-4 border-l-yellow-500/50"
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-2">
                      <RiUserStarLine size={14} className="text-primary" />
                      <span className="text-[10px] font-black text-white/60 uppercase">
                        {suggestion.professionals?.full_name || suggestion.responsibles?.full_name || 'Usuário'}
                      </span>
                    </div>
                    <p className="text-white/80 text-sm leading-relaxed">{suggestion.content}</p>
                  </div>
                  {(user?.role === 'admin' || activeTab === 'me') && (
                    <button 
                      onClick={() => handleDelete(suggestion.id)}
                      className="p-2 text-white/10 hover:text-red-400 transition-colors"
                    >
                      <RiDeleteBin7Line size={18} />
                    </button>
                  )}
                </div>

                {/* Response area */}
                {suggestion.response ? (
                  <div className="bg-green-500/5 border border-green-500/10 p-4 rounded-2xl space-y-2">
                    <div className="flex items-center gap-2 text-green-400">
                      <RiQuestionAnswerLine size={14} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Resposta da Equipe</span>
                    </div>
                    <p className="text-green-500/80 text-sm italic">"{suggestion.response}"</p>
                  </div>
                ) : user?.role === 'admin' && respondingTo !== suggestion.id && (
                  <button 
                    onClick={() => setRespondingTo(suggestion.id)}
                    className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline"
                  >
                    Responder ao FAC
                  </button>
                )}

                {/* Admin response input */}
                {respondingTo === suggestion.id && (
                  <div className="space-y-3 pt-2">
                    <textarea 
                      value={adminResponse}
                      onChange={(e) => setAdminResponse(e.target.value)}
                      className="w-full bg-secondary border border-white/10 rounded-2xl p-4 text-sm text-white focus:outline-none focus:border-primary/50"
                      placeholder="Sua resposta..."
                    />
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleRespond(suggestion.id)}
                        className="px-4 py-2 bg-primary text-secondary-dark text-[10px] font-black rounded-xl uppercase tracking-widest"
                      >
                        Enviar Resposta
                      </button>
                      <button 
                        onClick={() => setRespondingTo(null)}
                        className="px-4 py-2 bg-white/5 text-white/40 text-[10px] font-black rounded-xl uppercase tracking-widest"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-white/20">
                      <RiTimeLine size={12} />
                      <span className="text-[9px] font-bold uppercase">
                        {format(new Date(suggestion.created_at), "dd 'de' MMM, yyyy", { locale: ptBR })}
                      </span>
                    </div>
                  </div>
                  
                  <div className={cn(
                    "px-3 py-1 rounded-full flex items-center gap-1.5",
                    suggestion.status === 'responded' ? "bg-green-500/10 text-green-400" : "bg-yellow-500/10 text-yellow-400"
                  )}>
                    {suggestion.status === 'responded' ? <RiCheckboxCircleLine size={12} /> : <RiTimeLine size={12} />}
                    <span className="text-[9px] font-black uppercase tracking-widest">
                      {suggestion.status === 'responded' ? 'Respondido' : 'Pendente'}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
