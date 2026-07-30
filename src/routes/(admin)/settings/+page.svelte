<!-- Per-client studio profile, prefixes, templates, export, and tenant-scoped appearance. -->
<script lang="ts">
  import { untrack } from "svelte";
  import PageHeader from "$lib/components/PageHeader.svelte";
  import ModuleConfigurationPanel from "$lib/components/ModuleConfigurationPanel.svelte";
  import RequiredMark from "$lib/components/RequiredMark.svelte";
  import { themePalettes, applyTheme } from "$lib/theme";
  import {
    Sheet,
    Check,
    ChevronDown,
    Download,
    RefreshCw,
    UploadCloud,
    Database,
    MessageSquareText,
    X,
  } from "@lucide/svelte";
  import type { StudioSettings, TenantConfiguration, ThemePalette } from "$lib/types";
  import { formatDateTime } from "$lib/data";
  import { hasCapability, labelFor } from "$lib/capabilities";

  let { data } = $props();
  let settings = $state<StudioSettings>(untrack(() => ({ ...data.settings })));
  let configuration = $state<TenantConfiguration>(untrack(() => structuredClone(data.configuration)));
  const sheetsEnabled = $derived(hasCapability(configuration.effectiveCapabilities, "integrations.googleSheets"));
  const exportEnabled = $derived(hasCapability(configuration.effectiveCapabilities, "reports.excelExport"));
  const whatsappEnabled = $derived(hasCapability(configuration.effectiveCapabilities, "communications.whatsapp"));
  const whiteLabelEnabled = $derived(hasCapability(configuration.effectiveCapabilities, "branding.whiteLabel"));
  let saving = $state(false);
  let message = $state("");
  const messageIsError = $derived(/fail|unable|error|required|exists|incorrect/i.test(message));
  let syncPending = $state(untrack(() => data.sync.pending));
  let syncError = $state(untrack(() => data.sync.lastError || ""));
  let themesOpen = $state(false);
  let storageOpen = $state(false);
  let whatsappSaving = $state(false);
  let runningAction = $state<"sync" | "import" | null>(null);
  let messageTimer: ReturnType<typeof setTimeout> | undefined;
  $effect(() => {
    if (!message || saving || runningAction) return;
    if (messageTimer) clearTimeout(messageTimer);
    messageTimer = setTimeout(() => (message = ""), messageIsError ? 9000 : 4500);
  });
  const formatBytes = (bytes: number) =>
    bytes >= 1024 * 1024
      ? `${(bytes / 1024 / 1024).toFixed(1)} MB`
      : `${(bytes / 1024).toFixed(1)} KB`;

  function previewTheme(palette: ThemePalette) {
    const mode =
      themePalettes.find((theme) => theme.id === palette)?.mode ?? "light";
    settings.themePalette = palette;
    settings.themeDefaultMode = mode;
    applyTheme({ palette, mode }, true, data.themeScope);
  }

  async function save() {
    saving = true;
    message = "";
    try {
      const response = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(settings),
      });
      const result = await response.json();
      message = response.ok
        ? "Settings and business theme saved."
        : result.error || "Unable to save settings.";
    } catch {
      message = "Unable to reach the server. Your changes were not saved.";
    } finally {
      saving = false;
    }
  }

  async function saveWhatsappTemplates() {
    whatsappSaving = true;
    message = "";
    try {
      const response = await fetch("/api/settings/whatsapp", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(configuration.moduleConfiguration["communications.whatsapp"]),
      });
      const result = await response.json();
      if (!response.ok) {
        message = result.error || "Unable to save WhatsApp templates.";
        return;
      }
      configuration.moduleConfiguration["communications.whatsapp"] = result.catalog;
      message = "WhatsApp templates saved.";
    } catch {
      message = "Unable to reach the server. Your WhatsApp templates were not saved.";
    } finally {
      whatsappSaving = false;
    }
  }

  async function run(action: "sync" | "import") {
    if (runningAction) return;
    runningAction = action;
    message =
      action === "sync"
        ? "Retrying Google Sheets sync..."
        : "Importing historical orders...";
    try {
      const response = await fetch(`/api/sheets/${action}`, { method: "POST" });
      const result = await response.json();
      if (!response.ok) message = result.error || "Action failed.";
      else if (action === "import")
        message = `Imported ${result.imported} records; skipped ${result.skipped}. ${result.editorsArchived ? `${result.editorsArchived} ${labelFor(configuration.profile, "staff", true).toLowerCase()} missing from Sheets moved to Archived.` : `${labelFor(configuration.profile, "staff", true)} are reconciled.`}`;
      else if (result.error)
        message = `Google Sheets sync failed: ${result.error}`;
      else
        message = result.configured
          ? `Synced ${result.processed}; ${result.failed} failed. Orders summary: ${result.orders ?? 0} rows.`
          : "Add Google service-account credentials to enable sync.";
      const status = await fetch("/api/sheets/sync").then((statusResponse) =>
        statusResponse.json(),
      );
      syncPending = status.pending || 0;
      syncError = status.lastError || result.error || "";
    } catch {
      message =
        action === "sync"
          ? "Unable to retry Google Sheets sync."
          : "Unable to import historical orders.";
    } finally {
      runningAction = null;
    }
  }
