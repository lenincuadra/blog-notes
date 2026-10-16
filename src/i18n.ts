// Languages. The reader picks the language of the interface with EN/ES in the header (the script in
// BaseHead chooses the first one). Every text of the interface is here in both languages: the page
// carries both and shows the reader's (see UiText.astro and global.css).
// A post keeps the language it was written in (`lang`) and can have a translation, which the reader
// sees when it is in their language (see getTranslations and BlogPost.astro).
import { type CollectionEntry, getCollection } from 'astro:content';

export const LANGUAGES = ['en', 'es'] as const;
export type Language = (typeof LANGUAGES)[number];
export type Text = Record<Language, string>;

export const UI = {
	about: { en: 'About', es: 'Acerca de' },
	mainNav: { en: 'Main', es: 'Principal' },
	language: { en: 'Language', es: 'Idioma' },
	darkMode: { en: 'Toggle dark mode', es: 'Cambiar el modo oscuro' },
	filter: { en: 'Filter posts', es: 'Filtrar posts' },
	viewAll: { en: 'View All', es: 'Todo' },
	personal: { en: 'Personal', es: 'Personal' },
	practice: { en: 'Practice', es: 'Práctica' },
	updated: { en: 'Updated', es: 'Actualizado' },
	seeOriginal: { en: 'See the original', es: 'Ver el original' },
	seeTranslation: { en: 'See the translation', es: 'Ver la traducción' },
	portfolio: { en: 'Portfolio', es: 'Portafolio' },
	// The 404 page
	notFoundTitle: { en: 'Someone tore this page out of the notebook.', es: 'Alguien arrancó esta página del cuaderno.' },
	notFoundNote: { en: 'it was me', es: 'fui yo' },
	notFoundText: {
		en: 'Maybe it never existed, or it didn’t survive the edit. It happens in the best notebooks.',
		es: 'Quizás nunca existió, o no sobrevivió a la edición. Pasa en los mejores cuadernos.',
	},
	notFoundRandom: { en: 'If you’re lost, here’s a random post!', es: 'Si estás perdido, ¡acá hay un post random!' },
	notFoundHome: { en: 'Back to the notebook', es: 'Volver al cuaderno' },
} satisfies Record<string, Text>;

// Every post says the language it was written in: under the title of the original, and of its translation
export const WRITTEN_IN: Record<Language, Text> = {
	en: { en: 'Written in English', es: 'Escrito en inglés' },
	es: { en: 'Written in Spanish', es: 'Escrito en español' },
};
// EN or ES in the list, explained: the title may be showing a translation, so it says "originally"
export const ORIGINALLY_IN: Record<Language, Text> = {
	en: { en: 'Originally written in English', es: 'Escrito originalmente en inglés' },
	es: { en: 'Originally written in Spanish', es: 'Escrito originalmente en español' },
};
export const TRANSLATED_FROM: Record<Language, Text> = {
	en: { en: 'Translated from English', es: 'Traducido del inglés' },
	es: { en: 'Translated from Spanish', es: 'Traducido del español' },
};

// What each tag says; the tag itself (in the posts and the addresses) is the same in both languages
export const TAGS: Record<string, Text> = {
	personal: { en: 'personal', es: 'personal' },
	practice: { en: 'practice', es: 'práctica' },
};

// What each tag means, on hover. Like the descriptions of /personal/ and /practice/ (src/consts.ts)
export const TAG_MEANINGS: Record<string, Text> = {
	personal: {
		en: 'The personal side: what I learn, think and make beyond design',
		es: 'El lado personal: lo que aprendo, pienso y hago más allá del diseño',
	},
	practice: {
		en: 'The design side: what I learn, think and make in practice',
		es: 'El lado del diseño: lo que aprendo, pienso y hago en la práctica',
	},
};

export function formatDate(date: Date): Text {
	const options = { year: 'numeric', month: 'short', day: 'numeric' } as const;
	return { en: date.toLocaleDateString('en-us', options), es: date.toLocaleDateString('es', options) };
}

export type Translation = { lang: Language; entry: CollectionEntry<'translations'> };

// The translations of the posts, by the id of their original. They live in
// src/content/blog/translations/<language>/<id of the original>.md, in the language the original isn't.
export async function getTranslations(): Promise<Map<string, Translation>> {
	const originals = new Map((await getCollection('blog')).map((post) => [post.id, post]));
	const translations = new Map<string, Translation>();
	for (const entry of await getCollection('translations')) {
		const [lang, ...rest] = entry.id.split('/');
		const id = rest.join('/');
		const original = originals.get(id);
		if (!LANGUAGES.includes(lang as Language)) {
			throw new Error(`La traducción "${entry.id}" tiene que estar en translations/en/ o translations/es/.`);
		}
		if (!original) throw new Error(`La traducción "${entry.id}" no tiene un post "${id}" del que ser traducción.`);
		if (original.data.lang === lang) {
			throw new Error(`La traducción "${entry.id}" está en el mismo idioma que su original.`);
		}
		translations.set(id, { lang: lang as Language, entry });
	}
	return translations;
}
