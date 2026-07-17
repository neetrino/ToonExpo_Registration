import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

type RegistrationDetailRedirectProps = {
  params: Promise<{ id: string }>;
};

export default async function RegistrationDetailRedirectPage({
  params,
}: RegistrationDetailRedirectProps) {
  const { id } = await params;
  redirect(`/admin?view=${encodeURIComponent(id)}`);
}
