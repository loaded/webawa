

function _cl(el){

	return document.createElement(el);
}
function _l(id){
	return document.getElementById(id);
}


function Event(name){
  this.name = name;
  this.callbacks = [];
}
Event.prototype.registerCallback = function(callback){
  this.callbacks.push(callback);
}

function Reactor(){
  this.events = {};
}

Reactor.prototype.registerEvent = function(eventName){
  var event = new Event(eventName);
  this.events[eventName] = event;
};

Reactor.prototype.dispatchEvent = function(eventName, eventArgs){
  this.events[eventName].callbacks.forEach(function(callback){
    callback(eventArgs);
  });
};

Reactor.prototype.addEventListener = function(eventName, callback){
  this.events[eventName].registerCallback(callback);
};


//https://stackoverflow.com/questions/15308371/custom-events-model-without-using-dom-events-in-javascript#15308814
var R = new Reactor();

/*
reactor.registerEvent('big bang');

reactor.addEventListener('big bang', function(){
  console.log('This is big bang listener yo!');
});

reactor.addEventListener('big bang', function(){
  console.log('This is another big bang listener yo!');
});

reactor.dispatchEvent('big bang');
*/


let ws ;
let site = 'http://localhost:3000'
let myHome;



let slideUp;
let slideDown;
let hash;
let cook;
let navi = 0;

function isMobile(){
	let ret = window.innerWidth > 600 ? 0 : 1; 
  return ret;
}

function _cl(el){

	return document.createElement(el);
}
function _l(id){
	return document.getElementById(id);
}

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



function makeUrl(user,url){

	let base = 'files/';

	let ret = site + '/' + base + user + '/thumb/' + url;
	
	return ret;
	
}

function makeSlideUrl(user,url){

	let base = 'files/';
	

	if(config.width > 700) 

		 return site + '/' + base + user + '/desktop/' + url;

	else 
		return site + '/' + base + user + '/mobile/' + url;
}

function getLink(png){
	
	
	let dir = '/arrow/';
	return dir + png;
}
function getImage(url){
		let base = '/files/';

		return site + base + 'naro/mobile/' + url;
	}
window.onpopstate = function(e){
	alert(window.location.pathname);		
	App.navigate(window.location.pathname,true);
}


function pushState(a,b,c){

	history.pushState(a,b,c);
}

let config = {

	width : window.innerWidth,
	height : window.innerHeight,
	header : 40,
	footer : 40
}


let Database = (function(){
	
	let received ;

	let Home = (function(){

		let mapmove ;
		let hashText;


		function Router(database){


			switch(database){
				case 'mapmove':
					mapmove = received;
					break;
				case 'popup':
					hashText = received;
					break;
				default :
					break;
			}

		}

		function get(){
			return mapmove;
		}


		function pop(){
			return hashText;
		}
		return {
			Router : Router,
			mapmove : get,
			popup : pop
		}


	})();

	let Show = (function(){
		let model ;

		let Router = function(route){
		
			switch(route){
				
				case 'init':
					model = received;
					
					break;
				default:
					break;
			}
		}

		function getModel(){
			return model;
		}

		return {
	
			Router : Router,
			Model : getModel

		
		}
	})()
	

	let Basket = (function(){
	
		let models = [] ;
		
		function add(item){
			models.push(item);
		}


		function remove(item){
			let index = models.findIndex(function(el){
				return (item.id == el.id)
			})

			if(index != -1){
				models.splice(index)
			}
		}

		
		function get(){
			return models;
		}

		return {
			Get : get,	
			Add: add,
			Remove : remove
		}
	})()

	let Archive = (function(){
		let models ;

		let Router = function(route){
		
			switch(route){
				
				case 'init':
					models = received.models;
					
					break;
				default:
					break;
			}
		}

		function getModels(){
			return models;
		}

		function username (){
			return received.username;
		}

		return {

			user : username,
			Router : Router,
			Models : getModels
		}
	})()

	let Router = function(data){
		
		received = data;

		let route = data.route.split('--');
			

		switch(route[0]){
			case 'home':
				Home.Router(route[1]);
			case 'archive':
				Archive.Router(route[1])
				break;
			case 'show':
				Show.Router(route[1]);
			default : 
				break;
		}
	}


	return {
		Show : Show,
		Archive :Archive,
		Home : Home,
		Router : Router,
		Basket : Basket
	}
})()


let App =( function(){
	let apps = [];

	 function getCookie(name) {
		  var match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
		  
		 if (match)
			return 	match[2];
			else 
				return null;
	}

	
	function run(route){ 
	
		let routeObject;

		let app = apps.find(_app =>{
		
			return _app.routes.find(rt =>{

				if(rt.route == route){
					routeObject = rt;
					return true;
				}

			
				return false;
			})
		})


		if(app){ 
		
			routeObject.dependencies.forEach(subroute =>{
			
				run(subroute);
			})
		}else 
			return;
		
		let splited = route.split('--');
	
		app.Router(splited[1]);

	}
	
	function start(){
	
		if(getCookie("hash")){
				
			 hash = getCookie("hash");
			let obj = {"action":"session"};
			obj["hash"] = hash;
					
			ws.send(JSON.stringify(obj));

					
			} else 
		parseUrl(window.location.pathname,false);


	}

	function initializeWS(){
	
		ws = new_ws(get_appropriate_ws_url(""), "lws-minimal");
		
			ws.onopen = function() {
				
				start()		
			}
	
		ws.onmessage =function got_packet(_msg) {
			let msg = JSON.parse(_msg.data);
			

			console.log(msg);
			let route = msg.route;
		
			function findRoute(){

				for(let t =  0 ; t < apps.length ; t++){
				
					for(let p = 0 ; p < apps[t].routes.length ; p++){
					
						if(apps[t].routes[p].route == route)
							return t;
					}
				}

				return -1;
			}
			
		
		if(findRoute() != -1){
				
				Database.Router(msg);
				
	
				run(route);
			
			}else{ 
			
			 	R.dispatchEvent(msg.route,msg);
			}
		};
	
		ws.onclose = function(){


		};

		
	}


	function addApp(app){
	
		apps.push(app);

	}


	function findIndex(url){
		let route = null;

		let ap =  apps.findIndex(app=>{

			return app.routes.findIndex(rt =>{
				if(rt.url == url){
					route = rt.route;
					return true;
				}else
				return	false;
			}) > 0;
		})

		return route;

	}
	
	function findPath(path){

		for(let t =  0 ; t < apps.length ; t++){
		
			for(let p = 0 ; p < apps[t].routes.length ; p++){
			
				if(apps[t].routes[p].url == path)
					return t;
			}
		}

		return -1;


	}
		
	function parseUrl(url,navigate){
		

		let parts = url.split("/");
		
		console.log('initialized!');
		console.log(parts);
		console.log('navigate is ' + navigate);
		if(parts[1]){
			let index = findPath(parts[1]);
			console.log('index is ' + index);

			if(index == -1) return run('home--init');

			for(let i = 0 ; i < apps[index].routes.length ; i++){ 
				if(apps[index].routes[i].url == parts[1]){
					if(apps[index].routes[i].data )
						return getPage(parts);
					else 
						return run(apps[index].routes[i].route);

				}
			}		
		}
		

		

	//	ws.send(JSON.stringify({username : 'naro',action:'archive'}))
		run('home--init');
	
	}
	


	function getPage(parts){
		
		console.log("in get pages");

		console.log(parts[2]);


		switch(parts[1]){
		
			case 'product':
				ws.send(JSON.stringify({id : parts[2],action:'model'}));

				break;
			case 'archive':
				ws.send(JSON.stringify({username : parts[2],action : 'archive'}));	
		
				break;
			default : 
				break;
		}
	
	}

	function getHash(){
	
		return hash;
	}


	function restart(){
		
		document.getElementById('container').remove();
	
		run('home--init');
	}
	return {
		route : run,	
		Add : addApp,
		start : initializeWS,
		hash : getHash,
		navigate : parseUrl,
		restart : restart

	}

	
})()



function getUrl(){}


