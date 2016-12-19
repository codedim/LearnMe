
// when extension is installed or upgraded
chrome.runtime.onInstalled.addListener(function() {
	// replace all rules with a new rule
	chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
		chrome.declarativeContent.onPageChanged.addRules([
			{
				// that fires when file was opened from local disk
				conditions: [
					new chrome.declarativeContent.PageStateMatcher({
						pageUrl: { urlContains: 'file:///' },
					})
				],
				// and shows the extension's page action.
				actions: [ new chrome.declarativeContent.ShowPageAction() ]
			}
		]);
	});
});

// when extension icon has been clicked
chrome.pageAction.onClicked.addListener(function(tab) {
	// send a message to content script
	chrome.tabs.sendMessage(tab.id, 
		{ action: 'pageIconClicked' }, function(response) {});
});

