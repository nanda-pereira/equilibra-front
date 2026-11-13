import Avatar from "../../../../components/app/Avatar";
import SmallButton from "../../../../components/app/SmallButton";
import usePatientDashboardCareNetwork from "../../../../hooks/usePatientDashboardCareNetwork";

type Props = {
  accessToken?: string;
  userId?: string;
};

export default function PatientDashboardCareNetwork({ accessToken, userId }: Props) {
  const { loading, error, activePeople, pendingPeople, loadCareNetwork } =
    usePatientDashboardCareNetwork(accessToken, userId);

  return (
    <section className="flex flex-col gap-4">
      {loading ? (
        <p className="text-sm text-ink-soft">Carregando sua rede de cuidado…</p>
      ) : error ? (
        <div className="flex flex-col items-start gap-3">
          <p role="alert" className="text-sm text-ink-soft">
            {error}
          </p>
          <SmallButton onClick={() => void loadCareNetwork()}>Tentar novamente</SmallButton>
        </div>
      ) : activePeople.length === 0 ? (
        <p className="text-sm text-ink-soft">
          Sua rede está vazia. Convide um cuidador para acompanhar seu cuidado.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {activePeople.slice(0, 3).map((person) => (
            <li key={person.id} className="flex items-center gap-3 rounded-[20px] bg-mint-100/70 px-4 py-3">
              <Avatar name={person.name} tone="soft" className="bg-white!" />
              <div className="min-w-0">
                <p className="truncate text-base font-medium text-ink">{person.name}</p>
                <p className="text-sm text-ink-soft">{person.role}</p>
              </div>
            </li>
          ))}
        </ul>
      )}

      {!loading && !error && (
        <p className="text-sm text-ink-soft">
          {activePeople.length} na rede
          {pendingPeople.length > 0 ? ` · ${pendingPeople.length} convite(s) aguardando resposta` : ""}
        </p>
      )}

      <div>
        <SmallButton to="/app/rede-de-cuidado">Gerenciar minha rede</SmallButton>
      </div>
    </section>
  );
}