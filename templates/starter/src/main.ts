// A-Frame first: it defines the AFRAME and THREE globals that @xr-kit/ui reads.
// Imports run in order, so it's loaded before the app and the library.
import 'aframe';
// Teleport (`blink-controls`, used on the left hand in App.svelte).
import '@xr-kit/aframe-blink-controls';
// Fast raycasts against meshes with the `bvh` component (the floor and platforms, for teleport).
import '@xr-kit/aframe-bvh';
// Tap a spot on the floor to move there (`tap-to-move`, on the rig in App.svelte).
import '@xr-kit/aframe-tap-to-move';
import { mount } from 'svelte';
import App from './App.svelte';

export default mount(App, { target: document.getElementById('app')! });
