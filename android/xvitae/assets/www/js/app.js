var map;
var ref;
var host='107.22.68.10';
var data = [];
var newwindow;
var user;
var deviceId;
var api= 'http://data-cosafinity.apigee.net:3000/';
series = Math.floor(Math.random() * 6) + 3;
var oAuthTimer;
var skills= ["Java","node","SOA", "API","Dot Net", "Android","Cassandra","Hadoop","Python","Go","Erlang"];
for (var i = 0; i < series; i++) {
	data[i] = {
			label: skills[i],				
			data: Math.floor(Math.random() * 100) + 1
	}
}

$(document).ready(function(){


	document.addEventListener('deviceready', onDeviceReady,false);
    document.addEventListener('push-notification', function(event) {
    	console.log(event);
       console.log('push-notification!:'+JSON.stringify(event.notification.message));
       //navigator.notification.alert(event.notification.message);
       var ques = event.notification.message;
       var to =ques.split(' ')[0];
       $('#label-question').html(ques);
       $('#btn-answer').on('click',function(){
    	  console.log('answered ' + $('#txt-answer').val()); 
    	  var path = api + "people/" + user + "/people/" + to +"/conversations" ;
    	  makeAjax(path, "POST", function(resp){
    		  console.log("answer sent");
    		  $('#dialog-answer').dialog('close');
    		  $.mobile.changePage('#page-recommended');
    		  
    	  }, JSON.stringify( {question:$('#txt-answer').val()}), false);
       });
       
       $.mobile.changePage('#dialog-answer','pop',true,true);
       
   });
    
    $('#btn-apply').on('click',function(){
    	var jobid = $('#title_job_id').attr('value');
    	var refid = $('#input-refererid').attr('value');
    	
		console.log(jobid);
		var path = api+'job/'+jobid + "/people/" + refid + "/referral" ;
		makeAjax(path, "POST", function(applyresponse){
			console.log('apply success');
			 $('#dialog-ask-apply').dialog('close');
   		  $.mobile.changePage('#page-recommended');
		}, null, false);
		
    });
    
    $('#page-job-referrers').on ('click',function(){
    	$('#list-referrers').listview('refresh');
    });
    
    $('#page-myfeed').on('click',function(){
    	$('#list-myfeed').listview('refresh');	
    });
    $('#btn-login').on('click',function(){
    	ref = new Date().getTime () ;
    	queryString = "?8&openid.ns=http://specs.openid.net/auth/2.0&openid.claimed_id=http://specs.openid.net/auth/2.0/identifier_select&openid.identity=http://specs.openid.net/auth/2.0/identifier_select&" +
        "openid.return_to=http://" + host + "/hack/openid&" +
		"openid.realm=http://" + host + "/&" +
		"openid.assoc_handle=" + ref + "&openid.mode=checkid_setup&openid.ax.type.email=http://axschema.org/contact/email&openid.ax.required=email&&openid.ns.ax=http://openid.net/srv/ax/1.0&openid.ax.mode=fetch_request" ;
    	
    	var url = "https://www.google.com/accounts/o8/ud" + queryString ;
    	console.log(url);
    	newWindow = window.open(url,'_blank','location=no');
		oAuthTimer = setInterval(function(){embedOAuthWindowTimer()},3000);
    });
    
    $('.btn-recommended').on('click',function(){
    	
    	var path = api + "jobs" ;
    	makeAjax(path,"GET", function(data){
    		console.log("Job response = " + JSON.stringify(data));
    		console.log(data.entities.length);
    		var i ;
    		var it='';
    		for ( i=0;i<data.entities.length;i++)
			{
				var tit = data.entities[i];
				it += '<li><a href="#" joblink>' + 
					'<img src="'+ tit.logo+'" class="ui-li-thumb" width="120"/>' + 
					'<h2>' + tit.title+ '</h2>' + 
					'<p>' + tit.companyName+ '</p>' + 
					'<p>'+tit.location+ '</p>' +
					'<p class="ui-li-aside">'+ tit.experience+'</p></a></li>' ;

		     }
    		
    			
    		console.log(it);
    		$('#list-jobs').html(it);
    		$('a[joblink]').on('click',function(e){
    			var index = $(this).parents('li').eq(0).index();
		     	console.log(index);
		     	var selected = data.entities[index];
		     	
		     	$('#title_name_h3').html(selected.title);
		     	$('#title_name_h2').html(selected.title);
		     	$('#title_image').attr('src',selected.logo);
		     	$('#title_desc').html(selected.description);
		     	$('#title_ratings').html ('Experience: ' + selected.experience );
		     	$('#title_cert').html('Skills: ' + selected.skills );
		     	$('#title_job_id').attr('value',selected.uuid);
		     	
		     	var p = api + "jobs/" + selected.uuid + "/referrers";
		     	makeAjax(p, "GET", loadReferrers, null, false);
		     	
		     	$.mobile.changePage('#page-job-details');
    		});
    		//$('#list-jobs').listview('refresh');
    		$.mobile.changePage('#page-jobs');	
    	}, null, false);
    	
    });
    
    $('#page-jobs').on('pageshow',function(){
    	$('#list-jobs').listview('refresh');
    });
	$('#label-people').on('click',function(){
		
		$('#label-people').removeClass('jobClicked_people');
		$('#label-job').removeClass('jobClicked_job');
		$('#label-job').addClass('peopleClicked_job');
		$('#label-people').addClass('peopleClicked_people');
		$('.people').css({height:'80%'});
		$('.job').css({height:'20%'});
		
		
	});
	$('#label-job').on('click',function(){
		
		$('#label-people').removeClass('peopleClicked_people');
		$('#label-job').removeClass('peopleClicked_job');
		$('#label-people').addClass('jobClicked_people');
		$('#label-job').addClass('jobClicked_job');
		$('.people').css({height:'20%'});
		$('.job').css({height:'80%'});
		
	});
	$.fn.tagcloud.defaults = {
		  size: {start:5, end: 25, unit: 'pt'},
		  color: {start: '#cde', end: '#f52'}
	};

	$('#header-location').on('swipeleft',function(){
		console.log('swipe leftdetected');
		$('#panel-location-top-jobs').panel('close')
	});
	$('#header-location').on('swiperight',function(){
		console.log('swipe right detected');
		$('#panel-location-top-jobs').panel('open')
	});
	$('#page-pie-chart').on('pageshow',function(){

	});

	$('#page-tag-cloud').on('pageshow',function(){
		$('#tags-cloud a').tagcloud();
	});

	$('#btn-askquestion').on('click',function(){
		var data = $('#txt-question').val();
		console.log(data);
		var jobid = $('#title_job_id').attr('value');
		console.log(jobid);
		var path = api+'jobs/'+jobid + "/conversations"  ;
		console.log(path);
		console.log(data);
		makeAjax(path, "POST", function(res){
			console.log('ok - question sent');
			$('#dialog-ask-apply').dialog('close');
			$.mobile.changePage('#page-recommended');
		}, JSON.stringify({question:data}), false);
	})	;
	$('#page-myfeed').on('pageinit',function(){
		console.log('pageinit');
			setTimeout(function(){
				console.log('map init');
				
				var cities = new L.LayerGroup();

			    L.marker([28.55558, 77.2338]).bindPopup('This is Littleton, CO.').addTo(cities);
				L.marker([18.91668, 73.01514]).bindPopup('This is Denver, CO.').addTo(cities);
				//L.marker([39.73, -104.8]).bindPopup('This is Aurora, CO.').addTo(cities),
				//L.marker([39.77, -105.23]).bindPopup('This is Golden, CO.').addTo(cities);


			    var cmAttr = 'Map data &copy; 2011 OpenStreetMap contributors, Imagery &copy; 2011 CloudMade',
					cmUrl = 'http://{s}.tile.cloudmade.com/BC9A493B41014CAABB98F0471D759707/{styleId}/256/{z}/{x}/{y}.png';

			    var minimal   = L.tileLayer(cmUrl, {styleId: 22677, attribution: cmAttr}),
				    midnight  = L.tileLayer(cmUrl, {styleId: 999,   attribution: cmAttr}),
				    motorways = L.tileLayer(cmUrl, {styleId: 46561, attribution: cmAttr});

				var map = L.map('map', {
					center: [12.971176, 77.597819],
					zoom: 10,
					layers: [minimal]
				});

				var baseLayers = {
					"Minimal": minimal
					
				};

				var overlays = {
					"Motorways": motorways,
					"Cities": cities
				};

				L.control.layers(baseLayers, overlays).addTo(map);
				
				//map = L.map('map',{center: [22.95839, 77.91504],zoom:9});
//				map = L.map('map',{center: [12.971176, 77.597819],zoom:11});
//
//				L.tileLayer('http://{s}.tile.cloudmade.com/BC9A493B41014CAABB98F0471D759707/997/256/{z}/{x}/{y}.png', {
//					maxZoom: 18,
//					attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery Â© <a href="http://cloudmade.com">CloudMade</a>'
//				}).addTo(map);

				
				map.locate({setView: true, maxZoom: 16});
				var popup = L.popup();

				function onMapClick(e) {
					console.log(e);
				    popup
				        .setLatLng(e.latlng)
				        .setContent("You clicked the map at " + e.latlng.toString())
				        .openOn(map);
				}
				//map.on('click', onMapClick);

				//Delhi
				var delhi = L.circle([28.55558, 77.2338], 35000).addTo(map);
				delhi.on('click',function(){
					drawFlotChart();
				});
				//Mumbai
				// L.circle([18.91668, 73.01514], 20000).addTo(map).on('click',function(){drawFlotChart();});
				// //kolkata
				// L.circle([22.47195, 88.37402],15000).addTo(map).on('click',function(){drawFlotChart();});
				// //chennai
				// L.circle([12.94032, 80.26611], 15000).addTo(map).on('click',function(){drawFlotChart();});
				// //Bangalore
				// L.circle([12.98315, 77.45361], 25000).addTo(map).on('click',function(){drawFlotChart();});
				// //Pune
				// L.circle([18.41708, 74.00391], 20000).addTo(map).on('click',function(){drawFlotChart();});

				
				},500);

				
	});

	$('#btn-skills').on('click',drawFlotChart);

	
	var demo;
	demo = {};
	demo.resizeContentArea = function() {
		console.log('resizing');
		var content, contentHeight, footer, header, viewportHeight;
		window.scroll(0, 0);
		header = $(":jqmData(role='header'):visible");
		footer = $(":jqmData(role='footer'):visible");
		content = $(":jqmData(role='content'):visible");
		viewportHeight = $(window).height();
		contentHeight = viewportHeight - header.outerHeight() - footer.outerHeight() ;
		$("article:jqmData(role='content')").first().height(contentHeight);
		$('#content-landing').height(contentHeight);
		//$('#piechart').height(contentHeight);
		return $("#map").height(contentHeight);

	};
	window.demo = demo;
	$(window).bind('orientationchange pageshow resize', window.demo.resizeContentArea);
	
});		

