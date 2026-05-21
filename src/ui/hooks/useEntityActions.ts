import { useCallback, useState } from "react";
import type { EntityId } from "@/domain/value-objects/EntityId";
import type { ToastType } from "@/ui/hooks/useToast";

export type EntityActionModal = "inactivar" | "activar" | "eliminar" | null;

type OpenEntityActionModal = Exclude<EntityActionModal, null>;

export interface EntityActionMessages {
  activateSuccess: string;
  deactivateSuccess: string;
  toggleError: (error: unknown) => string;
  deleteSuccess: string;
  deleteError: (error: unknown) => string;
}

export interface UseEntityActionsParams {
  entityId?: EntityId;
  isActive?: boolean;
  patchActive: (id: EntityId, isActive: boolean) => Promise<void>;
  deleteEntity: (id: EntityId) => Promise<void>;
  onActiveChanged: (isActive: boolean) => void;
  onDeleted: () => void;
  showToast: (message: string, type?: ToastType) => void;
  messages: EntityActionMessages;
}

export interface UseEntityActionsReturn {
  modalActive: EntityActionModal;
  loadingPatch: boolean;
  openModal: (modal: OpenEntityActionModal) => void;
  closeModal: () => void;
  handleToggleActive: () => Promise<void>;
  handleDelete: () => Promise<void>;
}

export const useEntityActions = ({
  entityId,
  isActive,
  patchActive,
  deleteEntity,
  onActiveChanged,
  onDeleted,
  showToast,
  messages,
}: UseEntityActionsParams): UseEntityActionsReturn => {
  const [modalActive, setModalActive] = useState<EntityActionModal>(null);
  const [loadingPatch, setLoadingPatch] = useState(false);

  const openModal = useCallback((modal: OpenEntityActionModal) => {
    setModalActive(modal);
  }, []);

  const closeModal = useCallback(() => {
    setModalActive(null);
  }, []);

  const handleToggleActive = useCallback(async () => {
    if (!entityId || isActive === undefined) return;

    const nextValue = !isActive;
    setLoadingPatch(true);

    try {
      await patchActive(entityId, nextValue);
      onActiveChanged(nextValue);
      showToast(nextValue ? messages.activateSuccess : messages.deactivateSuccess, "success");

    } catch (error) {
      showToast(messages.toggleError(error));

    } finally {
      setLoadingPatch(false);
      setModalActive(null);
    }
  }, [entityId, isActive, messages, onActiveChanged, patchActive, showToast]);

  const handleDelete = useCallback(async () => {
    if (!entityId) return;

    setLoadingPatch(true);

    try {
      await deleteEntity(entityId);
      showToast(messages.deleteSuccess, "success");
      onDeleted();

    } catch (error) {
      showToast(messages.deleteError(error));

    } finally {
      setLoadingPatch(false);
      setModalActive(null);
    }
  }, [deleteEntity, entityId, messages, onDeleted, showToast]);

  return {
    modalActive,
    loadingPatch,
    openModal,
    closeModal,
    handleToggleActive,
    handleDelete,
  };
};
