<script lang="ts">
	import PageHeader from '$lib/components/PageHeader.svelte';
	import { Sheet, MessageCircle, HardDrive, Check, ExternalLink, TableProperties } from 'lucide-svelte';
</script>

<PageHeader eyebrow="Studio and integrations" title="Settings" />

<div class="settings-grid">
	<section class="card settings-card">
		<h2>Studio profile</h2><p>Used on invoices, portals and outgoing messages.</p>
		<div class="form-grid">
			<div class="field"><label for="studio-name">Studio name</label><input id="studio-name" value="Arvind Studio"/></div>
			<div class="field"><label for="studio-whatsapp">WhatsApp number</label><input id="studio-whatsapp" value="+91 98765 00000"/></div>
			<div class="field"><label for="studio-email">Email</label><input id="studio-email" value="hello@arvindstudio.in"/></div>
			<div class="field"><label for="studio-gst">GSTIN</label><input id="studio-gst" placeholder="Add GST number"/></div>
		</div>
		<button class="primary">Save changes</button>
	</section>
	<section class="card integrations">
		<h2>Integrations</h2><p>Connect the services StudioFlow uses.</p>
		<div><span class="integration-icon green"><Sheet size={17}/></span><p><strong>Google Sheets</strong><small>StudioFlow Master Sheet</small></p><a class="view-data" href="/settings/sheets"><TableProperties size={11}/> View data</a></div>
		<div><span class="integration-icon"><MessageCircle size={17}/></span><p><strong>WhatsApp Cloud API</strong><small>7 automatic message types</small></p><span class="connected"><Check size={11}/> Connected</span></div>
		<div><span class="integration-icon gray"><HardDrive size={17}/></span><p><strong>Cloudflare R2</strong><small>Optional file storage</small></p><button>Connect <ExternalLink size={10}/></button></div>
	</section>
</div>

<style>
	.settings-grid{display:grid;grid-template-columns:1.4fr 1fr;gap:16px}.settings-card,.integrations{padding:21px}.settings-card h2,.integrations h2{font-size:13px;margin:0}.settings-card>p,.integrations>p{color:#707b8d;font-size:10px;margin:5px 0 22px}.settings-card .primary{margin-top:22px}.integrations>div{display:flex;align-items:center;gap:10px;border-top:1px solid #292c35;padding:15px 0}.integration-icon{width:34px;height:34px;border-radius:8px;display:grid;place-items:center;background:#29213d;color:#a68eff}.integration-icon.green{background:#192b22;color:#47d07b}.integration-icon.gray{background:#252932;color:#8993a2}.integrations p{margin:0;display:flex;flex-direction:column;gap:3px}.integrations strong{font-size:10px}.integrations small{font-size:9px;color:#687385}.connected,.integrations button,.view-data{margin-left:auto;border:0;background:transparent;color:#5ed289;font-size:8px;display:flex;gap:4px;align-items:center}.integrations button{color:#9786ed}.view-data{color:#ad9afa;border:1px solid #40365e;border-radius:6px;padding:6px 8px;background:#211d30}@media(max-width:850px){.settings-grid{grid-template-columns:1fr}}
</style>
