import Avatar from "../../../../components/app/Avatar";
import usePatientDashboardCareNetwork, {
  relationshipLabels,
  statusLabels,
} from "../../../../hooks/usePatientDashboardCareNetwork";

type Props = {
  accessToken?: string;
  userId?: string;
};

export default function PatientDashboardCareNetwork({
  accessToken,
  userId,
}: Props) {
  const {
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
  } = usePatientDashboardCareNetwork(accessToken, userId);

  return (
    <section className="flex flex-col gap-6">
      <div>
        <h3 className="text-base font-medium text-ink">
          Adicionar à sua rede
        </h3>
        <p className="mt-1 text-sm text-ink-soft">
          Encontre seu cuidador pelo e-mail cadastrado no Equilibra.
        </p>

        <form
          onSubmit={handleSearch}
          className="mt-4 flex flex-col gap-4"
        >
          <div>
            <label
              htmlFor="caregiver-role"
              className="mb-2 block text-sm font-medium text-ink"
            >
              Tipo de cuidador
            </label>

            <select
              id="caregiver-role"
              value={caregiverRole}
              onChange={(event) => {
                setCaregiverRole(
                  event.target.value as typeof caregiverRole,
                );
                setFoundUser(null);
                setFeedback(null);
              }}
              className="min-h-12 w-full rounded-2xl border border-field-border bg-white px-4 text-sm text-ink outline-none focus:border-action"
            >
              <option value="CLINICAL_CAREGIVER">
                Cuidador clínico
              </option>
              <option value="HOME_CAREGIVER">
                Cuidador domiciliar
              </option>
            </select>
          </div>

          <div>
            <label
              htmlFor="caregiver-email"
              className="mb-2 block text-sm font-medium text-ink"
            >
              E-mail do cuidador
            </label>

            <input
              id="caregiver-email"
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setFoundUser(null);
                setFeedback(null);
              }}
              placeholder="nome@exemplo.com"
              required
              className="min-h-12 w-full rounded-2xl border border-field-border bg-white px-4 text-sm text-ink outline-none placeholder:text-ink-soft focus:border-action"
            />
          </div>

          <button
            type="submit"
            disabled={searching || sending}
            className="min-h-12 w-full rounded-full bg-action px-5 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {searching ? "Buscando..." : "Buscar cuidador"}
          </button>
        </form>

        {foundUser && (
          <div className="mt-4 rounded-[20px] border border-field-border/60 bg-mint-100/50 p-4">
            <div className="flex items-center gap-3">
              <Avatar
                name={foundUser.fullName ?? foundUser.email ?? "Cuidador"}
                tone="soft"
                className="bg-white!"
              />

              <div className="min-w-0 flex-1">
                <p className="font-medium text-ink">
                  {foundUser.fullName ?? "Conta encontrada"}
                </p>
                <p className="break-all text-sm text-ink-soft">
                  {foundUser.email}
                </p>
                <p className="mt-1 text-xs text-ink-soft">
                  {relationshipLabels[foundUser.role] ?? foundUser.role}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleInvite}
              disabled={sending}
              className="mt-4 min-h-12 w-full rounded-full bg-action px-5 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {sending ? "Enviando convite..." : "Enviar convite"}
            </button>
          </div>
        )}

        {feedback && (
          <p
            role={feedback.type === "error" ? "alert" : "status"}
            className={`mt-3 text-sm ${
              feedback.type === "success"
                ? "text-emerald-700"
                : "text-ink-soft"
            }`}
          >
            {feedback.message}
          </p>
        )}
      </div>

      <div className="h-px bg-field-border/40" />

      <div>
        <div className="mb-3 flex items-center justify-between gap-3">
          <h3 className="text-base font-medium text-ink">
            Convites enviados
          </h3>
          <span className="rounded-full bg-mint-100 px-3 py-1 text-xs text-ink-soft">
            {pendingPeople.length}
          </span>
        </div>

        {loading ? (
          <p className="py-3 text-sm text-ink-soft">
            Carregando convites...
          </p>
        ) : pendingPeople.length === 0 ? (
          <p className="py-3 text-sm text-ink-soft">
            Você ainda não tem convites pendentes.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {pendingPeople.map((person) => (
              <li
                key={person.id}
                className="flex items-center gap-3 rounded-[20px] bg-mint-100/50 px-4 py-3"
              >
                <Avatar
                  name={person.name}
                  tone="soft"
                  className="bg-white!"
                />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-ink">{person.name}</p>
                  <p className="text-sm text-ink-soft">{person.role}</p>
                </div>
                <span className="text-right text-xs text-ink-soft">
                  Aguardando resposta
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between gap-3">
          <h3 className="text-base font-medium text-ink">
            Sua rede de cuidado
          </h3>
          <span className="rounded-full bg-mint-100 px-3 py-1 text-xs text-ink-soft">
            {activePeople.length}
          </span>
        </div>

        {loading ? (
          <p className="py-3 text-sm text-ink-soft">
            Carregando sua rede de cuidado...
          </p>
        ) : error ? (
          <div>
            <p role="alert" className="py-3 text-sm text-ink-soft">
              {error}
            </p>
            <button
              type="button"
              onClick={() => void loadCareNetwork()}
              className="text-sm font-medium text-action underline"
            >
              Tentar novamente
            </button>
          </div>
        ) : activePeople.length === 0 ? (
          <p className="py-3 text-sm text-ink-soft">
            Sua rede aparecerá aqui quando um cuidador aceitar seu convite.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {activePeople.map((person) => (
              <li
                key={person.id}
                className="flex items-center gap-4 rounded-[20px] bg-mint-100/70 px-4 py-3"
              >
                <Avatar
                  name={person.name}
                  tone="soft"
                  className="bg-white!"
                />
                <div className="min-w-0">
                  <p className="text-base font-medium text-ink">
                    {person.name}
                  </p>
                  <p className="text-sm text-ink-soft">{person.role}</p>
                  <p className="mt-1 text-xs text-emerald-700">
                    {statusLabels[person.status]}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}