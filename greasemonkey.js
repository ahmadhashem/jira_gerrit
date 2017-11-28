"use strict";

(function() {
    // Load the script
    var script = document.createElement("SCRIPT");
    script.src = 'https://code.jquery.com/jquery-3.2.1.min.js';
    script.type = 'text/javascript';
    script.onload = function() {
        var $ = window.jQuery;
		$.ajaxSetup({async: false});
		
		/*chrome.tabs.query({
			currentWindow: true,
			active: true
		  }, function(tabs){
			    var currentTab = tabs[0].id;
			    chrome.tabs.sendMessage(currentTab, {message: 'getStoryChanges'}, function(response) {
				response.forEach(function(response){
					console.log(response);
				});
			  });
		  });*/
		  
		  
				let currentUrl = document.location.href;
				
				let selectedIssue = currentUrl.searchParams.get('selectedIssue');

				let storyId = selectedIssue;
				if( storyId == undefined || storyId === '' ){
					storyId = tabUrl.substr(tabUrl.lastIndexOf('/')+1);
				}
				
				let storyChanges = undefined;
				
				try
				{
					storyChanges = $.get("https://code.payon.com/changes/?q=status:merged+message:"+storyId).responseText;
				}catch(e)
				{
					console.error('cannot load story changes!');
				}
				
				let storyChangesArray = undefined;
				try{
					storyChangesArray = JSON.parse(storyChanges.substr(4));
				}
				catch(e){
					console.error('Couldnt parse story changes response');
				}
				
				let response = '';
				
				if( storyChangesArray && storyChangesArray.length > 0 ){
					storyChangesArray.forEach(function(change){
						if( change.branch === 'master'){
							let includedInResponse = $.get('https://code.payon.com/changes/'+change.id+'/in').responseText;
							try{
								let  includedIn = JSON.parse(includedInResponse.substr(4));
								let tags = undefined;
								if( includedIn && includedIn.tags ){
									tags = includedIn.tags
										.filter(function(tag){
											return tag.endsWith('_lr') || tag.endsWith('_stage');
										});
								}
								if( tags && tags.length > 0){
									response += 'Change ' + change._number + ' on master for project ' + change.project;
									response += ' is inlucded in tags : \n' + tags
									.reverse()
									.slice(0,7).join('\n');
								}
								else{
									return;
									response += 'Change is not inlcuded in any tags!';
								}
								response += '\n------------------------------------------------------------------------------\n';
							}
							catch(e){
								console.error('couldnot parse change included in response');
							}
						}
					});
				}
				if( response === '' ){
					alert(storyId + ' has no changes on master tagged on _lr or _stage');
				}
				else{
					alert(storyId + '\n------------------------------------------------------------------------------\n' + response);
				}

    };
    document.getElementsByTagName("head")[0].appendChild(script);
  })();
