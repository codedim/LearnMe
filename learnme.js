
var viewMode = 0; // source text (0), result text (1), words to learn (2)
var srcText, resText = ''; 
var wordsToLearn = [];
// is it a SRT file?
var isSubtitles = (document.baseURI.match(/\.srt$/i) || 
	document.baseURI.match(/\.srt#[a-z]+$/i)) ? true : false;

srcText = document.body.innerHTML;
resText = processText(srcText, isSubtitles);

// message listner from background skript
chrome.extension.onMessage.addListener(function(msg, sender, response) {
	if (msg.action == 'pageIconClicked' && resText.length) {
		if (viewMode == 0) {      
			// show modified text
			document.body.innerHTML = resText;
			// charge links
			setLinks();
			viewMode = 1; 
		}
		else if (viewMode == 1) { 
			// show selected words to be learned
			if (wordsToLearn.length) {
				var list = '';
				for (var i = 0; i < wordsToLearn.length; i++) {
					list += wordsToLearn[i] + '<br>';
				}
				document.body.innerHTML = list;
			} else {
				document.body.innerHTML = '<span style="color:red">' + 
					'no word was selected</span>';
			}
			viewMode = 2; 
		}
		else if (viewMode == 2) { 
			// show unmodified text back
			document.body.innerHTML = srcText;
			viewMode = 0; 
		}
	}
});

// modifies source text to select words to learn
function processText(text, isSrt) {
	const openPre = '<pre style="word-wrap: break-word; white-space: pre-wrap;">';
	const closePre = '</pre>';
	var wordNmbr = 0;
	
	if (text.indexOf(openPre) == 0 && text.includes(closePre)) {
		text = text.substr(openPre.length);
		text = text.substr(0, text.indexOf(closePre));

		var lines = text.split('\n'); 
		text = '';
		for (var i = 0; i < lines.length; ++i) {
			if (lines[i].length > 0) {
				if (isSrt && (lines[i].match(/^[^a-z]+$/i) || 
					lines[i].match(/^\d\d:\d\d:\d\d,\d\d\d/i)))
				{
					continue; // remove subtitles time stamps
				}

				var words = lines[i].split(' ');
				var line = '';
				for (var j = 0; j < words.length; ++j) {
					line += hyperlinkWord(words[j], ++wordNmbr) + ' '; 
				}

				text += line + '\n';
			} else {
				text += '\n';
			}
		}

		return openPre + text + closePre;
	}
}

// makes hyperlink from a given word
function hyperlinkWord(word, nmbr) {
	var search = word.match(/[a-z]+/i);
	if (search) {
		var prefix = (search.index) ? word.substr(0, search.index) : '';
		var suffix = word.substr(prefix.length + search[0].length);
		word = search[0];
		if (word.length > 2)
			return prefix + '<a href="#' + word.toLowerCase() + '">' + 
				word + '</a>' + suffix;
		else 
			return prefix + word + suffix;	
	} else {
		return word;
	}
}

// adds click event listener to every hyperlinked word
function setLinks() {
	var links = document.getElementsByTagName('a');
	if (links) for (var i = 0; i < links.length; i++) {
		links[i].addEventListener('click', function(){
		    storeWord(this.hash.substr(1));
		});
	}
}

// puts given word to 'words to learn' array
function storeWord(word) {
	var found = false;
	for (var i = 0; i < wordsToLearn.length; i++) {
		if (wordsToLearn[i] == word) {
			found = true;
			break;
		}
	}
	// store word if it's not in the array
	if (!found) wordsToLearn.push(word);
}
