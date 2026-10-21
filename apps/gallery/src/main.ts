// A-Frame first: it defines the AFRAME and THREE globals that @gadxr/ui reads.
import 'aframe';
import { mount } from 'svelte';
import Gallery from './Gallery.svelte';

export default mount(Gallery, { target: document.getElementById('app')! });
