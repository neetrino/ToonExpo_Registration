import { notFound } from 'next/navigation';
import { RegistrationDetailCard } from '@/components/admin/registration-detail-card';
import { getAdminRegistration } from '@/lib/admin/get-registration';

export const dynamic = 'force-dynamic';

type RegistrationDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function RegistrationDetailPage({ params }: RegistrationDetailPageProps) {
  const { id } = await params;
  const registration = await getAdminRegistration(id);

  if (!registration) {
    notFound();
  }

  return <RegistrationDetailCard registration={registration} />;
}
