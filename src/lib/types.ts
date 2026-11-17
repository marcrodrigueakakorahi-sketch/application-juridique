// Modèle de données d'un acte juridique.
// Tout est déclaratif (sérialisable en JSON) sauf `checks`, qui contient
// des contrôles de cohérence écrits en code.

export type FormData = Record<string, string | boolean>;

export type Condition =
  | { field: string; equals: string | boolean }
  | { field: string; notEquals: string | boolean }
  | { field: string; filled: true }
  | { all: Condition[] }
  | { any: Condition[] };

export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "money"
  | "date"
  | "email"
  | "tel"
  | "select"
  | "radio"
  | "checkbox";

export interface Field {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  help?: string;
  placeholder?: string;
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
  default?: string | boolean;
  showIf?: Condition;
}

export interface Step {
  title: string;
  description?: string;
  fields: Field[];
}

export type BlockType = "title" | "subtitle" | "heading" | "paragraph" | "signature" | "note";

export interface Block {
  type: BlockType;
  text: string;
  if?: Condition;
}

export type Category =
  | "logement"
  | "famille"
  | "argent"
  | "travail"
  | "litiges"
  | "succession"
  | "entreprise";

export type Complexity = "simple" | "intermediaire" | "complexe";

export interface Warning {
  level: "info" | "attention" | "bloquant";
  message: string;
}

export interface ActDefinition {
  id: string;
  title: string;
  category: Category;
  summary: string;
  whenToUse: string[];
  limits: string[];
  keywords: string[];
  complexity: Complexity;
  /** Prix en francs CFA. */
  prix: number;
  minutes: number;
  legalRefs: string[];
  version: string;
  /** Acte réservé à un professionnel (notaire, avocat) : pas de génération. */
  requiresProfessional?: { who: "notaire" | "avocat"; why: string };
  /** Absent = acte présent au catalogue mais pas encore disponible. */
  steps?: Step[];
  document?: Block[];
  instructions?: string[];
  checks?: (d: FormData) => Warning[];
}
