// Tabs <-> Tab: each Tab registers its key/title; Tabs draws the bar and tells
// each Tab whether it's the active one.
import { getContext, setContext } from 'svelte';

const TABS = Symbol('ui-tabs');

// Getters, so a Tab's props stay live after registering.
export type TabEntry = { readonly key: string; readonly title: string; readonly disabled: boolean };

export type TabsContext = {
	// Prefix for the ARIA ids linking each tab button to its panel.
	readonly id: string;
	register(tab: TabEntry): void;
	unregister(tab: TabEntry): void;
	readonly active: string | undefined;
};

export const setTabs = (tabs: TabsContext) => setContext(TABS, tabs);
export const getTabs = () => getContext<TabsContext | undefined>(TABS);
