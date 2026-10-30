import { useParams } from "react-router";
import EmptyState from "../../components/app/EmptyState";
import GlassCard from "../../components/app/GlassCard";
import PageHeader from "../../components/app/PageHeader";
import { findNavLabel } from "../../modules/app/navigation";
import { useSession } from "../../modules/session/session";

export default function UnderConstructionPage() {
  const { section = "" } = useParams();
  const { session } = useSession();
  if (!session) return null;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={findNavLabel(session.profile, section)} />
      <GlassCard>
        <EmptyState
          title="Esta área ainda está em construção"
          description="Ela ainda não está disponível nesta versão da plataforma."
        />
      </GlassCard>
    </div>
  );
}