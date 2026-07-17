import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function AdminRegistrationNotFound() {
  return (
    <div className="space-y-4 rounded-lg border border-border bg-background p-6">
      <h1 className="text-xl font-bold text-primary">Registration not found</h1>
      <p className="text-sm text-muted-foreground">
        This registration may have been deleted or does not belong to the active event.
      </p>
      <Button asChild variant="outline" size="sm">
        <Link href="/admin">&larr; Back to registrations</Link>
      </Button>
    </div>
  );
}
