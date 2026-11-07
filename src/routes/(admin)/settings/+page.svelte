<!-- Per-client studio profile, prefixes, templates, export, and tenant-scoped appearance. -->
<script lang="ts">
  import { safeFetch } from "$lib/http";
  import { untrack } from "svelte";
  import { beforeNavigate, goto } from "$app/navigation";
  import { askConfirm, confirmDanger } from "$lib/stores/confirm";
  import { notifyAction } from "$lib/stores/actionFeedback";
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
  // Unsaved-change tracking: the save bar appears only when something changed, and leaving warns first.
  let savedSnapshot = $state(untrack(() => JSON.stringify(data.settings)));
  const dirty = $derived(JSON.stringify(settings) !== savedSnapshot);
  // Ask before leaving with unsaved changes (in-app dialog; navigation resumes only if confirmed).
  let leaveConfirmed = false;
  beforeNavigate((navigation) => {
    if (!dirty || leaveConfirmed || navigation.type === "leave") return;
    navigation.cancel();
    const target = navigation.to?.url;
    askConfirm({ title: "Unsaved changes", message: "You have unsaved settings. Leave without saving?", confirmLabel: "Leave without saving", danger: true }).then((leave) => {
      if (leave && target) { leaveConfirmed = true; goto(target); }
    });
  });
  function discard() {
    settings = JSON.parse(savedSnapshot);
    applyTheme({ palette: settings.themePalette, mode: settings.themeDefaultMode }, false, data.themeScope);
  }
  let syncPending = $state(untrack(() => data.sync.pending));
  let syncError = $state(untrack(() => data.sync.lastError || ""));
  let themesOpen = $state(false);
  let storageOpen = $state(false);
  let whatsappSaving = $state(false);
  let runningAction = $state<"sync" | "import" | null>(null);
  const formatBytes = (bytes: number) =>
    bytes >= 1024 * 1024
      ? `${(bytes / 1024 / 1024).toFixed(1)} MB`
      : `${(bytes / 1024).toFixed(1)} KB`;

  function previewTheme(palette: ThemePalette) {
    const mode =
      themePalettes.find((theme) => theme.id === palette)?.mode ?? "light";
    settings.themePalette = palette;
    settings.themeDefaultMode = mode;
    // Preview only; the choice is remembered after Save succeeds.
    applyTheme({ palette, mode }, false, data.themeScope);
  }

  async function save() {
    saving = true;
    try {
      const response = await safeFetch("/api/settings", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(settings),
      });
      const result = await response.json();
      if (!response.ok) { notifyAction(result.error || "Couldn't save settings.", "error"); return; }
      savedSnapshot = JSON.stringify(settings);
      applyTheme({ palette: settings.themePalette, mode: settings.themeDefaultMode }, true, data.themeScope);
      notifyAction("Settings saved.");
    } finally {
      saving = false;
    }
  }

  async function saveWhatsappTemplates() {
    whatsappSaving = true;
    try {
      const response = await safeFetch("/api/settings/whatsapp", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(configuration.moduleConfiguration["communications.whatsapp"]),
      });
      const result = await response.json();
      if (!response.ok) {
        notifyAction(result.error || "Couldn't save the WhatsApp messages.", "error");
        return;
      }
      configuration.moduleConfiguration["communications.whatsapp"] = result.catalog;
      notifyAction("WhatsApp messages saved.");
    } finally {
      whatsappSaving = false;
    }
  }

  async function run(action: "sync" | "import") {
    if (runningAction) return;
    if (action === "import" && !await confirmDanger("Import past orders from the Google Sheet?\n\nRows already in NexaDesk are skipped. This can take a moment.")) return;
    runningAction = action;
    try {
      const response = await safeFetch(`/api/sheets/${action}`, { method: "POST" });
      const result = await response.json();
      if (!response.ok) notifyAction(result.error || (action === "sync" ? "Couldn't copy changes to Google Sheets." : "Couldn't import past orders."), "error");
      else if (action === "import")
        notifyAction(`Imported ${result.imported} past orders${result.skipped ? `, skipped ${result.skipped} already here` : ""}.${result.editorsArchived ? ` ${result.editorsArchived} ${labelFor(configuration.profile, "staff", true).toLowerCase()} archived to match the Sheet.` : ""}${result.warning ? ` ${result.warning}` : ""}`);
      else if (result.error) notifyAction(`Google Sheets didn't update: ${result.error}`, "error");
      else if (!result.configured) notifyAction("Google Sheets isn't connected yet. Ask your platform administrator to connect it.", "error");
      else if (result.failed) notifyAction(`Copied ${result.processed} changes; ${result.failed} couldn't be copied. Try again in a minute.`, "error");
      else notifyAction(result.processed ? `Copied ${result.processed} changes to Google Sheets.` : "Google Sheets is already up to date.");
      const status = await safeFetch("/api/sheets/sync").then((statusResponse) => statusResponse.json());
      syncPending = status.pending || 0;
      syncError = status.lastError || result.error || "";
    } finally {
      runningAction = null;
    }
  }
