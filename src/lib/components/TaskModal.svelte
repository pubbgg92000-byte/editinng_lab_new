<script lang="ts">
	import Modal from './Modal.svelte';
	import EditorModal from './EditorModal.svelte';
	import type { Editor, Task } from '$lib/types';
	let { open = $bindable(), orderId, editors = $bindable(), task = null, onsaved = () => {} }: { open:boolean; orderId:string; editors:Editor[]; task?:Task|null; onsaved?:()=>void }=$props();
	let titles=$state(''); let editorId=$state(''); let due=$state(''); let instructions=$state(''); let textLink=$state(''); let imageUrl=$state(''); let error=$state(''); let saving=$state(false); let showEditor=$state(false);
	$effect(()=>{if(open){titles=task?.name||'';editorId=task?.editorId||'';due=task?.due||'';instructions=task?.instructions||'';textLink=task?.textLink||'';imageUrl=task?.imageUrl||'';error=''}});
	async function save(){const names=titles.split('\n').map((value)=>value.trim()).filter(Boolean);if(!names.length){error='Add at least one task title.';return}if(!editorId){error='Choose or create an editor.';return}saving=true;const endpoint=task?`/api/tasks/${task.id}`:`/api/orders/${orderId}/tasks`;const body=task?{name:names[0],editorId,due,instructions,textLink,imageUrl}:{tasks:names.map((name)=>({name,editorId,due,instructions,textLink,imageUrl}))};const response=await fetch(endpoint,{method:task?'PATCH':'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)});const result=await response.json();saving=false;if(!response.ok){error=result.error||'Unable to save task';return}open=false;onsaved()}
	function editorSaved(editor:Editor){editors=[...editors,editor];editorId=editor.id}
</script>
<Modal title={task?'Edit task':'Assign work'} bind:open wide>
	<div class="field"><label for="task-titles">{task?'Task title':'Task titles — one per line'}</label><textarea id="task-titles" bind:value={titles} placeholder="Culling&#10;Colour correction&#10;Quality check"></textarea></div>
	<div class="form-grid task-fields"><div class="field"><label for="task-editor">Editor *</label><div class="editor-select"><select id="task-editor" bind:value={editorId}><option value="">Choose editor</option>{#each editors.filter((editor)=>editor.availability!=='inactive') as editor}<option value={editor.id}>{editor.name} · {editor.activeTasks} active</option>{/each}</select><button class="secondary" onclick={()=>showEditor=true}>New</button></div></div><div class="field"><label for="task-due">Due date</label><input id="task-due" type="date" bind:value={due}/></div></div>
	<div class="field section"><label for="task-instructions">Instructions</label><textarea id="task-instructions" bind:value={instructions}></textarea></div>
	<div class="form-grid section"><div class="field"><label for="task-link">Optional text / reference link</label><input id="task-link" bind:value={textLink} placeholder="https://..."/></div><div class="field"><label for="task-image">Optional image URL</label><input id="task-image" bind:value={imageUrl} placeholder="https://..."/></div></div>
	{#if error}<p class="error">{error}</p>{/if}
	{#snippet footer()}<button class="secondary" onclick={()=>open=false}>Cancel</button><button class="primary" disabled={saving} onclick={save}>{saving?'Saving...':task?'Update task':'Assign tasks'}</button>{/snippet}
</Modal>
<EditorModal bind:open={showEditor} onsaved={editorSaved}/>
<style>.task-fields,.section{margin-top:18px}.editor-select{display:grid;grid-template-columns:1fr auto;gap:7px}.error{color:#ef4444;font-size:10px;margin-top:12px}</style>
