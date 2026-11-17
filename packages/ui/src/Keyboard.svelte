<script lang="ts">
	// The VR keyboard. Place one in the <a-scene> (not under the camera), like Toaster:
	//   <Keyboard />
	// While a 3D Input has focus in an immersive session (or xr.simulated), it slides in on
	// a Surface that lazily follows your gaze, below eye level and in front of other
	// follow surfaces. The line on top shows the text being typed (click it to move the
	// caret), so the field itself can be anywhere. Keys are pressed with the laser and
	// trigger, or the mouse while simulating. Enter submits, Done keeps the text, × cancels.
	import { untrack } from 'svelte';
	import { ensure3d } from './aframe';
	import { getTheme } from './context';
	import Key3D from './Key3D.svelte';
	import {
		KEYBOARD,
		ROW_UNITS,
		afterChar,
		keyChar,
		keyLabel,
		keyWidth,
		startPage,
		tapShift,
		type KeyDef,
		type KeyboardPage,
		type ShiftState,
	} from './keyboard-layout';
	import Surface from './Surface.svelte';
	import { textFocus } from './text-focus.svelte';
	import TextLine3D from './TextLine3D.svelte';
	import { xr } from './xr.svelte';

	type Props = {
		// Follow placement (see Surface): meters ahead, below eye level, and size.
		distance?: number;
		height?: number;
		scale?: number;
		// Degrees the keyboard leans back to face you from below.
		tilt?: number;
	};

	let { distance = 0.75, height = -0.5, scale = 0.3, tilt = 25 }: Props = $props();

	ensure3d();
	const theme = getTheme();
	const t = $derived(theme());
	const m = (px: number) => px * t.space3d.metersPerPx;

	const field = $derived(textFocus.current);
	const open = $derived(!!field && xr.immersive);

	let page = $state<KeyboardPage>('letters');
	let shift = $state<ShiftState>('off');
	let lastShiftTap = 0;
	// Each newly focused field starts on its page, unshifted.
	$effect(() => {
		const f = field;
		if (!f) return;
		untrack(() => {
			page = startPage(f.inputmode);
			shift = 'off';
		});
	});

	let rootEl: HTMLElement | undefined = $state();
	$effect(() => {
		const el = rootEl;
		if (!el) return;
		textFocus.keyboards.add(el);
		return () => textFocus.keyboards.delete(el);
	});

	// Layout (meters). A key `w` units wide also covers the gaps it spans, so every row
	// (ROW_UNITS wide) lines up whatever its key count.
	const unit = $derived(m(t.keyboard.key));
	const gap = $derived(m(t.keyboard.gap));
	const pad = $derived(m(t.keyboard.padding));
	const span = (w: number) => w * unit + (w - 1) * gap;
	const rowsW = $derived(span(ROW_UNITS));
	const rows = $derived(KEYBOARD[page]);
	const previewH = $derived(m(t.input.height));
	const W = $derived(rowsW + 2 * pad);
	const H = $derived(pad + previewH + gap * 2 + rows.length * unit + (rows.length - 1) * gap + pad);
	const keyFont = $derived(t.typography[t.keyboard.typography]);
	const wordFont = $derived(t.typography[t.keyboard.wordTypography]);
	const inputStyle = $derived(t.colors.input);

	const placed = $derived(
		rows.flatMap((row, r) => {
			let x = -rowsW / 2;
			const y = H / 2 - pad - previewH - gap * 2 - unit / 2 - r * (unit + gap);
			return row.map((key, k) => {
				const w = span(keyWidth(key));
				const item = { key, id: `${r}-${k}`, x: x + w / 2, y, w };
				x += w + gap;
				return item;
			});
		})
	);

	const kindOf = (key: KeyDef) => (key.action === 'char' ? 'char' : key.action === 'enter' ? 'accent' : 'special');

	function press(key: KeyDef) {
		const f = textFocus.current;
		if (!f) return;
		switch (key.action) {
			case 'char':
				f.edit({ type: 'insert', text: keyChar(key, shift) });
				shift = afterChar(shift);
				break;
			case 'space':
				f.edit({ type: 'insert', text: ' ' });
				break;
			case 'backspace':
				f.edit({ type: 'backspace' });
				break;
			case 'shift': {
				const now = performance.now();
				shift = tapShift(shift, now - lastShiftTap);
				lastShiftTap = now;
				break;
			}
			case 'page':
				page = key.page;
				shift = 'off';
				break;
			case 'enter':
				f.enter();
				break;
			case 'done':
				f.done();
				break;
			case 'close':
				f.cancel();
				break;
		}
	}
</script>

<a-entity bind:this={rootEl} class="ui-keyboard">
	<Surface mode="3d" vr="follow" open={open} {distance} {height} {scale} maxAngle={25}>
		<a-entity rotation="{-tilt} 0 0">
			<!-- Raycastable so a press that misses a key lands here and keeps editing, instead of
			     counting as a click elsewhere (which closes the keyboard). -->
			<a-entity
				class="raycastable"
				rounded="width: {W}; height: {H}; depth: 0.02; radius: {m(t.panel.radius)}; color: {t.colors.keyboard.fill}; opacity: {t.space3d.panelOpacity}"
				position="{-W / 2} {-H / 2} -0.02"
			></a-entity>
			<!-- What's being typed, with its caret. -->
			<a-entity position="0 {H / 2 - pad - previewH / 2} 0">
				<a-entity
					rounded="width: {rowsW}; height: {previewH}; depth: 0.01; radius: {m(t.input.radius)}; color: {inputStyle.fill}"
					position="{-rowsW / 2} {-previewH / 2} 0"
				></a-entity>
				<a-entity position="0 0 0.012">
				<TextLine3D
					text={field?.text ?? ''}
					caret={field?.caret ?? 0}
					focused={!!field}
					placeholder={field?.placeholder ?? ''}
					font={t.typography[t.input.typography]}
					color={inputStyle.text}
					placeholderColor={inputStyle.placeholder}
					caretColor={inputStyle.caret}
					width={rowsW - 2 * m(t.input.paddingX)}
					hitWidth={rowsW}
					hitHeight={previewH}
					onpick={(index) => textFocus.current?.setCaret(index)}
				/>
				</a-entity>
			</a-entity>
			{#each placed as { key, id, x, y, w } (id)}
				{#if key.action !== 'spacer'}
					<a-entity position="{x} {y} 0">
						<Key3D
							label={keyLabel(key, shift, field?.enterKeyHint)}
							width={w}
							height={unit}
							font={[...keyLabel(key, shift, field?.enterKeyHint)].length > 1 ? wordFont : keyFont}
							kind={kindOf(key)}
							on={key.action === 'shift' && shift !== 'off'}
							onpress={() => press(key)}
						/>
					</a-entity>
				{/if}
			{/each}
		</a-entity>
	</Surface>
</a-entity>