function loadReferrers (users){
		var k;
		console.log(users);
		var usershtml = '' ;
		for(k=0;k<users.entities.length;k++){
			var us = users.entities[k];
			usershtml += '<li><a href="#" referrerlink>' + 
						'<img src="' + us.picture + '" class="ui-li-thumb width="120"/>' +
						'<h2>' + us.name + '</h2>' + 
						'<p>' + us.name + '<p>' +
						'</li>';
		}
		
		$('#list-referrers').html(usershtml);
		$('a[referrerlink]').on('click',function(){
			var index = $(this).parents('li').eq(0).index();
	     	console.log(index);
	     	var selected = users.entities[index];
	     	$('#input-refererid').attr('value',selected.uuid);
	     	$.mobile.changePage('#dialog-ask-apply', 'pop', true, true);
	     	
		});
		
}

function drawFlotChart(){
	var placeholder = $('#flot_piechart');
	placeholder.unbind();

			$("#title").text("Interactivity");
			$("#description").text("The pie can be made interactive with hover and click events.");

			$.plot(placeholder, data, {
				series: {
					pie: { 
						show: true
					}
				},
				grid: {
					hoverable: true,
					clickable: true
				}
			});

			placeholder.bind("plothover", function(event, pos, obj) {

				if (!obj) {
					return;
				}

				var percent = parseFloat(obj.series.percent).toFixed(2);
				$("#hover").html("<span style='font-weight:bold; color:" + obj.series.color + "'>" + obj.series.label + " (" + percent + "%)</span>");
			});

			placeholder.bind("plotclick", function(event, pos, obj) {

				if (!obj) {
					return;
				}

				percent = parseFloat(obj.series.percent).toFixed(2);
				$.mobile.changePage('#page-tag-cloud');
			});

			$.mobile.changePage('#page-flot-chart');
}


