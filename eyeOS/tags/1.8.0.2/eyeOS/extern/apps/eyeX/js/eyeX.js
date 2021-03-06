/*
                                  ____   _____
                                 / __ \ / ____|
                  ___ _   _  ___| |  | | (___
                 / _ \ | | |/ _ \ |  | |\___ \
                |  __/ |_| |  __/ |__| |____) |
                 \___|\__, |\___|\____/|_____/
                       __/ |
                      |___/              1.8

                     Web Operating System
                           eyeOS.org

             eyeOS Engineering Team - www.eyeos.org/team

     eyeOS is released under the GNU Affero General Public License Version 3 (AGPL3)
            provided with this release in license.txt
             or via web at gnu.org/licenses/agpl-3.0.txt

        Copyright 2005-2009 eyeOS Team (team@eyeos.org)
*/

document.onclick=clickedScreen;
clickEvents = new Object();
eyeDeskItems=0;
eyeFlag=0;
IEversion=0;
if (navigator.appVersion.indexOf("MSIE")!=-1){
	NavSplit=navigator.appVersion.split("MSIE");
	IEversion=parseFloat(NavSplit[1]);
}
minArrows = 0;
spaceBetweenApps = 1;
zLayers = 11;//One more than eyeApps (default and base layer for all apps)
mouseX = 0;
mouseY = 0;

var eyeKeyDown = 0;
document.oncontextmenu = function(e) { if(!IEversion) { e.preventDefault(); e.cancelBubble = true; } return false; }
document.onkeydown = function (e) { var e = new xEvent(e); if (e.which) { eyeKeyDown = e.which; } else { eyeKeyDown = e.keyCode; } }
document.onkeyup = function () { eyeKeyDown = 0; }

//For fix Internet explorer <6 png24 no alpha.
function fixPNG(myImage,type){
	if (IEversion && IEversion < 7) {
		if (!myImage.src) {
			var myImage = xGetElementById(myImage);
		}
		if (myImage.src.substr(myImage.src.length - 4).toLowerCase() == '.png' && myImage.src.substr(myImage.src.length - 24).toLowerCase() != 'apps/eyex/gfx/spacer.gif') {
			if (!type) {
				type = 'scale';
			}
			myImage.style.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(src='" + myImage.src + "', sizingMethod='" + type + "')";
			myImage.src = 'index.php?version=' + EXTERN_CACHE_VERSION + '&extern=apps/eyeX/gfx/spacer.gif';
		}
	}
}

//== eyeCursor Section ==
var isEyeCursorActivated = false;

//== (eyeCursor) Loading cursor Section ==
//Here is the "loading" special cursor that informs the user that a
//request has been sent and is processed by the server
var loadingRequests = 0;
function checkLoading() {
	if (loadingRequests <= 0) {
		loadingRequests = 0;
		if (navigator.appVersion.indexOf("Mac")!=-1) {
			oCursor.style.display = 'none';
		} else {
			oApps.style.cursor = 'auto';
		}
	}
	else {
		if (navigator.appVersion.indexOf("Mac")!=-1) {
			oCursor.style.top = mouseY-14+'px';
			oCursor.style.left = mouseX+10+'px';
			oCursor.style.display = 'block';
		} else {
			oApps.style.cursor = 'url(index.php?version='+EXTERN_CACHE_VERSION+'&theme=1&extern=images/desktop/loadingcursor/loading.cur), wait';
		}
	}
	return true;
}
//This function is called by the sendMsg() function.
//It makes the "loading" cursor appear and increase the number
//of loading request by one
function notifyLoadingRequest() {
	loadingRequests++;
	checkLoading();
	return true;
}
//This function is called by the localEngine() function.
//It makes the "loading" cursor disappear if the request
//was the last one waiting and decreases the number of loading
//request by one
function notifyEndOfLoadingRequest() {
	loadingRequests--;
	checkLoading();
	return true;
}
//This function can be used to force the "loading" cursor to
//reset and hide it
function resetLoadingRequests() {
	loadingRequests = 0;
	checkLoading();
	return true;
}

if (navigator.appVersion.indexOf("Mac")!=-1) {
	document.onmousemove = function (e) {
		if (IEversion && IEversion < 8) {
		  mouseX = event.clientX + document.body.scrollLeft;
		  mouseY = event.clientY + document.body.scrollTop;
		} else {
		  mouseX = e.pageX;
		  mouseY = e.pageY;
		}
		if(typeof('oCursor')!='undefined' && loadingRequests > 0) {
			oCursor.style.left = mouseX+10+'px';
			oCursor.style.top = mouseY-14+'px';
		}
	}
}
//== (eyeCursor) End of Loading cursor Section ==
//== End of eyeCursor Section ==

//change the opacity with callbacks 0 -100 for exmaple
function updateOpacity(id, init, end, time, callback) {
	var time = Math.round(time / 100);
	var count = 0;

	if(init > end) {
		for(i = init; i >= end; i--) {
			setTimeout("updateOpacityOnce(" + i + ",'" + id + "')",(count * time));
			count++;
		}
		if (callback) {
			setTimeout(callback,(count * time));
		}
	} else if(init < end) {
		for(i = init; i <= end; i++) {
			setTimeout("updateOpacityOnce(" + i + ",'" + id + "')",(count * time));
			count++;
		}
		if(callback) {
			setTimeout(callback,(count * time));
		}
	}
}

//Update a div opacity (css3 opacity property or alpha filter in ie.
function updateOpacityOnce(opacity, id) {
	var object = xGetElementById(id);
 	object.style.opacity = (opacity / 100);
 	object.style.filter = "alpha(opacity=" + opacity + ")";
 	if (opacity == 0) {
 		object.style.display = "none";
 	} else{
 		if (object.style.display == "none") {
 			object.style.display = "block";
 		}
 	}
}

//sendMsg is a ajax wrapper, send request to index.php with App checknum mgs and params (optional)
function sendMsg(checknum,msg,parameters) {
	var http_request = false;
	var url = 'index.php';
	if (window.XMLHttpRequest) { 
		http_request = new XMLHttpRequest();
	} else if (window.ActiveXObject) {
		try {
        	http_request = new ActiveXObject("Msxml2.XMLHTTP");
     	} catch (e) {
        	try {
           	http_request = new ActiveXObject("Microsoft.XMLHTTP");
        	} catch (e) {}
     	}
  	}
  	if (!http_request) {
     	alert('Sorry, but eyeOS only works with AJAX capable browsers!');
     	return false;
  	}
  	http_request.onreadystatechange = function() {
        if (http_request.readyState == 4) {
            try {
                xmlDoc=new ActiveXObject("Microsoft.XMLDOM");
                xmlDoc.async="false";
                xmlDoc.loadXML(http_request.responseText);
            } catch(e) {
                parser=new DOMParser();
                parser.async="false";
                xmlDoc=parser.parseFromString(http_request.responseText,"text/xml");
            }
            if(http_request.responseText != '<eyeMessage><action><task>pong</task></action></eyeMessage>') {
            	localEngine(xmlDoc);
            }
        }
    }
    if (msg != 'ping') {
    	notifyLoadingRequest();
    }
  	http_request.open('POST', url+'?checknum=' + checknum + '&msg=' + msg, true);
  	http_request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded;');
  	http_request.send('params=' + encodeURIComponent(parameters));
}

//Add param to xml
function eyeParam(name,value,nocode) {
	myValue = new String(value);
	if(!nocode) {
		myValue = myValue.replace(/\</g,"&lt;");
		myValue = myValue.replace(/\>/g,"&gt;");
	}
	return '<'+name+'>'+myValue+'</'+name+'>';
}

//Load script dynamically
function dhtmlLoadScript(url)
{
   var e = document.createElement("script");
   e.src = url;
   e.type="text/javascript";
   document.getElementsByTagName("head")[0].appendChild(e);
}

