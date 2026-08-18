import atividadesUstData from './atividadesUst.json';

export type AtividadeUst = {
  id: number;
  descricaoAtividade: string;
  complexidade: string;
};

export const atividadesUst: AtividadeUst[] = atividadesUstData;
