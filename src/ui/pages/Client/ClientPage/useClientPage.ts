import { useEffect, useState } from "react";
import { useRepositories } from "@/infrastructure/RepositoryContext/RepositoryContext";
import { useUserStore } from "@/infrastructure/store/user.store";
import { getErrorMessage } from "@/infrastructure/helpers/getErrorMessage";
import { useFab } from "@/ui/hooks/useFab";
import { useModal } from "@/ui/hooks/useModal";
import { usePagination } from "@/ui/hooks/usePagination";
import { useFilters } from "@/ui/hooks/useFilters";
import { useToast, type UseToastReturn } from "@/ui/hooks/useToast";
import type { Client } from "@/domain/models/Client/Client";
import type { Sector } from "@/domain/models/Client/Sector";
import type { CreateClientRequest } from "@/domain/models/Client/CreateClientRequest";
import type { RefCallback } from "react";

const PAGE_LIMIT = 20;

export interface UseClientPageReturn extends UseToastReturn {
  clients: Client[];
  sectors: Sector[];
  activeProjectCounts: Record<string, number>;
  filtered: Client[];
  selectedSectorId: string;
  setSelectedSectorId: (id: string) => void;
  isModalOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
  page: number;
  isFirst: boolean;
  isLast: boolean;
  goNext: () => void;
  goPrev: () => void;
  search: string;
  setSearch: (value: string) => void;
  status: string;
  setStatus: (value: string) => void;
  btnRef: RefCallback<HTMLButtonElement>;
  showFab: boolean;
  handleCreateClient: (data: CreateClientRequest) => Promise<void>;
}

export const useClientPage = (): UseClientPageReturn => {
  const { client: clientRepo, sector: sectorRepo } = useRepositories();
  const userStore = useUserStore((store) => store.user);

  const [clients, setClients] = useState<Client[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [activeProjectCounts, setActiveProjectCounts] = useState<Record<string, number>>({});
  const [selectedSectorId, setSelectedSectorId] = useState<string>("all");

  const { toast, showToast, closeToast } = useToast();
  const { isOpen: isModalOpen, open: openModal, close: closeModal } = useModal();
  const { btnRef, showFab } = useFab({ rootMargin: "-60px 0px 0px 0px" });
  const { page, limit, isFirst, isLast, setIsLast, goNext, goPrev } = usePagination(PAGE_LIMIT);
  const { search, setSearch, status, setStatus, filtered: baseFiltered } = useFilters(clients);

  const filtered = baseFiltered.filter(
    (client) => selectedSectorId === "all" || client.sectorId === selectedSectorId
  );

  useEffect(() => {
    if (!userStore) return;
    clientRepo.getAll(page, limit).then((result) => {
      setClients(result);
      setIsLast(result.length < limit);
    });
    sectorRepo.getAll().then(setSectors);
  }, [clientRepo, sectorRepo, page, limit]);

  useEffect(() => {
    if (clients.length === 0) return;
    clients.forEach((client) => {
      clientRepo.getProjects(client.id).then((projects) => {
        setActiveProjectCounts((prev) => ({
          ...prev,
          [String(client.id)]: projects.filter((p) => p.isActive).length,
        }));
      });
    });
  }, [clients]);

  const handleCreateClient = async (data: CreateClientRequest) => {
    try {
      await clientRepo.createClient(data);
      const result = await clientRepo.getAll(page, limit);
      setClients(result);
      setIsLast(result.length < limit);
      showToast("Cliente creado correctamente", "success");
    } catch (error) {
      showToast(getErrorMessage(error, "No se pudo crear el cliente."));
    }
  };

  return {
    clients,
    sectors,
    activeProjectCounts,
    filtered,
    selectedSectorId,
    setSelectedSectorId,
    isModalOpen,
    openModal,
    closeModal,
    page,
    isFirst,
    isLast,
    goNext,
    goPrev,
    search,
    setSearch,
    status,
    setStatus,
    btnRef,
    showFab,
    handleCreateClient,
    toast,
    showToast,
    closeToast,
  };
};
