
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";

import {
  getMyPatientCareNetwork,
  getMyPatientProfileId,
  searchCareUser,
  inviteCaregiver,
  enableCaregiverCommunication,
  revokeCaregiverAccess,
} from "../services/api/patients";

import type {
  PatientCareLink,
  CareUser,
} from "../services/api/patients";

export type CaregiverRole =
  | "PROFESSIONAL"
  | "CLINICAL_CAREGIVER"
  | "HOME_CAREGIVER";

type CarePerson = {
  id: string;
  linkId: string;
  relationship: string;
  name: string;
  role: string;
  status: string;
  permissions?: string[];
};

type Feedback = {
  type: "success" | "error";
  message: string;
} | null;

type CareUserWithProfessionalData = CareUser & {
  specialty?: string | null;
  crm?: string | null;
  professionalVerified?: boolean;
};

export const relationshipLabels: Record<string, string> = {
  PROFESSIONAL: "Médico",
  NEUROLOGIST: "Médico",
  CLINICAL_CAREGIVER: "Cuidador clínico",
  HOME_CAREGIVER: "Cuidador domiciliar",
};

export const statusLabels: Record<string, string> = {
  ACTIVE: "Vínculo ativo",
  PENDING: "Convite pendente",
};

function matchesCaregiverRole(
  user: CareUserWithProfessionalData,
  selectedRole: CaregiverRole,
): boolean {
  const role = user.role?.toUpperCase();

  if (selectedRole === "PROFESSIONAL") {
    return role === "PROFESSIONAL" || role === "NEUROLOGIST";
  }

  return role === selectedRole;
}

function toCarePerson(link: PatientCareLink): CarePerson | null {
  if (!link.userId || typeof link.userId === "string") {
    return null;
  }

  const user = link.userId;
  const name = user.fullName?.trim();

  if (!name) return null;

  return {
    id: user._id ?? link._id,
    linkId: link._id,
    relationship: link.relationship,
    name,
    role:
      relationshipLabels[link.relationship] ??
      "Membro da equipe de cuidado",
    status: link.status,
    permissions: link.permissions,
  };
}

function getUserId(user: CareUser): string | null {
  return user.id ?? user._id ?? null;
}

