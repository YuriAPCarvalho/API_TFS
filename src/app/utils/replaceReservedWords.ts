export type ReservedWordsContext = {
  formattedDate?: string;
  fullDate?: string;
  previousDay?: string;
  pbi?: string;
  pbiTitulo?: string;
  pbiDescricao?: string;
  pbisRelacionadas?: string;
  pbiCriterioAceite?: string;
  sprint?: string;
  dataInicioSprint?: string;
  dataFimSprint?: string;
  colaborador?: string;
};

type PlaceholderDef = {
  pattern: RegExp;
  key: keyof ReservedWordsContext;
  format?: (value: string) => string;
};

const PLACEHOLDER_DEFS: PlaceholderDef[] = [
  { pattern: /\{dd\/MM\/yyyy\}/g, key: "fullDate" },
  { pattern: /\{fullDate\}/g, key: "fullDate" },
  {
    pattern: /\{dda\/MMa\}/g,
    key: "previousDay",
    format: (value) => `(${value})`,
  },
  { pattern: /\{previousDay\}/g, key: "previousDay" },
  { pattern: /\{dd\/MM\}/g, key: "formattedDate" },
  { pattern: /\{formattedDate\}/g, key: "formattedDate" },
  { pattern: /\{pbi\.titulo\}/g, key: "pbiTitulo" },
  { pattern: /\{pbiTitulo\}/g, key: "pbiTitulo" },
  { pattern: /\{pbi\.descricao\}/g, key: "pbiDescricao" },
  { pattern: /\{pbiDescricao\}/g, key: "pbiDescricao" },
  { pattern: /\{pbi\.relacionadas\}/g, key: "pbisRelacionadas" },
  { pattern: /\{pbisRelacionadas\}/g, key: "pbisRelacionadas" },
  { pattern: /\{PBICriterioAceite\}/g, key: "pbiCriterioAceite" },
  { pattern: /\{pbiCriterioAceite\}/g, key: "pbiCriterioAceite" },
  { pattern: /\{pbi\}/g, key: "pbi" },
  { pattern: /\{DataInicioSprint\}/g, key: "dataInicioSprint" },
  { pattern: /\{dataInicioSprint\}/g, key: "dataInicioSprint" },
  { pattern: /\{DataFimSprint\}/g, key: "dataFimSprint" },
  { pattern: /\{dataFimSprint\}/g, key: "dataFimSprint" },
  { pattern: /\{sprint\}/g, key: "sprint" },
  { pattern: /\{colaborador\}/g, key: "colaborador" },
];

export const RESERVED_WORDS_HELP: {
  placeholder: string;
  description: string;
}[] = [
  { placeholder: "{formattedDate}", description: "Data selecionada (dd/MM)" },
  { placeholder: "{fullDate}", description: "Data selecionada (dd/MM/yyyy)" },
  {
    placeholder: "{previousDay}",
    description: "Dia útil anterior à data (dd/MM)",
  },
  {
    placeholder: "{dda/MMa}",
    description: "Dia útil anterior entre parênteses, ex: (25/06)",
  },
  { placeholder: "{pbi}", description: "ID do PBI da linha do Excel" },
  { placeholder: "{pbiTitulo}", description: "Título do PBI no TFS" },
  { placeholder: "{pbiDescricao}", description: "Descrição do PBI no TFS" },
  {
    placeholder: "{pbiCriterioAceite}",
    description: "Critérios de aceite do PBI no TFS",
  },
  { placeholder: "{sprint}", description: "Nome da sprint selecionada" },
  {
    placeholder: "{dataInicioSprint}",
    description: "Data de início da sprint (dd/MM/yyyy)",
  },
  {
    placeholder: "{dataFimSprint}",
    description: "Data de fim da sprint (dd/MM/yyyy)",
  },
  {
    placeholder: "{colaborador}",
    description: "Integrante selecionado no formulário",
  },
  {
    placeholder: "{pbisRelacionadas}",
    description: "PBIs relacionadas informadas no formulário",
  },
];

export function getPbiCriterioAceite(
  fields: Record<string, unknown> | undefined,
): string {
  if (!fields) return "";
  const value = fields["Microsoft.VSTS.Common.AcceptanceCriteria"];
  return value != null ? String(value) : "";
}

export function replaceReservedWords(
  template: string | null | undefined,
  context: ReservedWordsContext,
): string {
  let result = template ?? "";

  for (const { pattern, key, format } of PLACEHOLDER_DEFS) {
    const value = context[key];
    if (value === undefined) continue;

    const replacement = format ? format(value) : value;
    result = result.replace(pattern, replacement);
  }

  return result;
}
