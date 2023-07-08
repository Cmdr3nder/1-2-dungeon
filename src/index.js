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
		   conversation_zone.appendChild(user_entry);

			const analysis = compendium.analyse(prompt_text);
			const response = respond({prompt_text, analysis, conversation_window, annoyance});
		   annoyance = response.annoyance;

		   const bot_entry = bot_entry_template.content.cloneNode(true);
			bot_entry.querySelector('.text').innerHTML = to_inner_html(response.text);
		   conversation_zone.appendChild(bot_entry);

			prompt_editor.value = ''; // Clear
			conversation_window.push({prompt_text, analysis, response});
			if (conversation_window.length > MAX_CONV_WINDOW) {
				conversation_window.shift();
			}
		}
		prompt_editor.removeAttribute('disabled');
		prompt_submit.removeAttribute('disabled');
		prompt_editor.focus();
		// TODO: Let the user click on any conversation blurb, and copy the text to the editor automatically
	};

	prompt_editor.addEventListener('keyup', (event) => {
		// Pressed enter, but not shift-enter
		if (event.keyCode === 13 && !event.shiftKey) {
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
	return {
		text: 'I look around',
		annoyance: 0,
	};
}

function to_inner_html(text) {
	return text.split(/\n+/g).map(p => `<p>${p}</p>`).join('');
}

// TODO: Idea - Achievements, like getting the bot really angry or awarding a game over or awarding a game win
