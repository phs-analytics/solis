import { ZxcvbnFactory } from '@zxcvbn-ts/core';
import * as common from '@zxcvbn-ts/language-common';
import * as ptBr from '@zxcvbn-ts/language-pt-br';

const zxcvbn = new ZxcvbnFactory({
  translations: ptBr.translations,
  graphs: common.adjacencyGraphs,
  dictionary: { ...common.dictionary, ...ptBr.dictionary },
});

export const MIN_CARACTERES = 12;

export interface AvaliacaoSenha {
  forte: boolean;
  pontuacao: number;
  sugestao: string;
}

export function avaliarSenha(senha: string): AvaliacaoSenha {
  if (senha.length < MIN_CARACTERES) {
    return { forte: false, pontuacao: 0, sugestao: `Use pelo menos ${MIN_CARACTERES} caracteres.` };
  }
  const r = zxcvbn.check(senha, ['solis']);
  return {
    forte: r.score >= 3,
    pontuacao: r.score,
    sugestao: r.feedback.warning ?? r.feedback.suggestions[0] ?? '',
  };
}