let Main = (function(){
	let prefix = 'handi--';
	let container,body,header,footer;
	let inited;
	let width ;
	let height;
	let isBasket = 0;
	let View = {
	
		configure : function(){
		
			width = (config.width > 800) ? 800 : config.width -10 ;
			height = config.height;
		},
	
		init : function(){  
			if(inited) return ;
			inited = 1;
			this.configure();
			this.template();


			
		
		},
		template : function(){
			createMainContainer();
			createHeader();
			createBody();
			createFooter();

			_menu();
		}
	}


	function createMainContainer(){
		
		container = document.createElement('div');
		container.classList.add(prefix + 'container');
		container.id = prefix + 'container';

		container.style.width = width;
		
		container.style.height = height;

		document.body.append(container);
	}

	function createHeader(){
	      
	       header = document.createElement('div');
               header.classList.add(prefix + 'header');
	       header.style.height = config.header;
		
	       container.append(header);	
	};

	function createBody(){
	
		 body = document.createElement('div');

		body.classList.add(prefix  + 'body');
		body.style.height = config.height - (config.footer + config.header);
		container.append(body);
	}


	function createFooter(){
	
		footer = document.createElement('div');
		footer.classList.add(prefix + 'footer');
	
		footer.style.height = config.footer
		container.append(footer);
	}
	
	function main(){
		return {
			header : header,
			body : body,
			footer : footer,
			width : width,
			height : height,
			createMenu : createMenu
		}
	}
	
	
	function _expand_menu(e){

	    let target = e.target;
	    let wHeight = window.innerHeight;
	    let wWidth = window.innerWidth;
	    let menuHeight = 1/3 * wHeight-40;
	    let ratio = wWidth/200;
	    let steps = (140 + 40 + 30)/10;  
	    let width,height = 0;

	    let iterate = function() { setTimeout(function(){
	       
	    if( width >( window.innerWidth )){
	       _create_menu(window.innerWidth,height);
		return;
	    } 

	    let prev =  document.getElementById('handi--menu');
	    width = prev.width;
	    height = prev.height;
	    prev.remove();      
	   
	   let canvas  = document.createElement('canvas');
	   if(height < 220)
	     height += 10;
	   width +=ratio * 10
	   canvas.id = 'handi--menu';
	   canvas.width = width ;
	   canvas.height = height ;
	   canvas.style.top =( window.innerHeight - height) + 'px';
	   canvas.style.right = 0;
	   let ctx = canvas.getContext('2d');
	   ctx.beginPath();
	 //  ctx.lineWidth = 20/100 * width;
	  // ctx.strokeStyle = 'darkslategrey';
	   ctx.rect(0,0,width,height);
	   ctx.fillStyle = '#333'
	   ctx.fill();
	   ctx.stroke(); 

	   document.body.appendChild(canvas);

	   iterate();        

	    },5)

	  }

	iterate();
	}

	function _menu (e){
	   let color ;

	   if(e) {
	     color = 'green';
	     document.getElementById('handi--menu').remove();
	    }
	   else 
	     color = 'white';

	   let canvas  = document.createElement('canvas');

	   canvas.id = 'handi--menu';
	   canvas.width = 40;
	   canvas.height = 40;
	   canvas.style.top =( window.innerHeight - 40) + 'px';
	   canvas.style.right = 0;
	   let ctx = canvas.getContext('2d');
	   ctx.beginPath();
	   ctx.lineWidth = '25';
	   ctx.strokeStyle = '#333';
	   ctx.rect(0,0,40,40);
	   ctx.fillStyle = color;
	   ctx.fill();
	   ctx.stroke();  

	   canvas.addEventListener('click',_expand_menu); 
	   document.body.appendChild(canvas);
	}

	function _create_menu(width,height){
	  let div = document.createElement('div');
	  div.style.width = width + 'px';
	  div.style.height = height+ 'px';
	  div.id = 'handi--menu-footer';
	  div.style.top = (window.innerHeight - height) + 'px';
	  div.style.right = 0;


	  let footer = document.createElement('div');
	  if(isMobile()){
	   footer.style.width = config.width + 'px';
	  }else
	  footer.style.width = config.width + 'px';
	  footer.style.height = 40 + 'px';
	  footer.style.borderTop = "1px solid #332d2d";
	    
	  
	  footer.style.position = 'relative'
	  //footer.style.top =( height -30) + 'px';
	  footer.style.marginLeft = 'auto';
	  footer.style.marginRight = 'auto';
	  
	  let links = document.createElement('div');
	   links.id = 'handi--footer-links'; 

	  let menu = ['home','login','about'];
	   
	    
	  for(let i = 0 ; i < menu.length ; i++){
	     
	    let span = document.createElement('span');
	    span.innerHTML = menu[i];
	    span.classList.add('handi--footer-footerItem');
	    let border = document.createElement('span');
	    border.classList.add('handi--footer-border','handi--footer-footerItem');
	    links.appendChild(span);
	   // links.appendChild(border);
	  
	  }

	  let details = document.createElement('div');
	  details.id = 'handi--footer-details';
	  if(isMobile()){
	  //  details.style.width = View.config.mainWidth + 'px';
	  }else
	  details.style.width = config.width;
	  details.style.height = 40 + 'px';
	  //_create_model_basket_buttons(details);
	  let basketContent = document.createElement('div');
	  basketContent.id = 'handi--basket';
	  basketContent.style.width = config.width + 'px';
	  basketContent.style.height = 140 + 'px';
	   
	  footer.appendChild(links);
 	 _create_model_space_buttons(details);
	  fill_basket_thumbs();

	  div.appendChild(details);
	  div.appendChild(basketContent);
	  div.appendChild(footer);
	  document.body.appendChild(div);
	  
	}


	function _create_model_space_buttons(parent){
	      let buttonContainer = document.createElement('div');
	     buttonContainer.classList.add('handi--container-spaceContainer');

	     let remove = document.createElement('div');
	     let details = document.createElement('div');

	     details.classList.add('handi--container-spaceCart');
	     remove.innerHTML = 'remove' ;
	     details.innerHTML =  'Pay' + ' :  ' + '244556' + ' ' + 'rials';
		
		remove.addEventListener('mouseenter',function(e){
			this.style.color = 'tomato';
			this.style.borderTop = 'white';
		})
	     buttonContainer.appendChild(remove);
	     buttonContainer.appendChild(details);


	     Array.from(buttonContainer.children).forEach((child,index)=>{
	       child.classList.add('handi--container-spacebtns') ;
		     child.style.borderTop = 'none';
		     
	  /*     child.addEventListener('mouseenter',_handle_upload_btns_mouseenter.bind(child));
	       child.addEventListener('mouseleave',_handle_upload_btns_mouseleave.bind(child)); */
	     })

	     remove.addEventListener('click',function(){
	
			//Database.Basket.Remove(Database.Show.Model());
	      });


		let n = new Image();

		n.src = getLink('ne.png');
			
		
		n.classList.add('handi--basket-next');
		n.id = 'handi--basket-next';

		let b = new Image();
		b.src = getLink('be.png');
		b.classList.add('handi--basket-back');
		b.id = 'handi--basket-back';

		parent.append(n);
		parent.append(b);


	//     details.style.borderTop = '2px solid black';
	     parent.appendChild(buttonContainer);

  }

	function fill_basket_thumbs(){
		
		let models = Database.Basket.Get();
	

		models.forEach(model=>{
	
			_load_file(model.urls[0].url);
		})


	}

	function show_thumbs(){
	
/*		let model = Database.Show.Model();
		
		console.log(model);
		model.urls.forEach(url=>{
			_load_file(url.url);
		})
*/
//		_preview_firstone(model.urls[0].url);

	}
	 function _load_file(url){
		  
		 let image = new Image();
		  image.mSize = 100;
		  image.dSize = 100;
		  image.addEventListener('load',_load_template_for_thumb);
		  image.src =  getImage(url);

		  image.name = url;
		  image.filename = url;
		  
	}

	function _load_canvas(image){ 
	   
	  let width = image.width;
	  let height = image.height;
	  
	  let orientation = image.orient;
	  
	  let mSize = image.mSize;
	  let dSize = image.dSize;
	  
	  let canvas = document.createElement('canvas');
	  canvas.name = image.name;

	  if( 4 < orientation && orientation < 9){
	    if(width > height){
	       if(isMobile()){
		   height = mSize * height/width;
		   width = mSize;
	       }else{
		    height  =  dSize * height/width ;
		   width = dSize;
	       }
	    }else{
	       if(View.isMobile()){
		  width = parseInt(mSize * (width/height));
		  height = mSize;
	       }else{ console.log('2');
		  height = parseInt(dSize * (width/height));
		  width = dSize; 
		} 
	    }

	  canvas.height = width; 
	  canvas.width = height; 
	  }else{
	       if(width > height){
		 if(isMobile()){
		    height = parseInt(mSize*(height/width));
		    width = mSize;
		 }else{        
		   height   = parseInt(dSize * height/width);
		   width = dSize;
		 }
	      }else{
		if(isMobile()){ 
		   width = parseInt(mSize * (width/height));
		   height = mSize;
		}else{
		   width = parseInt(dSize * (width/height));
		   height = dSize;
		} 
	    }

	   canvas.width = width ;
	   canvas.height = height;
	  }


	  image.width = width;
	  image.height = height;

	  let ctx = canvas.getContext('2d');
	 	  ctx.drawImage(image,0,0,width,height);
	 
	  return canvas;
	}
			     


	function _load_template_for_thumb(e){
	  let image = e.target;

	  let mSize = image.mSize;
	  let dSize = image.dSize;

	  let preview = document.createElement('div');

	  let canvas = _load_canvas(image);

	  if(image.name)
	    canvas.gallery = image.name;
	  if(image.filename)
	   canvas.name =image.filename;

	  if(image.src)
	    canvas.src = image.src;

	  preview.appendChild(canvas);

	  let marginTop ;
	  let marginLeft;

	  if(isMobile()){
	     marginLeft = parseInt(mSize - canvas.width)/2;
	     marginTop = parseInt(mSize - canvas.height)/2;
	     preview.style.width = mSize + 'px';
	     preview.style.height = mSize + 'px';
	  }else{
	     marginLeft = parseInt(dSize - canvas.width)/2;
	     marginTop = parseInt(dSize - canvas.height)/2;
	     preview.style.width = dSize + 'px';
	     preview.style.height = dSize + 'px';
	  }

	  canvas.style.marginTop = marginTop + 'px';
	  canvas.style.marginLeft = marginLeft + 'px';

	  preview.style.marginTop = 5 + 'px';
	  preview.style.marginRight = 10 + 'px';
	  preview.name = image.name;
	  preview.classList.add('handi--container-thumbs');
	  canvas.style.borderBottom = '2px solid green';

	  if(image.filename)
	     canvas.addEventListener('click',_preview_file);
	  
	 

	 document.getElementById('handi--basket').appendChild(preview);
	}

	
	function prepareContainer(){
		
		isBasket = 1;	

		let prefix = 'basket--';
		let container = document.createElement('div');
		container.id = prefix + 'contaienr';	
		container.classList.add(prefix + 'container');
		container.style.width = width;
		container.style.height = config.height - (config.footer+140 + 40 );
		let header = document.createElement('div');
		header.id = prefix + 'header';

		header.classList.add(prefix + 'header');
		header.style.height = config.header;
	
		let close = document.createElement('div');
		close.classList.add('handi--header-backHome');
		let image = new Image();
		image.classList.add('handi--header-closeImg');
		image.src = getLink('close.png');
		close.addEventListener('click',_=>{
			
			container.remove();
			document.getElementById('handi--menu').remove();
			document.getElementById('handi--menu-footer').remove();
			isBasket = 0;
			_menu();
			//ws.send(JSON.stringify({username : 'naro',action : 'archive'}));	
		});

		close.append(image);
	
		let username = document.createElement('div');

		username.innerHTML = 'naro';

		username.classList.add('handi--username');
		username.addEventListener('click',Menu);
	
		header.append(close);
		header.append(username);

		let body = document.createElement('div');
		body.id = prefix + 'body';
		body.classList.add(prefix + 'body');
		body.style.height = config.height - (config.footer + config.header + 140 +40 );
		
		container.append(header);
		container.append(body);


		document.body.append(container);
	}


	
	function Menu(){
		let items = ['Archive','Location','Contact','About','Statistic'];	
		let menu = createMenu();
	
		for(let i = 0; i < items.length ; i++){
		
			let item = document.createElement('div');
			item.innerHTML = items[i];
			item.classList.add('handi--menu-item');
			menu.append(item);
		}
	
	}



	function _preview_file(e){
		let prefix = 'basket--';
		
		if(!isBasket ) 
			prepareContainer();
		

		document.getElementById(prefix + 'body').innerHTML = '';
		let canvas = e.target;

	   let image = new Image();
	   image.gallery = canvas.gallery;
	   image.name = canvas.name;
	   image.mSize = parseInt(config.width);
	   image.dSize =parseInt(config.height -260 - 20);
	   image.pType = 'file';
	   image.addEventListener('load',_load_template_for_show);
	   image.src = canvas.src;
	}

	 
	function _load_template_for_show(e){
	  
	  let image = e.target;

	  let mSize = image.mSize -20 ;
	  let dSize = image.dSize;
	 
		image.mSize -=20;

	  let preview = document.createElement('div');
	  
	  let canvas = _load_canvas(image);
	  preview.appendChild(canvas); 
	  
	  let marginTop ;
	  let marginLeft;

	  if(isMobile()){
	     marginLeft = parseInt(mSize - canvas.width )/2;
	     marginTop = parseInt(mSize - canvas.height)/2;   
	     preview.style.width = (mSize ) + 'px';
	     preview.style.height = (mSize )+ 'px';
	  }else{
	     marginLeft = parseInt(dSize - canvas.width)/2;
	     marginTop = parseInt(dSize - canvas.height)/2 ;
	     preview.style.width = dSize + 'px';
	     preview.style.height = (dSize )  + 'px';
	  }
	  
	  if(image.pType == 'file') { 
	    canvas.src = image.src;
	    canvas.name = image.name;
	    canvas.gallery = image.gallery;
	   }
	   

	   if(isMobile()){
	     canvas.style.marginLeft = marginLeft + 'px';
	   }else
	   canvas.style.marginLeft = marginLeft + 'px';

	   canvas.style.marginTop = marginTop + 'px';
	   canvas.top = marginTop;
	   canvas.addEventListener('click',_slide_canvas);
	   preview.style.margin = 'auto';  
	   
	   document.getElementById('basket--body').innerHTML = '';
	   document.getElementById('basket--body').appendChild(preview);
	}


	function _slide_canvas(e){
	   	let elem = e.target;
	 
		  elem.parentElement.remove();
	  	  ex(elem);
	 
	}
	
	function show_details(){
		
		let model = Database.Show.Model();
	
		let details = document.createElement('div');
	
		let title = document.createElement('div');
		let text  = document.createElement('div');
		let price = document.createElement('div');

		details.classList.add(prefix + 'show-details');	

		title.classList.add(prefix + 'show-title');
		text.classList.add(prefix + 'show-text');
		price.classList.add(prefix + 'show-price');
		

		title.innerHTML = model.title;
		text.innerHTML = model.text;
		price.innerHTML = model.price || '500';

		details.append(title);
		details.append(text);
		details.append(price);
		
		let elem = document.getElementById('basket--body');
		
		if(isMobile()){
			details.style.marginLeft = 10;
			details.style.marginTop = 20;
		}else {
			details.style.marginLeft = 20;
		}

		elem.append(details);	

	}

	function ex(el){
	  
	  let width = el.width;
	  let height = el.height;
	  let top = el.top;

			
	  let bWidth = (config.width > 800) ? 800 : config.width ;

		 
	  let src = el.src;
	  if(isMobile()){
	    	left = parseInt((bWidth - width)/2) ;   
	   }else
	   	left = parseInt((bWidth - width)/2) ;
	   
	  let style = window.getComputedStyle(el) ;
	  
	  
	  let type = width > height ? 'width' : 'height';
	  let steps = (type == 'width') ? parseInt( top/10) : parseInt( left/10);
	  
	  let xStep = parseInt(left/steps);
	  let yStep = parseInt(top/steps);
	  
	  let max = Math.max(width,height);

	  let nWidth = parseInt(width);
	  let nHeight =parseInt( height);

	 let promise = function(time){

	   setTimeout(function(){
	      if(top == 0 && left == 0) {
		  let elem = document.getElementById('basket--body').firstChild;
		  elem.style.float = 'left';
		show_details(el);
		  return;
	      }          
		
	      let image = new Image();
	      image.onload = function(){
		document.getElementById('basket--body').innerHTML = '';        

		let canvas = document.createElement('canvas');
		canvas.style.position = 'relative';       
	      
		canvas.width = nWidth;
		canvas.height = nHeight;      
	       
		if(yStep == 0){
		  let df =( height - 300)/steps;

		  this.height = nHeight - df;
		  this.width = nWidth - df * (width/height);
		  
		  canvas.style.height = nHeight - df + 'px';
		  this.width = nWidth -df * (width/height);
		  nWidth -= df * (width /height);
		  nHeight -= df;
		}else {
		    if(Math.max(nHeight,nWidth)> 300) {
		      let df = (width - 300)/steps;             

		      this.height = nHeight - df * (height/width);
		      this.width = nWidth -df ;
		      canvas.style.height = nHeight - df * (height/width)  + 'px';
		      canvas.style.width =(nWidth - df ) + 'px';

		      nHeight -= df * (height/width);
		      nWidth -= df;
		 }
		}
		

		let ctx = canvas.getContext('2d');
		ctx.drawImage(image,0,0,nWidth,nHeight);
	  
		canvas.style.left = (left - xStep) > 0 ? (left - xStep) + 'px' : 0;
		canvas.style.top = (top - yStep) > 0 ? (top - yStep) + 'px' : 0;

		top = (top - yStep) > 0 ? (top - yStep) : 0;
		left = (left -xStep) > 0 ? (left -xStep) : 0;       
	       
		document.getElementById('basket--body').appendChild(canvas);
	   
		promise(time);
	      }

	      image.src = src;

	   },time)
	 }
	  
	 if (type == 'width')
	   promise(10);
	 else 
	   promise(1);
	 
	 }



	function createMenu(){
	
		let menu = document.createElement('div');
		
		body.append(menu);
		let shadow = document.createElement('div');
		shadow.classList.add('handi-shadow');
		document.body.append(shadow);
		
		menu.addEventListener('click',function(e){
			e.stopPropagation();
		});

		shadow.addEventListener('click',_=>{
			menu.remove();
			shadow.remove();
		});

		menu.classList.add(prefix + 'user-menu');
		
		shadow.style.width = window.innerWidth;
		shadow.style.height = window.innerHeight;

		if(!config.dir){
			menu.style.right = 0;
		}

		return menu;
	}
	let Controller = (function(){
	
		let routes = [];

		let route1 = {
		
			route : prefix + 'init',
			url : '',
			dependencies : [],
			used : 0
		};

		routes.push(route1);

		let Router = function(route){
			
			switch(route){
				case 'init':
					View.init();
					break;
				default:
					break;

			}
		
		}

		return {
			Router : Router,
			routes : routes
		}
	})();
	
	App.Add(Controller);


	return { 
		Parts : main
	}


})();



 let mas = ( function(){
	

	let step = 10;
	let direction;
	let prefix = "home--";
	let id = 'home';
	let parent ;
	let container;
	let mp;
	 let inited;
	 let M ;
	let View = {
		configure : function(){
			if(inited) return;	
			parent  = Main.Parts().body
			M = Main.Parts();
				},
		init : function(){

		
			this.configure();
			this.template();	
			inited = 1;
	

		},
		template : function(){
			clear();
			setContainer();
			setSearchBar();
			setSuggestion();
			setMap();

		}
	
	}

	function clear(){
	
		M.header.innerHTML = '';
		M.body.innerHTML = '';
		M.footer.innerHTML = '';
	}


	function setContainer(){
	
		let homeContainer = _cl('div');
		parent.append(homeContainer);

		container = homeContainer;
	//	homeContainer.style.width = config.width;
	//	homeContainer.style.height = config.height - 70;

		let parentContainer = parent;

	//	parentContainer.style.width = config.width;
	//	parentContainer.style.height = config.height - 70;
		homeContainer.classList.add(prefix);
	}

	function setSearchBar(){
		
		let searchContainer = _cl('div');
		searchContainer.classList.add(prefix + 'container-search');

		let filter = _cl('div');
		let filterImage = new Image();
		filterImage.src = getLink('filter.png');
		filterImage.classList.add(prefix + 'search-filterIcon');
		filter.append(filterImage);

		let search = _cl('div');
		let searchImage = new Image();
		searchImage.src = getLink('search.png');
		searchImage.classList.add(prefix + 'search-searchIcon');
		
		search.append(searchImage)

		let searchInput = _cl('div');
		searchInput.classList.add(prefix + 'search');
		searchInput.contentEditable = "true";
	
		searchInput.addEventListener('keydown',e=>{
			if(e.which === 13) alert("entr");
		})	


		let icons = _cl('div');
		icons.classList.add(prefix + 'search-icons');



		if(config.dir){
			icons.append(filter);
			icons.append(search);

			searchInput.style.direction = "rtl";
			searchContainer.append(icons);

			searchContainer.append(searchInput)
		}else{
	
			icons.append(search);

			icons.append(filter);
	
			searchInput.style.direction = "ltr";
			searchContainer.append(searchInput)
			searchContainer.append(icons);

		
		}

		container.append(searchContainer);
	}


	function setSuggestion(){
	
		let suggestion = _cl('div');
		suggestion.classList.add(prefix + 'suggestion');
		
		container.append(suggestion);
		
		_addHash(suggestion);

		if(config.dir)
			suggestion.style.direction = 'rtl';
		else 
			suggestion.style.direction = 'ltr';
	}


	function setMap(){
		let map = _cl('div');
		map.classList.add(prefix + 'map');
		map.id = prefix + 'map';	
		map.style.height = _calculateHeight();

	//	map.style.width = config.width;


		container.append(map);
  	        mp=L.map(map,{zoomControl : false}).setView([34.70815,46.45460], 10);


        	L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
                         attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
                   maxZoom: 18,
                   id: 'mapbox/streets-v11',
                   tileSize: 512,
                    zoomOffset: -1,
                      accessToken: 'pk.eyJ1IjoiMWlvMWwiLCJhIjoiY2psNThyd3luMGVsMjN4bnR3bXc4MXV2cyJ9.ks2qVsrV6d1rXu54-CyqIw'
                }).addTo(mp);
	         
		mp.on('moveend', ()=> { 
   			let data = {
				xmin : mp.getBounds().getSouthWest().lat,
				ymin : mp.getBounds().getSouthWest().lng,
				xmax : mp.getBounds().getNorthEast().lat,
				ymax : mp.getBounds().getNorthEast().lng,
				action : "getbound"
			}
		
			ws.send(JSON.stringify(data));


		});
		mp.on('click',function(e){console.log(e)})
                 new L.Control.Zoom({position:'bottomright'}).addTo(mp);

	}

	function mapmove(){
	
        	let json = Database.Home.mapmove().data;
	
		console.log('map is moved');
		console.log(json);


              var myIcon = L.icon({
			    iconUrl:getLink('hl.png'),
			   
			    iconSize: [20,20],
                });


		for(let i = 0 ; i < json.length ; i++){
		
			latLng = L.latLng(json[i].x,json[i].y);
			let marker = new L.marker(latLng,{icon:myIcon}).addTo(mp).on('click',e=>{
				createThumb(json[i].id,e);	
				//_getHashData(json[i].hash);
			});

		}

	
	}

	function _getHashData(hash){

		let map = document.getElementById(prefix + 'map');
		 mp.setView([34.70915,46.45460], 15);

	//	ws.send(JSON.stringify({hash : hash , action : 'gethash'}));
	}

	 function createThumb(id,e){
		
		 let json = Database.Home.mapmove().data;
 	
		 let index =  json.findIndex(obj=>{

			return (obj.id == id);
		})

		

	 	let thumbContainer = document.createElement('div');
		 thumbContainer.classList.add(prefix + 'thumb-map');

		 let title = document.createElement('div');
		 let username = document.createElement('div');
		 let thumb = document.createElement('div');
		
		title.innerHTML = json[index].title;
		 username.innerHTML = 'naro';
		

		 title.style.textAlign= 'center';
		 username.style.textAlign = 'center';

		 let img = new Image();
	
		thumbContainer.append(title);
		 thumbContainer.append(username);
		 thumbContainer.append(thumb);

		 thumb.classList.add('archive--archive-viewThumb');
		 username.style.height = 25;
		 title.style.height = 25;
			
		 thumb.appendChild(img);

		 img.src = getImage(json[index].urls[0].url);

		 img.onload = function(){
		 
		 	let width =this.width ;
		     let height = this.height;

		     let portionX = this.width/this.height;
		     let portionY = this.height/this.width;

		     
		     thumb.style.width = 150; 
		     thumb.style.height = 150; 

		     if(width > height){
		       this.width = 150 ;
		       this.height = 150 *  portionY;
		       this.style.marginTop =(150 - (150 * portionY) )/2 + 'px';
		       
		     }else {
		       this.height = 150 ;
		       this.width = 150 * portionX;
		       this.style.marginLeft = (150 - (150 * portionX))/2 + 'px';
		     }
	
			this.style.padding = 10;
		 }

	     let map = document.getElementById(prefix + 'map');

		
		 map.append(thumbContainer);

		
			let 	xmin =  mp.getBounds().getSouthWest().lat;
			let 	ymin = mp.getBounds().getSouthWest().lng;
			let 	xmax = mp.getBounds().getNorthEast().lat;
			let 	ymax = mp.getBounds().getNorthEast().lng;
			
		console.log((xmin + xmax)/4);	
		
		 mp.setView([xmax ,ymin], 17);


		
			thumbContainer.addEventListener('click',function(){
			
				     ws.send(JSON.stringify({id : id,action:'model'}));

			})

	 }

	function _addHash(container){
		let hashes = ['cooking','driving','something','else'];


		for(let i = 0 ; i < hashes.length ;i++){
		
			let span = _cl('span');
			span.classList.add(prefix + 'hash');
			span.innerHTML = '#' +  hashes[i];

			container.append(span);
		}
	}


	function _calculateHeight(){
	
		let total = config.height;
		return (total - (120 + 50 + 20 + 20));
	}
	


	function _hashClick(){

	
		if(document.getElementsByClassName(prefix + 'description').length >  0)
			document.getElementsByClassName(prefix + 'description')[0].remove();
	
		let hashDescription = _cl('div');
		hashDescription.classList.add(prefix + 'description');
		_l('container').append(hashDescription);	


		let info = _cl('div');

		info.classList.add(prefix + 'description-info');
		
	
		let text = _cl('div');
		text.classList.add(prefix + 'description-text');
		console.log(Database.Home.popup());
		text.innerHTML = Database.Home.popup().text;
		hashDescription.append(text);
        	hashDescription.append(info);
		


		let profilename = _cl('div');
		profilename.classList.add(prefix + 'description-infoName');

		profilename.innerHTML = '@' + Database.Home.popup().username;

		let more = _cl('div');
		more.classList.add(prefix + 'description-more');

		more.innerHTML = "More ..";

		info.append(profilename);

		text.append(more);
	

		more.addEventListener('click',function(e){
		
			ws.send(JSON.stringify({
				hash : Database.Home.popup().hash,
				action : 'hash'
			}))	
		})

		profilename.addEventListener('click',function(e){
	
			ws.send(JSON.stringify({
				username : Database.Home.popup().username,
				action : 'profile'
			}))
		}
		)

		hashDescription.addEventListener('click',()=>{
		
			__slideUp(hashDescription,10,114,0);
		})


		if(config.dir){
			text.style.borderLeft='none';
			text.style.borderRight = '2px solid black';
			hashDescription.style.direction = 'rtl';
			more.style.left = 0;
			
		}else{
			more.style.right = 0;
		}

		__slideDown(hashDescription,10,114,-114)
		
	}



	let __slideUp = function(container,time,remains,top){
	
		
		setTimeout(function(){
				

			if(remains ==  0 ) {
					container.remove()
					step = 10; 				
					return;
		       
			};
			


			console.log(remains,top);
			if(remains < step) 
				step = remains;

			container.style.top = top -step ;
			
			__slideUp(container,time,remains -step,top - step);			
		
		},time);
	
	}


	let __slideDown = function(container,time,remains,top){
	
		
		setTimeout(function(){
				

			if(remains ==  0 ) {

					step = 10; 				
		 			return;
                       
			};
			
			if(remains < step) 
				step = remains;

			container.style.top = top+step ;
			
			__slideDown(container,time,remains -step,top +step);			
		
		},time);
	}



	let Controller = (function(){
		let init = prefix  + 'init';
		let map = prefix + 'mapmove';

		let route1 = {
			route : init,
			url : '',
			used : 0,
			dependencies : ['handi--init']
		};

		let route2 = {
		
			route : map,
			url : 'adfkj',
			used : 0,
			dependencies : ['main--init']
		}

		let route3 = {
		
			route : prefix + 'popup',
			url :  '',
			used : 0,
			dependencies : []
		}

		let routes =  [];
		routes.push(route1);
		routes.push(route2);
		routes.push(route3);


		let Router = function(route){
			
			switch(route){
			
				case 'init':
					View.init();
					pushState({},'home','/');
					break;
				case 'mapmove':
					mapmove();
					break;
				case 'popup':
					_hashClick();
					break;

				default:
					break;
			}
			
		}

		return {
			
			Router : Router,
			routes : routes
		
		}
	
	})()

	 App.Add(Controller);

})();


