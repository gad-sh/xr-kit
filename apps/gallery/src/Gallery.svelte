<script lang="ts">
	// Design system gallery: every component as HTML (top) and the same markup in
	// A-Frame (bottom), sharing state.
	import {
		Avatar,
		Button,
		ButtonGroup,
		Checkbox,
		Input,
		Keyboard,
		Menu,
		Modal,
		Panel,
		ProgressBar,
		Slider,
		Scene3D,
		Spinner,
		Stack,
		Tab,
		Tabs,
		Tag,
		Text,
		ThemeProvider,
		Toaster,
		toaster,
		Tooltip,
		xr,
	} from '@gadxr/ui';
	import type { ButtonKind, ButtonShape, ButtonSize, MenuItem, TagKind } from '@gadxr/ui';

	const kinds: ButtonKind[] = ['primary', 'secondary', 'tertiary'];
	const sizes: ButtonSize[] = ['mini', 'compact', 'default', 'large'];
	const shapes: ButtonShape[] = ['default', 'pill', 'round', 'circle', 'square'];
	const tagKinds: TagKind[] = ['neutral', 'accent', 'positive', 'warning', 'negative'];

	// Behind the glass Buttons panel (top left), plus a few around the edges.
	const backdrop = [
		{ geometry: 'primitive: torusKnot; radius: 0.2; radiusTubular: 0.05', color: '#E11900', position: '-1 0.95 0', spin: '360 360 0', dur: 24000 },
		{ geometry: 'primitive: sphere; radius: 0.28', color: '#0070C0', position: '-0.35 0.65 -0.2', spin: '0 360 0', dur: 30000 },
		{ geometry: 'primitive: box; width: 0.4; height: 0.4; depth: 0.4', color: '#F2F2F2', position: '-1.05 0.25 0', spin: '360 360 0', dur: 28000 },
		{ geometry: 'primitive: torus; radius: 0.25; radiusTubular: 0.05', color: '#0070C0', position: '1.75 -0.7 0', spin: '0 360 360', dur: 20000 },
		{ geometry: 'primitive: sphere; radius: 0.25', color: '#E11900', position: '-1.75 -0.9 -0.1', spin: '0 360 0', dur: 26000 },
		{ geometry: 'primitive: cone; radiusBottom: 0.2; height: 0.4', color: '#F2F2F2', position: '1.75 0.9 0', spin: '360 0 360', dur: 22000 },
	];

	let clicks = $state(0);
	let selected = $state(false);
	let radio = $state<number | number[] | undefined>(0);
	let lastClicked = $state('');
	let music = $state(true);
	let voice = $state(false);
	let agree = $state(true);
	let volume = $state(60);
	let fog = $state(0.3);

	let tab = $state('emotes');
	let quality = $state('Medium');
	// Separate per half: the 2D dialog makes the rest of the page (incl. the 3D canvas) inert.
	let modal2d = $state(false);
	let modal3d = $state(false);
	let discarded = $state(0);

	let playerName = $state('');
	let parcel = $state('42');
	const parcelError = $derived(/^\d+$/.test(parcel) && +parcel >= 1 && +parcel <= 9911 ? '' : 'A parcel is a number from 1 to 9911');
	let chat = $state('');
	let messages = $state<string[]>([]);
	function send(text: string) {
		if (!text.trim()) return;
		messages = [...messages.slice(-2), text.trim()];
		chat = '';
	}

	const emotes: MenuItem[] = [
		{ label: 'Thumbs up', end: '1' },
		{ label: 'Wave', end: '2' },
		{ label: 'Rock on', end: '3' },
		{ divider: true },
		{ label: 'Dance', end: 'soon', disabled: true },
		{ label: 'Clear emote' },
	];
	const qualities: MenuItem[] = [{ label: 'Low' }, { label: 'Medium' }, { label: 'High' }];

	// A picture avatar without an external image: a small SVG landscape. (An SVG needs a
	// width and height to become a 3D texture; without them it uploads blank.)
	const picture =
		'data:image/svg+xml;base64,' +
		btoa(
			`<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 64 64"><rect width="64" height="64" fill="#0070C0"/><circle cx="44" cy="20" r="9" fill="#F2F2F2"/><path d="M0 50 L20 30 L34 44 L46 34 L64 50 V64 H0 Z" fill="#E11900"/></svg>`
		);

	function clicked(name: string) {
		clicks++;
		lastClicked = name;
	}
</script>

