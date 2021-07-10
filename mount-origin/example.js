


let ws ;

function get_appropriate_ws_url(extra_url)
{
	var pcol;
	var u = document.URL;

	/*
	 * We open the websocket encrypted if this page came on an
	 * https:// url itself, otherwise unencrypted
	 */

	if (u.substring(0, 5) === "https") {
		pcol = "wss://";
		u = u.substr(8);
	} else {
		pcol = "ws://";
		if (u.substring(0, 4) === "http")
			u = u.substr(7);
	}

	u = u.split("/");

	/* + "/xxx" bit is for IE10 workaround */

	return pcol + u[0] + "/" + extra_url;
}

function new_ws(urlpath, protocol)
{
	if (typeof MozWebSocket != "undefined")
		return new MozWebSocket(urlpath, protocol);

	return new WebSocket(urlpath, protocol);
}

document.addEventListener("DOMContentLoaded", function() {
	
	ws = new_ws(get_appropriate_ws_url(""), "lws-minimal");
	try {
		ws.onopen = function() {
	

		};
	
	ws.onmessage =function got_packet(msg) {




		};
	
		ws.onclose = function(){


		};
	} catch(exception) {
		alert("<p>Error " + exception);  
	}
	
	function sendmsg()
	{

		//let obj = [1,2,3,4];
		ws.send(JSON.stringify(json));
		document.getElementById("m").value = "";
	}
	
//	document.getElementById("b").addEventListener("click", sendmsg);
	
}, false);


let file = null;
let offset = 0;
const chunkSize = 512;

function ab2str(buf) {
  return encodeURI( String.fromCharCode.apply(null, new Uint16Array(buf)));
}


function toUTF8Array(str) {
    var utf8 = [];
    for (var i=0; i < str.length; i++) {
        var charcode = str.charCodeAt(i);
        if (charcode < 0x80) utf8.push(charcode);
        else if (charcode < 0x800) {
            utf8.push(0xc0 | (charcode >> 6),
                      0x80 | (charcode & 0x3f));
        }
        else if (charcode < 0xd800 || charcode >= 0xe000) {
            utf8.push(0xe0 | (charcode >> 12),
                      0x80 | ((charcode>>6) & 0x3f),
                      0x80 | (charcode & 0x3f));
        }
        // surrogate pair
        else {
            i++;
            charcode = ((charcode&0x3ff)<<10)|(str.charCodeAt(i)&0x3ff)
            utf8.push(0xf0 | (charcode >>18),
                      0x80 | ((charcode>>12) & 0x3f),
                      0x80 | ((charcode>>6) & 0x3f),
                      0x80 | (charcode & 0x3f));
        }
    }
    return utf8;
}


window.onload = function(){

	let fileElement = document.getElementById('upload');
	fileElement.addEventListener('change',getFile);

	let filename ;
	let length;
	let total;


	let fileReader = new FileReader();

	fileReader.addEventListener('load',e=>{
		
	  	let arrayBuffer =new Uint8Array(e.target.result);

		let arr = Array.from(arrayBuffer);

		length = e.target.result.byteLength;
		total = file.size;

		let json = { 
		        data:arr,
			total : file.size,
			filename:file.name,
			len : length,
			action:"upload"
		};


		console.log(json);
	
		
		ws.send(JSON.stringify(json));

		offset +=e.target.result.byteLength;

		if(offset < file.size)
			readSlice(offset);
	})


	const readSlice = o=>{
		if(!o) o = 0;

		//const slice = file.slice(offset,o+chunkSize);

		const slice = file.slice(0,file.size);
		fileReader.readAsArrayBuffer(slice)
	}


	document.getElementById('b').addEventListener('click',function(){
			readSlice();
	});
	
}



function getFile(e){

	file = e.target.files[0];

	console.log(file);
}

