<script lang="ts">
	import { page } from '$app/state';
</script>

<svelte:head><title>{page.status} · xr-kit docs</title></svelte:head>

<h1>{page.status === 404 ? 'Page not found' : 'Something went wrong'}</h1>
<p>{page.error?.message}</p>
