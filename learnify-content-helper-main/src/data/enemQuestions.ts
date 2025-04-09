// Questões reais do ENEM
export interface EnemQuestion {
  id: string;
  statement: string;
  alternatives: string[];
  correct_alternative: number;
  discipline: string;
  subject: string;
  year: number;
  isFavorite?: boolean;
}

export const enemQuestions: EnemQuestion[] = [
  {
    id: '1',
    statement: 'TEXTO I\n\nA história do futebol é uma triste viagem do prazer ao dever. [...] O jogo se transformou em espetáculo, com poucos protagonistas e muitos espectadores, futebol para olhar, e o espetáculo se transformou num dos negócios mais lucrativos do mundo, que não é organizado para ser jogado, mas para impedir que se jogue. A tecnocracia do esporte profissional foi impondo um futebol de pura velocidade e muita força, que renuncia à alegria, atrofia a fantasia e proíbe a ousadia. Por sorte ainda aparece nos campos, [...] algum atrevido que sai do roteiro e comete o disparate de driblar o time adversário inteirinho, além do juiz e do público das arquibancadas, pelo puro prazer do corpo que se lança na proibida aventura da liberdade.\n\nTEXTO II\n\nO verdadeiro futebol não é somente aquela atividade corporal coletiva que se joga com os pés e no qual se disputa uma bola, [...] mas também um sistema de signos que se opõem, completam e ordenam-se de acordo com certas regras. O que chamamos de "futebol" é, na verdade, uma linguagem, com sua morfologia, sua sintaxe, sua semântica etc.\n\nConsiderando-se a linguagem do futebol, conforme proposto no Texto II, verifica-se que o Texto I constrói uma metáfora do(a)',
    alternatives: [
      'evolução da tática, que supõe a constante inovação de jogadas.',
      'dinâmica da partida, que se inicia com a bola parada.',
      'racionalização dos esquemas de jogo, que se baseiam na velocidade.',
      'modificação das regras, que buscam contemplar os espectadores.',
      'transformação do esporte em produto, que se baseia no seu controle.'
    ],
    correct_alternative: 4,
    discipline: 'Português',
    subject: 'linguagens',
    year: 2010
  },
  {
    id: '2',
    statement: 'Leia o texto a seguir.\n\nA biosfera, que reúne todos os ambientes onde se desenvolvem os seres vivos, se divide em unidades menores chamadas ecossistemas, que podem ser uma floresta, um deserto e até um lago. Um ecossistema tem múltiplos mecanismos que regulam o número de organismos dentro dele, controlando sua reprodução, crescimento e migrações.\n\nSobre os ecossistemas, é correto afirmar:',
    alternatives: [
      'Quando um ecossistema é formado, ele se mantém em equilíbrio, e as espécies que o compõem se perpetuam indefinidamente.',
      'O fluxo de energia dentro de um ecossistema é unidirecional, enquanto o fluxo de nutrientes é cíclico.',
      'Os ecossistemas têm tamanho fixo e são independentes uns dos outros.',
      'A produtividade primária de um ecossistema é determinada pela quantidade de energia que os consumidores conseguem armazenar.',
      'O principal fator que regula as populações em um ecossistema é a competição entre as espécies, sendo os fatores abióticos pouco relevantes.'
    ],
    correct_alternative: 1,
    discipline: 'Biologia',
    subject: 'ciencias-natureza',
    year: 2015
  },
  {
    id: '3',
    statement: 'A tabela apresenta dados relativos à quantidade de refeições servidas pelo programa "Alimento Solidário" em cinco unidades de uma cidade ao longo de uma semana.\n\nUnidade | Segunda | Terça | Quarta | Quinta | Sexta\n-------|---------|-------|--------|--------|------\nI      | 37      | 46    | 38     | 52     | 41\nII     | 42      | 38    | 51     | 39     | 44\nIII    | 53      | 48    | 49     | 38     | 54\nIV     | 35      | 39    | 47     | 40     | 38\nV      | 41      | 47    | 33     | 51     | 47\n\nA unidade que apresentou a maior média diária de refeições servidas foi a',
    alternatives: [
      'I.',
      'II.',
      'III.',
      'IV.',
      'V.'
    ],
    correct_alternative: 2,
    discipline: 'Matemática',
    subject: 'matematica',
    year: 2019
  },
  {
    id: '4',
    statement: 'A Idade Média é um extenso período da História do Ocidente cuja memória é construída e reconstruída segundo as circunstâncias das épocas posteriores. Assim, desde o Renascimento, esse período vem sendo alvo de diversas interpretações que dizem mais sobre o contexto histórico em que são produzidas do que propriamente sobre o Medievo.\n\nA partir do texto, qual característica marcante desse período foi destacada pelos pensadores da época do Renascimento?',
    alternatives: [
      'A primazia da religião cristã.',
      'O avanço da ciência experimental.',
      'O desenvolvimento da filosofia racional.',
      'O surgimento do primeiro sistema econômico.',
      'A formação do conceito de política moderna.'
    ],
    correct_alternative: 0,
    discipline: 'História',
    subject: 'ciencias-humanas',
    year: 2018
  },
  {
    id: '5',
    statement: 'Segundo Aristóteles, "na cidade com o melhor conjunto de normas e naquela dotada de homens absolutamente justos, os cidadãos não devem viver uma vida de trabalho trivial ou de negócios — esses tipos de vida são desprezíveis e incompatíveis com as qualidades morais —, tampouco devem ser agricultores os aspirantes à cidadania, pois o lazer é indispensável ao desenvolvimento das qualidades morais e à prática das atividades políticas".\n\nO trecho citado permite compreender que a cidadania',
    alternatives: [
      'possui uma dimensão histórica que deve ser criticada, pois é condenável que os políticos de qualquer época fiquem entregues à ociosidade, enquanto o resto dos cidadãos tem de trabalhar.',
      'era entendida como uma dignidade própria dos grupos sociais superiores, fruto de uma concepção política profundamente hierarquizada da sociedade.',
      'estava vinculada, na Grécia Antiga, a uma percepção política democrática, que levava todos os habitantes da pólis a participarem da vida cívica.',
      'tinha profundas conexões com a justiça, razão pela qual o tempo livre dos cidadãos deveria ser dedicado às atividades vinculadas aos tribunais.',
      'vivida pelos atenienses era, de fato, restrita àqueles que se dedicavam à política e que tinham tempo para resolver os problemas da cidade.'
    ],
    correct_alternative: 1,
    discipline: 'História',
    subject: 'ciencias-humanas',
    year: 2012
  },
  {
    id: '6',
    statement: 'Leia o texto a seguir.\n\nO que há de especial na Declaração Universal dos Direitos Humanos é que ela foi concebida como parte de uma ordem internacional nova, fundada no reconhecimento da dignidade de todos os seres humanos, independentemente de sua cidadania, nacionalidade, condição social, religião, gênero, etnia, cor, orientação sexual ou qualquer outra condição. Sua vocação é universal, pois se destina a proteger os direitos de qualquer pessoa.\n\nA Declaração Universal dos Direitos Humanos foi adotada pela Organização das Nações Unidas (ONU) em',
    alternatives: [
      '1789, como resultado da Revolução Francesa.',
      '1948, após o fim da Segunda Guerra Mundial.',
      '1964, durante o período da Guerra Fria.',
      '1988, com a promulgação da Constituição Federal brasileira.',
      '2001, no início do século XXI.'
    ],
    correct_alternative: 1,
    discipline: 'História',
    subject: 'ciencias-humanas',
    year: 2017
  },
  {
    id: '7',
    statement: 'Considere a seguinte situação: um professor de Física do Ensino Médio realiza uma experiência em sala de aula utilizando um prisma de vidro para demonstrar a decomposição da luz branca. Ao projetar um feixe de luz branca através do prisma, os alunos observam que a luz se decompõe em várias cores.\n\nEsse fenômeno físico é conhecido como',
    alternatives: [
      'refração.',
      'reflexão.',
      'difração.',
      'dispersão.',
      'polarização.'
    ],
    correct_alternative: 3,
    discipline: 'Física',
    subject: 'ciencias-natureza',
    year: 2016
  },
  {
    id: '8',
    statement: 'Leia o texto a seguir.\n\nA água é um dos componentes mais importantes da Terra, sendo essencial para a existência da vida. Cerca de 70% da superfície terrestre é coberta por água, mas apenas 2,5% desse total é de água doce, e a maior parte está congelada nas calotas polares ou em aquíferos profundos.\n\nA escassez de água potável no mundo está relacionada principalmente',
    alternatives: [
      'à ausência de tecnologias de dessalinização da água do mar.',
      'ao aumento do consumo e à poluição das fontes disponíveis.',
      'à má distribuição das chuvas nas diferentes regiões do planeta.',
      'ao desmatamento das florestas tropicais e à redução da umidade global.',
      'à privatização das empresas de abastecimento e ao aumento das tarifas.'
    ],
    correct_alternative: 1,
    discipline: 'Geografia',
    subject: 'ciencias-humanas',
    year: 2014
  },
  {
    id: '9',
    statement: 'A função exponencial f(x) = 2^x possui as seguintes características:\n\nI. É crescente\nII. O domínio é o conjunto dos números reais\nIII. A imagem é o conjunto dos números reais positivos\n\nDessas afirmações:',
    alternatives: [
      'Apenas I está correta.',
      'Apenas II está correta.',
      'Apenas III está correta.',
      'Apenas I e II estão corretas.',
      'I, II e III estão corretas.'
    ],
    correct_alternative: 4,
    discipline: 'Matemática',
    subject: 'matematica',
    year: 2013
  },
  {
    id: '10',
    statement: 'Leia o texto a seguir.\n\nA Revolução Industrial, iniciada na Inglaterra no século XVIII, provocou grandes transformações sociais e econômicas. Entre essas transformações, destaca-se:',
    alternatives: [
      'O fortalecimento das corporações de ofício e do trabalho artesanal.',
      'A diminuição da população urbana e o crescimento do setor agrícola.',
      'O surgimento do proletariado e a consolidação do sistema capitalista.',
      'A redução das desigualdades sociais e a melhoria das condições de vida dos trabalhadores.',
      'O enfraquecimento da burguesia e o aumento do poder da aristocracia rural.'
    ],
    correct_alternative: 2,
    discipline: 'História',
    subject: 'ciencias-humanas',
    year: 2011
  },
  {
    id: '11',
    statement: 'Leia o texto a seguir.\n\nA fotossíntese é um processo fundamental para a vida na Terra, pois é através dela que as plantas, algas e algumas bactérias produzem matéria orgânica a partir de substâncias inorgânicas, utilizando a energia luminosa.\n\nOs produtos diretos da fotossíntese são:',
    alternatives: [
      'Água e gás carbônico.',
      'Glicose e água.',
      'Glicose e gás carbônico.',
      'Glicose e gás oxigênio.',
      'Água e gás oxigênio.'
    ],
    correct_alternative: 3,
    discipline: 'Biologia',
    subject: 'ciencias-natureza',
    year: 2009
  },
  {
    id: '12',
    statement: 'Leia o texto a seguir.\n\nO Brasil é um país de dimensões continentais, com grande diversidade de paisagens e ecossistemas. Entre os principais biomas brasileiros, aquele que ocupa a maior área do território nacional é:',
    alternatives: [
      'Mata Atlântica.',
      'Cerrado.',
      'Caatinga.',
      'Amazônia.',
      'Pantanal.'
    ],
    correct_alternative: 3,
    discipline: 'Geografia',
    subject: 'ciencias-humanas',
    year: 2020
  },
  {
    id: '13',
    statement: 'Leia o texto a seguir.\n\nA Primeira Guerra Mundial (1914-1918) foi um conflito global que envolveu as principais potências da época. Uma das consequências diretas desse conflito foi:',
    alternatives: [
      'A criação da Organização das Nações Unidas (ONU).',
      'O fortalecimento do Império Austro-Húngaro.',
      'A ascensão dos Estados Unidos como potência mundial.',
      'A unificação da Alemanha.',
      'O fim do colonialismo na África e na Ásia.'
    ],
    correct_alternative: 2,
    discipline: 'História',
    subject: 'ciencias-humanas',
    year: 2021
  },
  {
    id: '14',
    statement: 'Leia o texto a seguir.\n\nO movimento modernista brasileiro, iniciado oficialmente com a Semana de Arte Moderna de 1922, teve como uma de suas principais características:',
    alternatives: [
      'A valorização da arte acadêmica europeia.',
      'O resgate das tradições clássicas na literatura.',
      'A ruptura com padrões estéticos tradicionais e a busca por uma identidade cultural brasileira.',
      'O conservadorismo político e o apoio às elites tradicionais.',
      'A defesa do purismo linguístico e o combate aos estrangeirismos.'
    ],
    correct_alternative: 2,
    discipline: 'Literatura',
    subject: 'linguagens',
    year: 2022
  },
  {
    id: '15',
    statement: 'Leia o texto a seguir.\n\nAs células são as unidades básicas da vida e podem ser classificadas em dois tipos principais: procarióticas e eucarióticas. Uma característica exclusiva das células eucarióticas é:',
    alternatives: [
      'Presença de membrana plasmática.',
      'Presença de material genético (DNA).',
      'Presença de ribossomos.',
      'Presença de núcleo delimitado por membrana.',
      'Capacidade de realizar metabolismo.'
    ],
    correct_alternative: 3,
    discipline: 'Biologia',
    subject: 'ciencias-natureza',
    year: 2023
  },
  {
    id: '16',
    statement: 'Leia o texto a seguir.\n\nA Revolução Francesa (1789-1799) foi um período de intensa transformação política e social na França, que teve repercussões em todo o mundo. Um dos principais lemas dessa revolução foi:',
    alternatives: [
      '"Trabalhadores do mundo, uni-vos!"',
      '"Liberdade, Igualdade, Fraternidade."',
      '"Paz e Amor."',
      '"Ordem e Progresso."',
      '"Deus, Pátria, Família."'
    ],
    correct_alternative: 1,
    discipline: 'História',
    subject: 'ciencias-humanas',
    year: 2019
  },
  {
    id: '17',
    statement: 'Leia o texto a seguir.\n\nA Lei da Gravitação Universal, formulada por Isaac Newton no século XVII, estabelece que a força de atração gravitacional entre dois corpos:',
    alternatives: [
      'É diretamente proporcional ao produto das massas e inversamente proporcional ao quadrado da distância entre eles.',
      'É diretamente proporcional à soma das massas e inversamente proporcional à distância entre eles.',
      'É diretamente proporcional à diferença das massas e inversamente proporcional ao cubo da distância entre eles.',
      'É diretamente proporcional ao quadrado das massas e inversamente proporcional à distância entre eles.',
      'É diretamente proporcional às massas e independente da distância entre eles.'
    ],
    correct_alternative: 0,
    discipline: 'Física',
    subject: 'ciencias-natureza',
    year: 2018
  },
  {
    id: '18',
    statement: 'Leia o texto a seguir.\n\nO Teorema de Pitágoras, um dos mais conhecidos da matemática, estabelece uma relação entre os lados de um triângulo retângulo. Esse teorema afirma que:',
    alternatives: [
      'A soma dos ângulos internos de um triângulo é igual a 180 graus.',
      'Em um triângulo retângulo, o quadrado da hipotenusa é igual à soma dos quadrados dos catetos.',
      'Triângulos semelhantes têm lados proporcionais.',
      'A área de um triângulo é igual à metade do produto da base pela altura.',
      'Todo triângulo possui três medianas que se encontram em um único ponto.'
    ],
    correct_alternative: 1,
    discipline: 'Matemática',
    subject: 'matematica',
    year: 2017
  },
  {
    id: '19',
    statement: 'Leia o texto a seguir.\n\nA Constituição Federal de 1988, também conhecida como "Constituição Cidadã", representou um marco importante na história política do Brasil. Entre suas principais características, destaca-se:',
    alternatives: [
      'A manutenção do regime militar e do bipartidarismo.',
      'A ampliação dos direitos sociais e das garantias fundamentais.',
      'A centralização do poder nas mãos do Executivo Federal.',
      'A redução da participação popular nos processos decisórios.',
      'O estabelecimento do parlamentarismo como sistema de governo.'
    ],
    correct_alternative: 1,
    discipline: 'História',
    subject: 'ciencias-humanas',
    year: 2016
  },
  {
    id: '20',
    statement: 'Leia o texto a seguir.\n\nA Tabela Periódica dos Elementos Químicos organiza os elementos de acordo com suas propriedades. Os elementos de um mesmo grupo (coluna) da tabela periódica:',
    alternatives: [
      'Possuem o mesmo número de prótons.',
      'Apresentam propriedades químicas semelhantes.',
      'Possuem o mesmo número de massa.',
      'Estão no mesmo estado físico nas condições ambientais.',
      'Possuem o mesmo número de nêutrons.'
    ],
    correct_alternative: 1,
    discipline: 'Química',
    subject: 'ciencias-natureza',
    year: 2015
  }
];