</script>

<PageHeader eyebrow="Workspace preferences, branding and integrations" title="Settings" />

<!-- Platform-managed feature, terminology, portal, and messaging controls are intentionally hidden from client administrators.
  <div class="setup-heading">
    <div><span>Flag-driven workspace</span><h2>Business setup and features</h2><p>Your owner controls what is available. You can enable or hide allowed features and adapt the wording to your niche.</p></div>
    <button class="primary" disabled={capabilitySaving} onclick={saveCapabilities}>{capabilitySaving ? "Saving..." : "Save business setup"}</button>
  </div>
  <div class="setup-columns">
    <div>
      <h3>Enabled features</h3>
      <div class="feature-grid">
        {#each data.capabilityDefinitions as definition}
          {@const allowed = configuration.allowedCapabilities[definition.key as CapabilityKey] !== false}
          <label class:unavailable={!allowed}><input type="checkbox" disabled={!allowed} checked={configuration.preferences[definition.key as CapabilityKey] !== false} onchange={(event) => configuration.preferences[definition.key as CapabilityKey] = event.currentTarget.checked}/><span><b>{definition.label}</b><small>{allowed ? definition.description : "Not included by the owner"}</small></span></label>
        {/each}
      </div>
    </div>
    <div>
      <h3>Business terminology</h3>
      <div class="term-grid">
        {#each terminologyKeys as key}
          <label><span>{key}</span><input bind:value={configuration.profile.terminology[key].singular}/><input bind:value={configuration.profile.terminology[key].plural}/></label>
        {/each}
      </div>
    </div>
  </div>
  {#if configuration.allowedCapabilities.customFields !== false}
    <div class="custom-fields">
      <div><h3>Custom fields</h3><p>Inactive fields keep their saved data. Portal, WhatsApp and reporting visibility can be controlled per field.</p></div>
      <div class="new-field">
        <select bind:value={newField.entity}><option value="customer">Customer</option><option value="order">Order</option><option value="task">Task</option><option value="staff">Staff</option></select>
        <input bind:value={newField.label} placeholder="Field label"/>
        <input bind:value={newField.key} placeholder="field_key"/>
        <select bind:value={newField.type}><option value="text">Short text</option><option value="textarea">Long text</option><option value="number">Number</option><option value="date">Date</option><option value="datetime">Date and time</option><option value="select">Select</option><option value="checkbox">Checkbox</option><option value="url">HTTPS URL</option></select>
        {#if newField.type === "select"}<input bind:value={newField.options} placeholder="Choices, comma separated"/>{/if}
        <button type="button" onclick={addCustomField}>Add field</button>
      </div>
      <div class="field-list">
        {#each configuration.profile.customFields as custom}
          <article class:inactive={!custom.active}><div><b>{custom.label}</b><small>{custom.entity} · {custom.key} · {custom.type}</small></div><label><input type="checkbox" bind:checked={custom.required}/>Required</label><label><input type="checkbox" bind:checked={custom.visibility.customerPortal}/>Customer portal</label><label><input type="checkbox" bind:checked={custom.visibility.staffPortal}/>Staff portal</label><label><input type="checkbox" bind:checked={custom.visibility.whatsapp}/>WhatsApp</label><label><input type="checkbox" bind:checked={custom.visibility.sheets}/>Sheets</label><label><input type="checkbox" bind:checked={custom.visibility.export}/>Export</label><button type="button" onclick={() => custom.active = !custom.active}>{custom.active ? "Deactivate" : "Restore"}</button></article>
        {:else}<p class="empty-fields">This niche does not have custom fields yet.</p>{/each}
      </div>
    </div>
  {/if}
</section>

<ModuleConfigurationPanel {configuration} onmessage={(value) => (message = value)}/> -->

<aside class="owner-managed" aria-label="Platform-managed features">
  <div>
    <strong>Features are managed by your platform administrator</strong>
    <span>Portals, WhatsApp templates, custom fields, and integrations are enabled safely from the platform control panel.</span>
  </div>
  <span class="managed-badge">Protected configuration</span>
</aside>

{#if whatsappEnabled}<details class="card whatsapp-settings">
  <summary>
    <span><MessageSquareText size={17}/></span>
    <div><strong>WhatsApp message templates</strong><small>Create reusable messages for this business. Feature access is still controlled by your platform administrator.</small></div>
    <ChevronDown size={17}/>
  </summary>
  <div class="whatsapp-settings-body">
    <ModuleConfigurationPanel {configuration} whatsappOnly onmessage={(value) => (message = value)}/>
    <button class="primary whatsapp-save" disabled={whatsappSaving} aria-busy={whatsappSaving} onclick={saveWhatsappTemplates}>{whatsappSaving ? "Saving templates..." : "Save WhatsApp templates"}</button>
  </div>
</details>{/if}

<div class="settings-grid">
  <section class="card settings-card">
    <h2>Business profile</h2>
    <p>Used in WhatsApp bills, portals and assignment messages.</p>
    <div class="form-grid">
      <div class="field">
        <label for="studio-name">Business name <RequiredMark/></label><input
          id="studio-name"
          bind:value={settings.studioName}
          required aria-required="true"
        />
      </div>
      <div class="field">
        <label for="order-prefix">{labelFor(configuration.profile, "order")} ID prefix <RequiredMark/></label><input
          id="order-prefix"
          maxlength="8"
          bind:value={settings.orderPrefix}
          required aria-required="true"
          placeholder="ORD"
        /><small>Example: {settings.orderPrefix || "ORD"}-0001</small>
      </div>
      <div class="field">
        <label for="editor-prefix">{labelFor(configuration.profile, "staff")} ID prefix <RequiredMark/></label><input
          id="editor-prefix"
          maxlength="8"
          bind:value={settings.editorPrefix}
          required aria-required="true"
          placeholder="ED"
        /><small>Example: {settings.editorPrefix || "ED"}-0001</small>
      </div>
      {#if whiteLabelEnabled}<div class="field">
        <label for="studio-logo">HTTPS logo URL</label><input
          id="studio-logo"
          type="url"
          bind:value={settings.logoUrl}
        />
      </div>{/if}
      {#if whatsappEnabled}<div class="field">
        <label for="studio-whatsapp">WhatsApp number</label><input
          id="studio-whatsapp"
          bind:value={settings.phone}
        />
      </div>{/if}
      <div class="field">
        <label for="studio-email">Email</label><input
          id="studio-email"
          bind:value={settings.email}
        />
      </div>
      <div class="field">
        <label for="studio-gst">GSTIN</label><input
          id="studio-gst"
          bind:value={settings.gstin}
        />
      </div>
    </div>
    <div class="field full">
      <label for="studio-address">Address</label><textarea
        id="studio-address"
        bind:value={settings.address}
      ></textarea>
    </div>
    <div class="field full">
      <label for="payment-note">Payment note</label><textarea
        id="payment-note"
        bind:value={settings.paymentNote}
      ></textarea>
    </div>
    <div class="field full">
      <label for="invoice-footer">Invoice footer</label><input
        id="invoice-footer"
        bind:value={settings.invoiceFooter}
      />
    </div>
  </section>

  {#if sheetsEnabled || exportEnabled}<section class="card sync-card">
    <h2>Reports and workbook</h2>
    <p>Download allowed reports or mirror enabled modules to Google Sheets.</p>
    {#if sheetsEnabled}
    <div class="sync-status">
      <Sheet size={17} />
      <div>
        <strong
          >{syncPending
            ? `${syncPending} pending changes`
            : "Sync queue clear"}</strong
        ><small>Orders plus supporting tabs</small>
      </div>
    </div>
    {#if syncError}<div class="sync-error">
        <strong>Last Google Sheets error</strong><span>{syncError}</span>
      </div>{/if}
    <button
      class="secondary sheet-action retry-action"
      disabled={runningAction !== null}
      aria-busy={runningAction === "sync"}
      onclick={() => run("sync")}
      ><RefreshCw
        class={runningAction === "sync" ? "loading" : ""}
        size={13}
      />{runningAction === "sync" ? "Retrying sync..." : "Retry sync"}</button
    >
    <button
      class="secondary sheet-action import-action"
      disabled={runningAction !== null}
      aria-busy={runningAction === "import"}
      onclick={() => run("import")}
      ><UploadCloud
        class={runningAction === "import" ? "loading-upload" : ""}
        size={13}
      />{runningAction === "import"
        ? "Importing orders..."
        : "Import historical Orders"}</button
    >
    {/if}
    {#if exportEnabled}<a class="secondary export" href="/api/export"
      ><Download size={13} /> Download workbook</a
    >{/if}
  </section>{/if}

  <section
    class:critical={data.storage.level === "critical"}
    class:warning={data.storage.level === "warning"}
    class:notice={data.storage.level === "notice"}
    class="card storage-card collapsible-card"
  >
    <button
      class="storage-heading dropdown-heading"
      aria-expanded={storageOpen}
      onclick={() => (storageOpen = !storageOpen)}
      ><span><Database size={17} /></span>
      <div>
        <h2>Database storage</h2>
        <p>
          {data.storage.percent}% used · Open only when you need storage
          details.
        </p>
      </div>
      <strong>{data.storage.percent}%</strong><ChevronDown
        class={storageOpen ? "open" : ""}
        size={17}
      /></button
    >
    {#if storageOpen}<div class="dropdown-body">
        <div class="storage-meter">
          <span style:width={`${Math.min(100, data.storage.percent)}%`}></span>
        </div>
        <div class="storage-numbers">
          <span>{formatBytes(data.storage.bytes)} used</span><span
            >{data.storage.limitMb} MB monitored limit</span
          >
        </div>
        <div class="retention-status">
          <strong>Automatic retention</strong><span
            >Successful Sheet-sync records: 30 days</span
          ><span>Activity logs: 12 months</span
          >{#if data.storage.cleanup.lastRunAt}<small
              >Last checked {formatDateTime(
                data.storage.cleanup.lastRunAt,
              )}</small
            >{/if}
        </div>
      </div>{/if}
  </section>

  <!-- Legacy two-template editor retained only for migration reference.
    <button
      class="dropdown-heading template-heading"
      aria-expanded={templatesOpen}
      onclick={() => (templatesOpen = !templatesOpen)}
      ><span><MessageSquareText size={17} /></span>
      <div>
        <h2>WhatsApp templates</h2>
        <p>{labelFor(configuration.profile, "staff")} assignments and {labelFor(configuration.profile, "customer").toLowerCase()} status/bill messages.</p>
      </div>
      <ChevronDown class={templatesOpen ? "open" : ""} size={17} /></button
    >
    {#if templatesOpen}<div class="template-grid dropdown-body">
        <article class="template-preview">
          <div class="template-title">
            <span><MessageSquareText size={16} /></span>
            <div>
              <strong>{labelFor(configuration.profile, "staff")} assignment</strong><small
                >Work details and private staff portal</small
              >
            </div>
            <button
              class="template-reset"
              onclick={() => usePolishedTemplate("assignmentTemplate")}
              aria-label="Use polished editor template"
              title="Use polished default"><RefreshCw size={13}/></button>
            <button
              onclick={() => editTemplate("assignmentTemplate")}
              aria-label="Edit editor assignment template"
              ><Pencil size={14} /></button
            >
          </div>
          <pre>{settings.assignmentTemplate}</pre>
          <div class="link-preview-mock"><span>SF</span><div><strong>{settings.studioName} — Private {labelFor(configuration.profile, "staff").toLowerCase()} work portal</strong><small>View work items, source files and submit updates</small><em>workspace portal</em></div></div>
        </article>
        <article class="template-preview">
          <div class="template-title">
            <span><MessageSquareText size={16} /></span>
            <div>
              <strong>Customer bill & status</strong><small
                >Invoice, payments and unique private status link</small
              >
            </div>
            <button
              class="template-reset"
              onclick={() => usePolishedTemplate("invoiceTemplate")}
              aria-label="Use polished customer template"
              title="Use polished default"><RefreshCw size={13}/></button>
            <button
              onclick={() => editTemplate("invoiceTemplate")}
              aria-label="Edit customer bill and status template"
              ><Pencil size={14} /></button
            >
          </div>
          <pre>{settings.invoiceTemplate}</pre>
          <div class="link-preview-mock"><span>SF</span><div><strong>{settings.studioName} — Private {labelFor(configuration.profile, "customer").toLowerCase()} portal</strong><small>View work status, invoices and receipts</small><em>workspace portal</em></div></div>
        </article>
      </div>{/if}
  -->

  <section class="card theme-card">
    <button
      class="theme-heading"
      aria-expanded={themesOpen}
      onclick={() => (themesOpen = !themesOpen)}
      ><div>
        <h2>Business theme</h2>
        <p>
          Choose a polished light or dark palette. Every option is tuned for
          readable text and controls.
        </p>
      </div>
      <ChevronDown class={themesOpen ? "open" : ""} size={18} /></button
    >
    {#if themesOpen}<div class="palette-grid">
        {#each themePalettes as palette}<button
            class:selected={settings.themePalette === palette.id}
            class="palette"
            onclick={() => previewTheme(palette.id)}
            ><span
              >{#each palette.colors as color}<i style:background={color}
                ></i>{/each}</span
            >
            <div class="palette-title">
              <strong>{palette.name}</strong><small
                >{palette.recommended
                  ? `Recommended · ${palette.mode}`
                  : palette.mode}</small
              >
            </div>
            {#if settings.themePalette === palette.id}<Check
                size={13}
              />{/if}</button
          >{/each}
      </div>{/if}
  </section>
</div>

<!-- Legacy template modal retained only for migration reference.
  title={editingTemplate === "assignmentTemplate"
    ? "Edit editor assignment template"
    : "Edit customer bill & status template"}
  bind:open={templateModalOpen}
  wide
>
  <div class="template-editor">
    <p>
      Keep placeholder names inside double braces. Messages open in WhatsApp for
      review before sending.
    </p>
    <textarea bind:value={templateDraft}></textarea><small
      >{editingTemplate === "assignmentTemplate"
        ? "Available: editor_name, studio_name, project, customer, task_list, portal_link"
        : "Available: studio_name, studio_address, studio_phone_line, gstin_line, invoice_number, customer, project, event, delivery_date, total, paid, balance, payment_note, invoice_footer_line, portal_link"}</small
    >
  </div>
  {#snippet footer()}<button
      class="secondary"
      onclick={() => (templateModalOpen = false)}>Cancel</button
    ><button class="primary" disabled={templateSaving} onclick={saveTemplate}
      >{templateSaving ? "Saving..." : "Save template"}</button
    >{/snippet}
-->

{#if message}<div class:error={messageIsError} class="settings-notice" role={messageIsError ? "alert" : "status"}>
  <span>{message}</span><button type="button" aria-label="Dismiss notification" onclick={() => message = ""}><X size={14}/></button>
</div>{/if}

<div class="save-bar">
  <span>Changes apply to this workspace after saving.</span><button class="primary" disabled={saving} aria-busy={saving} onclick={save}
    >{saving ? "Saving..." : "Save settings"}</button
  >
</div>

<style>
  .settings-notice{position:fixed;z-index:90;top:82px;right:20px;display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:start;gap:10px;width:min(390px,calc(100vw - 28px));box-sizing:border-box;padding:13px 14px;border:1px solid color-mix(in srgb,#10b981 46%,var(--line));border-radius:12px;background:color-mix(in srgb,var(--card) 94%,#10b981 6%);color:#047857;box-shadow:0 20px 55px #0f172a24;font-size:10px;line-height:1.5;animation:notice-in .2s ease-out}.settings-notice.error{border-color:color-mix(in srgb,#ef4444 48%,var(--line));background:color-mix(in srgb,var(--card) 94%,#ef4444 6%);color:#dc2626}.settings-notice button{width:26px;height:26px;display:grid;place-items:center;padding:0;border:0;border-radius:7px;background:transparent;color:currentColor}@keyframes notice-in{from{opacity:0;transform:translateY(-7px) scale(.98)}}
  .whatsapp-settings{margin-bottom:18px;padding:0;overflow:hidden}.whatsapp-settings>summary{display:grid;grid-template-columns:auto minmax(0,1fr) auto;align-items:center;gap:12px;padding:17px 19px;list-style:none;cursor:pointer}.whatsapp-settings>summary::-webkit-details-marker{display:none}.whatsapp-settings>summary>span{width:35px;height:35px;display:grid;place-items:center;border-radius:10px;background:color-mix(in srgb,var(--purple) 10%,var(--card));color:var(--purple)}.whatsapp-settings>summary>div{display:grid;gap:4px}.whatsapp-settings>summary strong{font-size:12px}.whatsapp-settings>summary small{color:var(--muted);font-size:9px;line-height:1.45}.whatsapp-settings>summary>:global(svg:last-child){color:var(--muted);transition:transform .2s ease}.whatsapp-settings[open]>summary{border-bottom:1px solid var(--line)}.whatsapp-settings[open]>summary>:global(svg:last-child){color:var(--purple);transform:rotate(180deg)}.whatsapp-settings-body{padding:18px}.whatsapp-save{width:100%;min-height:43px;justify-content:center;margin-top:12px}
  .owner-managed{display:flex;align-items:center;justify-content:space-between;gap:18px;margin-bottom:18px;padding:15px 18px;border:1px solid color-mix(in srgb,var(--purple) 28%,var(--line));border-radius:14px;background:linear-gradient(135deg,color-mix(in srgb,var(--purple) 8%,var(--card)),var(--card));box-shadow:0 10px 30px #0f172a08}.owner-managed>div{display:grid;gap:4px}.owner-managed strong{font-size:11px}.owner-managed span{color:var(--muted);font-size:9px;line-height:1.5}.owner-managed .managed-badge{flex:none;padding:7px 9px;border:1px solid color-mix(in srgb,var(--purple) 28%,var(--line));border-radius:999px;background:var(--card);color:var(--purple);font-size:8px;font-weight:750}
  .settings-grid {
    display: grid;
    grid-template-columns: 1.45fr 1fr;
    gap: 18px;
  }
  .settings-card,
  .sync-card,
  .theme-card {
    padding: 24px;
  }
  .settings-card h2,
  .sync-card h2,
  .theme-card h2 {
    font-size: 14px;
    margin: 0;
  }
  .settings-card > p,
  .sync-card > p,
  .theme-heading p {
    color: var(--muted);
    font-size: 10px;
    margin: 6px 0 22px;
  }
  .full {
    margin-top: 18px;
  }
  .sync-card {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .sync-card > p {
    margin-bottom: 7px;
  }
  .sync-status {
    display: flex;
    align-items: center;
    gap: 11px;
    border: 1px solid var(--line);
    border-radius: 12px;
    padding: 13px;
    color: var(--purple);
    transition:
      border-color 0.2s ease,
      transform 0.2s ease,
      background 0.2s ease;
  }
  .sync-status:hover {
    border-color: color-mix(in srgb, var(--purple) 55%, var(--line));
    background: var(--theme-soft);
    transform: translateY(-1px);
  }
  .sync-status :global(svg) {
    transition: transform 0.22s ease;
  }
  .sync-status:hover :global(svg) {
    transform: scale(1.12) rotate(-4deg);
  }
  .sync-status div {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }
  .sync-status strong {
    font-size: 11px;
  }
  .sync-status small {
    font-size: 9px;
    color: var(--muted);
  }
  .sync-error {
    display: flex;
    flex-direction: column;
    gap: 5px;
    border: 1px solid #ef44444d;
    border-radius: 12px;
    background: #ef444410;
    color: #ef7777;
    padding: 11px 12px;
  }
  .sync-error strong {
    font-size: 10px;
  }
  .sync-error span {
    font:
      9px/1.5 ui-monospace,
      SFMono-Regular,
      Menlo,
      monospace;
    overflow-wrap: anywhere;
    white-space: pre-wrap;
  }
  .retry-action {
    --action-color: var(--purple);
  }
  .import-action {
    --action-color: #38bdf8;
  }
  .export {
    --action-color: #34d399;
  }
  .sync-card .secondary,
  .export {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    border-color: color-mix(in srgb, var(--action-color) 42%, var(--line));
    background: color-mix(in srgb, var(--action-color) 9%, var(--card));
    color: var(--theme-text);
    box-shadow: inset 3px 0 var(--action-color);
    transition:
      border-color 0.2s ease,
      background 0.2s ease,
      color 0.2s ease,
      transform 0.15s ease,
      box-shadow 0.2s ease;
  }
  .sync-card .secondary :global(svg),
  .export :global(svg) {
    color: var(--action-color);
    transition:
      transform 0.2s ease,
      color 0.2s ease;
  }
  .sync-card .secondary:not(:disabled):hover,
  .export:hover {
    border-color: var(--action-color);
    color: var(--action-color);
    background: color-mix(in srgb, var(--action-color) 16%, var(--card));
    box-shadow:
      inset 3px 0 var(--action-color),
      0 8px 22px color-mix(in srgb, var(--action-color) 15%, transparent);
    transform: translateY(-1px);
  }
  .sync-card .secondary:not(:disabled):active,
  .export:active {
    transform: translateY(0) scale(0.985);
  }
  .sync-card .secondary:not(:disabled):hover :global(svg),
  .export:hover :global(svg) {
    transform: scale(1.14);
  }
  .sync-card .secondary:disabled {
    cursor: wait;
    opacity: 0.62;
  }
  .sync-card :global(svg.loading) {
    animation: sync-spin 0.75s linear infinite;
  }
  .sync-card :global(svg.loading-upload) {
    animation: upload-pulse 0.75s ease-in-out infinite alternate;
  }
  @keyframes sync-spin {
    to {
      transform: rotate(360deg);
    }
  }
  @keyframes upload-pulse {
    to {
      transform: translateY(-3px) scale(1.08);
    }
  }
  .theme-card {
    grid-column: 1/-1;
  }
  .collapsible-card {
    padding: 18px 20px;
  }
  .dropdown-heading {
    width: 100%;
    border: 0;
    background: transparent;
    color: inherit;
    text-align: left;
    padding: 0;
    display: flex;
    align-items: center;
    gap: 11px;
  }
  .dropdown-heading > span {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background: var(--theme-soft);
    color: var(--purple);
    display: grid;
    place-items: center;
  }
  .dropdown-heading > div {
    flex: 1;
  }
  .dropdown-heading h2 {
    font-size: 13px;
  }
  .dropdown-heading p {
    color: var(--muted);
    font-size: 9px;
    margin: 4px 0 0;
  }
  .dropdown-heading > :global(svg:last-child) {
    color: var(--muted);
    transition: transform 0.2s;
  }
  .dropdown-heading > :global(svg.open) {
    transform: rotate(180deg);
  }
  .dropdown-body {
    margin-top: 18px;
  }
  .storage-heading > strong {
    font-size: 14px;
    color: var(--purple);
  }
  .theme-heading {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: start;
    border: 0;
    background: transparent;
    color: inherit;
    text-align: left;
    padding: 0;
  }
  .theme-heading p {
    margin-bottom: 0;
  }
  .theme-heading :global(svg) {
    color: var(--muted);
    transition: transform 0.2s;
  }
  .theme-heading :global(svg.open) {
    transform: rotate(180deg);
  }
  .palette-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
    margin-top: 22px;
  }
  .palette {
    position: relative;
    border: 1px solid var(--line);
    border-radius: 13px;
    background: var(--card);
    color: inherit;
    text-align: left;
    padding: 10px;
  }
  .palette.selected {
    border-color: var(--purple);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--purple) 14%, transparent);
  }
  .palette > span {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    overflow: hidden;
    height: 44px;
    border-radius: 8px;
  }
  .palette i {
    display: block;
  }
  .palette-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 9px;
  }
  .palette strong {
    font-size: 10px;
  }
  .palette small {
    color: var(--muted);
    font-size: 8px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }
  .save-bar {
    position: sticky;
    bottom: 18px;
    margin-top: 18px;
    border: 1px solid var(--line);
    border-radius: 14px;
    background: color-mix(in srgb, var(--card) 92%, transparent);
    backdrop-filter: blur(16px);
    padding: 11px 13px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-shadow: 0 18px 50px #0002;
  }
  .save-bar span {
    font-size: 10px;
    color: var(--muted);
  }
  @media (max-width: 900px) {
    .settings-grid {
      grid-template-columns: 1fr;
    }
    .theme-card {
      grid-column: auto;
    }
    .palette-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
  @media (max-width: 650px) {
    .storage-heading > strong {
      display: none;
    }
  }
  @media (max-width: 560px) {
    .owner-managed{align-items:flex-start;flex-direction:column}.owner-managed .managed-badge{align-self:flex-start}
    .whatsapp-settings>summary{grid-template-columns:auto minmax(0,1fr);padding:15px}.whatsapp-settings>summary>:global(svg:last-child){grid-column:2;justify-self:end;margin-top:-27px}.whatsapp-settings-body{min-width:0;padding:12px}
    .palette-grid {
      grid-template-columns: 1fr;
    }
    .save-bar{bottom:10px;align-items:stretch;flex-direction:column;gap:9px;padding:10px}.save-bar span{text-align:center}.save-bar button{width:100%;min-height:42px;justify-content:center}
  }
</style>