export default function usePatientDashboardCareNetwork(
  accessToken?: string,
  userId?: string,
) {
  const [links, setLinks] = useState<PatientCareLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [email, setEmail] = useState("");

  const [caregiverRole, setCaregiverRole] =
    useState<CaregiverRole>("CLINICAL_CAREGIVER");

  const [foundUser, setFoundUser] = useState<CareUser | null>(null);
  const [searching, setSearching] = useState(false);
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);

  const [enablingCommunicationId, setEnablingCommunicationId] =
    useState<string | null>(null);

  const [removingCaregiverId, setRemovingCaregiverId] =
    useState<string | null>(null);

  const loadCareNetwork = useCallback(async () => {
    if (!accessToken) {
      setLinks([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await getMyPatientCareNetwork(accessToken);
      setLinks(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível carregar sua rede de cuidado.",
      );
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    let active = true;

    const fetchCareNetwork = async () => {
      if (!accessToken) {
        setLinks([]);
        setError(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const result = await getMyPatientCareNetwork(accessToken);

        if (active) {
          setLinks(result);
        }
      } catch (err) {
        if (active) {
          setLinks([]);
          setError(
            err instanceof Error
              ? err.message
              : "Não foi possível carregar sua rede de cuidado.",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void Promise.resolve().then(fetchCareNetwork);

    return () => {
      active = false;
    };
  }, [accessToken]);

  async function handleSearch(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!accessToken) {
      setFeedback({
        type: "error",
        message: "Sua sessão expirou. Entre novamente para continuar.",
      });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !normalizedEmail.includes("@")) {
      setFeedback({
        type: "error",
        message: "Digite um e-mail válido.",
      });
      return;
    }

    setSearching(true);
    setFoundUser(null);
    setFeedback(null);

    try {
      const user = await searchCareUser(
        accessToken,
        normalizedEmail,
      );

      if (!user) {
        setFeedback({
          type: "error",
          message: "Não encontramos uma conta com esse e-mail.",
        });
        return;
      }

      const professionalUser =
        user as CareUserWithProfessionalData;

      if (!matchesCaregiverRole(professionalUser, caregiverRole)) {
        const roleMessages: Record<CaregiverRole, string> = {
          PROFESSIONAL:
            "Essa conta não está cadastrada como médico. Confira o e-mail e o perfil informado no cadastro.",

          CLINICAL_CAREGIVER:
            "Essa conta não está cadastrada como cuidador clínico.",

          HOME_CAREGIVER:
            "Essa conta não está cadastrada como cuidador domiciliar.",
        };

        setFeedback({
          type: "error",
          message: roleMessages[caregiverRole],
        });

        return;
      }

      setFoundUser(user);
    } catch (err) {
      setFeedback({
        type: "error",
        message:
          err instanceof Error
            ? err.message
            : "Não foi possível buscar essa conta.",
      });
    } finally {
      setSearching(false);
    }
  }

  async function handleInvite() {
    if (!accessToken || !foundUser) return;

    if (!userId) {
      setFeedback({
        type: "error",
        message:
          "Não foi possível identificar seu usuário. Entre novamente para continuar.",
      });
      return;
    }

    const caregiverUserId = getUserId(foundUser);

    if (!caregiverUserId) {
      setFeedback({
        type: "error",
        message: "Não foi possível identificar essa conta.",
      });
      return;
    }

    setSending(true);
    setFeedback(null);

    try {
      const patientId = await getMyPatientProfileId(
        accessToken,
        userId,
      );

      await inviteCaregiver(
        accessToken,
        patientId,
        caregiverUserId,
        caregiverRole,
      );

      setFeedback({
        type: "success",
        message: "Convite enviado! Agora é só aguardar a resposta.",
      });

      setFoundUser(null);
      setEmail("");

      await loadCareNetwork();
    } catch (err) {
      setFeedback({
        type: "error",
        message:
          err instanceof Error
            ? err.message
            : "Não foi possível enviar o convite.",
      });
    } finally {
      setSending(false);
    }
  }

  async function handleEnableCommunication(linkId: string) {
    if (!accessToken) {
      setFeedback({
        type: "error",
        message: "Sua sessão expirou. Entre novamente para continuar.",
      });
      return;
    }

    setEnablingCommunicationId(linkId);
    setFeedback(null);

    try {
      await enableCaregiverCommunication(accessToken, linkId);

      setFeedback({
        type: "success",
        message: "Comunicação habilitada para o cuidador clínico.",
      });

      await loadCareNetwork();
    } catch (err) {
      setFeedback({
        type: "error",
        message:
          err instanceof Error
            ? err.message
            : "Não foi possível habilitar a comunicação.",
      });
    } finally {
      setEnablingCommunicationId(null);
    }
  }

  async function handleRevokeCaregiver(linkId: string) {
    if (!accessToken) {
      setFeedback({
        type: "error",
        message: "Sua sessão expirou. Entre novamente para continuar.",
      });
      return false;
    }

    setRemovingCaregiverId(linkId);
    setFeedback(null);

    try {
      await revokeCaregiverAccess(accessToken, linkId);

      setFeedback({
        type: "success",
        message: "Cuidador removido da sua rede de cuidado.",
      });

      await loadCareNetwork();
      return true;
    } catch (err) {
      setFeedback({
        type: "error",
        message:
          err instanceof Error
            ? err.message
            : "Não foi possível remover o cuidador.",
      });

      return false;
    } finally {
      setRemovingCaregiverId(null);
    }
  }

  const activePeople = useMemo(
    () =>
      links
        .filter((link) => link.status === "ACTIVE")
        .map(toCarePerson)
        .filter(
          (person): person is CarePerson => person !== null,
        ),
    [links],
  );

  const pendingPeople = useMemo(
    () =>
      links
        .filter((link) => link.status === "PENDING")
        .map(toCarePerson)
        .filter(
          (person): person is CarePerson => person !== null,
        ),
    [links],
  );

  return {
    loading,
    error,
    email,
    setEmail,
    caregiverRole,
    setCaregiverRole,
    foundUser,
    setFoundUser,
    searching,
    sending,
    feedback,
    setFeedback,
    activePeople,
    pendingPeople,
    loadCareNetwork,
    handleSearch,
    handleInvite,
    enablingCommunicationId,
    handleEnableCommunication,
    removingCaregiverId,
    handleRevokeCaregiver,
  };
}