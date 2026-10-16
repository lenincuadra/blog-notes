// Builds "Publicar en el blog", the iOS and macOS shortcut that publishes a note from Apple Notes as a
// post. The note is shared from Notes; the shortcut turns it into src/content/blog/<slug>.md and uploads
// it to GitHub, which publishes it. What it does, step by step: docs/atajo.md.
//
//   npm run atajo             -> tools/atajo/salida/Publicar en el blog.shortcut, signed, ready to open
//   npm run atajo -- --reglas -> prints the text rules as JSON, for tools/atajo/probar.js
//
// Signing uses the `shortcuts` command, so this runs on a Mac. The token is not in the file: the shortcut
// asks for it when it is installed.

import { execFileSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const NAME = 'Publicar en el blog';
const REPO = 'lenincuadra/blog-notes';
const SITE = 'notes.lenincuadra.com';

// Pages of the site: a post can't take their names (see CLAUDE.md). Keep both lists in sync.
const RESERVED = ['404', 'about', 'personal', 'practice'];

// ---------- Text rules ----------
// Regular expressions in ICU syntax, the engine Shortcuts uses. Each step: [what it does, find, replace].
//
// What "Make Markdown from Rich Text" returns: Shortcuts turns the note into HTML and then into Markdown
// with a port of html2text. Paragraphs come separated by a blank line, list items start with "  * ", and
// any line longer than about 100 characters is cut in two. A note's first paragraph, its title in Notes,
// can be that long: a quote written all in the title.

export const RULES = {
	// The whole note, already in Markdown
	note: [
		['Windows line breaks and Unicode separators', String.raw`\r\n?|[  ]`, '\n'],
		['Lines with only spaces are blank', String.raw`(?m)^[ \t ]+$`, ''],
		['Blank space before the title', String.raw`\A\s+`, ''],
		// Unless the line ends in two spaces (a line break in Markdown) or the next one starts a list
		// item, a code block or a line of hashtags
		[
			'Lines the conversion cut are joined back',
			String.raw`(?<!\n)(?<!  )\n(?![ \t]*\n)(?![ \t]*(?:[-*+]|\d+[.)])[ \t])(?![ \t]*[–•◦▪]\t)(?! {4}|\t)(?![ \t]*\\?#[\p{L}\p{N}_])`,
			' ',
		],
	],
	firstLine: String.raw`\A[^\n]*`,
	title: [
		['Hashtags at the end of the title', String.raw`(?:[ \t ]+\\?#[\p{L}\p{N}_-]+)+[ \t ]*\z`, ''],
		['Markdown marks around the title (#, **, _)', String.raw`\A[\s#*_\\]+|[\s*_]+\z`, ''],
		['Characters the conversion escaped', String.raw`\\([!-/:-@\[-\x60{-~])`, '$1'],
	],
	body: [
		['Drop the first line: it is the title', String.raw`\A[^\n]*\n*`, ''],
		['List items of the conversion start with "- ", as in the other posts', String.raw`(?m)^ {0,3}[*+][ \t]+`, '- '],
		['A dash or bullet and a tab, as Notes writes list items', String.raw`(?m)^[ \t]*\\?[-–•◦▪]\t[\t ]*`, '- '],
		[
			'Lines that only have hashtags',
			String.raw`(?m)^[ \t ]*\\?#[\p{L}\p{N}_-]+(?:[ \t ]+\\?#[\p{L}\p{N}_-]+)*[ \t ]*$`,
			'',
		],
		['Hashtags at the end of the text', String.raw`(?:[ \t ]+\\?#[\p{L}\p{N}_-]+)+\s*\z`, ''],
		['No extra blank lines', String.raw`\n{3,}`, '\n\n'],
		[
			'The items of a list stay together',
			String.raw`(?m)^([ \t]*(?:[-*+]|\d+[.)])[ \t].*)\n\n(?=[ \t]*(?:[-*+]|\d+[.)])[ \t])`,
			'$1\n',
		],
		['Blank space at the start and the end', String.raw`\A\s+|\s+\z`, ''],
	],
	// Matched against the whole note, hashtags included
	practice: String.raw`(?i)(?:^|\s)\\?#practice(?![\p{L}\p{N}_-])`,
	// Matched against what Detect Language returns: a code (es) or a name (Spanish, Español)
	spanish: String.raw`(?i)\A(?:es|sp)`,
	firstSentence: String.raw`\A[^\n]*?[.!?…](?=\s|\z)`,
	firstParagraph: String.raw`\A[^\n]+`,
	description: [
		['A list or heading mark at the start', String.raw`\A[ \t]*(?:(?:[-*+]|\d+[.)])[ \t]+|#+[ \t]*)`, ''],
		['Emphasis marks', String.raw`\*+|(?<![\p{L}\p{N}])_+|_+(?![\p{L}\p{N}])`, ''],
		['Characters the conversion escaped', String.raw`\\([!-/:-@\[-\x60{-~])`, '$1'],
	],
	// After lowercasing the title
	slug: [
		['a', '[áàäâãå]', 'a'],
		['e', '[éèëê]', 'e'],
		['i', '[íìïî]', 'i'],
		['o', '[óòöôõø]', 'o'],
		['u', '[úùüû]', 'u'],
		['ñ', 'ñ', 'n'],
		['ç', 'ç', 'c'],
		["Apostrophes go away: it's becomes its", "['’]", ''],
		['Anything but letters and numbers becomes a hyphen', '[^a-z0-9]+', '-'],
		['No hyphens at the start or the end', String.raw`\A-+|-+\z`, ''],
	],
	reserved: String.raw`\A(?:${RESERVED.join('|')})\z`,
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

if (process.argv.includes('--reglas')) {
	console.log(JSON.stringify(RULES, null, '\t'));
	process.exit(0);
}

// ---------- Building blocks of a shortcut file ----------

const actions = [];
const uuid = () => randomUUID().toUpperCase();
const INPUT = { input: true };
const v = (name) => ({ var: name });

function ref(x) {
	if (x.input) return { Type: 'ExtensionInput' };
	if (x.var) return { Type: 'Variable', VariableName: x.var };
	return { Type: 'ActionOutput', OutputUUID: x.out, OutputName: x.name };
}

// A text with variables in it: each variable takes one placeholder character
function text(...parts) {
	let string = '';
	const attachmentsByRange = {};
	for (const part of parts) {
		if (typeof part === 'string') {
			string += part;
		} else {
			attachmentsByRange[`{${string.length}, 1}`] = ref(part);
			string += '￼';
		}
	}
	return { Value: { string, attachmentsByRange }, WFSerializationType: 'WFTextTokenString' };
}

const variable = (x) => ({ Value: ref(x), WFSerializationType: 'WFTextTokenAttachment' });

function dictionary(pairs) {
	const items = pairs.map(([key, value]) => ({
		WFItemType: 0,
		WFKey: text(key),
		WFValue: text(...[value].flat()),
	}));
	return { Value: { WFDictionaryFieldValueItems: items }, WFSerializationType: 'WFDictionaryFieldValue' };
}

// Adds an action. With an output name it also returns its output, to use in later actions.
function action(id, params = {}, output) {
	const parameters = { ...params };
	let result;
	if (output) {
		parameters.UUID = uuid();
		result = { out: parameters.UUID, name: output };
	}
	actions.push({ WFWorkflowActionIdentifier: id, WFWorkflowActionParameters: parameters });
	return result;
}

const comment = (t) => action('is.workflow.actions.comment', { WFCommentActionText: t });
const stop = () => action('is.workflow.actions.exit');
// Actions take the previous action's output when their own input isn't read, so a few get it both ways
const pass = (x) => action('is.workflow.actions.getvariable', { WFVariable: variable(x) }, 'Variable');

function set(name, x) {
	action('is.workflow.actions.setvariable', { WFVariableName: name, WFInput: variable(x) });
	return v(name);
}
const textAction = (...parts) => action('is.workflow.actions.gettext', { WFTextActionText: text(...parts) }, 'Texto');
const setText = (name, ...parts) => set(name, textAction(...parts));

function replace(x, find, replaceWith, regex = true) {
	return action(
		'is.workflow.actions.text.replace',
		{
			WFInput: text(x),
			WFReplaceTextFind: find,
			WFReplaceTextReplace: replaceWith,
			WFReplaceTextRegularExpression: regex,
			WFReplaceTextCaseSensitive: true,
		},
		'Texto actualizado',
	);
}
const replaceAll = (x, steps) => steps.reduce((current, [, find, replaceWith]) => replace(current, find, replaceWith), x);

function match(x, pattern) {
	pass(x);
	return action(
		'is.workflow.actions.text.match',
		{ text: text(x), WFMatchTextPattern: pattern, WFMatchTextCaseSensitive: true },
		'Coincidencias',
	);
}
const first = (x) =>
	action('is.workflow.actions.getitemfromlist', { WFInput: variable(x), WFItemSpecifier: 'First Item' }, 'Elemento');
const valueFor = (dict, key) =>
	action(
		'is.workflow.actions.getvalueforkey',
		{ WFInput: variable(dict), WFGetDictionaryValueType: 'Value', WFDictionaryKey: text(key) },
		'Valor',
	);

function formatDate(x, format) {
	pass(x);
	return action(
		'is.workflow.actions.format.date',
		{ WFDate: text(x), WFDateFormatStyle: 'Custom', WFDateFormat: format },
		'Fecha con formato',
	);
}

const alert = (title, ...message) =>
	action('is.workflow.actions.alert', {
		WFAlertActionTitle: title,
		WFAlertActionMessage: text(...message),
		WFAlertActionCancelButtonShown: false,
	});

// Conditions for if_()
const HAS = 100;
const HAS_NOT = 101;
const CONTAINS = 99;

function if_(x, condition, string, then, otherwise) {
	const group = uuid();
	const params = { WFControlFlowMode: 0, GroupingIdentifier: group, WFCondition: condition };
	params.WFInput = { Type: 'Variable', Variable: variable(x) };
	if (string !== undefined) params.WFConditionalActionString = string;
	action('is.workflow.actions.conditional', params);
	then();
	if (otherwise) {
		action('is.workflow.actions.conditional', { WFControlFlowMode: 1, GroupingIdentifier: group });
		otherwise();
	}
	action('is.workflow.actions.conditional', { WFControlFlowMode: 2, GroupingIdentifier: group });
}

function menu(prompt, cases) {
	const group = uuid();
	action('is.workflow.actions.choosefrommenu', {
		WFControlFlowMode: 0,
		GroupingIdentifier: group,
		WFMenuPrompt: prompt,
		WFMenuItems: cases.map(([title]) => title),
	});
	for (const [title, run] of cases) {
		action('is.workflow.actions.choosefrommenu', { WFControlFlowMode: 1, GroupingIdentifier: group, WFMenuItemTitle: title });
		run();
	}
	action('is.workflow.actions.choosefrommenu', { WFControlFlowMode: 2, GroupingIdentifier: group });
}

// ---------- The shortcut ----------

comment(
	`Publica una nota de Notas como post en ${SITE}. Se usa desde la nota: Compartir → ${NAME}.\n\n` +
		'Cómo funciona y cómo se cambia: docs/atajo.md, en el repositorio blog-notes.',
);

comment('Tu token de GitHub ("Atajo de Notes"). Vence el 6 de agosto de 2027: cuando generes uno nuevo, pégalo aquí.');
const tokenAction = actions.length;
set('token', textAction(''));

if_(INPUT, HAS_NOT, undefined, () => {
	alert('Ábrelo desde una nota', `En Notas, abre la nota que quieres publicar, toca Compartir y elige "${NAME}".`);
	stop();
});

comment('1. La nota pasa a Markdown. Su primer párrafo es el título; el resto, el texto del post, tal cual.');
const markdown = action('is.workflow.actions.getmarkdownfromrichtext', { WFInput: variable(INPUT) }, 'Markdown');
set('nota', replaceAll(markdown, RULES.note));
set('titulo', replaceAll(first(match(v('nota'), RULES.firstLine)), RULES.title));
if_(v('titulo'), HAS_NOT, undefined, () => {
	alert('La nota no tiene título', 'La primera línea de la nota es el título del post.');
	stop();
});
set('cuerpo', replaceAll(v('nota'), RULES.body));

comment('Si la nota es un solo párrafo, como una frase escrita entera en el título, la frase es el texto del post y el atajo te pide un título.');
if_(v('cuerpo'), HAS_NOT, undefined, () => {
	set('cuerpo', v('titulo'));
	const asked = action(
		'is.workflow.actions.ask',
		{ WFInputType: 'Text', WFAskActionPrompt: 'La nota es una sola frase y va como texto del post. ¿Qué título le pones?' },
		'Título',
	);
	set('titulo', replace(asked, String.raw`\A\s+|\s+\z`, ''));
	if_(v('titulo'), HAS_NOT, undefined, () => {
		alert('No se publicó', 'El post necesita un título.');
		stop();
	});
});

comment('2. Si la nota tiene #practice, el post va a Practice. Ningún hashtag se publica.');
if_(
	match(v('nota'), RULES.practice),
	HAS,
	undefined,
	() => {
		setText('vista', 'Practice');
		setText('tags', "['practice']");
	},
	() => {
		setText('vista', 'Personal');
		setText('tags', "['personal']");
	},
);

comment('3. El idioma se detecta solo: español o inglés.');
const language = action(
	'is.workflow.actions.detectlanguage',
	{ WFInput: text(v('titulo'), '\n', v('cuerpo')) },
	'Idioma',
);
if_(
	match(language, RULES.spanish),
	HAS,
	undefined,
	() => {
		setText('lang', 'es');
		setText('idioma', 'español');
	},
	() => {
		setText('lang', 'en');
		setText('idioma', 'inglés');
	},
);

comment('4. La fecha del post: hoy, o la que elijas, por ejemplo la de una nota vieja. Se escribe como "Oct 16 2026".');
set('fecha', action('is.workflow.actions.ask', { WFInputType: 'Date', WFAskActionPrompt: '¿Qué fecha lleva el post?' }, 'Fecha'));
const monthNumber = formatDate(v('fecha'), 'M');
const months = action(
	'is.workflow.actions.dictionary',
	{ WFItems: dictionary(MONTHS.map((month, i) => [String(i + 1), month])) },
	'Diccionario',
);
const month = valueFor(months, monthNumber);
setText('fechaTexto', month, ' ', formatDate(v('fecha'), 'd yyyy'));

comment('5. La dirección sale del título: en minúsculas, sin tildes y con guiones. Nunca usa un nombre reservado.');
pass(v('titulo'));
const lowercase = action(
	'is.workflow.actions.text.changecase',
	{ text: text(v('titulo')), WFCaseType: 'lowercase' },
	'Texto actualizado',
);
set('slug', replaceAll(lowercase, RULES.slug));
if_(v('slug'), HAS_NOT, undefined, () => {
	alert('No pude armar la dirección', 'El título necesita al menos una letra o un número.');
	stop();
});
if_(match(v('slug'), RULES.reserved), HAS, undefined, () => {
	alert('Ese nombre está reservado', 'La dirección /', v('slug'), '/ es de una página del blog. Cambia el título de la nota.');
	stop();
});

comment('6. La descripción, la que muestran Google y los enlaces compartidos, es la primera oración del texto.');
set('oracion', match(v('cuerpo'), RULES.firstSentence));
if_(
	v('oracion'),
	HAS,
	undefined,
	() => set('descripcion', first(v('oracion'))),
	() => set('descripcion', first(match(v('cuerpo'), RULES.firstParagraph))),
);
if_(v('descripcion'), HAS_NOT, undefined, () => set('descripcion', v('titulo')));
// In YAML, a quote inside single quotes is written twice
set('descripcionYaml', replace(replaceAll(v('descripcion'), RULES.description), "'", "''", false));
set('tituloYaml', replace(v('titulo'), "'", "''", false));

comment('7. El archivo del post: sus datos arriba (el frontmatter) y después el texto.');
setText(
	'archivo',
	"---\ntitle: '",
	v('tituloYaml'),
	"'\ndescription: '",
	v('descripcionYaml'),
	"'\npubDate: '",
	v('fechaTexto'),
	"'\ntags: ",
	v('tags'),
	"\nlang: '",
	v('lang'),
	"'\n---\n\n",
	v('cuerpo'),
	'\n',
);

comment('8. Un resumen para confirmar antes de subirlo.');
menu(text('«', v('titulo'), '»\n', v('vista'), ' · ', v('fechaTexto'), ' · ', v('idioma'), `\n${SITE}/`, v('slug'), '/'), [
	['Publicar', () => {}],
	['Cancelar', stop],
]);

comment('9. Lo sube a GitHub. Si ya hay un post con esa dirección, GitHub lo rechaza: el atajo nunca reemplaza un post.');
pass(v('archivo'));
const base64 = action(
	'is.workflow.actions.base64encode',
	{ WFInput: variable(v('archivo')), WFEncodeMode: 'Encode', WFBase64LineBreakMode: 'None' },
	'Base64',
);
set('contenido', replace(base64, String.raw`\s+`, ''));
const response = action(
	'is.workflow.actions.downloadurl',
	{
		WFURL: text(`https://api.github.com/repos/${REPO}/contents/src/content/blog/`, v('slug'), '.md'),
		WFHTTPMethod: 'PUT',
		ShowHeaders: true,
		WFHTTPHeaders: dictionary([
			['Authorization', ['Bearer ', v('token')]],
			['Accept', 'application/vnd.github+json'],
			['X-GitHub-Api-Version', '2022-11-28'],
		]),
		WFHTTPBodyType: 'JSON',
		WFJSONValues: dictionary([
			['message', ['Post nuevo desde Notes: ', v('titulo')]],
			['content', [v('contenido')]],
			['branch', 'main'],
		]),
	},
	'Respuesta',
);
set('respuesta', response);

comment('10. Te avisa si se publicó o por qué no.');
if_(
	valueFor(v('respuesta'), 'content'),
	HAS,
	undefined,
	() => alert('Publicado', `En un minuto aparece en ${SITE}/`, v('slug'), '/'),
	() => {
		set('mensaje', valueFor(v('respuesta'), 'message'));
		if_(
			v('mensaje'),
			CONTAINS,
			'sha',
			() =>
				alert(
					'No se publicó',
					'Ya hay un post en /',
					v('slug'),
					'/. El atajo nunca reemplaza un post: cambia el título de la nota, o edita ese post desde la Mac.',
				),
			() =>
				if_(
					v('mensaje'),
					CONTAINS,
					'credentials',
					() =>
						alert(
							'No se publicó',
							'GitHub no aceptó el token. Puede que haya vencido: genera uno nuevo y pégalo al inicio del atajo.',
						),
					() => alert('No se publicó', 'GitHub respondió: ', v('mensaje')),
				),
		);
	},
);

const shortcut = {
	WFWorkflowActions: actions,
	WFWorkflowClientVersion: '2302.0.4',
	WFWorkflowHasOutputFallback: false,
	WFWorkflowHasShortcutInputVariables: true,
	WFWorkflowIcon: { WFWorkflowIconGlyphNumber: 59446, WFWorkflowIconStartColor: 4282601983 },
	WFWorkflowImportQuestions: [
		{
			ActionIndex: tokenAction,
			Category: 'Parameter',
			DefaultValue: '',
			ParameterKey: 'WFTextActionText',
			Text: 'Pega tu token de GitHub, "Atajo de Notes". Empieza con github_pat_.',
		},
	],
	WFWorkflowInputContentItemClasses: ['WFRichTextContentItem', 'WFStringContentItem'],
	WFWorkflowMinimumClientVersion: 900,
	WFWorkflowMinimumClientVersionString: '900',
	WFWorkflowOutputContentItemClasses: [],
	WFWorkflowTypes: ['ActionExtension'],
};

// ---------- Writing and signing ----------

const folder = join(dirname(fileURLToPath(import.meta.url)), 'salida');
mkdirSync(folder, { recursive: true });
const json = join(folder, `${NAME}.json`);
const unsigned = join(folder, `${NAME} (sin firmar).shortcut`);
const signed = join(folder, `${NAME}.shortcut`);
writeFileSync(json, JSON.stringify(shortcut, null, '\t'));
execFileSync('plutil', ['-convert', 'binary1', '-o', unsigned, json]);
// `shortcuts sign` prints harmless warnings; it fails with an exit code when it can't sign
execFileSync('shortcuts', ['sign', '--mode', 'anyone', '--input', unsigned, '--output', signed], { stdio: 'ignore' });
console.log(`${actions.length} acciones → ${signed}`);