function onDeviceReady(){
	console.log('device ready');
    var pushNotification = window.pushNotification;
    var gcmOptions = {
        gcmSenderId:"332156248130"
    };
    pushNotification.registerDevice(gcmOptions, function(device){
    	console.log("Registered with Google");
//        var options = {
//        		provider:"apigee",
//                orgName:"x-vitae",
//                appName:"vitae",
//                notifier:"google",
//            deviceId:device.deviceId
//        };

        console.log("Device ID is " + device.deviceId);
        deviceId = device.deviceId;
        console.log(JSON.stringify(options));
        
//        var p = 'http://data-cosafinity.apigee.net:8000/test?notifier=' + device.deviceId;
//        makeAjax(p, "GET", function(resp){
//        	console.log('success');
//        }, null, false);
        
//        pushNotification.registerWithPushProvider(options, function(result){
//        	
//        	pushNotification.getApigeeDeviceId(function(deviceresult){
//        		console.log(JSON.stringify(deviceresult));
//                deviceid =deviceresult.deviceid;
//                console.log('Got device ID - ' + deviceid);
//        	});
//        })
    });
}

function makeAjax (path, method, callback,postdata,needjson){
	var request = new XMLHttpRequest();
	console.log(path);
	request.onreadystatechange=state_change;
	request.open(method, path, true);
	
	if ( user ){
		console.log('setting user' + user);
		request.setRequestHeader('xuser',user);
	}
	
	if ( ( method=="POST" || method=="PUT" ) && postdata){
		request.setRequestHeader('Content-Type',"application/json");
		console.log("POST Data =" + postdata);
		
		request.send(postdata);
	}else{
		request.send(null);
	}
	    function state_change()
		{
		if (request.readyState==4)
		  {// 4 = "loaded"
			  if (request.status==200)
			    {
			    	try{

			    		var resp = eval("(" + request.responseText + ")")
			    	}catch(err){
			    		console.log(request.responseText);
			    		//console.log(err);
			    		callback({error:true});
			    	}	
			    	callback(resp);
			    }
			    else{
			    	console.log('error '  + request.statusText);
			    	callback({error:true});
			    }

			}
		}
}

