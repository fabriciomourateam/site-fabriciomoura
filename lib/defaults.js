// Conteúdo padrão do site. O CMS (/admin) salva uma cópia editável deste objeto.
// Nos textos: **palavra** = negrito (nos títulos grandes = amarelo). Enter = quebra de linha.
const resA = ["12", "13", "14", "15", "16", "17", "11"];
const resB = ["2", "3", "4", "5", "6", "7", "8", "9", "1"];
const ALT_RES = "Antes e depois de aluno do Time Fabricio Moura";

export const DEFAULT_CONTENT = {
  seo: {
    title: "Fabricio Moura | Nutrição e Treinamento",
    description: "Consiga um físico forte e definido, sem treinos malucos, sem abrir mão de comer o que você gosta e sem passar fome!",
  },
  contato: {
    whatsapp: "5511914849797",
    msgPadrao: "{cod} Oi Fabricio!! Vim através do seu site! Gostaria de saber como funciona seu acompanhamento.",
    msgAgendar: "{cod} Oi Fabricio!! Vim através do seu site! Quero agendar um horário.",
    instagram: "https://www.instagram.com/fabriciomourateam/",
  },
  rastreio: {
    // Sem GTM: o dono não tem contêiner GTM (a conta Tag Manager está vazia). A conversão
    // "Reunião agendada"/"Venda" vai ao Google Ads OFFLINE, pelo CRM (edge functions
    // google-ads-conversions / google-ads-sales), casada por gclid. O site só captura o
    // gclid e injeta o {cod} no WhatsApp (ver Tracking.jsx) — nada de tag de terceiro.
    gtm: "",
    googleTag: "",
    metaPixel: "",
  },
  hero: {
    titulo: "Perca gordura ganhando músculo",
    subtitulo: "Conquiste a definição que sempre sonhou em um tempo recorde!",
    texto: "Você vai **conseguir um físico forte e definido,** sem treinos malucos, sem abrir mão de comer o que você gosta e sem passar fome!",
    chamada: "Clique abaixo para saber como funciona!",
    botao: "Agendar um horário",
    imgDesktop: { src: "/img/hero-desktop.png", w: 1600, h: 900 },
    imgMobile: { src: "/img/hero-mobile.png", w: 676, h: 682 },
    alt: "Fabricio Moura, Consultoria Premium: transformo o seu corpo em 06 meses",
  },
  dor: {
    titulo: "Eu sei que você não está feliz com seus resultados e eu posso te ajudar!",
    perguntas: "Sua **autoestima** está péssima e você se sente **sem motivação**?\nTem dificuldades em seguir sua **dieta**, pois ela é totalmente fora da sua realidade?\nSeu **treino** não está fazendo nenhum efeito?",
    texto: "Esses problemas são mais comuns do que você imagina e é **por causa deles** que você **não consegue** ter o corpo que tanto deseja!",
    botao: "Quero fazer parte do time",
  },
  resultados1: resA.map((n) => ({ src: `/img/res-a-${n}.png`, w: 1080, h: 1920, alt: ALT_RES })),
  impede: {
    titulo: "Eu sei o que impede os seus resultados:",
    texto: "**Alcançar o físico que você deseja vai além de prescrições genéricas!**\n\nA origem de toda essa dificuldade está na falta de um acompanhamento personalizado e de alguém que esteja ao seu lado durante todo o processo.\nAlguém que te faça ter **RESULTADO DE VERDADE,** de maneira **MAIS RÁPIDA** e **MAIS FÁCIL!**",
    botao: "Quero fazer parte do time",
  },
  resultados2: resB.map((n) => ({ src: `/img/res-b-${n}.png`, w: 1080, h: 1220, alt: ALT_RES })),
  incluso: {
    titulo: "Veja tudo que estará\nincluso no seu **acompanhamento**",
    cardTitulo: "Consultoria\nPremium",
    itens: [
      "Acompanhamento de Perto",
      "Planejamento Alimentar",
      "Planejamento de Treino",
      "Suplementação e Manipulados",
      "Aplicativo de Dieta",
      "Aplicativo de Treino com Vídeos",
      "Avaliação Física Periódica",
      "Suporte diário pelo WhatsApp",
      "Acesso a Comunidade VIP do Time",
      "Área de Membros Exclusiva",
      "Análise de Exames Laboratoriais",
      "Encontro mensal com Psicóloga",
      "Bioimpedância Digital",
    ],
    fundo: { src: "/img/consultoria-premium-bg.webp", w: 1080, h: 1182 },
    fotoAlt: "Fabricio Moura sorrindo, de camisa vinho, segurando o celular",
    botao: "Eu quero agendar um horário",
  },
  quemE: {
    titulo: "Quem é\nFabricio Moura?",
    texto: "Empresário, construiu uma **Equipe de Nutrição**\n**e Treinamento**, contando com nutricionistas e\ntreinadores especializados, já ajudou mais de\n**1000 pessoas** a chegarem no objetivo que\nbuscavam, alcançando um físico estético e\nsaudável!",
    especTitulo: "Especializações do Time:",
    espec: ["BodyBuilding Coach", "Compulsão alimentar", "Ansiedade e emagrecimento", "Hipertrofia e ganho muscular"],
    conquista: "Mais de **12 Títulos no BodyBuilding**",
    fechamento: "Com mais de **18 anos de experiência prática** na\nárea, minha vida inteira tive a musculação, a\nalimentação e a qualidade de vida como base.",
    convite: "E hoje estou aqui pra te convidar para entrar no\nTime e ter sua vida totalmente transformada!",
    fundo: { src: "/img/quem-e-bg.webp", w: 1080, h: 1174 },
    fotoAlt: "Fabricio Moura em foto de fisiculturismo",
    botao: "Quero fazer parte do time de resultados",
  },
  faq: [
    { q: "Qual o diferencial de sua consultoria?", a: "O acompanhamento de perto nos traz uma proximidade muito maior, além disso meu olhar humanizado, clínico, tendo a experiência teórica e prática, vai te trazer o melhor caminho para o resultado que deseja, de forma leve e sem radicalismo." },
    { q: "Você atende apenas atletas?", a: "Não, atendo todo tipo de público, de adolescentes até idosos. Quem deseja emagrecer, ganhar massa muscular, melhorar a qualidade de vida, ter maior performance na vida pessoal e profissional. Incluindo atletas e não atletas." },
    { q: "Quanto tempo para obter os resultados?", a: "Meu papel é facilitar todo o processo para que você tenha resultados eficientes e rápidos, com 1 mês já notará melhora em diversos aspectos do seu físico e saúde." },
  ],
  // Seção de texto extra (aparece antes das perguntas). Deixe o título vazio para esconder.
  pratica: { titulo: "", texto: "" },
  barra: {
    texto: "",
    botaoWhats: "Falar no WhatsApp",
    botaoAgendar: "Agendar horário",
  },
  rodape: {
    legal: "Fabricio Moura, Nutricionista **CRN3 95563/P** | Educador Físico **CREF 201974-G/SP**\nCNPJ 53.348.650/0001-99 | Fabricio Moura Consultoria Esportiva Ltda",
  },
  // Páginas de campanha. Tudo que não estiver aqui vem da página inicial (imagens, carrosséis, artes, rodapé).
  paginas: {
    esportivo: {
      rota: "/acompanhamento-esportivo/",
      seo: {
        title: "Nutricionista Esportivo Online | Fabricio Moura",
        description: "Nutricionista Esportivo Online: perca gordura ganhando músculo com método e garantia de resultados. Acompanhamento individual de nutrição e treino. Fale no WhatsApp.",
      },
      hero: {
        titulo: "Perca gordura ganhando músculo",
        subtitulo: "Conquiste a definição que sempre sonhou em um tempo recorde!",
        texto: "Com o acompanhamento de um **nutricionista esportivo**, você vai conseguir um **físico forte e definido**, sem treinos malucos, sem abrir mão de comer o que gosta e sem passar fome!",
      },
      dor: {
        titulo: "Treina, faz dieta e o corpo travou?\nTe ajudo a mudar isso!",
        perguntas: "Você treina há anos mas o **corpo estagnou**?\nFaz dieta, mas ela é **impossível de seguir** no seu dia a dia?\nSeu treino não está trazendo resultados?",
        texto: "Esses problemas são mais comuns do que você imagina e é **por falta de uma estratégia** de nutrição esportiva individual que você não consegue ter o corpo que tanto deseja!",
      },
      impede: {
        titulo: "O que trava os seus resultados:",
        texto: "Alcançar o físico que você deseja vai muito além de uma dieta genérica de internet!\n\nA diferença está em ter alguém te acompanhando de perto, ajustando a nutrição e o treino para o seu corpo. Alguém que te faça ter **RESULTADO DE VERDADE**, de maneira **MAIS RÁPIDA** e **MAIS FÁCIL**!",
      },
      pratica: {
        titulo: "Como será seu acompanhamento na prática:",
        texto: "O acompanhamento inclui avaliação periódica, plano alimentar personalizado, prescrição de treino, ajustes contínuos, bioimpedância desenvolvida por mim e monitoramento da evolução corporal, tudo projetado para quem treina e quer resultado real, sem planejamentos genéricos.\n\nIremos alinhar alimentação, treino e suplementação para otimizar a composição corporal. O foco está em perda de gordura e ganho de massa muscular, possibilitando resultados estéticos com eficiência e rapidez.\n\nFabricio Moura (CRN3 95563/P) é nutricionista esportivo e também educador físico (CREF 201974-G/SP), o que permite prescrever nutrição e treino de forma integrada no mesmo acompanhamento. Com mais de 2.000 transformações em 7 países e 18 anos de experiência, o atendimento é 100% online, individual e com suporte contínuo, possibilitando um contato muito mais próximo e ágil do que em consultas presenciais.",
      },
      faq: [
        { q: "O que faz um nutricionista esportivo?", a: "O nutricionista esportivo alinha nutrição, treino e performance para melhorar a sua composição corporal, perdendo gordura e ganhando massa muscular, de maneira tranquila e sem radicalismo." },
        { q: "Vale a pena um nutricionista esportivo online?", a: "Sim. O acompanhamento online entrega a mesma estratégia individual, com a flexibilidade de fazer no seu ritmo e de onde você estiver." },
        { q: "Em quanto tempo vejo resultado?", a: "Meu papel é facilitar todo o processo para você ter resultados eficientes e rápidos: já no primeiro mês você nota melhora em diversos aspectos!" },
        { q: "Nutricionista esportivo prescreve treino?", a: "Fabricio Moura é nutricionista (CRN3 95563/P) e também educador físico (CREF 201974-G/SP), o que permite prescrever tanto o plano alimentar quanto o treino de forma integrada. Algo raro no mercado e que potencializa os seus resultados." },
      ],
    },
    online: {
      rota: "/acompanhamento-online/",
      seo: {
        title: "Nutricionista Online | Fabricio Moura",
        description: "Nutricionista Online: perca gordura ganhando músculo com método e garantia de resultados. Acompanhamento individual de nutrição e treino. Um acompanhamento muito mais completo que presencial, onde você pode tirar dúvidas a qualquer momento!",
      },
      hero: {
        titulo: "Nutricionista online: perca gordura ganhando músculo",
        subtitulo: "Conquiste o corpo que sempre sonhou em um tempo recorde!",
        texto: "Com um **Nutricionista Online**, você vai conseguir um **físico forte e definido independente do local onde esteja**, com um acompanhamento **MUITO** mais próximo do que presencial, sem treinos malucos e sem abrir mão de comer o que gosta!",
      },
      dor: {
        titulo: "Rotina corrida, treina, faz dieta e o corpo travou?\nEu posso te ajudar a mudar isso!",
        perguntas: "Você treina há anos mas o **corpo estagnou**?\nFaz dieta, mas ela é **impossível de seguir** no seu dia a dia?\nSeu treino não está trazendo resultados?",
        texto: "Esses obstáculos somem quando você tem um acompanhamento online individual, feito pro seu corpo e pra sua rotina, com alguém te guiando de perto, tirando dúvidas e te orientando sempre que você precisar!",
      },
      impede: {
        titulo: "O que trava os seus resultados:",
        texto: "Seguir uma **dieta genérica** baixada na internet quase nunca dá certo.\n\nA diferença está em ter um nutricionista online te acompanhando de perto, ajustando a dieta e o treino para o seu corpo e de acordo com a sua rotina. Alguém que te faça ter RESULTADO DE VERDADE, de maneira MAIS RÁPIDA e MAIS FÁCIL!",
      },
      pratica: {
        titulo: "Como funciona o acompanhamento com nutricionista online?",
        texto: "O acompanhamento com nutricionista online funciona da mesma forma que o presencial em termos de qualidade e individualização, com a vantagem de flexibilidade geográfica e acesso direto ao profissional por WhatsApp. Todas as consultas, avaliações e ajustes são feitos de forma remota, com avaliação por fotos, peso, medidas, dados antropométricos e Bioimpedância com tecnologia de ponta.\n\nFabricio Moura (CRN3 95563/P | CREF 201974-G/SP) atende 100% online, com plano alimentar e treino individualizados, ajustes contínuos conforme a evolução e suporte direto. O diferencial é a dupla formação em nutrição esportiva e educação física, que permite integrar dieta e treino no mesmo protocolo.\n\nCom mais de 2.000 transformações em 7 países, o método é voltado para perda de gordura com preservação de massa muscular, atendendo desde iniciantes até atletas de alto rendimento.",
      },
      faq: [
        { q: "Como funciona o acompanhamento online?", a: "Todo o acompanhamento é feito através de avaliação, plano de nutrição e treino individuais, ajustes contínuos e suporte por WhatsApp. Você faz no seu ritmo, de onde estiver. Eu faço toda avaliação por fotos, peso, medidas, dados antropométricos e tenho uma Bioimpedância desenvolvida por mim, com tecnologia de ponta!" },
        { q: "Nutricionista online funciona tão bem quanto presencial?", a: "Sim. E eu digo que funciona mais do que presencial, pois você pode tirar dúvidas e ter orientação a qualquer momento e de todo lugar, não tendo que depender de ir em consultas a cada dois meses, ficando boa parte do tempo sem saber o que fazer nos momentos em que mais precisa. Hoje atendo pessoas em vários lugares, do Brasil e em mais de 7 países com essa estratégia." },
        { q: "Em quanto tempo vejo resultado com um nutricionista online?", a: "Meu papel é facilitar todo o processo para você ter resultados eficientes e rápidos: já no primeiro mês você nota melhora em diversos aspectos do seu físico e da sua saúde, e tudo através de um método com garantia de resultados!" },
        { q: "O nutricionista online prescreve treino também?", a: "Fabricio Moura é nutricionista (CRN3 95563/P) e educador físico (CREF 201974-G/SP). Isso permite montar nutrição e treino de forma integrada no mesmo acompanhamento, sem precisar contratar dois profissionais separados." },
        { q: "O acompanhamento online inclui suporte por WhatsApp?", a: "Sim. O suporte por WhatsApp é parte do acompanhamento. Você pode tirar dúvidas sobre alimentação, treino, suplementação e ajustes do protocolo diretamente comigo, a qualquer momento." },
        { q: "Preciso morar em São Paulo para fazer o acompanhamento?", a: "Não. O acompanhamento é 100% online e atende pessoas de qualquer cidade ou país. Já atendi mais de 2.000 pessoas em 7 países diferentes." },
      ],
    },
  },
};