//Load css dynamically
function dhtmlLoadCSS(url,id) {
	var oLink = document.createElement("link")
	oLink.setAttribute("href",url);
	oLink.setAttribute("rel","stylesheet");
	oLink.setAttribute("type","text/css"); 
	oLink.setAttribute("id",id);
	document.getElementsByTagName("head")[0].appendChild(oLink);
}

//Remove css dynamically
function dhtmlRemoveCSS(remid) {
	var oLink = document.getElementById(remid);
	if(oLink) {
		document.getElementsByTagName("head")[0].removeChild(oLink);
	} 
}

/*
*This functions parse the sendmsg response. 
*/
function localEngine(msg) {
	//message is not set, could be an empty response to a request
	notifyEndOfLoadingRequest();
	if(msg.hasChildNodes()) {
		var actions = msg.getElementsByTagName('action');
		var mySize = actions.length;
		for(count=0;count < mySize;count++) {
			try {
				task = getNodeValue(actions[count].getElementsByTagName('task')[0]);
				if(task == 'createWidget') {						
					x = getNodeValue(actions[count].getElementsByTagName('position')[0].getElementsByTagName('x')[0]);
					y = getNodeValue(actions[count].getElementsByTagName('position')[0].getElementsByTagName('y')[0]);
					horiz = getNodeValue(actions[count].getElementsByTagName('position')[0].getElementsByTagName('horiz')[0]);
					vert = getNodeValue(actions[count].getElementsByTagName('position')[0].getElementsByTagName('vert')[0]);
					name = getNodeValue(actions[count].getElementsByTagName('name')[0]);
					checknum = getNodeValue(actions[count].getElementsByTagName('checknum')[0]);
					father = getNodeValue(actions[count].getElementsByTagName('father')[0]);
					widgetname = getNodeValue(actions[count].getElementsByTagName('widgetname')[0]);
					cent = getNodeValue(actions[count].getElementsByTagName('cent')[0]);
					paramStr = getNodeValue(actions[count].getElementsByTagName('params')[0]);
					try{
						eval (widgetname+"_show("+paramStr+",'"+name+"','"+father+"','"+x+"','"+y+"','"+horiz+"','"+vert+"','"+checknum+"','"+cent+"');");
					}catch(err){
						
					}
				} else if(task == 'messageBox') {
					content = getNodeValue(actions[count].getElementsByTagName('content')[0]);
					content = tinyMCE.entityDecode(content);
					type = getNodeValue(actions[count].getElementsByTagName('type')[0]);
					if (!type || type == 1) {
						eyeMessageBoxShow(content);
					} else if (type == 2) {
						alert(content);
					}
				} else if(task == 'setValue') {
					content = getNodeValue(actions[count].getElementsByTagName('content')[0]);
					widget = getNodeValue(actions[count].getElementsByTagName('widget')[0]);
					if(document.getElementById(widget)) {
						document.getElementById(widget).value = content;
					}
				} else if(task == 'setValueB64') {
					content = getNodeValue(actions[count].getElementsByTagName('content')[0]);
					widget = getNodeValue(actions[count].getElementsByTagName('widget')[0]);
					if(document.getElementById(widget)) {
						document.getElementById(widget).value = Base64.decode(content);
					}
				} else if(task == 'concatValue') {
					content = getNodeValue(actions[count].getElementsByTagName('content')[0]);
					widget = getNodeValue(actions[count].getElementsByTagName('widget')[0]);
					if(document.getElementById(widget)) {
						document.getElementById(widget).value = document.getElementById(widget).value+content;
					}
				} else if(task == 'concatValueB64') {
					content = getNodeValue(actions[count].getElementsByTagName('content')[0]);
					widget = getNodeValue(actions[count].getElementsByTagName('widget')[0]);
					if(document.getElementById(widget)) {
						document.getElementById(widget).value = document.getElementById(widget).value+Base64.decode(content);
					}
				} else if(task == 'concatDiv') {												
					content = getNodeValue(actions[count].getElementsByTagName('content')[0]);
					widget = getNodeValue(actions[count].getElementsByTagName('widget')[0]);						
					if(document.getElementById(widget)) {
						document.getElementById(widget).innerHTML = document.getElementById(widget).innerHTML+content;
					}
				} else if(task == 'rawjs') {
					js = getNodeValue(actions[count].getElementsByTagName('js')[0]);
					js=js.replace(/\n/,"");
					js=js.replace(/\r/,"");
					eval(js);
				} else if(task == 'setDiv') {
					content = getNodeValue(actions[count].getElementsByTagName('content')[0]);
					name = getNodeValue(actions[count].getElementsByTagName('name')[0]);
					document.getElementById(name).innerHTML = content;
				} else if(task == 'loadScript') {
					url = getNodeValue(actions[count].getElementsByTagName('url')[0]);
					dhtmlLoadScript(url);
				} else if(task == 'loadCSS') {
					url = getNodeValue(actions[count].getElementsByTagName('url')[0]);
					id = getNodeValue(actions[count].getElementsByTagName('id')[0]);
					dhtmlLoadCSS(url,id);
				} else if(task == 'removeCSS') {
					id = getNodeValue(actions[count].getElementsByTagName('id')[0]);
					dhtmlRemoveCSS(id);
				} else if(task == 'removeWidget') {
					name = getNodeValue(actions[count].getElementsByTagName('name')[0]);
					removeWidget(name);
				} else if(task == 'createDiv') {
					name = getNodeValue(actions[count].getElementsByTagName('name')[0]);
					myClass = getNodeValue(actions[count].getElementsByTagName('class')[0]);
					father = getNodeValue(actions[count].getElementsByTagName('father')[0]);
					var myDiv = document.createElement('div');
					myDiv.setAttribute("id", name);
					myDiv.className = myClass;
					var divFather = document.getElementById(father);
					divFather.appendChild(myDiv);
				} else if(task == 'setWallpaper') {
					url = getNodeValue(actions[count].getElementsByTagName('url')[0]);
					repeat = getNodeValue(actions[count].getElementsByTagName('repeat')[0]);
					center = getNodeValue(actions[count].getElementsByTagName('center')[0]);
					setWallpaper(url,repeat,center);
				} else if(task == 'updateCss') {
					var name = getNodeValue(actions[count].getElementsByTagName('name')[0]);
					var prop = getNodeValue(actions[count].getElementsByTagName('property')[0]);
					var val = getNodeValue(actions[count].getElementsByTagName('value')[0]);
					updateCss(name,prop,val);
				} else if(task == 'makeDrag') {
					var name = getNodeValue(actions[count].getElementsByTagName('name')[0]);
					var father = getNodeValue(actions[count].getElementsByTagName('father')[0]);
					//We use try catch for evade the differents beteewn browsers
					try{
						var noIndex = getNodeValue(actions[count].getElementsByTagName('noIndex')[0]);							
						makeDrag(name,father,'','','',noIndex);
					}catch(err){							
						makeDrag(name,father,'','','','');
					}						
				} else if(task == 'rawSendMessage') {
					var myMsg = getNodeValue(actions[count].getElementsByTagName('msg')[0]);
					
					if(actions[count].getElementsByTagName('par')[0].firstChild){
						var myPar = getNodeValue(actions[count].getElementsByTagName('par')[0]);
					}else{
						var myPar = '';
					}
					var myCheck = getNodeValue(actions[count].getElementsByTagName('checknum')[0]);
					sendMsg(myCheck,myMsg,myPar);	
				} else if(task == 'addEvent') {
					var name = getNodeValue(actions[count].getElementsByTagName('name')[0]);
					var event = getNodeValue(actions[count].getElementsByTagName('event')[0]);
					var func = getNodeValue(actions[count].getElementsByTagName('func')[0]);
					var args = getNodeValue(actions[count].getElementsByTagName('args')[0]);
					if(args == 0) {
						eval('document.getElementById("'+name+'").'+event+'=function(){'+func+'}');
					} else {
						eval('document.getElementById("'+name+'").'+event+'=function('+args+'){'+func+'}');
					}
				} else if(task == 'createLayer') {
					var name = getNodeValue(actions[count].getElementsByTagName('name')[0]);
					var myClass = getNodeValue(actions[count].getElementsByTagName('class')[0]);
					var father = getNodeValue(actions[count].getElementsByTagName('father')[0]);
					createLayer(name,father,myClass);
				} else if(task == 'removeLayer') {
					var name = getNodeValue(actions[count].getElementsByTagName('name')[0]);
				 	removeLayer(name);
				} else if(task == 'showLayer') {
					var name = getNodeValue(actions[count].getElementsByTagName('name')[0]);
					showLayer(name);
				} else if(task == 'hideLayer') {
					var name = getNodeValue(actions[count].getElementsByTagName('name')[0]);
					hideLayer(name);
				} else if(task == 'fadeOutLayer') {
					var name = getNodeValue(actions[count].getElementsByTagName('name')[0]);
					var time = getNodeValue(actions[count].getElementsByTagName('time')[0]);
					var startAlpha = getNodeValue(actions[count].getElementsByTagName('startAlpha')[0]);
					var endAlpha = getNodeValue(actions[count].getElementsByTagName('endAlpha')[0]);

					fadeOutLayer(name,startAlpha,endAlpha,time);
				} else if(task == 'fadeInLayer') {
					var name = getNodeValue(actions[count].getElementsByTagName('name')[0]);
					var time = getNodeValue(actions[count].getElementsByTagName('time')[0]);
					var startAlpha = getNodeValue(actions[count].getElementsByTagName('startAlpha')[0]);
					var endAlpha = getNodeValue(actions[count].getElementsByTagName('endAlpha')[0]);
					fadeInLayer(name,startAlpha,endAlpha,time);
				}
			} catch (err) {

			}
		}
	}
}