function embedOAuthWindowTimer() {
	var url1 = "http://" + host + "/hack/openid?q=" + ref ;
	makeAjax(url1, "GET", function(resp){
		console.log(resp);
		if(resp.user!='none'){
			newWindow.close();
			clearInterval(oAuthTimer);
			$.mobile.loading( 'show', {
				text: 'Loading feed..',
				textVisible: true
				
			});
			user= resp.user;
			console.log(resp);
			var link = api + 'people/' + user;
			makeAjax(link+'/feed', "GET", function(resp){
				console.log(resp);
				var k;
				var uhtml='';
				for(k=0;k<resp.entities.length;k++){
					var entry = resp.entities[k];
					uhtml+=
						'<li><a href="#">' + 
						'<img src="' + entry.actor.image.url + '" class="ui-li-thumb width="120"/>' +
						'<h2>' + entry.actor.displayName	 + '</h2>' + 
						'<p>' + entry.content + '<p>' +
						'</li>';
				}
				$('#list-myfeed').html(uhtml);
				
				console.log('feed complete');
				$.mobile.loading('hide');
				$.mobile.changePage('#page-myfeed');
			}, null, false);
			
			makeAjax(link, "PUT", function(res){
				console.log(JSON.stringify(res));
				
				
				
			}, JSON.stringify({"registration_ids":[deviceId]}), false);
		}
		console.log(resp.user);
	}, null, false);
	
    console.log ( "ajax request sent to " + url1 ) ;
	
}



