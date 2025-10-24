import { Entreprise } from './entreprise';
import { Skill } from './skill';

export interface Job {
  id: number;
  nom: string;
  description: string;
  dateLancement: string; // Les dates sont des strings au format ISO
  dateCandidature: string;
  dateReponse?: string;
  dateExpiration?: string;
  siteRecommandation: string;
  urlOffre: string;
  status: 'EN_COURS' | 'REFUSE' | 'ACCEPTE' | 'ARCHIVE'; // Ou un type plus large
  entreprise: Entreprise;
  requiredSkills: Skill[];
  isFavorite: boolean;
}