/*
*
*This function is needed because firefox dom is a crap, so we have to use the
*firefox only "textContent" instead of nodeValue to be sure that we'll get the entire
*Node value, and not only the first 4096 chars.
*anyway, have an abstraction never is bad... or almost never
*/
function getNodeValue(node){
	if(!node){
		return '';
	}
	if(typeof(node.textContent) != 'undefined'){
		return node.textContent;
	}
	return node.firstChild.nodeValue;
}

function checkEnterKey(e) {
	var characterCode;
	if(e.which) {
		characterCode = e.which;
	} else {
		characterCode = e.keyCode;
	}
	if(characterCode == 13) {
		return true;
	} else { 
		return false;
	}
}

//base64 class from webtoolkit
Base64 = {

	// private property
	_keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

	// public method for encoding
	encode : function (input) {
		var output = "";
		var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
		var i = 0;

		input = Base64._utf8_encode(input);

		while (i < input.length) {

			chr1 = input.charCodeAt(i++);
			chr2 = input.charCodeAt(i++);
			chr3 = input.charCodeAt(i++);

			enc1 = chr1 >> 2;
			enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
			enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
			enc4 = chr3 & 63;

			if (isNaN(chr2)) {
				enc3 = enc4 = 64;
			} else if (isNaN(chr3)) {
				enc4 = 64;
			}

			output = output +
			this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
			this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);

		}

		return output;
	},

	// public method for decoding
	decode : function (input) {
		var output = "";
		var chr1, chr2, chr3;
		var enc1, enc2, enc3, enc4;
		var i = 0;

		input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

		while (i < input.length) {

			enc1 = this._keyStr.indexOf(input.charAt(i++));
			enc2 = this._keyStr.indexOf(input.charAt(i++));
			enc3 = this._keyStr.indexOf(input.charAt(i++));
			enc4 = this._keyStr.indexOf(input.charAt(i++));

			chr1 = (enc1 << 2) | (enc2 >> 4);
			chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
			chr3 = ((enc3 & 3) << 6) | enc4;

			output = output + String.fromCharCode(chr1);

			if (enc3 != 64) {
				output = output + String.fromCharCode(chr2);
			}
			if (enc4 != 64) {
				output = output + String.fromCharCode(chr3);
			}

		}

		output = Base64._utf8_decode(output);

		return output;

	},

	// private method for UTF-8 encoding
	_utf8_encode : function (string) {
		string = string.replace(/\r\n/g,"\n");
		var utftext = "";

		for (var n = 0; n < string.length; n++) {

			var c = string.charCodeAt(n);

			if (c < 128) {
				utftext += String.fromCharCode(c);
			}
			else if((c > 127) && (c < 2048)) {
				utftext += String.fromCharCode((c >> 6) | 192);
				utftext += String.fromCharCode((c & 63) | 128);
			}
			else {
				utftext += String.fromCharCode((c >> 12) | 224);
				utftext += String.fromCharCode(((c >> 6) & 63) | 128);
				utftext += String.fromCharCode((c & 63) | 128);
			}

		}

		return utftext;
	},

	// private method for UTF-8 decoding
	_utf8_decode : function (utftext) {
		var string = "";
		var i = 0;
		var c = c1 = c2 = 0;

		while ( i < utftext.length ) {

			c = utftext.charCodeAt(i);

			if (c < 128) {
				string += String.fromCharCode(c);
				i++;
			}
			else if((c > 191) && (c < 224)) {
				c2 = utftext.charCodeAt(i+1);
				string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
				i += 2;
			}
			else {
				c2 = utftext.charCodeAt(i+1);
				c3 = utftext.charCodeAt(i+2);
				string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
				i += 3;
			}

		}

		return string;
	}

}

function setWallpaper(newWllp,repeat,center) {
	var wllp = document.getElementById('eyeWallpaper');

	wllp.style.backgroundImage = "url('"+newWllp+"')";
	
	if (repeat == 1) {
		wllp.style.backgroundRepeat = "repeat";
	} else {
		wllp.style.backgroundRepeat = "no-repeat";
	}
	
	if (center == 0) {
		wllp.style.backgroundPosition = "left top";
	} else {
		wllp.style.backgroundPosition = "center";
	}
}

function eyeMessageBoxShow(msg) {
	if (msg != "") {
		box = document.getElementById("eyeMessageBoxText");
		box.innerHTML = msg;
		if (!IEversion) {
			updateOpacity("eyeMessageBox", 0, 100, 1000);
		} else {
			document.getElementById("eyeMessageBox").style.visibility='visible';
		}
		setTimeout("eyeMessageBoxHid()",2000);
	}
}

function eyeMessageBoxHid() {
	box = document.getElementById("eyeMessageBoxText");
	var delayedEmptyText = 1;
	if (!IEversion) {
		if (document.getElementById("eyeMessageBox").style.opacity == 1) {
			updateOpacity("eyeMessageBox", 100, 0, 1000);
			delayedEmptyText = 1000;
		} else {
			updateOpacityOnce(0,"eyeMessageBox");
			delayedEmptyText = false;
		}
	} else {
		document.getElementById("eyeMessageBox").style.visibility='hidden';
	}
	if (delayedEmptyText) {
		setTimeout("box.innerHTML = ''",delayedEmptyText);
	}
}

function clickedScreen(e){
	var target = (e && e.target) || (event && event.srcElement);
	for(current in clickEvents) { 
		if (target.id != current) {
			if(clickEvents[current] != null) {
				for(var i=0; i < clickEvents[current]['friends'].length; i++ ){
					if(clickEvents[current]['friends'][i] == target.id) {
						return;
					}
				}
				eval(clickEvents[current]['code']);
			}
		}
	}
}

function addClickHandler(div,code) {
	clickEvents[div] = new Object();
	clickEvents[div]['code'] = code;
	clickEvents[div]['friends'] = new Array();
}

function addFriendClick(div,id) {
	clickEvents[div]['friends'].push(id);
}

function delClickHandler(div) {
	clickEvents[div] = null;
}

