/** Human, French relative time: "à l'instant", "il y a 3 h", "hier", "il y a 4 jours", then a date. */
export function timeAgo(iso: string | null | undefined): string {
  if (!iso) return "";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const diff = Math.floor((Date.now() - then) / 1000);
  if (diff < 60) return "à l'instant";
  if (diff < 3600) {
    const m = Math.floor(diff / 60);
    return `il y a ${m} min`;
  }
  if (diff < 86400) {
    const h = Math.floor(diff / 3600);
    return `il y a ${h} h`;
  }
  const days = Math.floor(diff / 86400);
  if (days === 1) return "hier";
  if (days < 7) return `il y a ${days} jours`;
  if (days < 31) {
    const w = Math.floor(days / 7);
    return `il y a ${w} sem.`;
  }
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
}

export const ANNONCE_TYPE_LABELS: Record<string, string> = {
  club_recrute: "Club qui recrute",
  equipe_joueurs: "Équipe cherche des joueurs",
  cherche_club: "Cherche un club",
  cherche_equipe: "Cherche une équipe",
  partie_ouverte: "Partie ouverte",
};
