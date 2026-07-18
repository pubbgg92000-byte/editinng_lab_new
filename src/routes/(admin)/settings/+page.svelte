<script lang="ts">
  import { untrack } from "svelte";
  import PageHeader from "$lib/components/PageHeader.svelte";
  import Modal from "$lib/components/Modal.svelte";
  import { themePalettes, applyTheme } from "$lib/theme";
  import {
    Sheet,
    Check,
    ChevronDown,
    Download,
    RefreshCw,
    UploadCloud,
    Pencil,
    MessageSquareText,
    Database,
  } from "@lucide/svelte";
  import type { StudioSettings, ThemePalette } from "$lib/types";
  import { formatDateTime } from "$lib/data";
  import { defaultAssignmentTemplate, defaultInvoiceTemplate } from "$lib/messageTemplates";

  let { data } = $props();
  let settings = $state<StudioSettings>(untrack(() => ({ ...data.settings })));
  let saving = $state(false);
  let message = $state("");
  let syncPending = $state(untrack(() => data.sync.pending));
  let syncError = $state(untrack(() => data.sync.lastError || ""));
  let themesOpen = $state(false);
  let storageOpen = $state(false);
  let templatesOpen = $state(false);
  let templateModalOpen = $state(false);
  let editingTemplate = $state<"assignmentTemplate" | "invoiceTemplate">(
    "assignmentTemplate",
  );
  let templateDraft = $state("");
  let templateSaving = $state(false);
  let runningAction = $state<"sync" | "import" | null>(null);
  const formatBytes = (bytes: number) =>
    bytes >= 1024 * 1024
      ? `${(bytes / 1024 / 1024).toFixed(1)} MB`
      : `${(bytes / 1024).toFixed(1)} KB`;

  function editTemplate(type: "assignmentTemplate" | "invoiceTemplate") {
    editingTemplate = type;
    templateDraft = settings[type];
    if (
      type === "invoiceTemplate" &&
      !templateDraft.includes("{{portal_link}}")
    )
      templateDraft = `${templateDraft.trimEnd()}\n\nView work status and bill:\n{{portal_link}}`;
    templateModalOpen = true;
  }
  function usePolishedTemplate(type: "assignmentTemplate" | "invoiceTemplate") {
    settings[type] = type === "assignmentTemplate" ? defaultAssignmentTemplate : defaultInvoiceTemplate;
    message = "Polished template selected. Save settings to apply it.";
  }

  async function saveTemplate() {
    templateSaving = true;
    const savedTemplate =
      editingTemplate === "invoiceTemplate" &&
      !templateDraft.includes("{{portal_link}}")
        ? `${templateDraft.trimEnd()}\n\nView work status and bill:\n{{portal_link}}`
        : templateDraft;
    const response = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ [editingTemplate]: savedTemplate }),
    });
    const result = await response.json();
    templateSaving = false;
    if (!response.ok) {
      message = result.error || "Unable to save template.";
      return;
    }
    settings[editingTemplate] = savedTemplate;
    message = "WhatsApp template saved.";
    templateModalOpen = false;
  }

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
    const response = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(settings),
    });
    const result = await response.json();
    message = response.ok
      ? "Settings and studio theme saved."
      : result.error || "Unable to save settings.";
    saving = false;
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
        message = `Imported ${result.imported} orders; skipped ${result.skipped}. ${result.editorsArchived ? `${result.editorsArchived} editor(s) missing from Sheets moved to Archived.` : "Editors are reconciled."}`;
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

<PageHeader eyebrow="Studio, theme and integrations" title="Settings" />

<div class="settings-grid">
  <section class="card settings-card">
    <h2>Studio profile</h2>
    <p>Used in WhatsApp bills, portals and assignment messages.</p>
    <div class="form-grid">
      <div class="field">
        <label for="studio-name">Studio name</label><input
          id="studio-name"
          bind:value={settings.studioName}
        />
      </div>
      <div class="field">
        <label for="order-prefix">Order ID prefix</label><input
          id="order-prefix"
          maxlength="8"
          bind:value={settings.orderPrefix}
          placeholder="ORD"
        /><small>Example: {settings.orderPrefix || "ORD"}-0001</small>
      </div>
      <div class="field">
        <label for="editor-prefix">Editor / employee ID prefix</label><input
          id="editor-prefix"
          maxlength="8"
          bind:value={settings.editorPrefix}
          placeholder="ED"
        /><small>Example: {settings.editorPrefix || "ED"}-0001</small>
      </div>
      <div class="field">
        <label for="studio-logo">HTTPS logo URL</label><input
          id="studio-logo"
          type="url"
          bind:value={settings.logoUrl}
        />
      </div>
      <div class="field">
        <label for="studio-whatsapp">WhatsApp number</label><input
          id="studio-whatsapp"
          bind:value={settings.phone}
        />
      </div>
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

  <section class="card sync-card">
    <h2>Google Sheets</h2>
    <p>Neon is the source of truth. Changes are mirrored to your workbook.</p>
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
    <a class="secondary export" href="/api/export"
      ><Download size={13} /> Download workbook</a
    >
  </section>

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

  <section class="card template-card collapsible-card">
    <button
      class="dropdown-heading template-heading"
      aria-expanded={templatesOpen}
      onclick={() => (templatesOpen = !templatesOpen)}
      ><span><MessageSquareText size={17} /></span>
      <div>
        <h2>WhatsApp templates</h2>
        <p>Editor assignments and customer status/bill messages.</p>
      </div>
      <ChevronDown class={templatesOpen ? "open" : ""} size={17} /></button
    >
    {#if templatesOpen}<div class="template-grid dropdown-body">
        <article class="template-preview">
          <div class="template-title">
            <span><MessageSquareText size={16} /></span>
            <div>
              <strong>Editor assignment</strong><small
                >Work details and private editor portal</small
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
          <div class="link-preview-mock"><span>SF</span><div><strong>{settings.studioName} — Private editor work portal</strong><small>View tasks, source files and submit work updates</small><em>editing-lab-new.vercel.app</em></div></div>
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
          <div class="link-preview-mock"><span>SF</span><div><strong>{settings.studioName} — Private customer portal</strong><small>View orders, progress, invoices and receipts</small><em>editing-lab-new.vercel.app</em></div></div>
        </article>
      </div>{/if}
  </section>

  <section class="card theme-card">
    <button
      class="theme-heading"
      aria-expanded={themesOpen}
      onclick={() => (themesOpen = !themesOpen)}
      ><div>
        <h2>Studio theme</h2>
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

<Modal
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
</Modal>

<div class="save-bar">
  <span>{message}</span><button class="primary" disabled={saving} onclick={save}
    >{saving ? "Saving..." : "Save settings"}</button
  >
</div>

<style>
  .settings-grid {
    display: grid;
    grid-template-columns: 1.45fr 1fr;
    gap: 18px;
  }
  .settings-card,
  .sync-card,
  .theme-card,
  .template-card {
    padding: 24px;
  }
  .settings-card h2,
  .sync-card h2,
  .theme-card h2,
  .template-card h2 {
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
  .template-card,
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
  .template-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }
  .template-grid small {
    display: block;
    margin-top: 7px;
    color: var(--muted);
    font-size: 8px;
    line-height: 1.5;
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
    .template-card,
    .theme-card {
      grid-column: auto;
    }
    .palette-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
  @media (max-width: 650px) {
    .template-grid {
      grid-template-columns: 1fr;
    }
    .storage-heading > strong {
      display: none;
    }
  }
  @media (max-width: 560px) {
    .palette-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
