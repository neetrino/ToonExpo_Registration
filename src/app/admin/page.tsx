export default function AdminDashboardPage() {
  return (
    <section className="rounded-lg border border-border bg-background p-6">
      <h1 className="text-2xl font-bold text-primary">Admin dashboard</h1>
      <p className="mt-2 text-muted-foreground">
        {/* TODO: Protect with Auth.js session and load registrations in a later phase. */}
        Placeholder shell — dashboard data is not available yet.
      </p>
    </section>
  );
}
