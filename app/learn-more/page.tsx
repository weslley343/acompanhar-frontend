import Image from "next/image";

const sections = [
  {
    badge: "1. WHAT",
    title: "O que é o projeto?",
    subtitle: "Um sistema digital que utiliza sistemas de recomendação aplicados a escalas de avaliação do espectro autista (CARS-BR, ICA e ATEC) para sugerir possíveis melhorias e pontos de atenção com base em pacientes semelhantes.",
    content: "A plataforma permite que profissionais registrem avaliações e recebam insights personalizados de forma segura, anônima e baseada em dados.",
    image: "/diagrams/sr.png",
    icon: (
      <svg className="w-12 h-12 mb-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.989-2.386l-.548-.547z" />
      </svg>
    )
  },
  {
    badge: "2. WHY",
    title: "Por que o projeto existe?",
    subtitle: "Porque profissionais e responsáveis frequentemente carecem de ferramentas que ajudem a comparar avaliações ao longo do tempo e facilitem identificar padrões.",
    content: "O sistema melhora a análise clínica, reduz subjetividade e oferece recomendações consistentes e fundamentadas, preservando totalmente a privacidade (LGPD).",
    image: "/diagrams/logic.png",
    icon: (
      <svg className="w-12 h-12 mb-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  },
  {
    badge: "3. WHO",
    title: "Para quem é?",
    subtitle: "Profissionais da saúde (psicólogos, neuropediatras, terapeutas), clínicas, pesquisadores e pais/responsáveis.",
    content: "Focado em quem precisa de análises padronizadas e acompanhamento da evolução terapêutica de forma clara e visual.",
    image: null,
    icon: (
      <svg className="w-12 h-12 mb-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    )
  },
  {
    badge: "4. WHERE",
    title: "Onde é utilizado?",
    subtitle: "Em qualquer dispositivo — smartphone, tablet ou computador — através de uma interface web responsiva.",
    content: "O backend roda em um ambiente seguro (Django), com anonimização e regras de privacidade compatíveis com a LGPD.",
    image: "/screens/home.png",
    icon: (
      <svg className="w-12 h-12 mb-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
      </svg>
    )
  },
  {
    badge: "5. WHEN",
    title: "Quando é aplicado?",
    subtitle: "Durante avaliações clínicas com CARS-BR, ICA ou ATEC, ou ao comparar resultados entre sessões.",
    content: "Ideal para visualizar tendências, gerar recomendações personalizadas ou realizar estudos de caso com grupos amostrais.",
    image: "/screens/RealizaçãoTeste.png",
    icon: (
      <svg className="w-12 h-12 mb-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  },
  {
    badge: "6. HOW",
    title: "Como funciona?",
    subtitle: "O profissional registra avaliações e o sistema compara os dados com uma base populacional para calcular similaridades.",
    content: "Gera recomendações e insights visuais com gráficos e indicadores, utilizando técnicas avançadas de ciência de dados.",
    image: "/diagrams/der.jpg",
    icon: (
      <svg className="w-12 h-12 mb-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    )
  },
  {
    badge: "7. HOW MUCH",
    title: "Quanto custa?",
    subtitle: "Disponível gratuitamente como parte do projeto acadêmico.",
    content: "Desenvolvido para democratizar o acesso a ferramentas de análise clínica baseadas em evidências.",
    image: null,
    icon: (
      <svg className="w-12 h-12 mb-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  }
];

export default function LearnMore() {
  return (
    <div className="h-screen overflow-y-auto snap-y snap-mandatory scroll-smooth bg-secondary text-foreground">
      {sections.map((section, index) => (
        <section key={index} className="relative h-screen w-full flex flex-col justify-center items-center snap-start p-6 md:p-12 overflow-hidden">
          {/* Background Decorations */}
          <div className="absolute inset-0 pointer-events-none z-0">
            <div className={`absolute top-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full bg-primary/5 blur-[120px]`} />
            <div className={`absolute bottom-[-10%] left-[-10%] w-[300px] h-[300px] rounded-full bg-primary/5 blur-[120px]`} />
          </div>

          <div className="relative z-10 max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16 items-center animate-fade-in-up">
            <div className="flex flex-col gap-6 order-2 lg:order-1">
              <span className="inline-block self-start px-4 py-1.5 bg-primary/10 text-primary rounded-full text-xs md:text-sm font-bold uppercase tracking-widest">
                {section.badge}
              </span>
              
              <div className="flex items-center gap-4">
                {section.icon}
                <h2 className="text-3xl md:text-5xl lg:text-6xl font-black leading-tight tracking-tighter text-white">
                  {section.title}
                </h2>
              </div>
              
              <p className="text-lg md:text-xl text-white/80 font-medium leading-relaxed">
                {section.subtitle}
              </p>
              
              <div className="p-6 md:p-8 rounded-3xl bg-tertiary border border-white/5 shadow-2xl shadow-black/40 transition-all hover:border-primary/20">
                <p className="text-sm md:text-base leading-relaxed text-white/70">
                  {section.content}
                </p>
              </div>
            </div>

            {section.image && (
              <div className="relative aspect-video lg:aspect-square w-full rounded-3xl overflow-hidden border border-white/10 shadow-2xl order-1 lg:order-2 group">
                <Image
                  src={section.image}
                  alt={section.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  priority={index === 0}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-secondary/60 to-transparent pointer-events-none" />
              </div>
            )}
          </div>

          {index < sections.length - 1 && (
            <div className="absolute bottom-6 md:bottom-10 animate-bounce opacity-30 text-primary">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          )}
        </section>
      ))}
    </div>
  );
}
