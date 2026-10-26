// A-Frame first: it defines the AFRAME and THREE globals that @gadxr/ui reads.
// Imports run in order, so it's loaded before the app and the library.
import 'aframe';
import { mount } from 'svelte';
import App from './App.svelte';

export default mount(App, { target: document.getElementById('app')! });
