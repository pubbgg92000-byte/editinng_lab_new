<!-- Team directory: availability, open and approved work, private portal link, WhatsApp, archive lifecycle. -->
<script lang="ts">
      import LinkReadyDialog from '$lib/components/LinkReadyDialog.svelte';
import { allowed } from '$lib/stores/permissions';
import { confirmDanger } from "$lib/stores/confirm";
  import { safeFetch } from "$lib/http";
  import { onMount, untrack } from "svelte";
  import { afterNavigate } from "$app/navigation";
  import PageHeader from "$lib/components/PageHeader.svelte";
  import EditorModal from "$lib/components/EditorModal.svelte";
  import DirectWhatsAppModal from "$lib/components/DirectWhatsAppModal.svelte";
  import Modal from "$lib/components/Modal.svelte";
  import StatusBadge from "$lib/components/StatusBadge.svelte";
  import WhatsAppIcon from "$lib/components/WhatsAppIcon.svelte";
  import CustomFieldValues from "$lib/components/CustomFieldValues.svelte";
  import { Pencil, Link2, Archive, RotateCcw, Phone, Trash2, ArrowLeft, MapPin, ExternalLink, MoreHorizontal, ChevronRight, Search, RefreshCw } from "@lucide/svelte";
  import { editorStore } from "$lib/stores/app";
  import { formatDate } from "$lib/data";
  import type { Editor, Order } from "$lib/types";
  import { hasCapability, labelFor } from "$lib/capabilities";
  import { notifyAction } from "$lib/stores/actionFeedback";

  let { data } = $props();
  const profile = $derived(data.configuration?.profile);
  const staffLabel = $derived(labelFor(profile, "staff"));
  const staffPlural = $derived(labelFor(profile, "staff", true));
  const taskPlural = $derived(labelFor(profile, "task", true));
  const portalEnabled = $derived(hasCapability(data.configuration?.effectiveCapabilities, "work.staffPortal"));
  const whatsappEnabled = $derived(hasCapability(data.configuration?.effectiveCapabilities, "communications.whatsapp"));
  const customFieldsEnabled = $derived(hasCapability(data.configuration?.effectiveCapabilities, "customFields"));

  let editors = $state<Editor[]>(untrack(() => data.editors));
  let orders = $state<Order[]>(untrack(() => data.orders));
  let showEditor = $state(false);
  let editing = $state<Editor | null>(null);
  let showArchived = $state(false);
  let query = $state("");
  let detailsOpen = $state(false);
  let detailEditor = $state<Editor | null>(null);
  let detailTab = $state<"open" | "done">("open");
  let directWhatsAppOpen = $state(false);
  let directEditor = $state<Editor | null>(null);
  let menuFor = $state("");
  let busy = $state("");

  // Re-sync after shared data reloads so counts never go stale.
  $effect(() => {
    const next = { editors: data.editors, orders: data.orders };
    untrack(() => {
      editors = next.editors;
      orders = next.orders;
      if (detailEditor) detailEditor = next.editors.find((item: Editor) => item.id === detailEditor?.id) || detailEditor;
    });
  });

  const archivedCount = $derived(editors.filter((editor) => Boolean(editor.archived)).length);
  const visibleEditors = $derived(editors.filter((editor) =>
    Boolean(editor.archived) === showArchived &&
    `${editor.name} ${editor.specialty || ""} ${editor.phone || ""}`.toLowerCase().includes(query.trim().toLowerCase())));

  function tasksFor(editorId: string) {
    return orders.flatMap((order) => order.tasks
      .filter((task) => task.editorId === editorId && !task.archived)
      .map((task) => ({ ...task, project: order.project, customer: order.customer, orderId: order.id })));
  }
  const openCount = (editorId: string) => tasksFor(editorId).filter((task) => task.status !== "Completed").length;
  const detailTasks = $derived(detailEditor ? tasksFor(detailEditor.id) : []);
  const detailOpenTasks = $derived(detailTasks.filter((task) => task.status !== "Completed"));
  const detailDoneTasks = $derived(detailTasks.filter((task) => task.status === "Completed"));
  const directEditorOrders = $derived(directEditor ? orders.filter((order) => order.tasks.some((task) => !task.archived && task.editorId === directEditor?.id)) : []);

  const availabilityText = (editor: Editor) => editor.archived ? "Archived" : editor.availability === "busy" ? "Busy" : editor.availability === "inactive" ? "Not taking work" : "Available";

  function openEditor(editor: Editor | null = null) {
    menuFor = "";
    detailsOpen = false;
    editing = editor;
    showEditor = true;
  }
  function openDetails(editor: Editor) {
    menuFor = "";
    detailEditor = editor;
    detailTab = "open";
    detailsOpen = true;
  }
  function openEditorChat(editor: Editor) {
    menuFor = "";
    if (!editor.phone) return;
    directEditor = editor;
    directWhatsAppOpen = true;
  }
  function saved(editor: Editor) {
    editors = editors.some((item) => item.id === editor.id) ? editors.map((item) => (item.id === editor.id ? editor : item)) : [...editors, editor];
    if (detailEditor?.id === editor.id) detailEditor = editor;
    editorStore.update((items) => items.some((item) => item.id === editor.id) ? items.map((item) => (item.id === editor.id ? editor : item)) : [editor, ...items]);
    notifyAction(`${staffLabel} saved.`);
  }
  let linkReady = $state({ open: false, name: "", phone: "", link: "", replaced: false });
  // Replace a staff member's private link (the old one stops working), then offer copy / WhatsApp.
  async function replacePortal(editor: Editor) {
    menuFor = "";
    if (!await confirmDanger(`Create a new private link for ${editor.name}?\n\nThe old link will stop working. Their work and history stay the same.`, "Yes, create new link")) return;
    busy = editor.id;
    const response = await safeFetch(`/api/editors/${editor.id}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "regenerate-token" }) });
    const result = await response.json();
    busy = "";
    if (!response.ok) { notifyAction(result.error || "Couldn't create a new link.", "error"); return; }
    const token = result.token as string;
    editors = editors.map((item) => (item.id === editor.id ? { ...item, token } : item));
    if (detailEditor?.id === editor.id) detailEditor = { ...detailEditor, token };
    editorStore.update((items) => items.map((item) => (item.id === editor.id ? { ...item, token } : item)));
    linkReady = { open: true, name: editor.name, phone: editor.phone, link: `${location.origin}/portal/${data.tenantSlug}/editor/${token}`, replaced: true };
  }
  async function copyPortal(editor: Editor) {
    menuFor = "";
    let token = editor.token;
    if (!token) {
      busy = editor.id;
      const response = await safeFetch(`/api/editors/${editor.id}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "regenerate-token" }) });
      const result = await response.json();
      busy = "";
      if (!response.ok) { notifyAction(result.error || "Couldn't create the private link.", "error"); return; }
      token = result.token as string;
      editors = editors.map((item) => (item.id === editor.id ? { ...item, token } : item));
      if (detailEditor?.id === editor.id) detailEditor = { ...detailEditor, token };
      editorStore.update((items) => items.map((item) => (item.id === editor.id ? { ...item, token } : item)));
    }
    try {
      await navigator.clipboard.writeText(`${location.origin}/portal/${data.tenantSlug}/editor/${token}`);
      notifyAction(`Private link copied. Send it to ${editor.name} so they can update their work.`);
    } catch {
      notifyAction("Couldn't copy automatically. Open their page and copy the address instead.", "error");
    }
  }
  const syncNote = (sync: { configured?: boolean; failed?: number } | undefined) => (sync?.configured && !sync?.failed ? "" : " Google Sheets will update shortly.");
  async function archiveEditor(editor: Editor) {
    menuFor = "";
    if (!await confirmDanger(`Archive ${editor.name}?\n\nTheir past work stays in history and their private link stops working. You can restore them later.`)) return;
    busy = editor.id;
    const response = await safeFetch(`/api/editors/${editor.id}`, { method: "DELETE" });
    const result = await response.json();
    busy = "";
    if (!response.ok) { notifyAction(result.error || `Couldn't archive this ${staffLabel.toLowerCase()}.`, "error"); return; }
    editors = editors.map((item) => (item.id === editor.id ? result.editor : item));
    detailsOpen = false;
    detailEditor = null;
    editorStore.update((items) => items.filter((item) => item.id !== editor.id));
    notifyAction(`${editor.name} archived.${syncNote(result.sync)}`);
  }
  async function restoreEditor(editor: Editor) {
    busy = editor.id;
    const response = await safeFetch(`/api/editors/${editor.id}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "restore" }) });
    const result = await response.json();
    busy = "";
    if (!response.ok) { notifyAction(result.error || `Couldn't restore this ${staffLabel.toLowerCase()}.`, "error"); return; }
    editors = editors.map((item) => (item.id === editor.id ? result.editor : item));
    editorStore.update((items) => [result.editor, ...items.filter((item) => item.id !== editor.id)]);
    notifyAction(`${editor.name} restored.${syncNote(result.sync)}`);
  }
  async function permanentlyDelete(editor: Editor) {
    if (!await confirmDanger(`Delete ${editor.name} permanently?\n\nThis can't be undone. Their past ${taskPlural.toLowerCase()} are kept and marked "Unassigned".`)) return;
    busy = editor.id;
    const response = await safeFetch(`/api/editors/${editor.id}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "delete-permanently" }) });
    const result = await response.json();
    busy = "";
    if (!response.ok) { notifyAction(result.error || `Couldn't delete this ${staffLabel.toLowerCase()}.`, "error"); return; }
    editors = editors.filter((item) => item.id !== editor.id);
    editorStore.update((items) => items.filter((item) => item.id !== editor.id));
    detailsOpen = false;
    detailEditor = null;
    notifyAction(`${editor.name} deleted.${syncNote(result.sync)}`);
  }
  // Runs on first load and on same-page links (e.g. picking a result in Cmd-K while already here).
  afterNavigate((navigation) => {
    const editorId = (navigation.to?.url ?? new URL(location.href)).searchParams.get("editor");
    const editor = editors.find((item) => item.id === editorId);
    if (editor) {
      showArchived = Boolean(editor.archived);
      openDetails(editor);
    }
  });
</script>

<svelte:window
  onclick={(event) => { if (menuFor && !(event.target as Element).closest?.(".card-menu")) menuFor = ""; }}
  onkeydown={(event) => { if (event.key === "Escape") menuFor = ""; }}
/>

<PageHeader
  eyebrow={showArchived ? `Restore or remove past ${staffPlural.toLowerCase()}.` : "Who's on the team, and how much work each person has."}
  title={showArchived ? `Archived ${staffPlural.toLowerCase()}` : staffPlural}
  action={showArchived || !allowed("staff.manage") ? undefined : `New ${staffLabel.toLowerCase()}`}
  onclick={() => openEditor()}
/>

{#if showArchived}
  <div class="archive-bar">
    <span><Archive size={16} aria-hidden="true" />You're viewing archived {staffPlural.toLowerCase()}.</span>
    <button type="button" class="link" onclick={() => (showArchived = false)}><ArrowLeft size={15} aria-hidden="true" />Back to the team</button>
  </div>
{/if}

<div class="toolbar">
  <label class="search">
    <Search size={16} aria-hidden="true" />
    <input bind:value={query} placeholder="Search by name, skill or phone" aria-label={`Search ${staffPlural.toLowerCase()}`} />
  </label>
  {#if !showArchived}<button type="button" class="secondary archived-btn" onclick={() => (showArchived = true)}><Archive size={15} aria-hidden="true" />Archived<span class="count">{archivedCount}</span></button>{/if}
</div>

{#if visibleEditors.length}
  <div class="team">
    {#each visibleEditors as editor (editor.id)}
      {@const open = openCount(editor.id)}
      <article class="card person" class:archived={editor.archived}>
        <header>
          <span class="avatar" aria-hidden="true">{editor.initials}</span>
          <div class="who">
            <button type="button" class="name" onclick={() => openDetails(editor)}>{editor.name}</button>
            <span class="skill">{editor.specialty || "No skill added"}</span>
          </div>
          <span class="availability" class:free={!editor.archived && (!editor.availability || editor.availability === "available")}>{availabilityText(editor)}</span>
        </header>
        <dl class="facts">
          <div><dt>Open work</dt><dd>{open === 0 ? "Nothing open" : `${open} ${open === 1 ? labelFor(profile, "task").toLowerCase() : taskPlural.toLowerCase()}`}</dd></div>
          <div><dt>Phone</dt><dd>{#if editor.phone}<a href={`tel:${editor.phone}`}>{editor.phone}</a>{:else}<span class="muted">Not added</span>{/if}</dd></div>
        </dl>
        <footer class="actions">
          {#if editor.archived}
            {#if allowed("staff.manage")}<button type="button" class="small" disabled={busy === editor.id} onclick={() => restoreEditor(editor)}><RotateCcw size={14} aria-hidden="true" />Restore</button>
            <button type="button" class="small danger" disabled={busy === editor.id} onclick={() => permanentlyDelete(editor)}><Trash2 size={14} aria-hidden="true" />Delete</button>{/if}
          {:else}
            <button type="button" class="small" onclick={() => openDetails(editor)}>View<ChevronRight size={14} aria-hidden="true" /></button>
            {#if whatsappEnabled && editor.phone}<button type="button" class="icon" title="Message on WhatsApp" aria-label={`Message ${editor.name} on WhatsApp`} onclick={() => openEditorChat(editor)}><WhatsAppIcon size={16} /></button>{/if}
            <div class="card-menu">
              <button type="button" class="icon" aria-haspopup="menu" aria-expanded={menuFor === editor.id} title="More actions" aria-label={`More actions for ${editor.name}`} onclick={() => (menuFor = menuFor === editor.id ? "" : editor.id)}><MoreHorizontal size={16} /></button>
              {#if menuFor === editor.id}
                <div class="menu" role="menu">
                  {#if portalEnabled}<button type="button" role="menuitem" disabled={busy === editor.id} onclick={() => copyPortal(editor)}><Link2 size={15} aria-hidden="true" />Copy private link</button>{/if}
                  {#if portalEnabled && editor.token && allowed("staff.manage")}<button type="button" role="menuitem" disabled={busy === editor.id} onclick={() => replacePortal(editor)}><RefreshCw size={15} aria-hidden="true" />Create a new link</button>{/if}
                  {#if allowed("staff.manage")}<button type="button" role="menuitem" onclick={() => openEditor(editor)}><Pencil size={15} aria-hidden="true" />Edit details</button>
                  <button type="button" role="menuitem" class="danger" onclick={() => archiveEditor(editor)}><Archive size={15} aria-hidden="true" />Archive</button>{/if}
                </div>
              {/if}
            </div>
          {/if}
        </footer>
      </article>
    {/each}
  </div>
{:else}
  <div class="card empty">
    <p><strong>{query.trim() ? `No ${staffPlural.toLowerCase()} match “${query.trim()}”.` : showArchived ? `No archived ${staffPlural.toLowerCase()}.` : `No ${staffPlural.toLowerCase()} yet.`}</strong></p>
    {#if query.trim()}<button type="button" class="secondary" onclick={() => (query = "")}>Clear search</button>{:else if !showArchived && allowed("staff.manage")}<button type="button" class="secondary" onclick={() => openEditor()}>New {staffLabel.toLowerCase()}</button>{/if}
  </div>
{/if}

<Modal bind:open={detailsOpen} wide title={detailEditor ? detailEditor.name : `${staffLabel} details`}>
  {#if detailEditor}
    <div class="detail">
      <div class="detail-actions">
        {#if whatsappEnabled && detailEditor.phone}<button type="button" class="secondary" onclick={() => openEditorChat(detailEditor!)}><WhatsAppIcon size={15} />Message</button>{/if}
        {#if portalEnabled && !detailEditor.archived}<button type="button" class="secondary" disabled={busy === detailEditor.id} onclick={() => copyPortal(detailEditor!)}><Link2 size={15} aria-hidden="true" />Copy private link</button>{/if}
        {#if portalEnabled && detailEditor.token && !detailEditor.archived}<a class="secondary" href={`/portal/${data.tenantSlug}/editor/${detailEditor.token}`} target="_blank" rel="noreferrer"><ExternalLink size={15} aria-hidden="true" />Open their page</a>{/if}
        {#if portalEnabled && detailEditor.token && !detailEditor.archived && allowed("staff.manage")}<button type="button" class="secondary" disabled={busy === detailEditor.id} onclick={() => replacePortal(detailEditor!)}><RefreshCw size={15} aria-hidden="true" />New link</button>{/if}
        {#if allowed("staff.manage")}<button type="button" class="secondary" onclick={() => openEditor(detailEditor)}><Pencil size={15} aria-hidden="true" />Edit</button>{/if}
      </div>

      <section class="box">
        <dl class="info">
          <div><dt>Skill</dt><dd>{detailEditor.specialty || "Not added"}</dd></div>
          <div><dt>Availability</dt><dd>{availabilityText(detailEditor)}</dd></div>
          <div><dt><Phone size={14} aria-hidden="true" />Phone</dt><dd>{#if detailEditor.phone}<a href={`tel:${detailEditor.phone}`}>{detailEditor.phone}</a>{:else}Not added{/if}</dd></div>
          {#if detailEditor.locationUrl}<div><dt><MapPin size={14} aria-hidden="true" />Location</dt><dd><a href={detailEditor.locationUrl} target="_blank" rel="noreferrer">Open in Google Maps <ExternalLink size={12} aria-hidden="true" /></a></dd></div>{/if}
        </dl>
        {#if customFieldsEnabled}<CustomFieldValues definitions={data.configuration.profile.customFields} entity="staff" values={detailEditor.customFields} />{/if}
      </section>

      <section class="box">
        <div class="tabs" role="tablist" aria-label="Work">
          <button type="button" role="tab" aria-selected={detailTab === "open"} class:on={detailTab === "open"} onclick={() => (detailTab = "open")}>Open work <span class="count">{detailOpenTasks.length}</span></button>
          <button type="button" role="tab" aria-selected={detailTab === "done"} class:on={detailTab === "done"} onclick={() => (detailTab = "done")}>Approved <span class="count">{detailDoneTasks.length}</span></button>
        </div>
        {#if (detailTab === "open" ? detailOpenTasks : detailDoneTasks).length}
          <ul class="work">
            {#each detailTab === "open" ? detailOpenTasks : detailDoneTasks as task (task.id)}
              <li><a href={"/orders/" + task.orderId}>
                <span class="work-main"><strong>{task.name}</strong><small>{task.project} · {task.customer}{task.due ? ` · Due ${formatDate(task.due)}` : ""}</small></span>
                <span class="work-status"><StatusBadge status={task.status} />{#if detailTab === "open"}<small>{task.progress}% done</small>{/if}</span>
                <ChevronRight size={15} aria-hidden="true" />
              </a></li>
            {/each}
          </ul>
        {:else}
          <p class="muted">{detailTab === "open" ? `Nothing open right now.` : `No approved work yet.`}</p>
        {/if}
      </section>

      {#if !detailEditor.archived && allowed("staff.manage")}
        <div class="danger-zone"><button type="button" class="link danger" disabled={busy === detailEditor.id} onclick={() => archiveEditor(detailEditor!)}><Archive size={14} aria-hidden="true" />Archive {detailEditor.name}</button></div>
      {/if}
    </div>
  {/if}
  {#snippet footer()}<button class="secondary" onclick={() => (detailsOpen = false)}>Close</button>{/snippet}
</Modal>

<DirectWhatsAppModal
  bind:open={directWhatsAppOpen}
  recipient={directEditor ? { kind: "staff", record: directEditor } : null}
  orders={directEditorOrders}
  configuration={data.configuration}
  onmessage={(value) => notifyAction(value)}
/>
<EditorModal bind:open={showEditor} editor={editing} onsaved={saved} />

<LinkReadyDialog bind:open={linkReady.open} name={linkReady.name} phone={linkReady.phone} link={linkReady.link} replaced={linkReady.replaced} business={data.settings?.studioName || ""} whatsapp={whatsappEnabled} />

<style>
  .muted { color: var(--muted); }
  .count { display: inline-grid; place-items: center; min-width: 22px; height: 20px; padding: 0 6px; border-radius: 999px; background: var(--theme-soft); color: var(--theme-text); font-size: 12px; font-weight: 650; }
  .link { display: inline-flex; align-items: center; gap: 6px; padding: 0; border: 0; background: none; color: var(--purple); font-size: 13.5px; font-weight: 600; cursor: pointer; }
  .link.danger { color: #b91c1c; }
  .archive-bar { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; padding: 12px 14px; margin-bottom: 14px; border: 1px solid var(--line); border-radius: 12px; background: var(--theme-soft); font-size: 13.5px; color: var(--theme-text); }
  .archive-bar span { display: inline-flex; align-items: center; gap: 8px; }
  .toolbar { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; margin-bottom: 14px; }
  .search { flex: 1; min-width: 200px; display: flex; align-items: center; gap: 8px; height: 40px; padding: 0 12px; border: 1px solid var(--line); border-radius: 10px; background: var(--card); color: var(--muted); }
  .search:focus-within { border-color: var(--purple); box-shadow: 0 0 0 3px color-mix(in srgb, var(--purple) 18%, transparent); }
  .search input { flex: 1; min-width: 0; height: 100%; border: 0; outline: 0; background: transparent; color: var(--theme-text); font-size: 14px; }
  .archived-btn { display: inline-flex; align-items: center; gap: 7px; height: 40px; padding: 0 12px; font-size: 13.5px; }

  .team { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 14px; }
  .person { display: flex; flex-direction: column; gap: 14px; padding: 16px; min-width: 0; transition: border-color .15s ease; }
  .person:hover { border-color: color-mix(in srgb, var(--purple) 35%, var(--line)); }
  .person.archived { opacity: .85; }
  .person header { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; align-items: center; gap: 10px; }
  .avatar { width: 40px; height: 40px; border-radius: 10px; display: grid; place-items: center; background: var(--theme-soft); color: var(--purple); font-size: 14px; font-weight: 700; }
  .who { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
  .name { padding: 0; border: 0; background: none; color: var(--theme-text); font-size: 15px; font-weight: 650; text-align: left; cursor: pointer; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .name:hover { text-decoration: underline; }
  .skill { font-size: 12.5px; color: var(--muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .availability { font-size: 12px; font-weight: 600; padding: 3px 8px; border-radius: 999px; background: var(--theme-soft); color: var(--muted); white-space: nowrap; }
  .availability.free { background: color-mix(in srgb, #16a34a 14%, transparent); color: #15803d; }
  .facts { margin: 0; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .facts dt { font-size: 12px; color: var(--muted); }
  .facts dd { margin: 2px 0 0; font-size: 13.5px; font-weight: 600; color: var(--theme-text); overflow-wrap: anywhere; }
  .facts a { color: inherit; text-decoration: none; }
  .facts a:hover { text-decoration: underline; }
  .actions { display: flex; align-items: center; gap: 6px; margin-top: auto; }
  .small { display: inline-flex; align-items: center; gap: 5px; height: 34px; padding: 0 12px; border: 1px solid var(--line); border-radius: 8px; background: var(--card); color: var(--theme-text); font-size: 13px; font-weight: 600; cursor: pointer; white-space: nowrap; }
  .small:hover { border-color: color-mix(in srgb, var(--purple) 45%, var(--line)); }
  .small.danger { color: #b91c1c; }
  .small:disabled { opacity: .5; cursor: not-allowed; }
  .icon { width: 34px; height: 34px; display: grid; place-items: center; border: 0; border-radius: 8px; background: transparent; color: var(--muted); cursor: pointer; }
  .icon:hover { background: var(--theme-soft); color: var(--theme-text); }
  .card-menu { position: relative; margin-left: auto; }
  .menu { position: absolute; right: 0; bottom: calc(100% + 4px); z-index: 30; min-width: 210px; padding: 6px; display: grid; gap: 2px; border: 1px solid var(--line); border-radius: 12px; background: var(--card); box-shadow: 0 12px 32px #0000001f; }
  .menu button { display: flex; align-items: center; gap: 9px; width: 100%; height: 38px; padding: 0 10px; border: 0; border-radius: 8px; background: transparent; color: var(--theme-text); font-size: 13.5px; font-weight: 500; text-align: left; cursor: pointer; white-space: nowrap; }
  .menu button:hover { background: var(--theme-soft); }
  .menu .danger { color: #b91c1c; }
  .empty { display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 36px 16px; text-align: center; color: var(--muted); font-size: 14px; }
  .empty p { margin: 0; }
  .empty strong { color: var(--theme-text); }

  .detail { display: grid; gap: 14px; }
  .detail-actions { display: flex; flex-wrap: wrap; gap: 8px; }
  .detail-actions > * { display: inline-flex; align-items: center; gap: 7px; min-height: 40px; text-decoration: none; }
  .box { border: 1px solid var(--line); border-radius: 12px; padding: 14px 16px; background: var(--card); min-width: 0; }
  .info { margin: 0; display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; }
  .info dt { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--muted); }
  .info dd { margin: 3px 0 0; font-size: 13.5px; color: var(--theme-text); overflow-wrap: anywhere; }
  .info a { color: var(--purple); }
  .tabs { display: inline-flex; gap: 4px; padding: 3px; border-radius: 10px; background: var(--theme-soft); margin-bottom: 10px; max-width: 100%; }
  .tabs button { display: inline-flex; align-items: center; gap: 7px; height: 34px; padding: 0 12px; border: 0; border-radius: 8px; background: transparent; color: var(--muted); font-size: 13px; font-weight: 600; cursor: pointer; white-space: nowrap; }
  .tabs button.on { background: var(--card); color: var(--theme-text); box-shadow: 0 1px 2px #0000001a; }
  .work { list-style: none; margin: 0; padding: 0; }
  .work a { display: grid; grid-template-columns: minmax(0, 1fr) auto auto; align-items: center; gap: 10px; padding: 10px 0; border-bottom: 1px solid var(--line); color: inherit; text-decoration: none; }
  .work li:last-child a { border-bottom: 0; }
  .work a:hover strong { text-decoration: underline; }
  .work-main { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
  .work-main strong { font-size: 13.5px; color: var(--theme-text); }
  .work-main small { font-size: 12px; color: var(--muted); overflow-wrap: anywhere; }
  .work-status { display: flex; flex-direction: column; align-items: flex-end; gap: 3px; }
  .work-status small { font-size: 12px; color: var(--muted); }
  .danger-zone { display: flex; justify-content: flex-end; }
  @media (max-width: 520px) {
    .work a { grid-template-columns: minmax(0, 1fr) auto; }
    .work a > :global(svg) { display: none; }
  }
</style>