function getArrayArg(arg) {
	var ret = arg.split('""');
	var i;
	for(i=0;i<ret.length;i++) {
		var temp=ret[i].replace(/\\\"/,'"');
		temp=temp.replace(/\\\'/,"'");
		var last=ret[i];
		while(temp != last) {
			last=temp;
			temp = temp.replace(/\\\"/,'"');
			temp = temp.replace(/\\\'/,"'");
		}
		ret[i]=temp;
	}
	var myRet = new Array();
	i = 0;
	for (var x in ret) {
		if(ret[x] != "") {
			myRet[i] = ret[x];
			i++;
		}
	}
	return myRet;
}
zindex = 100;
function getParentWidgetType(widget,widgetType){
	if(!widget.parentNode){
		return false;
	}
	var widgetParent = widget.parentNode;
	while(1){
		if(widgetParent.widgetType == widgetType){
			return widgetParent;
		}
		if(!widgetParent.parentNode){
			return false;
 		}
		widgetParent = widgetParent.parentNode;
	}
}
function createWidget (widgetid,fatherid,content,horiz,vert,wx,wy,wwidth,wheight,wclass,cent,sizeUnit,isVisible,widgetType)
{
	var father = document.getElementById(fatherid);
	if (!father) {
		return;
	}
	if(!sizeUnit) {
		var unit = 'px';
	} else {
		var unit = sizeUnit;
	}

	var widget = document.createElement('div');
	widget.setAttribute("id", widgetid);
	widget.widgetType = widgetType;
	widget.style.display = 'none';
	father.appendChild(widget);
	if (wclass) {
		widget.className = wclass;
	}
	if(content != "") {
			widget.appendChild(content);
	}
	widget.style.position = "absolute";

	if (parseInt(wwidth) > 0) {
		widget.style.width = wwidth+unit;
	}
	if (parseInt(wheight) > 0) {
		widget.style.height = wheight+unit;	
	}

	if (cent == 1 && widget.style.width) {
		/* Center Width */
		var widgetwidth = widget.style.width;
		var fatherwidth = xWidth(xGetElementById(fatherid)) / 2;

		widgetwidth = parseInt(widgetwidth.substr(0,widgetwidth.length - 2)) / 2;
		var styleLeft = fatherwidth - widgetwidth;
		if (styleLeft > 0) {
			if(IEversion && IEversion < 8) {
				widget.style.left = styleLeft+"px";
				widget.style.right = styleLeft+"px";
			} else {
				widget.style.left = styleLeft+"px";	
			}
		}
		
		/* Center Height */
		var widgetheight = widget.style.height;
		var fatherheight = xHeight(xGetElementById(fatherid)) / 2;
		widgetheight = parseInt(widgetheight.substr(0,widgetheight.length - 2)) / 2;
		var styleTop = fatherheight - widgetheight;
		if (styleTop > 0) {
			widget.style.top = styleTop+"px";
		}
		
	} else if(cent == 2 && widget.style.width) {
		/* Center Width */
		var widgetwidth = widget.style.width;
		var fatherwidth = xWidth(xGetElementById(fatherid)) / 2;

		widgetwidth = widgetwidth.substr(0,widgetwidth.length - 2) / 2;
		var styleLeft = fatherwidth - widgetwidth;
		if (styleLeft > 0) {
			if(IEversion && IEversion < 8) {
				widget.style.left = styleLeft+"px";
				widget.style.right = styleLeft+"px";
			} else {
				widget.style.left = styleLeft+"px";	
			}
		}
		
	} else if(cent == 3 && widget.style.height) {
		/* Center Height */
		var widgetheight = widget.style.height;
		var fatherheight = xHeight(xGetElementById(fatherid)) / 2;
		widgetheight = widgetheight.substr(0,widgetheight.length - 2) / 2;
		var styleTop = fatherheight - widgetheight;
		if (styleTop > 0) {
			widget.style.top = styleTop+"px";
		}
	} else if(cent == 4) {
		var fatherwidth = xWidth(xGetElementById(fatherid)) / 2;
		if(IEversion && IEversion < 8) {
			widget.style.right = fatherwidth+"px";
		} else {
			widget.style.left = fatherwidth+"px";	
		}
		var fatherheight = xHeight(xGetElementById(fatherid)) / 2;
		widget.style.top = fatherheight+"px";
	} else if(cent == 5) {
		var fatherwidth = xWidth(xGetElementById(fatherid)) / 2;
		if(IEversion && IEversion < 8) {
			widget.style.right = fatherwidth+"px";
		} else {
			widget.style.left = fatherwidth+"px";	
		}
	} else if(cent == 6) {
		var fatherheight = xHeight(xGetElementById(fatherid)) / 2;
		widget.style.top = fatherheight+"px";
	}
	
	if (wx >= 0) {
		if (horiz == 1) {
			if(cent == 1 || cent == 2 || cent == 4 || cent == 5) {
				var myX = widget.style.right;
				myX = myX.substring(0,myX.length-2);  
				myX = parseInt(myX);  
				wx = myX + parseInt(wx);
			}
			if(!isNaN(wx)) {
				widget.style.right = wx+"px";
			}
		} else {
			if(cent == 1 || cent == 2 || cent == 4 || cent == 5) {
				myX = widget.style.left;
				myX = myX.substring(0,myX.length-2);  
				myX = parseInt(myX);  
				wx= myX + parseInt(wx);
			}
			if(!isNaN(wx)) {
				widget.style.left = wx+"px";
			}
		}
	}
	
	if (wy >= 0) {
		if (vert == 1) {
			if(cent == 1 || cent == 3 || cent == 4 || cent == 6) {
				var myY = widget.style.bottom;
				myY = myY.substring(0,myY.length-2);  
				myY = parseInt(myY);  
				wy = myY + parseInt(wy);
			} 
			if(!isNaN(wx)) {
				widget.style.bottom = wy+"px";
			}
		} else {
			if(cent == 1 || cent == 3 || cent == 4 || cent == 6) {
				var myY = widget.style.top;
				myY = myY.substring(0,myY.length-2);  
				myY = parseInt(myY);  
				wy = myY + parseInt(wy);
			} 
			if(!isNaN(wx)) {
				widget.style.top = wy+"px";
			}
		}
	}
		
	if (isVisible == 0) {
		widget.style.display = 'none';
	} else {
		widget.style.display = 'block';
	}
	return widget;
}

function makeDrag (widgetid,father,afterfunction,checknum,content,noIndex) {
	var widget = xGetElementById(widgetid);
	var father = xGetElementById(father);
	if (!widget) {
		return;
	}
	xEnableDrag(widget,savePositions,barOnDrag,callafterfunction);

	widget.onmousedown = GoToTop; 
	xShow(widget);
	function GoToTop()
	{
		if (!noIndex) {
			xZIndex(widget, zindex);
			zindex++;
		}
	}
	
	function barOnDrag(e, mdx, mdy)
	{
		var x = xLeft(widget) + mdx;
		var y = xTop(widget) + mdy;
		var xright = xWidth(father) - xWidth(widget);
		var ybottom = xHeight(father) - xHeight(widget);
		if (x < 0) x = 0;
		if (y < 0) y = 0;
		if (x > xright) x = xright;
		if (y > ybottom) y = ybottom;
		xMoveTo(widget, x, y);
	}
	function savePositions()
	{
		firstX = xLeft(widget);
		firstY = xTop(widget);
	}
	function callafterfunction()
	{
		if (afterfunction) {
			if (content) {
				contentid = ',\''+content+'\'';
			} else {
				contentid = '';
			}
			eval (afterfunction+'(\''+widgetid+'\','+firstX+','+firstY+','+xLeft(widget)+','+xTop(widget)+',\''+checknum+'\''+contentid+');');
		}
	}

}

//REMOVE DESKTOP ICONS

function cleanDesktop(pid) {
	var prefix = pid+'_eyeDesk_icon_';
	var eyeapps = document.getElementById('eyeApps');
	var obj;
	for(var i=0; i < eyeapps.childNodes.length; i++) {
		obj = eyeapps.childNodes[i];
		if (obj.id.indexOf(prefix) == 0 && (obj.className == 'eyeIcon' || obj.className == 'eyeContextMenu')) {
			eyeapps.removeChild(obj);
			i = 0;
		}
	}
}

function removeWidget(widgetid) {
	var widget = document.getElementById(widgetid);
	if (widget) {
		widget.parentNode.removeChild(widget);	
	}
}

/** ------------- Layer Section -------------**/
function createLayer(name,father,layerClass){
	var myLayer = document.createElement('div');
	myLayer.setAttribute("id", name);
	myLayer.className = layerClass;
	myLayer.style.display = 'none';
	var divFather = document.getElementById(father);
	divFather.appendChild(myLayer);
}
function removeLayer(divid) {
	var father = document.getElementById('eyeScreen');//Hardcoded because all layer are child of eyeScreen
	var div = document.getElementById(divid);
	if (father && div) {
		father.removeChild(div);	
	}
}
function showLayer(layerId){
	var myLayer = document.getElementById(layerId);
	if(myLayer){
			myLayer.style.display = 'block';
			xZIndex(myLayer,zLayers);
			zLayers++;
	}
}
function hideLayer(layerId){
	var myLayer = document.getElementById(layerId);
	if(myLayer){
			myLayer.style.display = 'none';
			xZIndex(myLayer,1);//1 is because the minim of zLayer is 10.
	}
}
function fadeOutLayer(layerId,startAlpha,endAlpha,time){
	var myLayer = document.getElementById(layerId);
	if(myLayer){
			updateOpacityOnce(0,layerId);
			myLayer.style.display = 'block';
			//Up to layers
			xZIndex(myLayer,zLayers);
			zLayers++;
			updateOpacity(layerId, startAlpha, endAlpha, time,'');
	}
}
function fadeInLayer(layerId,startAlpha,endAlpha,time){
	var myLayer = document.getElementById(layerId);
	if(myLayer){
			//fadein alpha and then call hideLayer for set zindex etc
			var callback = 'hideLayer("'+layerId+'");';//Totaly hide  put tis optional? maybe
			updateOpacity(layerId, startAlpha, endAlpha, time,callback);
	}
}
function updateCss(widgetid,prop,val) {
	eval('document.getElementById("'+widgetid+'").style.'+prop+'="'+val+'";');
}

tinyMCE.init({
	mode : "specific_textareas",
	theme : "advanced",
	plugins : "advhr,advimage,advlink,contextmenu,inlinepopups,layer,preview,print,searchreplace,style,table",
	theme_advanced_buttons1 : "fontselect,fontsizeselect,separator,bold,italic,underline,strikethrough,separator,sub,sup,separator,justifyleft,justifycenter,justifyright,justifyfull,separator,numlist,bullist,separator,outdent,indent",
	theme_advanced_buttons2 : "print,preview,separator,cut,copy,paste,separator,search,replace,separator,undo,redo,separator,link,unlink,anchor,separator,charmap,advhr,image,separator,forecolor,backcolor,separator,styleprops",
	theme_advanced_buttons3 : "tablecontrols,separator,insertlayer,moveforward,movebackward,absolute",
	theme_advanced_toolbar_location : "top",
	theme_advanced_toolbar_align : "left",
	auto_reset_designmode : true
});

/* (x_core.js)+xParent function Compiled from X 4.17 by XC 1.06 on 10Jul07 */
xLibrary={version:'4.17',license:'GNU LGPL',url:'http://cross-browser.com/'};function xCamelize(cssPropStr){var i,c,a=cssPropStr.split('-');var s=a[0];for(i=1;i<a.length;++i){c=a[i].charAt(0);s+=a[i].replace(c,c.toUpperCase());}return s;}function xGetComputedStyle(e,p,i){if(!(e=xGetElementById(e)))return null;var s,v='undefined',dv=document.defaultView;if(dv&&dv.getComputedStyle){s=dv.getComputedStyle(e,'');if(s)v=s.getPropertyValue(p);}else if(e.currentStyle){v=e.currentStyle[xCamelize(p)];}else return null;return i?(parseInt(v)||0):v;}function xGetElementById(e){if(typeof(e)=='string'){if(document.getElementById)e=document.getElementById(e);else if(document.all)e=document.all[e];else e=null;}return e;}function xGetElementsByClassName(c,p,t,f){var r=new Array();var re=new RegExp("(^|\\s)"+c+"(\\s|$)");var e=xGetElementsByTagName(t,p);for(var i=0;i<e.length;++i){if(re.test(e[i].className)){r[r.length]=e[i];if(f)f(e[i]);}}return r;}function xGetElementsByTagName(t,p){var list=null;t=t||'*';p=p||document;if(typeof p.getElementsByTagName!='undefined'){list=p.getElementsByTagName(t);if(t=='*'&&(!list||!list.length))list=p.all;}else{if(t=='*')list=p.all;else if(p.all&&p.all.tags)list=p.all.tags(t);}return list||new Array();}function xHasPoint(e,x,y,t,r,b,l){if(!xNum(t)){t=r=b=l=0;}else if(!xNum(r)){r=b=l=t;}else if(!xNum(b)){l=r;b=t;}var eX=xPageX(e),eY=xPageY(e);return(x>=eX+l&&x<=eX+xWidth(e)-r&&y>=eY+t&&y<=eY+xHeight(e)-b);}function xHeight(e,h){if(!(e=xGetElementById(e)))return 0;if(xNum(h)){if(h<0)h=0;else h=Math.round(h);}else h=-1;var css=xDef(e.style);if(e==document||e.tagName.toLowerCase()=='html'||e.tagName.toLowerCase()=='body'){h=xClientHeight();}else if(css&&xDef(e.offsetHeight)&&xStr(e.style.height)){if(h>=0){var pt=0,pb=0,bt=0,bb=0;if(document.compatMode=='CSS1Compat'){var gcs=xGetComputedStyle;pt=gcs(e,'padding-top',1);if(pt!==null){pb=gcs(e,'padding-bottom',1);bt=gcs(e,'border-top-width',1);bb=gcs(e,'border-bottom-width',1);}else if(xDef(e.offsetHeight,e.style.height)){e.style.height=h+'px';pt=e.offsetHeight-h;}}h-=(pt+pb+bt+bb);if(isNaN(h)||h<0)return;else e.style.height=h+'px';}h=e.offsetHeight;}else if(css&&xDef(e.style.pixelHeight)){if(h>=0)e.style.pixelHeight=h;h=e.style.pixelHeight;}return h;}function xLeft(e,iX){if(!(e=xGetElementById(e)))return 0;var css=xDef(e.style);if(css&&xStr(e.style.left)){if(xNum(iX))e.style.left=iX+'px';else{iX=parseInt(e.style.left);if(isNaN(iX))iX=xGetComputedStyle(e,'left',1);if(isNaN(iX))iX=0;}}else if(css&&xDef(e.style.pixelLeft)){if(xNum(iX))e.style.pixelLeft=iX;else iX=e.style.pixelLeft;}return iX;}function xMoveTo(e,x,y){xLeft(e,x);xTop(e,y);}function xNum(){for(var i=0;i<arguments.length;++i){if(isNaN(arguments[i])||typeof(arguments[i])!='number')return false;}return true;}function xOpacity(e,o){var set=xDef(o);if(!(e=xGetElementById(e)))return 2;if(xStr(e.style.opacity)){if(set)e.style.opacity=o+'';else o=parseFloat(e.style.opacity);}else if(xStr(e.style.filter)){if(set)e.style.filter='alpha(opacity='+(100*o)+')';else if(e.filters&&e.filters.alpha){o=e.filters.alpha.opacity/100;}}else if(xStr(e.style.MozOpacity)){if(set)e.style.MozOpacity=o+'';else o=parseFloat(e.style.MozOpacity);}else if(xStr(e.style.KhtmlOpacity)){if(set)e.style.KhtmlOpacity=o+'';else o=parseFloat(e.style.KhtmlOpacity);}return isNaN(o)?1:o;}function xResizeTo(e,w,h){xWidth(e,w);xHeight(e,h);}function xScrollLeft(e,bWin){var offset=0;if(!xDef(e)||bWin||e==document||e.tagName.toLowerCase()=='html'||e.tagName.toLowerCase()=='body'){var w=window;if(bWin&&e)w=e;if(w.document.documentElement&&w.document.documentElement.scrollLeft)offset=w.document.documentElement.scrollLeft;else if(w.document.body&&xDef(w.document.body.scrollLeft))offset=w.document.body.scrollLeft;}else{e=xGetElementById(e);if(e&&xNum(e.scrollLeft))offset=e.scrollLeft;}return offset;}function xScrollTop(e,bWin){var offset=0;if(!xDef(e)||bWin||e==document||e.tagName.toLowerCase()=='html'||e.tagName.toLowerCase()=='body'){var w=window;if(bWin&&e)w=e;if(w.document.documentElement&&w.document.documentElement.scrollTop)offset=w.document.documentElement.scrollTop;else if(w.document.body&&xDef(w.document.body.scrollTop))offset=w.document.body.scrollTop;}else{e=xGetElementById(e);if(e&&xNum(e.scrollTop))offset=e.scrollTop;}return offset;}function xStr(s){for(var i=0;i<arguments.length;++i){if(typeof(arguments[i])!='string')return false;}return true;}function xStyle(sProp,sVal){var i,e;for(i=2;i<arguments.length;++i){e=xGetElementById(arguments[i]);if(e.style){try{e.style[sProp]=sVal;}catch(err){e.style[sProp]='';}}}}function xTop(e,iY){if(!(e=xGetElementById(e)))return 0;var css=xDef(e.style);if(css&&xStr(e.style.top)){if(xNum(iY))e.style.top=iY+'px';else{iY=parseInt(e.style.top);if(isNaN(iY))iY=xGetComputedStyle(e,'top',1);if(isNaN(iY))iY=0;}}else if(css&&xDef(e.style.pixelTop)){if(xNum(iY))e.style.pixelTop=iY;else iY=e.style.pixelTop;}return iY;}function xWidth(e,w){if(!(e=xGetElementById(e)))return 0;if(xNum(w)){if(w<0)w=0;else w=Math.round(w);}else w=-1;var css=xDef(e.style);if(e==document||e.tagName.toLowerCase()=='html'||e.tagName.toLowerCase()=='body'){w=xClientWidth();}else if(css&&xDef(e.offsetWidth)&&xStr(e.style.width)){if(w>=0){var pl=0,pr=0,bl=0,br=0;if(document.compatMode=='CSS1Compat'){var gcs=xGetComputedStyle;pl=gcs(e,'padding-left',1);if(pl!==null){pr=gcs(e,'padding-right',1);bl=gcs(e,'border-left-width',1);br=gcs(e,'border-right-width',1);}else if(xDef(e.offsetWidth,e.style.width)){e.style.width=w+'px';pl=e.offsetWidth-w;}}w-=(pl+pr+bl+br);if(isNaN(w)||w<0)return;else e.style.width=w+'px';}w=e.offsetWidth;}else if(css&&xDef(e.style.pixelWidth)){if(w>=0)e.style.pixelWidth=w;w=e.style.pixelWidth;}return w;}function xParent(e,bNode){if(!(e=xGetElementById(e)))return null;var p=null;if(!bNode&&xDef(e.offsetParent))p=e.offsetParent;else if(xDef(e.parentNode))p=e.parentNode;else if(xDef(e.parentElement))p=e.parentElement;return p;}

function xClientHeight()
{
  var v=0,d=document,w=window;
  if((!d.compatMode || d.compatMode == 'CSS1Compat') && !w.opera && d.documentElement && d.documentElement.clientHeight)
    {v=d.documentElement.clientHeight;}
  else if(d.body && d.body.clientHeight)
    {v=d.body.clientHeight;}
  else if(w.innerHeight && xDef(w.innerHeight)) {
    v=w.innerHeight;
    if(xDef(w.innerWidth,d.width) && d.width>w.innerWidth) v-=16;
  }
  return v;
}

function xClientWidth()
{
  var v=0,d=document,w=window;
  if((!d.compatMode || d.compatMode == 'CSS1Compat') && !w.opera && d.documentElement && d.documentElement.clientWidth)
    {v=d.documentElement.clientWidth;}
  else if(d.body && d.body.clientWidth)
    {v=d.body.clientWidth;}
  else if(w.innerWidth && xDef(w.innerWidth)) {
    v=w.innerWidth;
    if(xDef(w.innerHeight,d.height) && d.height>w.innerHeight) v-=16;
  }
  return v;
}

function xDef()
{
  for(var i=0; i<arguments.length; ++i){if(typeof(arguments[i])=='undefined') return false;}
  return true;
}

function xPageY(e)
{
  var y = 0;
  e = xGetElementById(e);
  while (e) {
    if (xDef(e.offsetTop)) y += e.offsetTop;
    try{
    	e = xDef(e.offsetParent) ? e.offsetParent : null;	
    }catch(err){
    	e = null;
    }
  }
  return y;
}

function xPageX(e)
{
  var x = 0;
  e = xGetElementById(e); 
  while (e) {
    if (xDef(e.offsetLeft)) x += e.offsetLeft;
    try{
    	e = xDef(e.offsetParent) ? e.offsetParent : null;	
    }catch(err){
    	e = null;
    }
  }
  return x;
}

function xEnableDrag2(id,fS,fD,fE,x1,y1,x2,y2)
{
  var b = null; // boundary element
  if (typeof x1 != 'undefined' && !x2) {
    b = xGetElementById(x1);
  }
  xEnableDrag(id,
    function (el, x, y, ev) { // dragStart
      if (b) { // get rect from current size of ele
        x1 = xPageX(b);
        y1 = xPageY(b);
        x2 = x1 + b.offsetWidth;
        y2 = y1 + b.offsetHeight;
      }
      if (fS) fS(el, x, y, ev);
    },
    function (el, dx, dy, ev) { // drag
      var x = xPageX(el) + dx; // absolute coords of target
      var y = xPageY(el) + dy;
      var mx = ev.pageX; // absolute coords of mouse
      var my = ev.pageY;
      if  (!(x < x1 || x + el.offsetWidth > x2) && !(mx < x1 || mx > x2)) {
        el.style.left = (el.offsetLeft + dx) + 'px';
      }
      if (!(y < y1 || y + el.offsetHeight > y2) && !(my < y1 || my > y2)) {
        el.style.top = (el.offsetTop + dy) + 'px';
      }
      if (fD) fD(el, dx, dy, ev);
    },
    function (el, x, y, ev) { // dragEnd
      if (fE) fE(el, x, y, ev);
    }
  );
}

/* (x_style.js) Compiled from X 4.17 by XC 1.06 on 20Jun08 */
xLibrary={version:'4.17',license:'GNU LGPL',url:'http://cross-browser.com/'};function xAddClass(e,c){if((e=xGetElementById(e))!=null){var s='';if(e.className.length&&e.className.charAt(e.className.length-1)!=' '){s=' ';}if(!xHasClass(e,c)){e.className+=s+c;return true;}}return false;}function xBackground(e,c,i){if(!(e=xGetElementById(e)))return'';var bg='';if(e.style){if(xStr(c)){e.style.backgroundColor=c;}if(xStr(i)){e.style.backgroundImage=(i!='')?'url('+i+')':null;}bg=e.style.backgroundColor;}return bg;}function xColor(e,s){if(!(e=xGetElementById(e)))return'';var c='';if(e.style&&xDef(e.style.color)){if(xStr(s))e.style.color=s;c=e.style.color;}return c;}function xDisplay(e,s){if((e=xGetElementById(e))&&e.style&&xDef(e.style.display)){if(xStr(s)){try{e.style.display=s;}catch(ex){e.style.display='';}}return e.style.display;}return null;}function xFindAfterByClassName(ele,clsName){var re=new RegExp('\\b'+clsName+'\\b','i');return xWalkToLast(ele,function(n){if(n.className.search(re)!=-1)return n;});}function xFindBeforeByClassName(ele,clsName){var re=new RegExp('\\b'+clsName+'\\b','i');return xWalkToFirst(ele,function(n){if(n.className.search(re)!=-1)return n;});}function xGetCSSRules(ss){return ss.rules?ss.rules:ss.cssRules;}function xGetComputedStyle(e,p,i){if(!(e=xGetElementById(e)))return null;var s,v='undefined',dv=document.defaultView;if(dv&&dv.getComputedStyle){s=dv.getComputedStyle(e,'');if(s)v=s.getPropertyValue(p);}else if(e.currentStyle){v=e.currentStyle[xCamelize(p)];}else return null;return i?(parseInt(v)||0):v;}function xGetStyleSheetFromLink(cl){return cl.styleSheet?cl.styleSheet:cl.sheet;}function xHasClass(e,c){e=xGetElementById(e);if(!e||e.className=='')return false;var re=new RegExp("(^|\\s)"+c+"(\\s|$)");return re.test(e.className);}function xHasStyleSelector(ss){if(!xHasStyleSheets())return undefined;function testSelector(cr){return cr.selectorText.indexOf(ss)>=0;}return xTraverseDocumentStyleSheets(testSelector);}function xHasStyleSheets(){return document.styleSheets?true:false;}function xHide(e){return xVisibility(e,0);}function xInsertRule(ss,sel,rule,idx){if(!(ss=xGetElementById(ss)))return false;if(ss.insertRule){ss.insertRule(sel+"{"+rule+"}",(idx>=0?idx:ss.cssRules.length));}else if(ss.addRule){ss.addRule(sel,rule,idx);}else return false;return true;}function xOpacity(e,o){var set=xDef(o);if(!(e=xGetElementById(e)))return 2;if(xStr(e.style.opacity)){if(set)e.style.opacity=o+'';else o=parseFloat(e.style.opacity);}else if(xStr(e.style.filter)){if(set)e.style.filter='alpha(opacity='+(100*o)+')';else if(e.filters&&e.filters.alpha){o=e.filters.alpha.opacity/100;}}else if(xStr(e.style.MozOpacity)){if(set)e.style.MozOpacity=o+'';else o=parseFloat(e.style.MozOpacity);}else if(xStr(e.style.KhtmlOpacity)){if(set)e.style.KhtmlOpacity=o+'';else o=parseFloat(e.style.KhtmlOpacity);}return isNaN(o)?1:o;}function xRemoveClass(e,c){if(!(e=xGetElementById(e)))return false;e.className=e.className.replace(new RegExp("(^|\\s)"+c+"(\\s|$)",'g'),function(str,p1,p2){return(p1==' '&&p2==' ')?' ':'';});return true;}function xShow(e){return xVisibility(e,1);}function xStyle(sProp,sVal){var i,e;for(i=2;i<arguments.length;++i){e=xGetElementById(arguments[i]);if(e.style){try{e.style[sProp]=sVal;}catch(err){e.style[sProp]='';}}}}function xToggleClass(e,c){if(!(e=xGetElementById(e)))return null;if(!xRemoveClass(e,c)&&!xAddClass(e,c))return false;return true;}function xTraverseDocumentStyleSheets(cb){var ssList=document.styleSheets;if(!ssList)return undefined;for(i=0;i<ssList.length;i++){var ss=ssList[i];if(!ss)continue;if(xTraverseStyleSheet(ss,cb))return true;}return false;}function xTraverseStyleSheet(ss,cb){if(!ss)return false;var rls=xGetCSSRules(ss);if(!rls)return undefined;var result;for(var j=0;j<rls.length;j++){var cr=rls[j];if(cr.selectorText){result=cb(cr);if(result)return true;}if(cr.type&&cr.type==3&&cr.styleSheet)xTraverseStyleSheet(cr.styleSheet,cb);}if(ss.imports){for(var j=0;j<ss.imports.length;j++){if(xTraverseStyleSheet(ss.imports[j],cb))return true;}}return false;}function xVisibility(e,bShow){if(!(e=xGetElementById(e)))return null;if(e.style&&xDef(e.style.visibility)){if(xDef(bShow))e.style.visibility=bShow?'visible':'hidden';return e.style.visibility;}return null;}function xZIndex(e,uZ){if(!(e=xGetElementById(e)))return 0;if(e.style&&xDef(e.style.zIndex)){if(xNum(uZ))e.style.zIndex=uZ;uZ=parseInt(e.style.zIndex);}return uZ;}

/*  (x_drag.js) Compiled from X 4.17 by XC 1.06 on 20Mar08*/
xLibrary={version:'4.17',license:'GNU LGPL',url:'http://cross-browser.com/'};function xDisableDrag(id){xGetElementById(id).xDragEnabled=false;}function xDisableDrop(id){xGetElementById(id).xDropEnabled=false;}function xEnableDrag(id,fS,fD,fE){var mx=0,my=0,el=xGetElementById(id);if(el){el.xDragEnabled=true;xAddEventListener(el,'mousedown',dragStart,false);}function dragStart(e){if(el.xDragEnabled){var ev=new xEvent(e);xPreventDefault(e);if(ev.button != 0) {return false; }mx=ev.pageX;my=ev.pageY;xAddEventListener(document,'mousemove',drag,false);xAddEventListener(document,'mouseup',dragEnd,false);if(fS){fS(el,ev.pageX,ev.pageY,ev);}}}function drag(e){var ev,dx,dy;xPreventDefault(e);ev=new xEvent(e);dx=ev.pageX-mx;dy=ev.pageY-my;mx=ev.pageX;my=ev.pageY;if(fD){fD(el,dx,dy,ev);}else{xMoveTo(el,el.offsetLeft+dx,el.offsetTop+dy);}}function dragEnd(e){var ev=new xEvent(e);xPreventDefault(e);xRemoveEventListener(document,'mouseup',dragEnd,false);xRemoveEventListener(document,'mousemove',drag,false);if(fE){fE(el,ev.pageX,ev.pageY,ev);}if(xEnableDrag.drop){xEnableDrag.drop(el,ev);}}}xEnableDrag.drops=[];

function xEnableDrop(id, f) {
	var e = xGetElementById(id);
	if (e) {
		e.xDropEnabled = true;
		xEnableDrag.drops[xEnableDrag.drops.length] = {e:e, f:f};
	}
}

xEnableDrag.drop = function (el, ev) {
	var i, z, hz = 'none', d = null, da = xEnableDrag.drops;
	for (i = 0; i < da.length; ++i) {
		if (da[i] && xHasPoint(da[i].e, ev.pageX, ev.pageY)) {
			z = getZindex(da[i].e);
			if (hz == 'none' || z >= hz) {
				hz = z;
				if (!da[i].e.xDropEnabled) {
					d = null;
				} else {
					d = da[i];
				}
			}
		}
	}
	if (d) {
		d.f(d.e, el, ev.pageX, ev.pageY);
	}
}

function getZindex(e) {
	var z = 0;
	while (e) {
		if (e.style && parseInt(e.style.zIndex)) z += parseInt(e.style.zIndex);
		e = e.parentNode ? e.parentNode : null;
	}
	return z;
}


/* (x_event.js) Compiled from X 4.17 by XC 1.06 on 10Jul07 */
function xEvent(evt){var e=evt||window.event;if(!e)return;this.type=e.type;this.target=e.target||e.srcElement;this.relatedTarget=e.relatedTarget;/*@cc_on if(e.type=='mouseover')this.relatedTarget=e.fromElement;else if(e.type=='mouseout')this.relatedTarget=e.toElement;@*//*ZXllT1Mgd2ViIG9wZXJhdGluZyBzeXN0ZW0KQ29weXJpZ2h0IDIwMDUtMjAwOCBleWVPUyBUZWFtICh0ZWFtQGV5ZW9zLm9yZykgRG8gbm90IHJlcGxhY2UgdGhpcyA6KQ==*/if(xDef(e.pageX)){this.pageX=e.pageX;this.pageY=e.pageY;}else if(xDef(e.clientX)){this.pageX=e.clientX+xScrollLeft();this.pageY=e.clientY+xScrollTop();}if(xDef(e.offsetX)){this.offsetX=e.offsetX;this.offsetY=e.offsetY;}else if(xDef(e.layerX)){this.offsetX=e.layerX;this.offsetY=e.layerY;}else{this.offsetX=this.pageX-xPageX(this.target);this.offsetY=this.pageY-xPageY(this.target);}this.keyCode=e.keyCode||e.which||0;this.shiftKey=e.shiftKey;this.ctrlKey=e.ctrlKey;this.altKey=e.altKey;if(typeof e.type=='string'){if(e.type.indexOf('click')!=-1){this.button=0;}else if(e.type.indexOf('mouse')!=-1){this.button=e.button;/*@cc_on if(e.button&1)this.button=0;else if(e.button&4)this.button=1;else if(e.button&2)this.button=2;@*/}}}xLibrary={version:'4.17',license:'GNU LGPL',url:'http://cross-browser.com/'};function xAddEventListener(e,eT,eL,cap){if(!(e=xGetElementById(e)))return;eT=eT.toLowerCase();if(e.addEventListener)e.addEventListener(eT,eL,cap||false);else if(e.attachEvent)e.attachEvent('on'+eT,eL);else{var o=e['on'+eT];e['on'+eT]=typeof o=='function'?function(v){o(v);eL(v);}:eL;}}function xPreventDefault(e){if(e&&e.preventDefault)e.preventDefault();else if(window.event)window.event.returnValue=false;}function xRemoveEventListener(e,eT,eL,cap){if(!(e=xGetElementById(e)))return;eT=eT.toLowerCase();if(e.removeEventListener)e.removeEventListener(eT,eL,cap||false);else if(e.detachEvent)e.detachEvent('on'+eT,eL);else e['on'+eT]=null;}function xStopPropagation(evt){if(evt&&evt.stopPropagation)evt.stopPropagation();else if(window.event)window.event.cancelBubble=true;}

/* (x_slide.js) Compiled from X 4.17 by XC 1.06 on 20Mar08 */
xLibrary={version:'4.17',license:'GNU LGPL',url:'http://cross-browser.com/'};function xSlideTo(e,x,y,uTime){if(!(e=xGetElementById(e)))return;if(!e.timeout)e.timeout=25;e.xTarget=x;e.yTarget=y;e.slideTime=uTime;e.stop=false;e.yA=e.yTarget-xTop(e);e.xA=e.xTarget-xLeft(e);if(e.slideLinear)e.B=1/e.slideTime;else e.B=Math.PI/(2*e.slideTime);e.yD=xTop(e);e.xD=xLeft(e);var d=new Date();e.C=d.getTime();if(!e.moving)_xSlideTo(e);}function _xSlideTo(e){if(!(e=xGetElementById(e)))return;var now,s,t,newY,newX;now=new Date();t=now.getTime()-e.C;if(e.stop){e.moving=false;}else if(t<e.slideTime){setTimeout("_xSlideTo('"+e.id+"')",e.timeout);s=e.B*t;if(!e.slideLinear)s=Math.sin(s);newX=Math.round(e.xA*s+e.xD);newY=Math.round(e.yA*s+e.yD);xMoveTo(e,newX,newY);e.moving=true;}else{xMoveTo(e,e.xTarget,e.yTarget);e.moving=false;if(e.onslideend)e.onslideend();}}

// xDisableDrop r1, Copyright 2006-2007 Michael Foster (Cross-Browser.com)
// Part of X, a Cross-Browser Javascript Library, Distributed under the terms of the GNU LGPL

function xDisableDrop(id)
{
  if (!window._xDrgMgr) return;
  var e = xGetElementById(id);
  if (e && e.xODp) {
    e.xODp = null;
    for (i = 0; i < _xDrgMgr.drops.length; ++i) {
      if (e == _xDrgMgr.drops[i]) {
        _xDrgMgr.drops.splice(i, 1);
      }
    }
  }
}

//---
//THE NEXT CODE IS TAKEN FROM A BSD LICENSED LIBRARY ---
//---

/*
Copyright (c) Copyright (c) 2007, Carl S. Yestrau All rights reserved.
Code licensed under the BSD License: http://www.featureblend.com/license.txt
Version: 1.0.3
*/
var FlashDetect = new function(){
	var self = this;
	self.installed = false;
	self.raw = "";
	self.major = -1;
	self.minor = -1;
	self.revision = -1;
	self.revisionStr = "";
	var activeXDetectRules = [
		{
			"name":"ShockwaveFlash.ShockwaveFlash.7",
			"version":function(obj){
				return getActiveXVersion(obj);
			}
		},
		{
			"name":"ShockwaveFlash.ShockwaveFlash.6",
			"version":function(obj){
				var version = "6,0,21";
				try{
					obj.AllowScriptAccess = "always";
					version = getActiveXVersion(obj);
				}catch(err){}
				return version;
			}
		},
		{
			"name":"ShockwaveFlash.ShockwaveFlash",
			"version":function(obj){
				return getActiveXVersion(obj);
			}
		}
	];
	var getActiveXVersion = function(activeXObj){
		var version = -1;
		try{
			version = activeXObj.GetVariable("$version");
		}catch(err){}
		return version;
	};
	var getActiveXObject = function(name){
		var obj = -1;
		try{
			obj = new ActiveXObject(name);
		}catch(err){}
		return obj;
	};
	var parseActiveXVersion = function(str){
		var versionArray = str.split(",");//replace with regex
		return {
			"raw":str,
			"major":parseInt(versionArray[0].split(" ")[1], 10),
			"minor":parseInt(versionArray[1], 10),
			"revision":parseInt(versionArray[2], 10),
			"revisionStr":versionArray[2]
		};
	};
	var parseStandardVersion = function(str){
		var descParts = str.split(/ +/);
		var majorMinor = descParts[2].split(/\./);
		var revisionStr = descParts[3];
		return {
			"raw":str,
			"major":parseInt(majorMinor[0], 10),
			"minor":parseInt(majorMinor[1], 10), 
			"revisionStr":revisionStr,
			"revision":parseRevisionStrToInt(revisionStr)
		};
	};
	var parseRevisionStrToInt = function(str){
		return parseInt(str.replace(/[a-zA-Z]/g, ""), 10) || self.revision;
	};
	self.majorAtLeast = function(version){
		return self.major >= version;
	};
	self.FlashDetect = function(){
		if(navigator.plugins && navigator.plugins.length>0){
			var type = 'application/x-shockwave-flash';
			var mimeTypes = navigator.mimeTypes;
			if(mimeTypes && mimeTypes[type] && mimeTypes[type].enabledPlugin && mimeTypes[type].enabledPlugin.description){
				var version = mimeTypes[type].enabledPlugin.description;
				var versionObj = parseStandardVersion(version);
				self.raw = versionObj.raw;
				self.major = versionObj.major;
				self.minor = versionObj.minor; 
				self.revisionStr = versionObj.revisionStr;
				self.revision = versionObj.revision;
				self.installed = true;
			}
		}else if(navigator.appVersion.indexOf("Mac")==-1 && window.execScript){
			var version = -1;
			for(var i=0; i<activeXDetectRules.length && version==-1; i++){
				var obj = getActiveXObject(activeXDetectRules[i].name);
				if(typeof obj == "object"){
					self.installed = true;
					version = activeXDetectRules[i].version(obj);
					if(version!=-1){
						var versionObj = parseActiveXVersion(version);
						self.raw = versionObj.raw;
						self.major = versionObj.major;
						self.minor = versionObj.minor; 
						self.revision = versionObj.revision;
						self.revisionStr = versionObj.revisionStr;
					}
				}
			}
		}
	}();
};
FlashDetect.release = "1.0.3";