// Tests the shortcut's text rules with the regular expression engine Shortcuts uses (ICU, through
// NSRegularExpression): it turns sample notes into posts and prints them. Runs on a Mac:
//
//   node tools/atajo/generar.mjs --reglas > /tmp/reglas.json
//   osascript -l JavaScript tools/atajo/probar.js /tmp/reglas.json [notas.json]
//
// notas.json, optional: a list of { "nota": "...", "lang": "es" } to try instead of the samples below.
// The note is what "Make Markdown from Rich Text" returns. Detect Language and the date are not tested:
// each sample says its language, and the date is a fixed one.
ObjC.import('Foundation');

const SAMPLES = [
	{
		lang: 'es',
		nota: 'Una prueba\nPrimer párrafo con una idea. Sigue la idea.\nSegundo párrafo, con una lista:\n–\tuno\n–\tdos\nCierre del texto.\n\n#practice #Prueba',
	},
	{
		lang: 'en',
		nota: "# A test: it's \"quoted\"\n\nFirst paragraph. Second sentence!\n\n- one\n- two\n\nLast line. \\#Quote \\#Practice",
	},
	{ lang: 'en', nota: '**Practice**\nA note whose title is the name of a page.' },
	{ lang: 'en', nota: 'Only a title' },
];

function read(path) {
	return ObjC.unwrap($.NSString.stringWithContentsOfFileEncodingError(path, $.NSUTF8StringEncoding, null));
}

function regex(pattern) {
	const re = $.NSRegularExpression.regularExpressionWithPatternOptionsError(pattern, 0, null);
	if (re.isNil()) throw new Error(`Invalid pattern: ${pattern}`);
	return re;
}

function replace(string, find, replaceWith) {
	const s = $(string);
	return ObjC.unwrap(regex(find).stringByReplacingMatchesInStringOptionsRangeWithTemplate(s, 0, $.NSMakeRange(0, s.length), replaceWith));
}

function matches(string, pattern) {
	const s = $(string);
	const found = regex(pattern).matchesInStringOptionsRange(s, 0, $.NSMakeRange(0, s.length));
	const result = [];
	for (let i = 0; i < found.count; i++) result.push(ObjC.unwrap(s.substringWithRange(found.objectAtIndex(i).range)));
	return result;
}

const replaceAll = (string, steps) => steps.reduce((current, [, find, replaceWith]) => replace(current, find, replaceWith), string);

function toPost(rules, { nota, lang }) {
	const note = replaceAll(nota, rules.note);
	const title = replaceAll(matches(note, rules.firstLine)[0] || '', rules.title);
	if (!title) return '(stops: the note has no title)';
	const body = replaceAll(note, rules.body);
	const practice = matches(note, rules.practice).length > 0;
	const slug = replaceAll(title.toLowerCase(), rules.slug);
	if (!slug) return '(stops: no letters or numbers in the title)';
	if (matches(slug, rules.reserved).length > 0) return `(stops: /${slug}/ is reserved)`;
	const sentence = matches(body, rules.firstSentence)[0] || matches(body, rules.firstParagraph)[0] || title;
	const description = replaceAll(sentence, rules.description).split("'").join("''");
	return [
		`→ src/content/blog/${slug}.md`,
		'---',
		`title: '${title.split("'").join("''")}'`,
		`description: '${description}'`,
		"pubDate: 'Oct 16 2026'",
		`tags: ${practice ? "['practice']" : '[]'}`,
		`lang: '${lang}'`,
		'---',
		'',
		body,
	].join('\n');
}

function run(argv) {
	const rules = JSON.parse(read(argv[0]));
	const notes = argv[1] ? JSON.parse(read(argv[1])) : SAMPLES;
	return notes.map((note) => toPost(rules, note)).join('\n\n========\n\n');
}
