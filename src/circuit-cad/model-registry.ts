import modelManifest from '@/../public/models/model-manifest.json';

export type ModelConfidence = 'A' | 'B' | 'C' | 'D';
export type ModelValidation = 'exact_verified' | 'documented_reference' | 'pending_physical_evidence';

export interface RegisteredModel {
  id: string;
  label: string;
  kind: string;
  format: string;
  path?: string;
  sourceStep?: string;
  sourceUrl?: string;
  sourceAssetUrl?: string;
  sourceLicense?: string;
  confidence: ModelConfidence;
  validation: ModelValidation;
  dimensionsMm?: { width: number; depth: number; height: number };
  notes: string;
}

export const MODEL_REGISTRY = modelManifest.assets as RegisteredModel[];
export const RUNTIME_MODEL_REGISTRY = MODEL_REGISTRY.filter((asset) => Boolean(asset.path));

export const getRegisteredModel = (id: string) => MODEL_REGISTRY.find((asset) => asset.id === id);
