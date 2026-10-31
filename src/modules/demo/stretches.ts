import type { PoseId } from "../../components/app/StretchIllustration";

export type Stretch = {
  id: string;
  pose: PoseId;
  title: string;
  duration: string;
  summary: string;
  benefit: string;
  steps: string[];
  care: string[];
  illustrationLabel: string;
};

export const DISCLAIMER =
  "Conteúdo informativo, que não substitui a orientação da sua equipe de saúde. Interrompa o exercício se sentir dor, tontura ou desconforto.";

// TODO: textos de demonstração; revisar com um profissional de saúde antes de usar como orientação
export const STRETCHES: Stretch[] = [
  {
    id: "pescoco",
    pose: "neck",
    title: "Alongamento lateral do pescoço",
    duration: "20 a 30 segundos de cada lado",
    summary: "Solta a musculatura do pescoço e dos ombros.",
    benefit: "Ajuda a aliviar a tensão do pescoço, comum ao longo do dia.",
    steps: [
      "Sente-se ou fique em pé, com a coluna reta e os ombros relaxados.",
      "Incline a cabeça devagar para um lado, aproximando a orelha do ombro.",
      "Se quiser, apoie a mão do mesmo lado na cabeça, sem puxar.",
      "Mantenha respirando com calma, volte devagar e repita do outro lado.",
    ],
    care: [
      "Não force nem gire a cabeça bruscamente.",
      "Mantenha o ombro do lado oposto relaxado, sem levantá-lo.",
    ],
    illustrationLabel: "Ilustração: pessoa em pé inclinando a cabeça para o lado, com a mão apoiada na cabeça.",
  },
  {
    id: "ombros",
    pose: "shoulder",
    title: "Alongamento de ombros e braços",
    duration: "20 a 30 segundos de cada lado",
    summary: "Alonga o ombro e a parte de trás do braço.",
    benefit: "Ajuda a manter a mobilidade dos ombros e a soltar a região das costas.",
    steps: [
      "Fique em pé ou sentado, com as costas retas.",
      "Leve um braço esticado à frente do peito, na direção do ombro oposto.",
      "Com a outra mão, segure o braço perto do cotovelo e traga-o de leve para o corpo.",
      "Mantenha por alguns segundos, respirando normalmente, e troque de lado.",
    ],
    care: [
      "Mantenha o ombro baixo, sem encolher.",
      "Puxe só até sentir um alongamento leve, nunca dor.",
    ],
    illustrationLabel: "Ilustração: pessoa em pé com um braço cruzado à frente do peito, segurado pelo outro braço.",
  },
  {
    id: "tronco",
    pose: "twist",
    title: "Rotação suave do tronco sentado",
    duration: "10 a 15 segundos de cada lado",
    summary: "Dá mobilidade ao tronco com o apoio da cadeira.",
    benefit: "Ajuda a manter a flexibilidade da coluna em movimentos do dia a dia.",
    steps: [
      "Sente-se com os pés apoiados no chão e as costas retas.",
      "Cruze os braços à frente do peito ou apoie uma mão no encosto da cadeira.",
      "Gire o tronco devagar para um lado, olhando por cima do ombro.",
      "Volte ao centro e repita para o outro lado.",
    ],
    care: [
      "Use uma cadeira firme, sem rodinhas.",
      "Gire só até onde for confortável, mantendo os quadris voltados para a frente.",
    ],
    illustrationLabel: "Ilustração: pessoa sentada em uma cadeira girando o tronco com um braço estendido para o lado.",
  },
  {
    id: "panturrilha",
    pose: "calf",
    title: "Alongamento da panturrilha na parede",
    duration: "20 a 30 segundos de cada perna",
    summary: "Alonga a panturrilha com o apoio da parede.",
    benefit: "Ajuda a manter a flexibilidade da perna, importante para caminhar com mais conforto.",
    steps: [
      "Fique de frente para uma parede, com as mãos apoiadas na altura do peito.",
      "Dê um passo para trás com uma perna, mantendo o calcanhar no chão.",
      "Dobre levemente a perna da frente e incline o corpo em direção à parede.",
      "Mantenha por alguns segundos e troque de perna.",
    ],
    care: [
      "Mantenha o calcanhar de trás no chão e use calçado antiderrapante.",
      "Se sentir instabilidade, faça com alguém por perto.",
    ],
    illustrationLabel: "Ilustração: pessoa de lado apoiando as mãos na parede, com uma perna esticada para trás.",
  },
  {
    id: "coxa",
    pose: "hamstring",
    title: "Alongamento da parte de trás da coxa, sentado",
    duration: "20 a 30 segundos de cada perna",
    summary: "Alonga a parte de trás da coxa sem sair da cadeira.",
    benefit: "Ajuda a soltar a coxa e a manter a mobilidade do quadril.",
    steps: [
      "Sente-se na ponta de uma cadeira firme.",
      "Estique uma perna à frente, com o calcanhar no chão.",
      "Com as costas retas, incline o corpo para a frente até sentir o alongamento.",
      "Mantenha por alguns segundos e troque de perna.",
    ],
    care: [
      "Não arredonde as costas para tentar alcançar o pé.",
      "Encoste a cadeira na parede, para ter mais segurança.",
    ],
    illustrationLabel: "Ilustração: pessoa sentada na ponta de uma cadeira, com uma perna esticada e o corpo inclinado para a frente.",
  },
  {
    id: "equilibrio",
    pose: "balance",
    title: "Equilíbrio com apoio",
    duration: "10 a 15 segundos de cada lado",
    summary: "Treina o equilíbrio com um apoio firme por perto.",
    benefit: "Ajuda a ganhar confiança ao transferir o peso de uma perna para a outra.",
    steps: [
      "Fique ao lado de uma bancada ou encosto firme e apoie uma mão.",
      "Distribua o peso nas duas pernas e mantenha o olhar à frente.",
      "Transfira o peso para uma perna e levante a outra de leve, sem soltar o apoio.",
      "Volte devagar e repita para o outro lado.",
    ],
    care: [
      "Faça sempre com apoio firme e, de preferência, com alguém por perto.",
      "Retire tapetes soltos e use calçado antiderrapante.",
    ],
    illustrationLabel: "Ilustração: pessoa em pé apoiada em uma bancada, com uma perna levantada de lado.",
  },
];