</script>

<PageHeader eyebrow="Your business details, messages, Google Sheets and look." title="Settings" />

<nav class="jump" aria-label="Settings sections">
  <a href="#business">Business details</a>
  {#if whatsappEnabled}<a href="#messages">WhatsApp messages</a>{/if}
  {#if sheetsEnabled || exportEnabled}<a href="#sheets">Google Sheets and reports</a>{/if}
  <a href="#theme">Look and colours</a>
  <a href="#storage">Storage</a>
</nav>


<aside class="owner-managed" aria-label="Platform-managed features">
  <div>
    <strong>Features are managed by your platform administrator</strong>
    <span>Portals, WhatsApp templates, custom fields, and integrations are enabled safely from the platform control panel.</span>
  </div>
  <span class="managed-badge">Protected configuration</span>
</aside>

{#if whatsappEnabled}<details class="card whatsapp-settings" id="messages">
  <summary>
    <span><MessageSquareText size={17}/></span>
    <div><strong>WhatsApp messages</strong><small>Ready-made messages you send to customers and your team. Open to add or edit.</small></div>
    <ChevronDown size={17}/>
  </summary>
  <div class="whatsapp-settings-body">
    <ModuleConfigurationPanel {configuration} whatsappOnly onmessage={(value) => notifyAction(value, /fail|unable|couldn|error|remove|required/i.test(value) ? "error" : "success")}/>
    <button class="primary whatsapp-save" disabled={whatsappSaving} aria-busy={whatsappSaving} onclick={saveWhatsappTemplates}>{whatsappSaving ? "Saving…" : "Save WhatsApp messages"}</button>
  </div>
</details>{/if}

<div class="settings-grid">
  <section class="card settings-card" id="business">
    <h2>Business details</h2>
    <p>Shown on bills, customer pages and messages.</p>
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

  {#if sheetsEnabled || exportEnabled}<section class="card sync-card" id="sheets">
    <h2>Google Sheets and reports</h2>
    <p>Your data is copied to Google Sheets automatically. You can also download everything as an Excel file.</p>
    {#if sheetsEnabled}
    <div class="sync-status">
      <Sheet size={17} />
      <div>
        <strong
          >{syncPending
            ? `${syncPending} ${syncPending === 1 ? "change" : "changes"} waiting to copy`
            : "Google Sheets is up to date"}</strong
        ><small>{syncPending ? "These copy automatically; use the button to try now." : "All changes are copied."}</small>
      </div>
    </div>
    {#if syncError}<div class="sync-error">
        <strong>Last problem copying to Google Sheets</strong><span>{syncError}</span>
      </div>{/if}
    <button
      class="secondary sheet-action retry-action"
      disabled={runningAction !== null}
      aria-busy={runningAction === "sync"}
      onclick={() => run("sync")}
      ><RefreshCw
        class={runningAction === "sync" ? "loading" : ""}
        size={13}
      />{runningAction === "sync" ? "Copying…" : "Copy changes now"}</button
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
        ? "Importing…"
        : "Import past orders from the Sheet"}</button
    >
    {/if}
    {#if exportEnabled}<a class="secondary export" href="/api/export" data-sveltekit-reload
      ><Download size={13} /> Download Excel file</a
    >{/if}
  </section>{/if}

  <section
    class:critical={data.storage.level === "critical"}
    class:warning={data.storage.level === "warning"}
    class:notice={data.storage.level === "notice"}
    class="card storage-card collapsible-card"
    id="storage"
  >
    <button
      class="storage-heading dropdown-heading"
      aria-expanded={storageOpen}
      onclick={() => (storageOpen = !storageOpen)}
      ><span><Database size={17} /></span>
      <div>
        <h2>Database storage</h2>
        <p>
          {data.storage.percent}% of your space used. Old sync records clean up automatically.
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


  <section class="card theme-card" id="theme">
    <button
      class="theme-heading"
      aria-expanded={themesOpen}
      onclick={() => (themesOpen = !themesOpen)}
      ><div>
        <h2>Look and colours</h2>
        <p>
          Pick a colour style for your workspace. Click one to preview it, then save.
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


{#if dirty}
  <div class="save-bar" role="region" aria-label="Unsaved changes">
    <span>You have unsaved changes.</span>
    <div class="save-actions">
      <button class="secondary" type="button" disabled={saving} onclick={discard}>Discard</button>
      <button class="primary" type="button" disabled={saving} aria-busy={saving} onclick={save}>{saving ? "Saving…" : "Save changes"}</button>
    </div>
  </div>
{/if}
<svelte:window onbeforeunload={(event) => { if (dirty) event.preventDefault(); }} />

<style>
  @keyframes notice-in{from{opacity:0;transform:translateY(-7px) scale(.98)}}
  .whatsapp-settings{margin-bottom:18px;padding:0;overflow:hidden}.whatsapp-settings>summary{display:grid;grid-template-columns:auto minmax(0,1fr) auto;align-items:center;gap:12px;padding:17px 19px;list-style:none;cursor:pointer}.whatsapp-settings>summary::-webkit-details-marker{display:none}.whatsapp-settings>summary>span{width:35px;height:35px;display:grid;place-items:center;border-radius:10px;background:color-mix(in srgb,var(--purple) 10%,var(--card));color:var(--purple)}.whatsapp-settings>summary>div{display:grid;gap:4px}.whatsapp-settings>summary strong{font-size:13px}.whatsapp-settings>summary small{color:var(--muted);font-size:11px;line-height:1.45}.whatsapp-settings>summary>:global(svg:last-child){color:var(--muted);transition:transform .2s ease}.whatsapp-settings[open]>summary{border-bottom:1px solid var(--line)}.whatsapp-settings[open]>summary>:global(svg:last-child){color:var(--purple);transform:rotate(180deg)}.whatsapp-settings-body{padding:18px}.whatsapp-save{width:100%;min-height:43px;justify-content:center;margin-top:12px}
  .owner-managed{display:flex;align-items:center;justify-content:space-between;gap:18px;margin-bottom:18px;padding:15px 18px;border:1px solid color-mix(in srgb,var(--purple) 28%,var(--line));border-radius:14px;background:linear-gradient(135deg,color-mix(in srgb,var(--purple) 8%,var(--card)),var(--card));box-shadow:0 10px 30px #0f172a08}.owner-managed>div{display:grid;gap:4px}.owner-managed strong{font-size:12.5px}.owner-managed span{color:var(--muted);font-size:11px;line-height:1.5}.owner-managed .managed-badge{flex:none;padding:7px 9px;border:1px solid color-mix(in srgb,var(--purple) 28%,var(--line));border-radius:999px;background:var(--card);color:var(--purple);font-size:11px;font-weight:750}
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
    font-size:12px;
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
  }
  .sync-status :global(svg) {
    transition: transform 0.22s ease;
  }

  .sync-status div {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }
  .sync-status strong {
    font-size:12.5px;
  }
  .sync-status small {
    font-size:11px;
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
    font-size:12px;
  }
  .sync-error span {
    font:
      11px/1.5 ui-monospace,
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
  }
  .sync-card .secondary:not(:disabled):active,
  .export:active {
    transform: translateY(0) scale(0.985);
  }
  .sync-card .secondary:not(:disabled):hover :global(svg),

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
    font-size:14px;
  }
  .dropdown-heading p {
    color: var(--muted);
    font-size:11px;
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
    font-size:12px;
  }
  .palette small {
    color: var(--muted);
    font-size:11px;
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
    font-size:12px;
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

  .jump { display: flex; flex-wrap: wrap; gap: 6px; margin: -8px 0 18px; }
  .jump a { height: 32px; padding: 0 12px; display: inline-flex; align-items: center; border: 1px solid var(--line); border-radius: 999px; background: var(--card); color: var(--theme-text); font-size: 13px; font-weight: 600; text-decoration: none; }
  .jump a:hover { border-color: color-mix(in srgb, var(--purple) 45%, var(--line)); }
  #business, #messages, #sheets, #theme, #storage { scroll-margin-top: 84px; }
  .save-actions { display: flex; gap: 8px; }
  @media (max-width: 620px) { .save-actions { width: 100%; } .save-actions button { flex: 1; } }
</style>
