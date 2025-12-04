import { useState, useCallback } from "react";
import { toast } from "sonner";
import { Modal } from "@/renderer/components/ui/Modal/Modal";
import { ModalHeader } from "@/renderer/components/ui/Modal/ModalHeader";
import type { Lead } from "@/shared/types/lead";
import { PasteStep } from "./PasteStep";
import { PreviewStep } from "./PreviewStep";
import { ErrorStep } from "./ErrorStep";

type Step = "paste" | "preview" | "error";

interface ImportLeadsModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onOpenManualForm: () => void;
}

export function ImportLeadsModal({
  open,
  onClose,
  onSuccess,
  onOpenManualForm,
}: ImportLeadsModalProps) {
  const [step, setStep] = useState<Step>("paste");
  const [text, setText] = useState("");
  const [parsedLeads, setParsedLeads] = useState<Lead[]>([]);
  const [selectedLeadIds, setSelectedLeadIds] = useState<Set<string>>(new Set());
  const [isParsing, setIsParsing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const resetState = useCallback(() => {
    setStep("paste");
    setText("");
    setParsedLeads([]);
    setSelectedLeadIds(new Set());
    setIsParsing(false);
    setIsCreating(false);
  }, []);

  const handleClose = useCallback(() => {
    resetState();
    onClose();
  }, [resetState, onClose]);

  const handleParse = useCallback(async () => {
    if (!text.trim()) return;

    setIsParsing(true);
    try {
      const leads = await window.api.leads.parseFromText({ text });
      if (leads.length === 0) {
        setStep("error");
      } else {
        setParsedLeads(leads);
        setSelectedLeadIds(new Set(leads.map((l) => l.id)));
        setStep("preview");
      }
    } catch (error) {
      console.error("Parse error:", error);
      setStep("error");
    } finally {
      setIsParsing(false);
    }
  }, [text]);

  const handleCreate = useCallback(async () => {
    const leadsToCreate = parsedLeads.filter((l) => selectedLeadIds.has(l.id));
    if (leadsToCreate.length === 0) return;

    setIsCreating(true);
    try {
      let created = 0;
      let duplicates = 0;

      for (const lead of leadsToCreate) {
        const result = await window.api.leads.create(lead);
        if (result.duplicate) {
          duplicates++;
        } else {
          created++;
        }
      }

      if (created > 0) {
        toast.success(
          `${created} lead${created > 1 ? "s" : ""} cr\u00e9\u00e9${created > 1 ? "s" : ""}`
        );
      }
      if (duplicates > 0) {
        toast.warning(
          `${duplicates} lead${duplicates > 1 ? "s" : ""} d\u00e9j\u00e0 existant${duplicates > 1 ? "s" : ""}`
        );
      }

      handleClose();
      onSuccess();
    } catch (error) {
      console.error("Create error:", error);
      toast.error("Erreur lors de la cr\u00e9ation");
    } finally {
      setIsCreating(false);
    }
  }, [parsedLeads, selectedLeadIds, handleClose, onSuccess]);

  const handleBack = useCallback(() => {
    setStep("paste");
  }, []);

  const handleRetry = useCallback(() => {
    setStep("paste");
  }, []);

  const handleManualForm = useCallback(() => {
    handleClose();
    onOpenManualForm();
  }, [handleClose, onOpenManualForm]);

  const toggleLeadSelection = useCallback((id: string) => {
    setSelectedLeadIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const toggleAllSelection = useCallback(() => {
    if (selectedLeadIds.size === parsedLeads.length) {
      setSelectedLeadIds(new Set());
    } else {
      setSelectedLeadIds(new Set(parsedLeads.map((l) => l.id)));
    }
  }, [selectedLeadIds.size, parsedLeads]);

  if (!open) return null;

  return (
    <Modal isOpen={open} onClose={handleClose}>
      <ModalHeader
        title={
          step === "paste"
            ? "Importer des leads"
            : step === "preview"
              ? `${parsedLeads.length} lead${parsedLeads.length > 1 ? "s" : ""} d\u00e9tect\u00e9${parsedLeads.length > 1 ? "s" : ""}`
              : "Format non reconnu"
        }
        onClose={handleClose}
      />

      <div className="p-6">
        {step === "paste" && (
          <PasteStep
            text={text}
            onTextChange={setText}
            onParse={handleParse}
            onCancel={handleClose}
            isParsing={isParsing}
          />
        )}

        {step === "preview" && (
          <PreviewStep
            leads={parsedLeads}
            selectedIds={selectedLeadIds}
            onToggleSelection={toggleLeadSelection}
            onToggleAll={toggleAllSelection}
            onBack={handleBack}
            onCreate={handleCreate}
            isCreating={isCreating}
          />
        )}

        {step === "error" && (
          <ErrorStep onRetry={handleRetry} onManualForm={handleManualForm} />
        )}
      </div>
    </Modal>
  );
}