{#snippet caption(text: string)}
	<Text variant="LabelSmall" color="#AFAFAF" {text} />
{/snippet}

{#snippet showcase(is3d: boolean)}
	<Stack direction="row" align="start" gap={24}>
		<Stack direction="column" align="start" gap={24}>
			<Panel title="Buttons" kind="glass">
				{@render caption('Kinds')}
				<ButtonGroup gap={12}>
					{#each kinds as kind}
						<Button {kind} label={kind} onclick={() => clicked(kind)} />
					{/each}
				</ButtonGroup>
				{@render caption('Sizes')}
				<ButtonGroup gap={12}>
					{#each sizes as size}
						<Button {size} label={size} onclick={() => clicked(size)} />
					{/each}
				</ButtonGroup>
				{@render caption('Shapes')}
				<ButtonGroup gap={12} kind="secondary">
					{#each shapes as shape}
						<Button {shape} label={shape === 'round' || shape === 'circle' || shape === 'square' ? '★' : shape} onclick={() => clicked(shape)} />
					{/each}
				</ButtonGroup>
			</Panel>
			<Panel title="Controls" width={340}>
				<Checkbox type="toggle" label="Music" bind:checked={music} />
				<Checkbox type="toggle" label="Voice chat" bind:checked={voice} />
				<Checkbox type="toggle" label="Locked" checked disabled />
				<Checkbox label="Show other players" bind:checked={agree} />
				<Slider label="Volume" bind:value={volume} disabled={!music} />
				<Slider label="Fog" bind:value={fog} min={0} max={1} step={0.1} />
			</Panel>
		</Stack>
		<Stack direction="column" align="start" gap={24}>
			<Panel title="States">
				<ButtonGroup gap={12}>
					<Button label={selected ? 'Selected' : 'Toggle me'} isSelected={selected} onclick={() => (selected = !selected)} />
					<Button label="Disabled" disabled onclick={() => clicked('disabled')} />
					<Button label="Inert" inert onclick={() => clicked('inert')} />
				</ButtonGroup>
				{@render caption('Radio group')}
				<ButtonGroup mode="radio" bind:selected={radio} kind="secondary" gap={12}>
					<Button label="Day" />
					<Button label="Dusk" />
					<Button label="Night" />
				</ButtonGroup>
			</Panel>
			<Panel title="Status">
				<Stack gap={8}>
					{#each tagKinds as kind}
						<Tag {kind} label={kind} variant="solid" />
					{/each}
				</Stack>
				<Stack gap={8}>
					{#each tagKinds as kind}
						<Tag {kind} label={kind} />
					{/each}
				</Stack>
				<Stack gap={16}>
					<Spinner size="small" />
					<Spinner size="medium" />
					<Spinner size="large" />
					<Tag kind="positive" label="Live · 3 players" size="medium" variant="solid" />
				</Stack>
				<Text
					variant="ParagraphMedium"
					color="#CBCBCB"
					align="left"
					maxWidth={380}
					text="Panels stack their children and size themselves to fit, in HTML and in 3D."
				/>
			</Panel>
		</Stack>
		<Stack direction="column" align="start" gap={24}>
			<Panel title="Tabs + Menu">
				<Tabs bind:active={tab}>
					<Tab key="emotes" title="Emotes">
						<Menu items={emotes} onselect={(item) => toaster.info(`Sent: ${item.label}`)} />
					</Tab>
					<Tab key="quality" title="Quality">
						<Menu items={qualities} bind:selected={quality} />
					</Tab>
					<Tab key="about" title="About">
						<Text variant="ParagraphMedium" align="left" maxWidth={260} color="#CBCBCB" text="Tabs switch what's below the bar. Menus pick an action, or one option with a check." />
					</Tab>
					<Tab key="soon" title="Later" disabled />
				</Tabs>
			</Panel>
			<Panel title="Progress + people">
				<!-- Follows the Volume slider. -->
				<ProgressBar label="Download" value={volume} showValue />
				<ProgressBar label="Joining world…" infinite size="small" />
				<Stack gap={12}>
					<Tooltip content="Ada Lovelace · online"><Avatar name="Ada Lovelace" status="online" /></Tooltip>
					<Tooltip content="Grace Hopper · away"><Avatar name="Grace Hopper" status="away" /></Tooltip>
					<Avatar name="Linus" size="small" status="busy" />
					<Tooltip content="A picture avatar" placement="right"><Avatar name="Terra" src={picture} size="large" status="offline" /></Tooltip>
				</Stack>
				<Stack gap={8}>
					<Tooltip content="Copies the invite link"><Button label="Hover me" size="compact" kind="secondary" /></Tooltip>
					<Tooltip content="Tooltips can sit below, or to either side" placement="bottom"><Button label="Below" size="compact" kind="secondary" /></Tooltip>
				</Stack>
			</Panel>
			<Panel title="Overlays">
				<Button label="Discard changes…" kind="secondary" onclick={() => (is3d ? (modal3d = true) : (modal2d = true))} />
				<Stack gap={8}>
					<Button label="Info" size="compact" kind="secondary" onclick={() => toaster.info('Player 2 joined')} />
					<Button label="Positive" size="compact" kind="secondary" onclick={() => toaster.positive('Screen share started')} />
					<Button label="Warning" size="compact" kind="secondary" onclick={() => toaster.warning('Connection is slow')} />
					<Button label="Negative" size="compact" kind="secondary" onclick={() => toaster.negative('Peer disconnected')} />
				</Stack>
			</Panel>
		</Stack>
		<Stack direction="column" align="start" gap={24}>
			<Panel title="Inputs" width={340}>
				<Input label="Name" placeholder="What should we call you?" caption="Shown above your avatar" bind:value={playerName} maxLength={24} />
				<Input
					label="Parcel"
					inputmode="numeric"
					enterkeyhint="go"
					bind:value={parcel}
					error={parcelError}
					onsubmit={(id) => {
						// Invalid: keep editing.
						if (parcelError) return false;
						toaster.positive(`Going to parcel ${id}`);
					}}
					oncancel={() => toaster.info('Parcel unchanged')}
				/>
				<Input label="Locked" value="Can't touch this" disabled />
				<!-- One Text, not one per message: 3D stacks order items by when they mount. -->
				<Text variant="LabelSmall" align="left" color="#CBCBCB" style="white-space: pre-line" text={messages.length ? messages.join('\n') : 'Chat: Send keeps the field open'} />

				<Input placeholder="Message…" enterkeyhint="send" blurOnSubmit={false} bind:value={chat} onsubmit={send} />
				{#if is3d}
					<Checkbox type="toggle" label="VR keyboard (simulated)" bind:checked={xr.simulated} />
				{/if}
			</Panel>
		</Stack>
	</Stack>
{/snippet}

{#snippet confirmActions(is3d: boolean)}
	<Button label="Cancel" kind="tertiary" onclick={() => (is3d ? (modal3d = false) : (modal2d = false))} />
	<Button
		label="Discard"
		onclick={() => {
			discarded++;
			if (is3d) modal3d = false;
			else modal2d = false;
			toaster.warning('Changes discarded (not really)');
		}}
	/>
{/snippet}

{#snippet confirmBody()}
	<Text variant="ParagraphMedium" align="left" maxWidth={360} color="#CBCBCB" text="Your edits haven't been saved. If you close now, they'll be lost." />
{/snippet}

<ThemeProvider>
	<div class="gallery">
		<section class="html">
			<Text variant="HeadingMedium" text="gadxr ui — 2D" />
			<Text
				variant="ParagraphMedium"
				color="#AFAFAF"
				text="clicks: {clicks} · last: {lastClicked || '—'} · radio: {radio} · music: {music} · voice: {voice} · volume: {volume} · fog: {fog} · tab: {tab} · quality: {quality} · discarded: {discarded} · name: {playerName} · parcel: {parcel} · toasts: {toaster.items.length}"
			/>
			<div class="grid">{@render showcase(false)}</div>
			<Modal bind:open={modal2d} title="Discard changes?">
				{@render confirmBody()}
				{#snippet actions()}{@render confirmActions(false)}{/snippet}
			</Modal>
			<Toaster />
		</section>

		<section class="space">
			<Scene3D embedded vr-mode-ui="enabled: false">
				<a-sky color="#101018"></a-sky>
				<a-entity light="type: ambient; intensity: 0.6"></a-entity>
				<a-entity light="type: directional; intensity: 2" position="1 2 2"></a-entity>
				<a-entity light="type: point; intensity: 1.5; color: #9fc2ff" position="-1.5 1 1"></a-entity>

				<!-- Glass only shows what's behind it: colorful shapes (terrain palette) to refract. -->
				<a-entity position="0 0 -0.9">
					{#each backdrop as shape}
						<a-entity
							geometry={shape.geometry}
							material="color: {shape.color}; emissive: {shape.color}; emissiveIntensity: 0.35; roughness: 0.4"
							position={shape.position}
							animation="property: rotation; to: {shape.spin}; dur: {shape.dur}; loop: true; easing: linear"
						></a-entity>
					{/each}
				</a-entity>
				<!-- Slow side-to-side orbit around the panels, so their depth shows. -->
				<a-entity
					animation="property: rotation; from: 0 -12 0; to: 0 12 0; dur: 8000; dir: alternate; loop: true; easing: easeInOutSine"
				>
					<a-entity camera="fov: 60" look-controls="enabled: false" position="0 0 3.8"></a-entity>
				</a-entity>
				{@render showcase(true)}
				<Modal bind:open={modal3d} title="Discard changes?" position="0 0 0.9">
					{@render confirmBody()}
					{#snippet actions()}{@render confirmActions(true)}{/snippet}
				</Modal>
				<Toaster position="1.75 -1.3 0.4" />
				<!-- Farther out than in a headset, so the fixed fov-60 camera sees it. -->
				<Keyboard distance={1.4} height={-0.55} />
			</Scene3D>
		</section>
	</div>
</ThemeProvider>

<style>
	.gallery {
		display: grid;
		grid-template-rows: auto 1fr;
		min-height: 100vh;
		background: #000;
	}
	.html {
		padding: 24px;
		display: flex;
		flex-direction: column;
		gap: 8px;
		/* Something behind the glass panel in 2D too. */
		background:
			radial-gradient(circle at 15% 30%, #e1190055, transparent 30%),
			radial-gradient(circle at 35% 60%, #0070c055, transparent 30%),
			#000;
	}
	.grid {
		display: flex;
		flex-wrap: wrap;
		align-items: flex-start;
		gap: 16px;
		margin-top: 8px;
	}
	.space {
		height: 80vh;
		position: relative;
	}
	.space :global(a-scene) {
		width: 100%;
		height: 100%;
	}
</style>
