import { Button } from "@/renderer/components/ui/Button";
import { SlideOverSection, SlideOverDataRow } from "@/renderer/components/ui/SlideOver";
import { Edit2, User, FileText, Users, Baby } from "lucide-react";
import type { Lead } from "@/shared/types/lead";

interface LeadDetailsProps {
  lead: Lead;
  onEdit: () => void;
  onClose: () => void;
}

/**
 * Read-only view of lead details
 */
export function LeadDetails({ lead, onEdit, onClose }: LeadDetailsProps) {
  const { subscriber, project, children } = lead;

  return (
    <div className="space-y-6">
      {/* Subscriber Section */}
      <SlideOverSection title="Adherent">
        <div className="bg-[var(--color-surface-elevated)] rounded-lg p-4 space-y-1">
          <div className="flex items-center gap-2 mb-3">
            <User className="h-4 w-4 text-[var(--color-primary)]" />
            <span className="font-medium text-[var(--color-text-primary)]">
              {subscriber.civilite && `${subscriber.civilite}. `}
              {subscriber.prenom} {subscriber.nom?.toUpperCase()}
            </span>
          </div>
          <SlideOverDataRow label="Date de naissance" value={subscriber.dateNaissance} />
          <SlideOverDataRow label="Code postal" value={subscriber.codePostal} />
          {subscriber.ville && <SlideOverDataRow label="Ville" value={subscriber.ville} />}
          {subscriber.adresse && <SlideOverDataRow label="Adresse" value={subscriber.adresse} />}
          <SlideOverDataRow label="Profession" value={subscriber.profession} />
          <SlideOverDataRow label="Regime social" value={subscriber.regimeSocial} />
          {subscriber.email && <SlideOverDataRow label="Email" value={subscriber.email} />}
          {subscriber.telephone && <SlideOverDataRow label="Telephone" value={subscriber.telephone} />}
        </div>
      </SlideOverSection>

      {/* Project Section */}
      {project && (
        <SlideOverSection title="Projet">
          <div className="bg-[var(--color-surface-elevated)] rounded-lg p-4 space-y-1">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="h-4 w-4 text-[var(--color-primary)]" />
              <span className="font-medium text-[var(--color-text-primary)]">Details du projet</span>
            </div>
            <SlideOverDataRow label="Date d'effet" value={project.dateEffet} />
            {project.source && <SlideOverDataRow label="Source" value={project.source} />}
            {project.assureurActuel && (
              <SlideOverDataRow label="Assureur actuel" value={project.assureurActuel} />
            )}
            {project.formuleChoisie && (
              <SlideOverDataRow label="Formule choisie" value={project.formuleChoisie} />
            )}
          </div>
        </SlideOverSection>
      )}

      {/* Conjoint Section */}
      {project?.conjoint?.dateNaissance && (
        <SlideOverSection title="Conjoint">
          <div className="bg-[var(--color-surface-elevated)] rounded-lg p-4 space-y-1">
            <div className="flex items-center gap-2 mb-3">
              <Users className="h-4 w-4 text-[var(--color-primary)]" />
              <span className="font-medium text-[var(--color-text-primary)]">Informations conjoint</span>
            </div>
            <SlideOverDataRow label="Date de naissance" value={project.conjoint.dateNaissance} />
            {project.conjoint.profession && (
              <SlideOverDataRow label="Profession" value={project.conjoint.profession} />
            )}
            {project.conjoint.regimeSocial && (
              <SlideOverDataRow label="Regime social" value={project.conjoint.regimeSocial} />
            )}
          </div>
        </SlideOverSection>
      )}

      {/* Children Section */}
      {children && children.length > 0 && (
        <SlideOverSection title="Enfants">
          <div className="bg-[var(--color-surface-elevated)] rounded-lg p-4 space-y-1">
            <div className="flex items-center gap-2 mb-3">
              <Baby className="h-4 w-4 text-[var(--color-primary)]" />
              <span className="font-medium text-[var(--color-text-primary)]">
                {children.length} enfant{children.length > 1 ? "s" : ""}
              </span>
            </div>
            {children.map((child, index) => (
              <SlideOverDataRow
                key={index}
                label={`Enfant ${index + 1}`}
                value={child.dateNaissance}
              />
            ))}
          </div>
        </SlideOverSection>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-border)]">
        <Button variant="secondary" onClick={onClose}>
          Fermer
        </Button>
        <Button onClick={onEdit}>
          <Edit2 className="h-4 w-4" />
          Modifier
        </Button>
      </div>
    </div>
  );
}
