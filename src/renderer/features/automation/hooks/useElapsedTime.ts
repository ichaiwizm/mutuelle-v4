import { useState, useEffect } from 'react';

/**
 * Hook pour calculer le temps écoulé en temps réel.
 * Force un re-render toutes les secondes quand isRunning est true.
 *
 * @param startedAt - Timestamp de début (ms)
 * @param completedAt - Timestamp de fin (ms) - optionnel
 * @param duration - Durée finale (ms) - optionnel, prioritaire si présent
 * @param isRunning - Si true, met à jour le timer toutes les secondes
 * @returns Temps écoulé en millisecondes
 */
export function useElapsedTime(
  startedAt: number | undefined,
  completedAt: number | undefined,
  duration: number | undefined,
  isRunning: boolean
): number {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    // Ne pas démarrer l'intervalle si pas en cours ou pas de timestamp de début
    if (!isRunning || !startedAt) return;

    // Mettre à jour immédiatement
    setNow(Date.now());

    // Puis toutes les secondes
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, startedAt]);

  // Priorité : duration finale > calcul depuis timestamps > calcul live
  if (duration) return duration;
  if (completedAt && startedAt) return completedAt - startedAt;
  if (startedAt) return now - startedAt;
  return 0;
}
