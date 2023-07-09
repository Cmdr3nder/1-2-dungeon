import compendium from 'compendium-js';

const MAX_CONV_WINDOW = 5;
const MIN_ANNOYANCE = -10;

document.addEventListener('DOMContentLoaded', () => {
	const conversation_window = [];
	let annoyance = 0;
	const prompt_editor = document.querySelector('#prompt-editor');
	const prompt_submit = document.querySelector('#prompt-submit');
	const user_entry_template = document.querySelector('#conversation-user-entry'); 
	const bot_entry_template = document.querySelector('#conversation-bot-entry'); 
	const conversation_zone = document.querySelector('#conversation');

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
		   conversation_zone.querySelector('.entry-container:last-child').scrollIntoView();

			const analysis = compendium.analyse(prompt_text);
			const response = respond({prompt_text, analysis, conversation_window, annoyance});
		   annoyance = Math.max(response.annoyance, MIN_ANNOYANCE);

		   const bot_entry = bot_entry_template.content.cloneNode(true);
			bot_entry.querySelector('.text').innerHTML = to_inner_html(response.text);
		   conversation_zone.appendChild(bot_entry);
		   conversation_zone.querySelector('.entry-container:last-child').scrollIntoView();

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

function respond(params) {
	const {
		prompt_text,
		analysis,
		conversation_window,
		annoyance,
	} = params;
	console.log('Qwalski:', params);
	let common = COMMON_COMMANDS[randi(0, COMMON_COMMANDS.length)];
	return {
		text: common,
		annoyance: annoyance - 0.5,
	};
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

// TODO: Have frustrated command sequences? like 'Just tell me what to do, please!' -> '...' -> 'Okay, I do that'

// TODO: Idea - Achievements, like getting the bot really angry or awarding a game over or awarding a game win
// TODO: Idea - Some sort of minimum delay for the computer to 'process' the entry and spit out something reasonable in response since it is too fast right now to feel good
