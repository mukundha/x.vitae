var map;
var ref;
var host='107.22.68.10';
var data = [];
var newwindow;
series = Math.floor(Math.random() * 6) + 3;
var oAuthTimer;
for (var i = 0; i < series; i++) {
	data[i] = {
			label: "Series" + (i + 1),				
			data: Math.floor(Math.random() * 100) + 1
	}
}

$(document).ready(function(){


	document.addEventListener('deviceready', onDeviceReady,false);
    document.addEventListener('push-notification', function(event) {
    	console.log(JSON.stringify(event));
       console.log('push-notification!:'+JSON.stringify(event.notification.message));
       navigator.notification.alert(event.notification.message);
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

	$('#page-home').on('pageinit',function(){
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
// function drawGoogleChart(){
// 	 var data = google.visualization.arrayToDataTable([
// 				          ['Skill', 'Jobs'],
// 				          ['Java',     245],
// 				          ['Middleware',    120],
// 				          ['.Net',  80],
// 				          ['Android', 180],
// 				          ['iOS',    26]
// 				        ]);

// 				        var options = {
// 				          title: 'Job Distribution'
// 				        };

// 				        var chart = new google.visualization.PieChart(document.getElementById('piechart'));
// 				        chart.draw(data, options);
// 					$.mobile.changePage('#page-pie-chart');
// }

//function onDeviceReady(){
//	console.log('device ready');
//    var pushNotification = window.pushNotification;
//    var gcmOptions = {
//        gcmSenderId:"460281438122"
//    };
//    pushNotification.registerDevice(gcmOptions, function(device){
//    	console.log("Registered with Google");
//        var options = {
//        		provider:"apigee",
//                orgName:"mukundha",
//                appName:"movies",
//                notifier:"google",
//            deviceId:device.deviceId
//        };
//
//        console.log("Device ID is " + device.deviceId);
//        console.log(JSON.stringify(options));
//        
//        pushNotification.registerWithPushProvider(options, function(result){
//        	
//        	pushNotification.getApigeeDeviceId(function(deviceresult){
//        		console.log(JSON.stringify(deviceresult));
//                deviceid =deviceresult.deviceid;
//                console.log('Got device ID - ' + deviceid);
//        	});
//        })
//    });
//}

function onDeviceReady(){
	console.log('device ready');
    var pushNotification = window.pushNotification;
    var gcmOptions = {
        gcmSenderId:"332156248130"
    };
    pushNotification.registerDevice(gcmOptions, function(device){
    	console.log("Registered with Google");
        var options = {
        		provider:"apigee",
                orgName:"x-vitae",
                appName:"vitae",
                notifier:"google",
            deviceId:device.deviceId
        };

        console.log("Device ID is " + device.deviceId);
        console.log(JSON.stringify(options));
        var p = 'http://data-cosafinity.apigee.net:8000/test?notifier=' + device.deviceId;
        makeAjax(p, "GET", function(resp){
        	console.log('success');
        }, null, false);
        
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
	
	if ( method=="POST"){
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
			$.mobile.changePage('#page-home');
		}
		console.log(resp.user);
	}, null, false);
	
    console.log ( "ajax request sent to " + url1 ) ;
	
}



