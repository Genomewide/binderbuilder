export function SettingsPage() {
  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      <div className="space-y-6">
        <div className="rounded-lg border border-border p-6">
          <h2 className="text-lg font-medium mb-2">General</h2>
          <p className="text-sm text-muted-foreground">
            Settings configuration will be available here.
          </p>
        </div>
        <div className="rounded-lg border border-border p-6">
          <h2 className="text-lg font-medium mb-2">API Keys</h2>
          <p className="text-sm text-muted-foreground">
            API key management coming soon.
          </p>
        </div>
        <div className="rounded-lg border border-border p-6">
          <h2 className="text-lg font-medium mb-2">Appearance</h2>
          <p className="text-sm text-muted-foreground">
            Theme and display preferences coming soon.
          </p>
        </div>
      </div>
    </div>
  );
}