let Archive = (function(){

	let inited = 0;
	let parent ;	
	let prefix = 'handi--';
	let container ;
	let M ;
	let ps;
	let View = {
		configure : function(){
			M = Main.Parts();
			parent = M.body;	
		},
		init : function(){
				if(inited) return;
			
			this.configure();
			this.clear();

			this.template();

			showModels();

		},
		template : function(){
			createArchiveHeader();	
			createArchiveContainer();	
		},

		clear : function(){
			M.header.innerHTML = '';
			M.body.innerHTML = '';
			M.footer.innerHTML = '';
		}
	

	
	}


	function createArchiveHeader(){
	
	        
		let username = document.createElement('div');

		username.innerHTML = 'naro';

		username.classList.add(prefix + 'username');
		username.addEventListener('click',createMenu);
		let map = new Image();
		 map.classList.add('handi--header-map');
		map.style.float = 'left';
		 map.src = getLink('a.png');
		map.addEventListener('click',_=>{
			App.route('home--init');
		})	
		Main.Parts().header.append(map);
		Main.Parts().header.appendChild(username);
		Main.Parts().header.classList.add('borderbottom');
	}
	
	function createMenu(){
	
		let menu = M.createMenu();


	}
	
	function createArchiveContainer(){
		
		let psContainer = document.createElement('div');
					  
		psContainer.id = prefix + 'archive';
		
		psContainer.style.width = (M.width ) + 'px';

		psContainer.style.height = (M.height- 80) + 'px';
		
	     	container = psContainer;
			
	 	parent.appendChild(psContainer);	   
		
		
		ps = new PerfectScrollbar(container,{suppressScrollX : true}) 

		  
	}

	function getImage(url){
		let base = '/files/';

		return site + base + 'naro/mobile/' + url;
	}

	
	function showModels(){
		
		let models = Database.Archive.Models();
		models.forEach(model=>{console.log(model)

			_add_model_to_archive(model).then(view=>{
				container.append(view);
				ps.update();
			})
					
		})

	}


		function _add_model_to_archive(model){

	      let view = document.createElement('div');
	      let container = document.createElement('div');
	      let thumb = document.createElement('div');
	      let details = document.createElement('div');

	     view.classList.add(prefix + 'archive-view');
	     container.classList.add(prefix + 'archive-viewContainer');
	     thumb.classList.add(prefix + 'archive-viewThumb');
	     details.classList.add(prefix + 'archive-viewDetails');
		console.log(model.urls[0]);
	     let image = new Image();
		
		image.src = getImage(model.urls[0].url);

	return new Promise(resolve =>{
		image.onload = function(){
			let width =this.width ;
		     let height = this.height;

		     let portionX = this.width/this.height;
		     let portionY = this.height/this.width;

		      thumb.appendChild(this);
			

			if(isMobile()){

			     view.style.width = 350 ;
			     view.style.height = 250;
			     thumb.style.width = 150; 
			     thumb.style.height = 150; 


			}else {
			     view.style.width = 450 ;
			     view.style.height = 250;
			     thumb.style.width = 250; 
			     thumb.style.height = 250; 
		
			}	
		     
		     let detailsContainer = document.createElement('div');

		     let gallery = document.createElement('div');
		     let description = document.createElement('div');
		     let price = document.createElement('div');

		     gallery.innerHTML = model.title;
		     description.innerHTML = model.text;
		     price.innerHTML = 500;


		     gallery.classList.add(prefix + 'archive-viewDetail');
		     description.classList.add(prefix + 'archive-viewDetail');
		     description.classList.add(prefix + 'archive-viewDesc');

		     price.classList.add(prefix + 'archive-viewDetail');

		     detailsContainer.appendChild(gallery);
		    		     detailsContainer.appendChild(price);
		     detailsContainer.style.paddingLeft = 10; 

		     details.appendChild(detailsContainer);

			details.style.width = 200; 
		      details.style.height = 250; 
			

			if(isMobile()){ 
				if(width > height){
					 detailsContainer.style.width = 200 -10; 

					image.width = 150 ;
				       image.height = 150 *  portionY;
				       image.style.marginTop =(150 - (150 * portionY) )/2 + 'px';
				       detailsContainer.style.marginTop = (150 - (150*portionY))/2 + 'px';
			     }else {
				       image.height = 150 ;
				       image.width = 150 * portionX;
				       image.style.marginLeft = (150 - (150 * portionX))/2 + 'px';
			     }

			}else{
				if(width > height){
				       image.width = 250 ;
				       image.height = 250 *  portionY;
				       image.style.marginTop =(250 - (250 * portionY) )/2 + 'px';
				       detailsContainer.style.marginTop = (250 - (250*portionY))/2 + 'px';
			     }else {
				       image.height = 250 ;
				       image.width = 250 * portionX;
				       image.style.marginLeft = (250 - (250 * portionX))/2 + 'px';
			     }

			 detailsContainer.appendChild(description);


			}

		     			
			this.addEventListener('click',function(){
			
				     ws.send(JSON.stringify({id : model.id,action:'model'}));

			})
		     details.addEventListener('click',function(e){
					
					 this.style.position = 'relative';
			 e.preventDefault();
			 e.stopPropagation();
			 if(this.left){
			    this.left = 0;
			    //$(image).animate({opacity : 1},200)
			    //$(this).animate({left : 0},200)
			 }
			 else {
			    this.left = 1;
			    //$(image).animate({opacity : 0.3},200);
			    //$(this).animate({left : '-=260px'},200);
			 }
		     })
		     container.appendChild(thumb);
		     container.appendChild(details);
		     view.appendChild(container);
			resolve(view);
		}
})


	    
		     
	    
   }


	let Controller = (function(){
		let prefix = 'archive--';

		let routes = [];

		let route1 = {
		
			route : prefix + 'init',
			url : 'archive',
			dependencies : ['handi--init'],
			used : 0,
			data : true
		};
		
		routes.push(route1);
		let Router = function(route){
			
			switch(route){
				case 'init':
					View.init();
					let user = Database.Archive.user();
					
					pushState({},'arvhive','/archive/' + user);
					break;
				default:
					break;

			}
		
		}

		return {
			Router : Router,
			routes : routes
		}
	})();
	
		
		


	App.Add(Controller);


})()


