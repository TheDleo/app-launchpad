/**
 * appgroups.js
 */
var isPageDirty = false;
	
var selected_app_grp_id = -1;
var current_app_grps = null;
var selectAppGrp = null;

function makeAppGrpButton(id,name,container) {
	container.append($('<button id="APP_GRP_'+id+'" class="app_grp_button selector_btn cW100"><span id="DFUserLabel_'+id+'">'+name+'</span></button>'));
}

function renderApps(container,appGrp) {
	for(var i = 0; i < appGrp.length; i++) {
		if(!appGrp[i]) continue;
		makeAppGrpButton(i,appGrp[i].Name,container);
		if(selected_app_grp_id > -1 && parseInt(appGrp[i].Id) == selected_app_grp_id) {
			selected_app_grp_id = -1;
		}
	}
	$('.app_grp_button').button({icons: {primary: "ui-icon-star"}}).click(function(){
		showAppGrp(); // clear user selection
		$(this).button( "option", "icons", {primary: 'ui-icon-seek-next', secondary:'ui-icon-seek-next'} );
		showAppGrp(current_app_grps[parseInt($(this).attr('id').substring('APP_GRP_'.length))]);
	});
}

/**
 * 
 */
function selectCurrentRole() {
	if(selectAppGrp && current_app_grps) {
		for(var i in current_app_grps) {
			if(current_app_grps[i].Name == selectAppGrp.Name) {
				$('#APP_GRP_'+i).button( "option", "icons", {primary: "ui-icon-seek-next", secondary:"ui-icon-seek-next"} );
				showAppGrp(current_app_grps[i]);
				return;
			}
		}
	} else {
		showAppGrp();
	}
}

function showAppGrp(appGrp) {
	selectAppGrp = appGrp;
	if(appGrp) {
		$('input:text[name=Name]').val(appGrp.Name);
		$('input:text[name=Description]').val(appGrp.Description);
		$("#save").button({ disabled: true });
		$('#delete').button({ disabled: false });
		$('#clear').button({ disabled: false });
	} else {
		if(current_app_grps) {
			for(var i in current_app_grps) {
				$('#APP_GRP_'+i).button( "option", "icons", {primary: 'ui-icon-star', secondary:''} );
			}
		}
		$('input:text[name=Name]').val('');
		$('input:text[name=Description]').val('');
		$('#save').button({ disabled: false });
		$('#delete').button({ disabled: true });
		$('#clear').button({ disabled: true });
	}
}

function makeClearable() {
	$('#clear').button({ disabled: false });
	$("#save").button({ disabled: false });
}


var appgrpio = new DFRequest({
	app: 'admin',
	service: "System",
	resource: '/AppGroup',
	type: DFRequestType.POST,
	success: function(json,request) {
		if(!parseErrors(json,errorHandler)) {
			if(request) {
				switch(request.action) {
					case DFRequestActions.UPDATE:
						$("#appGrpList").dfSearchWidget('go');
						break;
					case DFRequestActions.CREATE:
						$("#appGrpList").dfSearchWidget('go');
						break;
					case DFRequestActions.DELETE:
						$("#appGrpList").dfSearchWidget('go');
						break;
					default:
						// maybe refresh?
						break;
				}
			}
		}
		$("#save").button({ disabled: true });
		$('#savingDialog').dialog('close');
	}
});

function deleteAppGrp(confirmed) {
	if(selectAppGrp) {
		if(confirmed) {
			appgrpio.deletes(selectAppGrp.Id);
			showAppGrp();
		} else {
			$( "#deleteAppGrp" ).html(selectAppGrp.Name);
			$( "#confirmDeleteAppGrpDialog" ).dialog('open');
		}
	}
}

function getForm(grp) {
	grp.Name = $('input:text[name=Name]').val();
	grp.Description = $('input:text[name=Description]').val();
}

$(document).ready(function() {
	//$(document).ajaxStart($.blockUI).ajaxStop($.unblockUI);
	makeAdminNav('appgroups');
	
	$("#delete").button({icons: {primary: "ui-icon-trash"}}).click(function(){
		deleteAppGrp();
	});
	
	$("#save").button({icons: {primary: "ui-icon-disk"}}).click(function(){
		if(selectAppGrp) {
			getForm(selectAppGrp);
			delete selectAppGrp.CreatedById;
			delete selectAppGrp.CreatedDate;
			delete selectAppGrp.LastModifiedById;
			delete selectAppGrp.LastModifiedDate;
			appgrpio.update(selectAppGrp);
		} else {
			var appGrp = {};
			getForm(appGrp);
			appgrpio.create(appGrp);
			selectAppGrp = appGrp;
		}
	});
	
	$("#clear").button({icons: {primary: "ui-icon-document"}}).click(function(){
		showAppGrp();
	});
	
	$( "#confirmDeleteAppGrpDialog" ).dialog({
		resizable: false,
		modal: true,
		autoOpen: false,
		buttons: {
			Continue: function() {
				deleteAppGrp(true);
				$( this ).dialog( "close" );
			},
			Cancel: function() {
				$( this ).dialog( "close" );
			}
		}
	});
	
	$("#AppType").buttonset();
	$("#active").buttonset();
	
	$("#appGrpList").dfSearchWidget({
		app: 'admin',
		service: "System",
		resource: '/AppGroup',
		offsetHeight: 25,
		noSearchTerm: true,
		renderer: function(container,apps) {
			if(apps.length > 0) {
				current_app_grps = apps;
				renderApps(container,apps);
				resizeUi();
				selectCurrentRole();
				return apps.length;
			} else {
				renderApps(container,users);
				container.append('<i>End Of List</i>');
				resizeUi();
				showAppGrp();
				return 0;
			}
		}
	});
});