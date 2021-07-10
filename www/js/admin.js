
let Admin = function(){

let config = {
  ww : '',
  wh : '',
  lang : 'en',
  dir : 0,
  prefix : 'admin--'

}


let prefix = 'admin--';


let View = {

	init : function(){
	  this.configure();
 	  this.construct();

	},

	configure : function(){
	  this.ww = config.ww || window.innerWidth;
          this.wh = config.wh || window.innerHeight;

	  prefix = config.lang ;
	  dir = config.dir;
	},

	construct : function(){
	 this.setTemplate();
	},

	setTemplate : function(){
	  set_template();
	
	}
}




function set_template(){
  let admin = document.createElement('div');
  admin.classList.add(prefix + 'admin');
}

}



window.onload  = function(){
  Home();
}