let Upload = (function(){
	
	let inited = 0;
	let parent ;	
	let prefix = 'handi--';
	let M ;
	let location;
	let selected = 0;
	let unselected = 0; 
	let select,remove;
	let files;
	let details = {};

	let View = {
		configure : function(){
			M = Main.Parts();

			parent = M.body;	
		},
		init : function(){
			
			if(inited) return;
			this.configure();
			this.template();
			M.header.classList.remove('noborder');

		},

		template : function(){
			createUploadHeader();	
			createUploadContainer();
			createUploadFooter();
		}

	
	}
	

	function createUploadHeader(){
		
		 M.header.innerHTML = '';
		M.header.classList.add('borderbottom');

		let hash = document.createElement('div');
		 hash.innerHTML = '#';
		 hash.classList.add('handi--header-item');
		 hash.style.marginTop = '8px';         
		 let map = new Image();
		 map.classList.add('handi--header-png');
		 map.src = getLink('a.png');
		 
		 let add = new Image();
		 add.classList.add('handi--header-png');

		 add.src= getLink('add.png');
	
		let upload = document.createElement('div');

		upload.classList.add(prefix + 'upload-btn');

		upload.innerHTML = 'upload';

		upload.addEventListener('click',startUpload);	

		 let input = document.createElement('input');
		document.body.append(input);
		input.id = 'input';
		input.type = 'file';
		input.multiple = 'multiple';
		input.style.display = 'none';
		 add.addEventListener('click',function(e){
		     input.click();
		 })

		input.addEventListener('change',_getInputFiles);

		 let edit = new Image();
		 edit.classList.add('handi--header-png');
		 edit.src = getLink('edit.png');
		 
		 edit.addEventListener('click',add_details);
		 map.addEventListener('click',select_location);
		 hash.addEventListener('click',add_hash); 
		 M.header.appendChild(add);
		 M.header.appendChild(map);
	//	 M.header.appendChild(hash);
		 M.header.appendChild(edit);
		M.header.appendChild(upload);
	}

	
	function createUploadFooter(){
		M.body.innerHTML = '';	
		let wrapper  = document.createElement('div');

		wrapper.classList.add(prefix + 'upload-footer');
		wrapper.style.height = config.footer;
		

		let sWrap = document.createElement('div');
		let dWrap = document.createElement('div');
		let cWrap = document.createElement('div');
		
		sWrap.classList.add(prefix + 'upload-items');
		dWrap.classList.add(prefix + 'upload-items');
		cWrap.classList.add(prefix + 'upload-items');

		

		let sline = document.createElement('span');
		let dline = document.createElement('span');
		
		sline.classList.add(prefix + 'upload-line');
		dline.classList.add(prefix + 'upload-line');
		

		sline.style.backgroundColor = 'green';
		dline.style.backgroundColor = 'tomato';

		let  selectSpan = document.createElement('span');
		selectSpan.innerHTML = 'selected';

		let removeSpan = document.createElement('span');
		removeSpan.innerHTML = 'remove';
		

		let numContainerSelect = document.createElement('div');
		let numContainerRemove = document.createElement('div');
		
		numContainerSelect.classList.add(prefix + 'upload-num');
		numContainerRemove.classList.add(prefix + 'upload-num');

		let o1 = document.createElement('span');
		let o2 = document.createElement('span');
		

		o1.innerHTML = '(';
		o2.innerHTML = '(';


		let num1 = document.createElement('span');
		let num2 = document.createElement('span');
		

		select = num1;
		remove = num2;

		num1.innerHTML = 0;
		num2.innerHTML = 0;
		

		num1.id = prefix + 'selected';
		num2.id = prefix + 'unselected';


		let c1 = document.createElement('span');
		let c2 = document.createElement('span');


		 c1.innerHTML = ')';
		 c2.innerHTML = ')';

		

		o1.classList.add(prefix + 'num');
		o2.classList.add(prefix + 'num');
		c1.classList.add(prefix + 'num');
		c1.classList.add(prefix + 'num');

		
		numContainerSelect.append(o1);
		numContainerSelect.append(num1);
		numContainerSelect.append(c1);
	
		
		numContainerRemove.append(o2);
		numContainerRemove.append(num2);
		numContainerRemove.append(c2);
	


		sWrap.append(sline);
		sWrap.append(selectSpan);
		sWrap.append(numContainerSelect);

		dWrap.append(dline);
		dWrap.append(removeSpan);
		dWrap.append(numContainerRemove);
		

		let close = new Image();
		close.src = getLink('close.png');
			
		close.classList.add(prefix + 'upload-close');
		let closeText = document.createElement('div');

		closeText.innerHTML = 'close';
		
		let space = document.createElement('span');
		space.innerHTML = '    ';
		cWrap.append(close);
		cWrap.append(closeText);

		cWrap.append(space);

		sWrap.style.width = 110;
		dWrap.style.width = 90;
		cWrap.style.width = 70;

		cWrap.addEventListener('click',_=>{
			App.route('archive--init');
		})
		wrapper.append(sWrap);
		wrapper.append(dWrap);
		wrapper.append(cWrap);


		M.footer.append(wrapper);
	}

	function select_location(){
		let shadow = document.createElement('div');
		   shadow.style.width = window.innerWidth ;
		   shadow.style.height = window.innerHeight ;

		   shadow.classList.add('handi-shadow');
			shadow.addEventListener('click',function(e){
				if(e.originalTarget == this)
				 this.remove();
			})

		let map = _cl('div');
		map.classList.add(prefix + 'select-map');
			console.log(M.body);	
		let style = window.getComputedStyle(M.body);
		let bodyWidth =parseInt( style.getPropertyValue('width'));
		let bodyHeight =parseInt (style.getPropertyValue('height'));


		map.style.height = bodyHeight  -20; 

		map.style.width = bodyWidth -40;

		
		map.id = prefix + 'select-map';	
		shadow.append(map);

	       	document.body.append(shadow);

		let mp=L.map(map,{zoomControl : false}).setView([34.70815,46.45460], 15);


        	L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
                         attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
                   maxZoom: 18,
                   id: 'mapbox/streets-v11',
                   tileSize: 512,
                    zoomOffset: -1,
                      accessToken: 'pk.eyJ1IjoiMWlvMWwiLCJhIjoiY2psNThyd3luMGVsMjN4bnR3bXc4MXV2cyJ9.ks2qVsrV6d1rXu54-CyqIw'
                }).addTo(mp);
	         


                 new L.Control.Zoom({position:'bottomright'}).addTo(mp);
	  	
		let newMarker;
		

		 var myIcon = L.icon({
			    iconUrl:getLink('pin.png'),
			   
			    iconSize: [20, 35],
                });

		mp.on('click',(e)=>{
			
			if(newMarker)
				mp.removeLayer(newMarker);
			location = e.latlng;
			 newMarker = new L.marker(e.latlng,{icon: myIcon}).addTo(mp);	
		})

	}
	

	function add_hash(){
	
	}


	 function add_details() {

	   let shadow = document.createElement('div');
	   shadow.style.width = window.innerWidth + 'px';
	   shadow.style.height = window.innerHeight + 'px';
		
		 shadow.addEventListener('click',function(){
		 	this.remove();
		 })
	   shadow.classList.add('handi-shadow');

	   let inputContainer  = document.createElement('div');
	   inputContainer.classList.add('handi--details-addContainer');
	   
	   let style = window.getComputedStyle(M.body);
           let bodyWidth =parseInt( style.getPropertyValue('width'));
	   let bodyHeight =parseInt (style.getPropertyValue('height'));

		

	   let wrapper = document.createElement('div');
	   wrapper.classList.add(prefix + 'details-wrapper');
		
		wrapper.addEventListener('click',function(e){
			e.stopPropagation();
		})

	   inputContainer.style.width =  bodyWidth ;	
	   inputContainer.style.marginTop = 60;
	   let detailsInput = ['title','description','tags','price'];

	   detailsInput.forEach(function(el){
	      let input = document.createElement('input');
	      input.type = 'text';
	      input.id = 'handi--details-' + el + 'Input';
	      input.placeholder = el;
	      input.classList.add('handi--details-inputs');
	      inputContainer.appendChild(input);
	   })

	   let inpts = inputContainer.children;
	   Array.from(inpts).forEach(function(el){
	      el.onclick = function(e){e.stopPropagation();}
	   })

	   let submit = document.createElement('div');
	   submit.classList.add('handi--details-submit');
	   submit.innerHTML = 'Add';


	   submit.addEventListener('click',function(){
	   	Add();
		   shadow.remove();
	   });

	   inputContainer.appendChild(submit);
	   //shadow.addEventListener('click',_close_shadow);
	wrapper.append(inputContainer);

	  shadow.appendChild(wrapper);
	   document.body.appendChild(shadow);

	 }
	


	function Add(){
	   let detailsInput = ['title','description','tags','price'];

		
		//let details = {};
		

		detailsInput.forEach(function(el){
			let id = 'handi--details-' + el + 'Input';

			details[el] = document.getElementById(id).value;

		})

		
	}

	function startUpload(){
	
		let index = 0;
		let offset = 0;
		let chunkSize = 512;
		let offSize ;
		let numberOfFiles ;

	

		let x = location.lat;
		let y = location.lng;


		if(files)
			numberOfFiles = files.length;
		

	

		let prepareUpload = {
		
			nfile : numberOfFiles,
			x : x,
			y : y,
			price : details['price'],
			tags : details['tags'],
			title : details['title'],
			text : details['description'],
			action : 'insert'
		};

	
		let fileReader = new FileReader();

		let readSlice = function(i){
			

			if(!files[i]) return;

			if((files[i].length -1) < i) return;
			
			chunkSize = files[i].size;
			
			if(offset + chunkSize > files[i].size){
			
				offSize = files[i].size - offset;
				
			}else{
				
				offSize = offset + chunkSize;
			
			}
		

			let slice = files[i].slice(offset,offSize);

			fileReader.readAsArrayBuffer(slice);
		
		}

		fileReader.addEventListener('load',function(e){
			
			let arrayBuffer = new Uint8Array(e.target.result);
			let buff = Array.from(arrayBuffer);
		
			let jObject = {
			
				data : buff,
				total : files[index].size,
				len : e.target.result.byteLength,
				filename : files[index].name,
				action : "upload"
				
			}

			ws.send(JSON.stringify(jObject));

			if(offSize <= offset + chunkSize){
				
				index +=1;
				offset = 0;
			}else {
				
				offset +=e.target.result.byteLength;
			
			}			

			readSlice(index);

				
		})
		

		console.log(prepareUpload);
		ws.send(JSON.stringify(prepareUpload));
		readSlice(0)

	
	}
	function _getInputFiles(e){

		const partitionSize = 100;
		files = e.target.files;
		

		let fileContainer =  document.createElement('div');
		fileContainer.classList.add(prefix + 'body-upload');
		
		let style = window.getComputedStyle(M.body);
		let bodyWidth =parseInt( style.getPropertyValue('width'));
		let bodyHeight = (style.getPropertyValue('height'));


		fileContainer.style.width = bodyWidth -20;
		//fileContainer.style.height = bodyHeight - 40;

		M.body.append(fileContainer);

		if(config.dir){

			fileContainer.style.direction = 'rtl';
		}


		for (let i = 0 ; i < files.length ; i++){

			let wrapper = _cl('div');
			wrapper.classList.add(prefix + 'filecontainer-wrapper');


			let image = new Image();

			image.style.display = 'none';


			let canvas = _cl('canvas');

			fileContainer.append(wrapper);
			let reader = new FileReader();


			reader.onload = function(e){

				image.src = e.target.result;
				image.onload = function(){
					let width  =this.width;
					let height = this.height;


					if(width > height){
						canvas.width = partitionSize;
						canvas.height = height/width * partitionSize;

						canvas.style.marginTop = (partitionSize - canvas.height)/2;
					}else{

						canvas.height = partitionSize;
						canvas.width = width/height * partitionSize;

						canvas.style.marginLeft = (partitionSize - canvas.width )/2;
					}

					canvas.classList.add(prefix + 'selected');


					canvas.selected = 1;
					canvas.addEventListener('click',()=>{
						if(canvas.selected){
							canvas.classList.remove(prefix + 'selected');
							canvas.classList.add(prefix + 'unselected');
							canvas.selected = 0;
							updateSelection(0);
						}else{
							canvas.classList.remove(prefix + 'unselected');
							canvas.classList.add(prefix + 'selected');
							canvas.selected = 1;
							updateSelection(1);
						}
					})


					wrapper.append(canvas);

					let cantx = canvas.getContext('2d');

					cantx.drawImage(this,0,0,canvas.width,canvas.height);
				}

			}


			reader.readAsDataURL(input.files[i]);


		}

		 select.innerHTML  = files.length;
		 remove.innerHTML = 0;
		

		selected = files.length;
		unselected = 0;
	}

	function updateSelection(sel){
	
		if(sel){
			select.innerHTML = ++(selected);	
			remove.innerHTML = --(unselected);
		}else {
		
			select.innerHTML = --(selected);	
			remove.innerHTML = ++(unselected);
		
		}
	
	}

	function createUploadContainer(){}

	let Controller = (function(){
		let prefix = 'upload--';

		let routes = [];

		let route1 = {
		
			route : prefix + 'init',
			url : '',
			dependencies : ['handi--init'],
			used : 0
		};

		R.registerEvent(prefix + 'completed');
		R.addEventListener(prefix + 'completed',function(e){
			console.log(e);
		});
		
		routes.push(route1);


		let Router = function(route){
			
			switch(route){
				case 'init':
					View.init();
					break;
				default:
					break;

			}
		
		}

		return {
			Router : Router,
			routes : routes
		}
	})();
	

	App.Add(Controller);


})()

