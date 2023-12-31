import compendium from 'compendium-js';

const MAX_CONV_WINDOW = 5;
const MIN_ANNOYANCE = -10;
const MAX_ANNOYANCE = 10;

document.addEventListener('DOMContentLoaded', () => {
	const conversation_window = [];
	let annoyance = 0;
	const prompt_editor = document.querySelector('#prompt-editor');
	const prompt_submit = document.querySelector('#prompt-submit');
	const user_entry_template = document.querySelector('#conversation-user-entry'); 
	const bot_entry_template = document.querySelector('#conversation-bot-entry'); 
	const conversation_zone = document.querySelector('#conversation');
	const bot_status_img = document.querySelector('#bot-status > img');
	const scroll_behavior = {
		behavior: 'smooth',
		block: 'center',
		inline: 'center',
	};

	const submit_prompt = () => {
		prompt_editor.setAttribute('disabled', '');
		prompt_submit.setAttribute('disabled', '');
		const prompt_text = prompt_editor.value.trim();
		if (prompt_text) { // Prompt with contents
		   const user_entry = user_entry_template.content.cloneNode(true);
		   user_entry.querySelector('.text').innerHTML = to_inner_html(prompt_text);
		   const reuse = user_entry.querySelector('.reuse');
		   reuse.setAttribute('data-prompt', prompt_text);
		   reuse.addEventListener('click', () => {
			   // TODO: We should probably confirm before applying this!
			   prompt_editor.value = reuse.getAttribute('data-prompt'); 
		   });
		   conversation_zone.appendChild(user_entry);
		   conversation_zone.querySelector('.entry-container:last-child').scrollIntoView(scroll_behavior);

			const analysis = compendium.analyse(prompt_text);
			const response = respond({prompt_text, analysis, conversation_window, annoyance});
		   annoyance = Math.min(Math.max(response.annoyance, MIN_ANNOYANCE), MAX_ANNOYANCE);
		   update_bot_status(annoyance, bot_status_img);

		   const bot_entry = bot_entry_template.content.cloneNode(true);
			bot_entry.querySelector('.text').innerHTML = to_inner_html(response.text);
		   conversation_zone.appendChild(bot_entry);
		   conversation_zone.querySelector('.entry-container:last-child').scrollIntoView(scroll_behavior);

			prompt_editor.value = ''; // Clear
			conversation_window.push({prompt_text, analysis, response});
			if (conversation_window.length > MAX_CONV_WINDOW) {
				conversation_window.shift();
			}
		}
		prompt_editor.removeAttribute('disabled');
		prompt_submit.removeAttribute('disabled');
		prompt_editor.focus();
	};

	prompt_editor.addEventListener('keyup', (event) => {
		// Pressed enter, but not shift-enter
		if (event.keyCode === 13 && !event.shiftKey) {
			event.preventDefault();
			submit_prompt();
		}
	});
	prompt_submit.addEventListener('click', () => submit_prompt());
});

const analysis_refusal = (analysis) => analysis.findIndex(s => s.profile.types.indexOf('refusal') !== -1) !== -1;
const prompt_refusal = (text) => / no | not | cannot | can't | won't /gi.test(text);
const word_count = (analysis) => analysis.reduce((sum, s) => s.length + sum, 0);

function respond(params) {
	const {
		prompt_text,
		analysis,
		conversation_window,
		annoyance,
	} = params;
	let forbidden = [];
	let factor = -0.5;
	if (analysis_refusal(analysis) || prompt_refusal(prompt_text)) {
		factor = 2;
		forbidden = conversation_window.map(c => c.response.text);
	} else {
		const wc = word_count(analysis);
		if (wc < 4 || wc > 120) {
			factor = 0.5;
		} else if (wc >= 12 && wc <= 48) {
			factor = -1;
		}
	}
	let common = COMMON_COMMANDS[randi(0, COMMON_COMMANDS.length)];
	while (forbidden.indexOf(common) !== -1) {
		common = COMMON_COMMANDS[randi(0, COMMON_COMMANDS.length)];
	}
	return {
		text: common,
		annoyance: annoyance + factor,
		factor,
	};
	// TODO: Add factor for recently reused prompts.
}

function to_inner_html(text) {
	return text.split(/\n+/g).map(p => `<p>${p}</p>`).join('');
}

// Exclusive integer range random
function randi(raw_min, raw_max) {
	let [min, max] = raw_max ? [raw_min || 0, raw_max] : [0, raw_min || 0];
	return Math.floor(Math.random() * (max - min)) + min;
}

const COMMON_COMMANDS = [
	'look around',
	'go north',
	'go east',
	'go south',
	'go west',
	'go up',
	'go down',
	'enter it',
	'open it',
	'close it',
	'inspect it',
	'turn left',
	'turn right',
	'look up',
	'look down',
];

function update_bot_status(annoyance, img) {
	console.log('annoyance', annoyance);
	switch (true) {
		case annoyance > 9:
			img.setAttribute('src', './assets/Linus7.svg');
			break;
		case annoyance > 7:
			img.setAttribute('src', './assets/Linus6.svg');
			break;
		case annoyance > 6:
			img.setAttribute('src', './assets/Linus5.svg');
			break;
		case annoyance > 5:
			img.setAttribute('src', './assets/Linus4.svg');
			break;
		case annoyance > 3:
			img.setAttribute('src', './assets/Linus3.svg');
			break;
		case annoyance > 1:
			img.setAttribute('src', './assets/Linus2.svg');
			break;
		case annoyance < -9:
			img.setAttribute('src', './assets/Linus12.svg');
			break;
		case annoyance < -7:
			img.setAttribute('src', './assets/Linus11.svg');
			break;
		case annoyance < -5:
			img.setAttribute('src', './assets/Linus10.svg');
			break;
		case annoyance < -3:
			img.setAttribute('src', './assets/Linus9.svg');
			break;
		case annoyance < -1:
			img.setAttribute('src', './assets/Linus8.svg');
			break;
		default:
			img.setAttribute('src', './assets/Linus1.svg');
			break;
	}
}

// TODO: Have frustrated command sequences? like 'Just tell me what to do, please!' -> '...' -> 'Okay, I do that'

// TODO: Idea - Achievements, like getting the bot really angry or awarding a game over or awarding a game win
// TODO: Idea - Some sort of minimum delay for the computer to 'process' the entry and spit out something reasonable in response since it is too fast right now to feel good
