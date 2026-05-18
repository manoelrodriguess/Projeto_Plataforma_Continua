import {
  BarChart3,
  BookMarked,
  Check,
  Hand,
  Lightbulb,
  RotateCw,
  Rocket,
  Users,
  Zap,
  type LucideIcon,
} from 'lucide-react';

export interface LessonModule {
  id: number;
  title: string;
  time: number;
  paragraphs: string[];
  highlights: string[];
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

export interface Course {
  id: number;
  title: string;
  description: string;
  icon: LucideIcon;
  level: string;
  modules: LessonModule[];
}

export type ProgressState = Record<number, number[]>;
export type AttemptsState = Record<string, number>;

export interface DiagnosticAnswers {
  pain: string;
  time: string;
  area: string;
  format: string;
}

export interface DashboardStats {
  overall: number;
  completedModules: number;
  totalMinutes: number;
  studyHours: number;
  activeCourses: number;
  completedCourses: number;
  developedCompetencies: number;
  estimatedHoursSaved: number;
}

export const currentUser = {
  name: 'Servidor P\u00fablico',
  initials: 'SP',
};

export const storageKeys = {
  progress: 'innovagov-progress',
  attempts: 'innovagov-attempts',
  theme: 'innovagov-compact-mode',
  diagnostic: 'innovagov-diagnostic',
};

export const legacyStorageKeys = {
  progress: 'capacitagov-progress',
  attempts: 'capacitagov-attempts',
  theme: 'capacitagov-compact-mode',
  diagnostic: 'capacitagov-diagnostic',
};

export const recommendedTrailLimit = 4;

export const courses: Course[] = [
  {
    id: 1,
    title: 'Inovação no Setor Público',
    description: 'Aprenda princípios de inovação aplicados ao contexto governamental.',
    icon: Rocket,
    level: 'Básico',
    modules: [
      {
        id: 1,
        title: 'Conceitos Fundamentais',
        time: 15,
        paragraphs: [
          'Inovar no setor público é implementar ideias novas ou melhoradas que geram valor real para servidores, gestores e cidadãos.',
          'A inovação pode aparecer em tecnologia, processos, atendimento, gestão de pessoas e novas formas de colaboração.',
        ],
        highlights: ['Valor público antes de novidade', 'Experimentação com responsabilidade', 'Melhoria mensurável dos serviços'],
        question: 'Qual é a definição mais adequada de inovação pública?',
        options: ['Usar qualquer tecnologia nova', 'Implementar ideias que geram valor público real', 'Trocar todos os sistemas atuais', 'Copiar práticas privadas sem adaptação'],
        correct: 1,
        explanation: 'Inovação pública precisa gerar valor e impacto. Tecnologia pode ajudar, mas não é o objetivo por si só.',
      },
      {
        id: 2,
        title: 'Barreiras à Inovação',
        time: 12,
        paragraphs: [
          'As maiores barreiras costumam ser culturais e institucionais: medo de errar, excesso de burocracia e pouca integração entre equipes.',
          'Superar essas barreiras exige patrocínio, comunicação clara, pequenos testes e aprendizado contínuo.',
        ],
        highlights: ['Resistência à mudança', 'Processos pouco flexíveis', 'Baixa segurança para testar'],
        question: 'Qual barreira costuma travar a inovação com mais frequência?',
        options: ['Cultura burocrática e resistência à mudança', 'Falta total de computadores', 'Excesso de cidadãos interessados', 'Cursos muito curtos'],
        correct: 0,
        explanation: 'Recursos importam, mas cultura e resistência à mudança costumam bloquear até soluções simples.',
      },
      {
        id: 3,
        title: 'Medindo Impacto',
        time: 18,
        paragraphs: [
          'Uma boa iniciativa precisa mostrar resultados por meio de indicadores de eficiência, qualidade e satisfação do usuário.',
          'Medir impacto ajuda a decidir se a solução deve ser ampliada, ajustada ou encerrada.',
        ],
        highlights: ['Tempo economizado', 'Satisfação do usuário', 'Redução de custo ou retrabalho'],
        question: 'Como medir o impacto de uma inovação?',
        options: ['Apenas por opinião informal', 'Não é possível medir inovação', 'Com métricas de eficiência, qualidade e impacto', 'Somente pela quantidade de reuniões'],
        correct: 2,
        explanation: 'Indicadores objetivos e feedback dos usuários dão base para avaliar o impacto real.',
      },
    ],
  },
  {
    id: 2,
    title: 'Design Thinking',
    description: 'Use empatia, definição de problemas e prototipação para resolver desafios complexos.',
    icon: Lightbulb,
    level: 'Intermediário',
    modules: [
      {
        id: 1,
        title: 'Empatia com o Usuário',
        time: 14,
        paragraphs: [
          'Design Thinking começa pela compreensão profunda das pessoas afetadas por um serviço ou problema.',
          'Entrevistas, observação e análise de jornada ajudam a revelar necessidades que não aparecem em relatórios frios.',
        ],
        highlights: ['Ouvir usuários reais', 'Observar rotinas', 'Mapear dores e expectativas'],
        question: 'Qual é o ponto de partida do Design Thinking?',
        options: ['Comprar uma ferramenta', 'Empatia com as pessoas usuárias', 'Escrever uma norma extensa', 'Definir a solução antes do problema'],
        correct: 1,
        explanation: 'A etapa de empatia reduz achismos e coloca o usuário no centro da solução.',
      },
      {
        id: 2,
        title: 'Ideação e Priorização',
        time: 16,
        paragraphs: [
          'Depois de entender o problema, a equipe gera alternativas e prioriza ideias viáveis, desejáveis e capazes de gerar impacto.',
          'A diversidade de perfis melhora a qualidade das ideias e reduz pontos cegos.',
        ],
        highlights: ['Divergir antes de convergir', 'Priorizar impacto e viabilidade', 'Combinar ideias complementares'],
        question: 'O que deve orientar a priorização das ideias?',
        options: ['A ideia da pessoa mais antiga', 'Impacto, viabilidade e valor para o usuário', 'A opção mais cara', 'A primeira ideia citada'],
        correct: 1,
        explanation: 'Boas ideias precisam ser úteis para o usuário e possíveis de implementar no contexto real.',
      },
      {
        id: 3,
        title: 'Prototipação',
        time: 13,
        paragraphs: [
          'Protótipos são versões simples da solução usadas para aprender rápido antes de investir pesado.',
          'Eles podem ser fluxos desenhados, telas clicáveis, scripts de atendimento ou simulações de processo.',
        ],
        highlights: ['Testar cedo', 'Aprender com baixo custo', 'Ajustar antes de escalar'],
        question: 'Por que criar protótipos?',
        options: ['Para aprender rápido com baixo custo', 'Para substituir a implementação final', 'Para evitar conversar com usuários', 'Para encerrar o projeto'],
        correct: 0,
        explanation: 'Protótipos antecipam aprendizados e reduzem risco antes da implementação completa.',
      },
    ],
  },
  {
    id: 3,
    title: 'Agilidade no Governo',
    description: 'Implemente práticas ágeis para melhorar entregas e colaboração entre equipes.',
    icon: Zap,
    level: 'Intermediário',
    modules: [
      {
        id: 1,
        title: 'Princípios Ágeis',
        time: 12,
        paragraphs: [
          'Agilidade é uma forma de trabalhar com ciclos curtos, transparência e adaptação contínua.',
          'No governo, ela ajuda equipes a entregar valor em etapas sem perder governança.',
        ],
        highlights: ['Ciclos curtos', 'Feedback constante', 'Transparência do trabalho'],
        question: 'O que caracteriza uma abordagem ágil?',
        options: ['Planejamento imutável por anos', 'Ciclos curtos com feedback contínuo', 'Mais documentos e menos entrega', 'Trabalho sem prioridades'],
        correct: 1,
        explanation: 'Agilidade combina planejamento suficiente com aprendizado e adaptação ao longo do caminho.',
      },
      {
        id: 2,
        title: 'Kanban para Serviços',
        time: 15,
        paragraphs: [
          'Kanban torna o fluxo de trabalho visível e ajuda a controlar gargalos.',
          'Quadros com etapas claras permitem acompanhar demandas, responsáveis e prazos de forma simples.',
        ],
        highlights: ['Visualizar o fluxo', 'Limitar trabalho em andamento', 'Melhorar continuamente'],
        question: 'Qual benefício direto do Kanban?',
        options: ['Esconder gargalos', 'Visualizar o fluxo de trabalho', 'Eliminar qualquer reunião', 'Garantir orçamento infinito'],
        correct: 1,
        explanation: 'Ao visualizar o fluxo, a equipe identifica gargalos e melhora a gestão das demandas.',
      },
      {
        id: 3,
        title: 'Retrospectivas',
        time: 10,
        paragraphs: [
          'Retrospectivas são encontros para analisar o que funcionou, o que atrapalhou e quais melhorias serão testadas.',
          'Elas devem terminar com ações pequenas, responsáveis definidos e acompanhamento.',
        ],
        highlights: ['Aprendizado em equipe', 'Ações concretas', 'Melhoria contínua'],
        question: 'Qual é o objetivo de uma retrospectiva?',
        options: ['Culpar pessoas', 'Aprender e definir melhorias práticas', 'Cancelar entregas', 'Substituir todos os indicadores'],
        correct: 1,
        explanation: 'A retrospectiva foca aprendizado coletivo e melhorias reais no processo de trabalho.',
      },
    ],
  },
  {
    id: 4,
    title: 'Transformação Digital',
    description: 'Modernize processos administrativos com serviços digitais centrados no cidadão.',
    icon: RotateCw,
    level: 'Avançado',
    modules: [
      {
        id: 1,
        title: 'Serviços Digitais',
        time: 18,
        paragraphs: [
          'Transformação digital não é digitalizar burocracia ruim. É redesenhar serviços para serem simples, acessíveis e integrados.',
          'A jornada do cidadão deve orientar prioridades e eliminar etapas desnecessárias.',
        ],
        highlights: ['Simplicidade', 'Acessibilidade', 'Integração entre órgãos'],
        question: 'O que uma transformação digital efetiva deve fazer?',
        options: ['Apenas trocar papel por PDF', 'Redesenhar serviços com foco no cidadão', 'Criar mais senhas', 'Aumentar etapas presenciais'],
        correct: 1,
        explanation: 'Digitalizar sem simplificar mantém o problema. O foco deve ser a experiência e o valor do serviço.',
      },
      {
        id: 2,
        title: 'Dados para Decisão',
        time: 16,
        paragraphs: [
          'Dados ajudam a priorizar melhorias, monitorar serviços e identificar desigualdades no acesso.',
          'Qualidade, segurança e governança são essenciais para que os dados sejam confiáveis.',
        ],
        highlights: ['Indicadores confiáveis', 'Governança de dados', 'Privacidade e segurança'],
        question: 'Por que dados são importantes na transformação digital?',
        options: ['Para decidir por evidências', 'Para substituir todos os servidores', 'Para evitar transparência', 'Para complicar relatórios'],
        correct: 0,
        explanation: 'Dados bem governados apoiam decisões melhores e permitem acompanhar resultados.',
      },
      {
        id: 3,
        title: 'Adoção e Sustentação',
        time: 14,
        paragraphs: [
          'Uma solução digital só gera valor quando as pessoas conseguem adotá-la no dia a dia.',
          'Treinamento, suporte, comunicação e monitoramento sustentam a mudança depois do lançamento.',
        ],
        highlights: ['Capacitação', 'Suporte contínuo', 'Monitoramento pós-lançamento'],
        question: 'O que sustenta uma solução digital depois do lançamento?',
        options: ['Abandonar o acompanhamento', 'Treinamento, suporte e monitoramento', 'Remover canais de ajuda', 'Não ouvir usuários'],
        correct: 1,
        explanation: 'Adoção depende de suporte contínuo e ajustes baseados no uso real.',
      },
    ],
  },
  {
    id: 5,
    title: 'Atendimento ao Cidadão',
    description: 'Aprimore escuta, linguagem simples e resolução de demandas em serviços públicos.',
    icon: Users,
    level: 'Básico',
    modules: [
      {
        id: 1,
        title: 'Escuta Ativa no Serviço Público',
        time: 12,
        paragraphs: [
          'Atendimento humanizado começa por reconhecer a situação da pessoa usuária e compreender sua necessidade real antes de encaminhar a demanda.',
          'Perguntas abertas, confirmação do entendimento e comunicação respeitosa reduzem retrabalho e aumentam confiança no serviço.',
        ],
        highlights: ['Escuta sem julgamento', 'Confirmação da demanda', 'Encaminhamento responsável'],
        question: 'Qual prática fortalece a escuta ativa no atendimento?',
        options: ['Interromper para acelerar a fila', 'Confirmar o entendimento antes de orientar', 'Responder com termos técnicos', 'Encaminhar sem registrar contexto'],
        correct: 1,
        explanation: 'Confirmar o entendimento evita encaminhamentos errados e demonstra respeito pela necessidade apresentada.',
      },
      {
        id: 2,
        title: 'Linguagem Simples',
        time: 14,
        paragraphs: [
          'Linguagem simples torna informações públicas mais claras, diretas e acessíveis para diferentes perfis de cidadãos.',
          'Textos, formulários e respostas devem priorizar termos conhecidos, ordem lógica e instruções objetivas.',
        ],
        highlights: ['Clareza nas orientações', 'Menos juridiquês', 'Acesso inclusivo'],
        question: 'O que caracteriza uma comunicação em linguagem simples?',
        options: ['Frases longas e formais', 'Uso de siglas sem explicação', 'Orientações claras e diretas', 'Cópia integral de normas'],
        correct: 2,
        explanation: 'Linguagem simples mantém rigor, mas apresenta a informação de forma compreensível e acionável.',
      },
      {
        id: 3,
        title: 'Gestão de Demandas',
        time: 15,
        paragraphs: [
          'Demandas bem registradas permitem acompanhar prazos, identificar recorrências e melhorar a qualidade do serviço.',
          'Classificação, priorização e retorno ao cidadão ajudam a equipe a atuar com transparência.',
        ],
        highlights: ['Registro padronizado', 'Priorização transparente', 'Retorno ao cidadão'],
        question: 'Por que classificar demandas de atendimento?',
        options: ['Para esconder atrasos', 'Para organizar prioridades e recorrências', 'Para impedir novos pedidos', 'Para substituir a escuta'],
        correct: 1,
        explanation: 'Classificar demandas ajuda a enxergar padrões, priorizar corretamente e planejar melhorias.',
      },
    ],
  },
  {
    id: 6,
    title: 'Gestão de Projetos Públicos',
    description: 'Planeje entregas, riscos, partes interessadas e resultados em iniciativas governamentais.',
    icon: BookMarked,
    level: 'Intermediário',
    modules: [
      {
        id: 1,
        title: 'Objetivos e Escopo',
        time: 16,
        paragraphs: [
          'Projetos públicos precisam declarar problema, público beneficiado, entregas e critérios de sucesso desde o início.',
          'Um escopo bem definido reduz dispersão e facilita pactos com gestores, equipes técnicas e usuários do serviço.',
        ],
        highlights: ['Problema claro', 'Entregas pactuadas', 'Critérios de sucesso'],
        question: 'O que ajuda a manter um projeto público bem direcionado?',
        options: ['Escopo indefinido', 'Objetivos e entregas claros', 'Mudanças sem registro', 'Ausência de indicadores'],
        correct: 1,
        explanation: 'Objetivos e entregas claros ajudam a alinhar expectativas e acompanhar avanço real.',
      },
      {
        id: 2,
        title: 'Riscos e Governança',
        time: 18,
        paragraphs: [
          'Riscos devem ser identificados cedo, avaliados por impacto e probabilidade, e acompanhados durante a execução.',
          'Governança define papéis, decisões, canais de prestação de contas e momentos de revisão.',
        ],
        highlights: ['Mapa de riscos', 'Papéis definidos', 'Ritos de decisão'],
        question: 'Como tratar riscos em projetos públicos?',
        options: ['Ignorar até acontecerem', 'Registrar, avaliar e acompanhar respostas', 'Transferir todos para a equipe técnica', 'Evitar qualquer decisão'],
        correct: 1,
        explanation: 'Riscos acompanhados com método reduzem surpresas e melhoram a tomada de decisão.',
      },
      {
        id: 3,
        title: 'Monitoramento de Resultados',
        time: 17,
        paragraphs: [
          'Monitorar resultados permite comparar entregas previstas, entregas realizadas e benefícios alcançados.',
          'Indicadores simples e revisões periódicas ajudam a corrigir rota antes que o projeto perca valor.',
        ],
        highlights: ['Indicadores de entrega', 'Benefícios esperados', 'Revisão de rota'],
        question: 'Qual é a função do monitoramento em projetos?',
        options: ['Apenas gerar relatórios longos', 'Acompanhar resultados e apoiar ajustes', 'Encerrar a participação da equipe', 'Eliminar toda mudança'],
        correct: 1,
        explanation: 'Monitoramento mostra se o projeto está produzindo valor e onde precisa de ajuste.',
      },
    ],
  },
  {
    id: 7,
    title: 'Dados e Indicadores para Políticas Públicas',
    description: 'Use evidências, painéis e indicadores para priorizar ações e acompanhar resultados.',
    icon: BarChart3,
    level: 'Intermediário',
    modules: [
      {
        id: 1,
        title: 'Indicadores Úteis',
        time: 15,
        paragraphs: [
          'Indicadores úteis conectam uma pergunta de gestão a uma medida que pode orientar decisão.',
          'Eles precisam ter fonte conhecida, periodicidade definida e interpretação simples para a equipe.',
        ],
        highlights: ['Pergunta de gestão', 'Fonte confiável', 'Periodicidade definida'],
        question: 'O que torna um indicador útil para gestão pública?',
        options: ['Ser difícil de explicar', 'Responder a uma pergunta de decisão', 'Não ter fonte definida', 'Mudar todo dia sem critério'],
        correct: 1,
        explanation: 'Um bom indicador ajuda a decidir e precisa ser compreendido por quem usa a informação.',
      },
      {
        id: 2,
        title: 'Painéis para Acompanhamento',
        time: 16,
        paragraphs: [
          'Painéis devem destacar poucos indicadores essenciais, com contexto suficiente para apoiar análise rápida.',
          'Cores, filtros e comparações precisam facilitar leitura sem esconder limitações dos dados.',
        ],
        highlights: ['Poucos sinais vitais', 'Contexto para leitura', 'Comparações consistentes'],
        question: 'Qual cuidado melhora um painel de indicadores?',
        options: ['Exibir todos os dados possíveis', 'Selecionar indicadores essenciais e comparáveis', 'Remover contexto', 'Usar cores sem significado'],
        correct: 1,
        explanation: 'Painéis efetivos priorizam clareza e foco nos indicadores que orientam ação.',
      },
      {
        id: 3,
        title: 'Decisão Baseada em Evidências',
        time: 17,
        paragraphs: [
          'Evidências combinam dados administrativos, escuta dos usuários, avaliações e conhecimento das equipes.',
          'Decisões melhores surgem quando dados são usados para aprender, não apenas para justificar escolhas já feitas.',
        ],
        highlights: ['Dados administrativos', 'Avaliação de resultados', 'Aprendizado institucional'],
        question: 'Como evidências devem apoiar decisões?',
        options: ['Confirmando qualquer opinião', 'Combinando dados e análise do contexto', 'Substituindo diálogo com usuários', 'Eliminando revisão'],
        correct: 1,
        explanation: 'Evidências ganham força quando são interpretadas junto com contexto e finalidade pública.',
      },
    ],
  },
  {
    id: 8,
    title: 'Ética, LGPD e Segurança da Informação',
    description: 'Proteja dados pessoais, reduza riscos e fortaleça a confiança nos serviços públicos digitais.',
    icon: Check,
    level: 'Avançado',
    modules: [
      {
        id: 1,
        title: 'Proteção de Dados Pessoais',
        time: 18,
        paragraphs: [
          'Dados pessoais devem ser tratados com finalidade clara, base adequada e acesso limitado ao necessário.',
          'Boas práticas de privacidade reduzem exposição indevida e fortalecem a confiança da população.',
        ],
        highlights: ['Finalidade definida', 'Acesso necessário', 'Transparência no tratamento'],
        question: 'Qual princípio orienta o uso responsável de dados pessoais?',
        options: ['Coletar tudo por precaução', 'Usar apenas o necessário para finalidade clara', 'Compartilhar sem controle', 'Guardar sem prazo'],
        correct: 1,
        explanation: 'Minimizar dados e declarar finalidade são práticas centrais para proteção de dados.',
      },
      {
        id: 2,
        title: 'Segurança no Dia a Dia',
        time: 14,
        paragraphs: [
          'Segurança da informação depende de hábitos cotidianos: senhas fortes, atenção a links, atualização de sistemas e cuidado com compartilhamentos.',
          'Pequenas falhas operacionais podem comprometer serviços inteiros quando não há orientação e controle.',
        ],
        highlights: ['Senhas fortes', 'Cuidado com links', 'Compartilhamento responsável'],
        question: 'Qual atitude reduz risco de segurança da informação?',
        options: ['Reutilizar senhas simples', 'Conferir links e canais antes de informar dados', 'Enviar planilhas sensíveis sem controle', 'Ignorar atualizações'],
        correct: 1,
        explanation: 'Verificar canais e links reduz exposição a golpes e vazamentos.',
      },
      {
        id: 3,
        title: 'Ética no Uso de Tecnologia',
        time: 16,
        paragraphs: [
          'Tecnologias públicas precisam ser avaliadas quanto a transparência, inclusão, vieses e impactos sobre direitos.',
          'A decisão ética considera eficiência, mas também riscos, explicabilidade e possibilidade de contestação pelo cidadão.',
        ],
        highlights: ['Transparência', 'Inclusão digital', 'Responsabilidade pública'],
        question: 'O que uma análise ética de tecnologia deve considerar?',
        options: ['Apenas velocidade', 'Impactos, transparência e direitos', 'Somente custo de licença', 'Preferência pessoal da equipe'],
        correct: 1,
        explanation: 'Uso ético de tecnologia exige olhar para efeitos sobre pessoas, direitos e confiança pública.',
      },
    ],
  },
  {
    id: 9,
    title: 'Comunicação Pública e Facilitação',
    description: 'Conduza reuniões, oficinas e comunicações internas com foco, clareza e participação.',
    icon: Hand,
    level: 'Básico',
    modules: [
      {
        id: 1,
        title: 'Reuniões Produtivas',
        time: 11,
        paragraphs: [
          'Reuniões produtivas têm objetivo claro, pauta enxuta, papéis definidos e encaminhamentos registrados.',
          'Quando a equipe sabe o que será decidido, a reunião deixa de ser apenas informe e passa a gerar avanço.',
        ],
        highlights: ['Objetivo claro', 'Pauta enxuta', 'Encaminhamentos registrados'],
        question: 'O que aumenta a efetividade de uma reunião?',
        options: ['Pauta indefinida', 'Objetivo e encaminhamentos claros', 'Convocar todos sempre', 'Evitar decisões'],
        correct: 1,
        explanation: 'Objetivo e encaminhamentos claros tornam a reunião útil e rastreável.',
      },
      {
        id: 2,
        title: 'Facilitação de Oficinas',
        time: 15,
        paragraphs: [
          'Facilitar oficinas é criar condições para que pessoas contribuam, organizem ideias e cheguem a decisões práticas.',
          'Dinâmicas simples, tempo bem distribuído e sínteses visuais ajudam a transformar debate em ação.',
        ],
        highlights: ['Participação equilibrada', 'Síntese visual', 'Decisão prática'],
        question: 'Qual é o papel da facilitação em uma oficina?',
        options: ['Impor a opinião do facilitador', 'Organizar participação e apoiar decisões', 'Evitar divergências', 'Substituir o planejamento'],
        correct: 1,
        explanation: 'Facilitação ajuda o grupo a pensar melhor junto e sair com próximos passos claros.',
      },
      {
        id: 3,
        title: 'Comunicação Interna',
        time: 12,
        paragraphs: [
          'Comunicação interna eficiente reduz ruídos, alinha prioridades e dá visibilidade às decisões que afetam o trabalho.',
          'Canais, frequência e responsáveis precisam ser combinados para evitar excesso de mensagens e perda de informação.',
        ],
        highlights: ['Canais definidos', 'Mensagens objetivas', 'Ritmo combinado'],
        question: 'O que reduz ruído na comunicação interna?',
        options: ['Mensagens duplicadas em todos os canais', 'Canais e responsáveis definidos', 'Decisões sem registro', 'Informações sempre urgentes'],
        correct: 1,
        explanation: 'Combinar canais e responsáveis torna a comunicação mais previsível e menos dispersa.',
      },
    ],
  },
];

export const demoProgress: ProgressState = {
  1: [1, 2, 3],
  2: [1, 2],
  3: [1],
  4: [],
  5: [],
  6: [],
  7: [],
  8: [],
  9: [],
};

export const defaultDiagnostic: DiagnosticAnswers = {
  pain: 'Tenho pouco tempo e preciso de aulas objetivas.',
  time: '2 horas por semana',
  area: 'Modernização administrativa',
  format: 'Conteúdo curto com prática guiada',
};

export const courseCompetencies: Record<number, string[]> = {
  1: ['Inovação pública', 'Mensuração de impacto', 'Melhoria de serviços'],
  2: ['Empatia com usuários', 'Prototipação', 'Priorização de soluções'],
  3: ['Gestão visual', 'Trabalho em ciclos curtos', 'Melhoria contínua'],
  4: ['Serviços digitais', 'Governança de dados', 'Adoção de tecnologia'],
  5: ['Atendimento humanizado', 'Linguagem simples', 'Gestão de demandas'],
  6: ['Gestão de projetos', 'Governança', 'Monitoramento de resultados'],
  7: ['Indicadores públicos', 'Análise de dados', 'Decisão por evidências'],
  8: ['Proteção de dados', 'Segurança da informação', 'Ética digital'],
  9: ['Comunicação pública', 'Facilitação', 'Reuniões produtivas'],
};

export function clampPercent(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function scoreCourseRecommendation(courseId: number, diagnostic: DiagnosticAnswers) {
  const scoreGroups = [
    diagnostic.area.includes('Digital') ? [4, 8, 7, 3, 1] : [],
    diagnostic.area.includes('Atendimento') ? [5, 9, 2, 1, 7] : [],
    diagnostic.area.includes('Dados') ? [7, 4, 6, 8, 1] : [],
    diagnostic.area.includes('Projetos') ? [6, 3, 1, 7, 9] : [],
    diagnostic.area.includes('Modernização') ? [1, 3, 6, 4, 2] : [],
    diagnostic.pain.includes('pouco tempo') ? [9, 5, 3, 1, 8] : [],
    diagnostic.pain.includes('teóricos') ? [2, 6, 9, 5, 3] : [],
    diagnostic.pain.includes('ferramentas digitais') ? [4, 8, 7, 1, 3] : [],
    diagnostic.pain.includes('dados') ? [7, 6, 4, 8, 1] : [],
    diagnostic.pain.includes('atendimento') ? [5, 9, 2, 1, 6] : [],
    diagnostic.time.includes('1 hora') ? [9, 5, 3, 1, 8] : [],
    diagnostic.time.includes('4 horas') ? [6, 4, 7, 8, 2] : [],
    diagnostic.format.includes('certificação') ? [6, 4, 8, 7, 1] : [],
    diagnostic.format.includes('consulta rápida') ? [9, 7, 8, 5, 3] : [],
    diagnostic.format.includes('prática guiada') ? [2, 3, 5, 6, 1] : [],
  ];

  return scoreGroups.reduce((total, group) => {
    const index = group.indexOf(courseId);
    return index >= 0 ? total + group.length - index : total;
  }, 0);
}