let Show = (function(){
	
	let inited = 0;
	let parent ;	
	let prefix = 'handi--';
	let M; 
	
	let location;

	let View = {
		configure : function(){
			M = Main.Parts();			
			parent = M.body;	
		},
		init : function(){
	

			inited = 1;
			this.configure();
			this.template();
		},

		template : function(){
			createHeader();	
			createContainer();
			createFooter();

			show_thumbs();

			//_menu();
		}

	
	}


	function createHeader(){
		//document.getElementsByClassName('handi--header')[0].innerHTML = '';
	 	M.header.innerHTML = '';
		let back = document.createElement('div');
		back.classList.add('handi--header-backHome');
		let image = new Image();
		image.classList.add('handi--header-backHomeImg');
		image.src = getLink('home.png');
		back.addEventListener('click',_=>{
			ws.send(JSON.stringify({username : 'naro',action : 'archive'}));	
		});
		
		M.header.classList.remove('noborder');
		let username = document.createElement('div');

		username.innerHTML = 'naro';

		username.classList.add(prefix + 'username');
		username.addEventListener('click',createMenu);
		back.appendChild(image);

		M.header.append(back);
		M.header.append(username);
	}

	
	function createMenu(){
		let items = ['Archive','Location','Contact','About','Statistic'];	
		let menu = M.createMenu();
	
		for(let i = 0; i < items.length ; i++){
		
			let item = document.createElement('div');
			item.innerHTML = items[i];
			item.classList.add(prefix + 'menu-item');
			menu.append(item);
		}
	
	}

	function createContainer(){
		
		document.getElementsByClassName('handi--body')[0].innerHTML = '';

	     _create_model_view(M.body);	

	}

	function createFooter(){
		document.getElementsByClassName('handi--footer')[0].innerHTML = '';

		M.footer.innerHTML = '';
	
	}

	 function _create_model_view(el){

		let preview = document.createElement('div');
	       _create_model_preview(preview);

	       let space = document.createElement('div');
	       _create_model_space(space);

	       let thumbContainer = document.createElement('div');
	       _create_model_thumbs(thumbContainer);
   }

   function _create_model_preview(el){
  
	     el.style.width = '100%';
	     el.style.height  = calculateHeight();
	     el.id = 'handi--container-preview';
	     M.body.append(el); 
	   //View.handiModel.appendChild(el);

   }

   function _create_model_space(el){
	     
	     el.style.width = '100%';
	     el.style.height = 40 ;

	     _create_model_space_buttons(el);
	     M.body.append(el);

   }

   function _create_model_thumbs(el){
		
	 el.id = 'handi--container-thumbs';

	   let container = document.createElement('div');
	   container.classList.add('handi--thumb-container');
	container.append(el);

	    	     
	   M.body.append(container);

   }

	function slide_back(){
		let thumbContainer = document.getElementById('handi--container-thumbs');	
		let container = document.getElementById('handi--thumb-container');

		let model = Database.Show.Model();
		
		let style = window.getComputedStyle(thumbContainer);
		let left =parseInt( style.getPropertyValue('left'));
	
		


		if(isMobile()){
			if( model.urls.length * 100 > M.width ){
				let howMuch = left + 2 *100;
				if(howMuch > 0){
				 	howMuch = 0;
				}

				thumbContainer.style.left= howMuch;
			} 
		}else {
			if( model.urls.length * 130 > M.width ){
				let howMuch = left + 2 *130; 
				if(  howMuch > 0) {
					howMuch = 0;
		
				}
		

				thumbContainer.style.left= howMuch;
			} 
			
		
		}
	}



	function slide_next(){
		let thumbContainer = document.getElementById('handi--container-thumbs');	
		let container = document.getElementById('handi--thumb-container');

		let model = Database.Show.Model();
		
		let style = window.getComputedStyle(thumbContainer);
		let left =parseInt( style.getPropertyValue('left'));
	

		if(isMobile()){
			if( model.urls.length * 100 > M.width ){

				let howMuch = left - 2 *100;
				if((M.width- howMuch) >  model.urls.length * 100) 
					howMuch =left -((model.urls.length * 100) -(M.width - left));

				console.log('howmuch  ' + howMuch);
                               
				console.log('width - howMuch ' + (M.width - howMuch));
				console.log('total length'+model.urls.length * 100);
				console.log('width is ' + M.width);
				thumbContainer.style.left= howMuch;
			} 
		}else {
			if( model.urls.length * 130 > M.width ){
				let howMuch = left - 2 *130;
				console.log('howmuch  ' + howMuch);
				console.log('width - howMuch ' + (M.width - howMuch));
				console.log('total length'+model.urls.length * 130);
				if((M.width- howMuch) > model.urls.length * 130) 
					howMuch = left-((model.urls.length * 130) -(M.width - left))
				if(-left ==( model.urls.length * 130 - M.width)) return; 
				console.log('new left and howMuch ' + left + ' ' + howMuch);
				thumbContainer.style.left= howMuch;
			} 
			
		
		}
	}

	
	function _create_model_space_buttons(parent){
	     
	     let buttonContainer = document.createElement('div');
	     buttonContainer.classList.add('handi--container-spaceContainer');

	     let upload = document.createElement('div');
	     let details = document.createElement('div');

	     upload.classList.add('handi--container-spaceCart');
	     upload.innerHTML = 'add to cart';
	     details.innerHTML = 'details';

	     buttonContainer.appendChild(upload);
	     buttonContainer.appendChild(details);
		
		
		let n = new Image();

		n.src = getLink('n.png');

		n.classList.add('handi--basket-next');

		let b = new Image();
		b.src = getLink('b.png');
		b.classList.add('handi--basket-back');
		
		n.addEventListener('click',slide_next);
		b.addEventListener('click',slide_back);

		parent.append(n);
		parent.append(b);



	     Array.from(buttonContainer.children).forEach((child,index)=>{
	       child.classList.add('handi--container-spacebtns') ;
	  /*     child.addEventListener('mouseenter',_handle_upload_btns_mouseenter.bind(child));
	       child.addEventListener('mouseleave',_handle_upload_btns_mouseleave.bind(child)); */
	     })

	     upload.addEventListener('click',function(){
	
			Database.Basket.Add(Database.Show.Model());
	      });

	     details.style.borderTop = '2px solid black';
	     parent.appendChild(buttonContainer);

  	}

	  function calculateHeight(){
	  
		return (config.height - 180 -40 -40 );
	  }
		
	

	
	function show_thumbs(){
	
		let model = Database.Show.Model();
		let container = document.getElementById('handi--container-thumbs');	
		if(isMobile())
			container.style.width = model.urls.length * 100;
		else 
			container.style.width = model.urls.length * 130;

		model.urls.forEach(url=>{
			_load_file(url.url);
		})

		_preview_firstone(model.urls[0].url);

	}
	 function _load_file(url){
		  
		 let image = new Image();
		  image.mSize = 100;
		  image.dSize = 130;
		  image.addEventListener('load',_load_template_for_thumb);
		  image.src =  getImage(url);

		  image.name = url;
		  image.filename = url;
		  
	}

	function _load_canvas(image){ 
	   
	  let width = image.width;
	  let height = image.height;
	  
	  let orientation = image.orient;
	  
	  let mSize = image.mSize;
	  let dSize = image.dSize;
	  
	  let canvas = document.createElement('canvas');
	  canvas.name = image.name;

	  if( 4 < orientation && orientation < 9){
	    if(width > height){
	       if(isMobile()){
		   height = mSize * height/width;
		   width = mSize;
	       }else{
		    height  =  dSize * height/width ;
		   width = dSize;
	       }
	    }else{
	       if(View.isMobile()){
		  width = parseInt(mSize * (width/height));
		  height = mSize;
	       }else{ console.log('2');
		  height = parseInt(dSize * (width/height));
		  width = dSize; 
		} 
	    }

	  canvas.height = width; 
	  canvas.width = height; 
	  }else{
	       if(width > height){
		 if(isMobile()){
		    height = parseInt((mSize  )*(height/width));
		    width = mSize  ;
		 }else{        
		   height   = parseInt(dSize * height/width);
		   width = dSize;
		 }
	      }else{
		if(isMobile()){ 
		   width = parseInt(mSize * (width/height));
		   height = mSize;
		}else{
		   width = parseInt(dSize * (width/height));
		   height = dSize;
		} 
	    }

	   canvas.width = width ;
	   canvas.height = height;
	  }


	  image.width = width;
	  image.height = height;

	  let ctx = canvas.getContext('2d');
	  ctx.drawImage(image,0,0,width ,height );
	 
	  return canvas;
	}
			     


	function _load_template_for_thumb(e){
	  let image = e.target;

	  let mSize = image.mSize;
	  let dSize = image.dSize;

	  let preview = document.createElement('div');

	  let canvas = _load_canvas(image);

	  if(image.name)
	    canvas.gallery = image.name;
	  if(image.filename)
	   canvas.name =image.filename;

	  if(image.src)
	    canvas.src = image.src;

	  preview.appendChild(canvas);

	  let marginTop ;
	  let marginLeft;

	  if(isMobile()){
	     marginLeft = parseInt(mSize - canvas.width)/2;
	     marginTop = parseInt(mSize - canvas.height)/2;
	     preview.style.width = mSize + 'px';
	     preview.style.height = mSize + 'px';
	  }else{
	     marginLeft = parseInt(dSize - canvas.width)/2;
	     marginTop = parseInt(dSize - canvas.height)/2;
	     preview.style.width = dSize + 'px';
	     preview.style.height = dSize + 'px';
	  }

	  canvas.style.marginTop = marginTop + 'px';
	  canvas.style.marginLeft = marginLeft + 'px';

	  preview.style.marginTop = 5 + 'px';
	  preview.style.marginRight = 10 + 'px';
	  preview.name = image.name;
	  preview.classList.add('handi--container-thumbs');
	  canvas.style.borderBottom = '2px solid green';

	  if(image.filename)
	     canvas.addEventListener('click',_preview_file);
	  
	 

	 document.getElementById('handi--container-thumbs').appendChild(preview);
	}



	function _preview_file(e){
		let canvas = e.target;

	   let image = new Image();
	   image.gallery = canvas.gallery;
	   image.name = canvas.name;
	   image.mSize = parseInt(config.width  );
	   image.dSize =parseInt(config.height -260 - 20);
	   image.pType = 'file';
	   image.addEventListener('load',_load_template_for_show);
	   image.src = canvas.src;
	}

	
	function _preview_firstone(url){
		
		let image = new Image();
	   image.gallery = null;
	   image.name = url;
	   image.mSize = parseInt(config.width );
	   image.dSize =parseInt(config.height -260 - 20);
	   image.pType = 'file';
	   image.addEventListener('load',_load_template_for_show);
	   image.src = getImage(url);
 
	}

 
	function _load_template_for_show(e){
	  
	  let image = e.target;

	  let mSize = image.mSize -20 ;
	  let dSize = image.dSize;
	 
		image.mSize -=20;

	  let preview = document.createElement('div');
	  
	  let canvas = _load_canvas(image);
	  preview.appendChild(canvas); 
	  
	  let marginTop ;
	  let marginLeft;

	  if(isMobile()){
	     marginLeft = parseInt(mSize - canvas.width )/2;
	     marginTop = parseInt(mSize - canvas.height)/2;   
	     preview.style.width = (mSize ) + 'px';
	     preview.style.height = (mSize )+ 'px';
	  }else{
	     marginLeft = parseInt(dSize - canvas.width)/2;
	     marginTop = parseInt(dSize - canvas.height)/2 ;
	     preview.style.width = dSize + 'px';
	     preview.style.height = (dSize )  + 'px';
	  }
	  
	  if(image.pType == 'file') { 
	    canvas.src = image.src;
	    canvas.name = image.name;
	    canvas.gallery = image.gallery;
	   }
	   

	   if(isMobile()){
	     canvas.style.marginLeft = marginLeft + 'px';
	   }else
	   canvas.style.marginLeft = marginLeft + 'px';

	   canvas.style.marginTop = marginTop + 'px';
	   canvas.top = marginTop;
	   canvas.addEventListener('click',_slide_canvas);
	   preview.style.margin = 'auto';  
	   
	   document.getElementById('handi--container-preview').innerHTML = '';
	   document.getElementById('handi--container-preview').appendChild(preview);
	}


	function _slide_canvas(e){
	   	let elem = e.target;
	 
		  elem.parentElement.remove();


	  	  ex(elem);
	 
	}
	
	function show_details(){
		
		let model = Database.Show.Model();
	
		let details = document.createElement('div');
	
		let title = document.createElement('div');
		let text  = document.createElement('div');
		let price = document.createElement('div');

		details.classList.add(prefix + 'show-details');	

		title.classList.add(prefix + 'show-title');
		text.classList.add(prefix + 'show-text');
		price.classList.add(prefix + 'show-price');
		

		title.innerHTML = model.title;
		text.innerHTML = model.text;
		price.innerHTML = model.price || '500';

		details.append(title);
		details.append(text);
		details.append(price);
		
		let elem = document.getElementById('handi--container-preview');
		
		if(isMobile()){
			details.style.marginLeft = 10;
			details.style.marginTop = 20;
		}else {
			details.style.marginLeft = 20;
		}

		elem.append(details);	

	}

	function ex(el){
	  
	  let width = el.width;
	  let height = el.height;
	  let top = el.top;

			
	  let bWidth = (config.width > 800) ? 800 : config.width ;

		 
	  let src = el.src;
	  if(isMobile()){
	    	left = parseInt((bWidth - width)/2) ;   
	   }else
	   	left = parseInt((bWidth - width)/2) ;
	   
	  let style = window.getComputedStyle(el) ;
	  
	  
	  let type = width > height ? 'width' : 'height';
	  let steps = (type == 'width') ? parseInt( top/10) : parseInt( left/10);
	  
	  let xStep = parseInt(left/steps);
	  let yStep = parseInt(top/steps);
	  
	  let max = Math.max(width,height);

	  let nWidth = parseInt(width);
	  let nHeight =parseInt( height);

	 let promise = function(time){

	   setTimeout(function(){
	      if(top == 0 && left == 0) {
		  let elem = document.getElementById('handi--container-preview').firstChild;
		  elem.style.float = 'left';
		show_details(el);
		  return;
	      }          
		
	      let image = new Image();
	      image.onload = function(){
		document.getElementById('handi--container-preview').innerHTML = '';        

		let canvas = document.createElement('canvas');
		canvas.style.position = 'relative';       
	      
		canvas.width = nWidth;
		canvas.height = nHeight;      
	       
		if(yStep == 0){
		  let df =( height - 300)/steps;

		  this.height = nHeight - df;
		  this.width = nWidth - df * (width/height);
		  
		  canvas.style.height = nHeight - df + 'px';
		  this.width = nWidth -df * (width/height);
		  nWidth -= df * (width /height);
		  nHeight -= df;
		}else {
		    if(Math.max(nHeight,nWidth)> 300) {
		      let df = (width - 300)/steps;             

		      this.height = nHeight - df * (height/width);
		      this.width = nWidth -df ;
		      canvas.style.height = nHeight - df * (height/width)  + 'px';
		      canvas.style.width =(nWidth - df ) + 'px';

		      nHeight -= df * (height/width);
		      nWidth -= df;
		 }
		}
		

		let ctx = canvas.getContext('2d');
		ctx.drawImage(image,0,0,nWidth,nHeight);
	  
		canvas.style.left = (left - xStep) > 0 ? (left - xStep) + 'px' : 0;
		canvas.style.top = (top - yStep) > 0 ? (top - yStep) + 'px' : 0;

		top = (top - yStep) > 0 ? (top - yStep) : 0;
		left = (left -xStep) > 0 ? (left -xStep) : 0;       
	       
		document.getElementById('handi--container-preview').appendChild(canvas);
	   
		promise(time);
	      }

	      image.src = src;

	   },time)
	 }
	  
	 if (type == 'width')
	   promise(10);
	 else 
	   promise(1);
	 
	 }




	let Controller = (function(){
		let prefix = 'show--';

		let routes = [];

		let route1 = {
		
			route : prefix + 'init',
			url : 'product',
			dependencies : ['handi--init'],
			used : 0,
			data : true
		};

	/*	R.registerEvent(prefix + 'completed');
		R.addEventListener(prefix + 'completed',function(e){
			console.log(e);
		});*/
		
		routes.push(route1);


		let Router = function(route){
			
			switch(route){
				case 'init':
					View.init();
					let model = Database.Show.Model();
					pushState({},'show','/product/' + model.id);
					break;
				default:
					break;

			}
		
		}

		return {
			Router : Router,
			routes : routes
		}
	})();
	

     App.Add(Controller);

})()


document.addEventListener('DOMContentLoaded',_=>{
	
	App.start();
})

