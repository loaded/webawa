
let Home = function(){
  

	let prefis ;
	let dir;
	let main;
	let header;


	let host = 'localhost:7681';


     let config = {
       ww : '',
       wh : '',
       lang : 'en',
       dir : 1,
       prefix : 'profile--'
     }

	
	let sug = ['cooking','car','worker','teacher','else'];


 
    let View = {
             construct : function(){
	      this.setTemplate(); 	     
	    },
	    configure :function(){
              this.ww = config.ww ||  window.innerWidth;
	      this.wh = config.wh ||  window.innerHeight;
	      
              dir = config.dir || 0;
	      prefix = config.prefix ;
	    },
	    init : function(){
	
	      this.configure();
              this.construct();
	      this.setHeader();
	      this.setBody();	      
	    },
	    setTemplate :function(){
	       set_template();
	    },
	    setHeader :function(){
	        set_header();
	  
	    },
	    setBody : function(){ 
	      set_body();
  	     
	    
	    }
    }


    function set_template(){
         main = document.createElement('div'); 
         main.classList.add(prefix + 'main');

         document.body.append(main);
    }
  
   function set_header(){
    
           header = document.createElement('div');

	   header.classList.add(prefix + 'header-home');

	   let search = document.createElement('input');


	   search.classList.add(prefix + 'search');
          

	   let suggestion = document.createElement('div');
	   suggestion.classList.add(prefix + 'suggestion');

	   
          
      
	   for(let i = 0 ; i < sug.length ; i++){
	   
	     let div = document.createElement('div');
		   div.innerHTML = '#' +sug[i];
                   div.classList.add(prefix + 'hash');
		   suggestion.append(div);
		   if(dir){
		      div.classList.add(prefix + 'float-right');
		   }		   
	   }

	   header.append(search);
	   header.append(suggestion);

	   main.append(header);	   
   }

  function set_body(){
  
    let body = document.createElement('div');
    body.classList.add(prefix + 'body-home');
     
	  main.append(body);


  	   let map=L.map(body,{zoomControl : false}).setView([35.70815,51.45460], 15);

	   View.map = map;

        	L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
                         attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
                   maxZoom: 18,
                   id: 'mapbox/streets-v11',
                   tileSize: 512,
                    zoomOffset: -1,
                      accessToken: 'pk.eyJ1IjoiMWlvMWwiLCJhIjoiY2psNThyd3luMGVsMjN4bnR3bXc4MXV2cyJ9.ks2qVsrV6d1rXu54-CyqIw'
}).addTo(map);
		
/*

            L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
              attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
              maxZoom: 18,
              id: 'mapbox.streets',
                accessToken:             }).addTo(map);  */




  new L.Control.Zoom({position:'bottomright'}).addTo(map);    




  }


	function popUp(e,model){
	
	  alert(e);
	}

   let Controller = (function(){
          
     View.init();
  

	   let models = [{
		   location : [35.6705594,51.4780219]
	   }]

	 for(let i = 0 ; i < models.length ; i++){
	 

		 new L.Marker(models[i].location).addTo(View.map).on('click',function(e){
		   popUp(e,models[i]);
		 })
	 
	 }
   
   })()



 

}





let Admin = function(){



  let prefix ;
  let dir ; 
  let main;
  let header ; 
  
  let host = 'localhost:3000';


   let response = {
     name : 'Aein O aldin sarbazi',
     address : '09224563243 , amail.moc@gmail.com',
     link : 'ocean01.ir'
   }

  let config = {
     ww : '',
     wh : '',
     lang : 'en',
     dir : 1,
     prefix : 'profile--'
  }
 
   let links = {
       'profile-image' : 'me.png',
       'profile-back' : 'hbck.png',
       'profile-back-r' : 'hnxt.png'
    }

    let View = {
             construct : function(){
	      this.setTemplate(); 	     
	    },
	    configure :function(){
              this.ww = config.ww ||  window.innerWidth;
	      this.wh = config.wh ||  window.innerHeight;
	      
              dir = config.dir || 0;
	      prefix = config.prefix ;
	    },
	    init : function(){
	
	      this.configure();
              this.construct();
	      this.setHeader();
	      this.setBody();	      
	    },
	    setTemplate :function(){
	       set_template();
	    },
	    setHeader :function(){
	        set_header();
	  
	    },
	    setBody : function(){ 
	      set_body();
  	     
	    
	    }
    }


    function set_template(){
         main = document.createElement('div'); 
         main.classList.add(prefix + 'main');

         document.body.append(main);
    }

    function set_header(){
            header = document.createElement('div');
	    header.classList.add(prefix + 'header');

	    let image = new Image();
	    image.src = getLink('profile-image');
	    let whichClass = (dir ? 'left' : 'right');
	   
            image.classList.add(prefix +'image-'+ whichClass);
            image.classList.add(prefix + 'image' );
            
    
	    let back = new Image();

	    if(dir)
		    back.src = getLink('profile-back-r');
	    else 
	      back.src = getLink('profile-back');

	    back.classList.add(prefix + 'back');
	    back.classList.add(prefix + 'back-' + whichClass);

            header.append(image);
	    header.append(back);
	   
	  
	    main.append(header);
    }



  function set_body(){
     let bodyContainer = document.createElement('div');

	  let password = document.createElement('input');
	  let location = document.createElement('input');

	  bodyContainer.classList.add(prefix + 'body');

	  password.classList.add(prefix + 'body-password');
	  location.classList.add(prefix + 'body-location');

          
          password.placeholder = '**********'

          location.placeholder = '34.380,47.813'
         
          let passwordLabel = document.createElement('div');
	  let locationLabel = document.createElement('div');
  

	  passwordLabel.classList.add(prefix + 'body-label');
	  locationLabel.classList.add(prefix + 'body-label');

	  passwordContainer = document.createElement('div');
	  locationContainer = document.createElement('div');


	  passwordContainer.classList.add(prefix + 'body-passContainer');
          locationContainer.classList.add(prefix + 'body-locContainer');


	  passwordLabel.innerHTML = 'change password';

	  locationLabel.innerHTML = 'your location'

          passwordContainer.append(passwordLabel);
	  passwordContainer.append(password);


	  locationContainer.append(locationLabel);
	  locationContainer.append(location);


          bodyContainer.append(passwordContainer);
	 
	  bodyContainer.append(locationContainer);

        main.append(bodyContainer);

  
  }


  function getLink(x){
      return 'http://' + host + '/public/arrow/' + links[x];
   }

 
   let Controller = (function(){
	   document.body.innerHTML = '';
        View.init();
   })()  

}

 /*                     --------------------------------------------                         */

let Profile = function(){

   
    let config = {
      ww : '',
      wh : '',
      lang : 'en',
      dir : 0,
      prefix : 'profile--'
    }


    let links = {
       'profile-image' : 'me.png',
	'profile-back' : 'hbck.png',
	'profile-back-r' : 'hnxt.png'
    }


   let response = {
     name : 'Adnan Moradi',
     address : '09038801599 , amail.moc@gmail.com',
     link : 'ocean01.ir'
   }

    let main,header,body ;
    let dir ; 
    let prefix ; 
    let host = 'localhost:7681' ; 

    let View = {
             construct : function(){
	      this.setTemplate(); 	     
	    },
	    configure :function(){
              this.ww = config.ww ||  window.innerWidth;
	      this.wh = config.wh ||  window.innerHeight;
	      
              dir = config.dir || 0;
	      prefix = config.prefix ;
	    },
	    init : function(){
	
	      this.configure();
              this.construct();
	      this.setHeader();
	      this.setBody();	      
	    },
	    setTemplate :function(){
	       set_template();
	    },
	    setHeader :function(){
	        set_header();
		info_header();
	    },
	    setBody : function(){
	      set_body();
		    set_body_header();
	      add_hash();
	    }
    }


    function set_template(){
         main = document.createElement('div'); 
         main.classList.add(prefix + 'main');

         document.body.append(main);
    }

    function set_header(){
            header = document.createElement('div');
	    header.classList.add(prefix + 'header');

	    let image = new Image();
	    image.src = getLink('profile-image');
	    let whichClass = (dir ? 'left' : 'right');
	   
            image.classList.add(prefix +'image-'+ whichClass);
            image.classList.add(prefix + 'image' );
            
            image.addEventListener('click',__profile);
	    let back = new Image();

	    if(dir)
		    back.src = getLink('profile-back-r');
	    else 
	      back.src = getLink('profile-back');

	    back.classList.add(prefix + 'back');
	    back.classList.add(prefix + 'back-' + whichClass);

            header.append(image);
	    header.append(back);
	   
	  
	    main.append(header);
    }


       
  function __profile(){}

   	
   function info_header(){
   
      let container = document.createElement('div');
	   container.classList.add(prefix  + 'info');
	   header.append(container);


	   let name = document.createElement('div');
	   name.classList.add(prefix + 'info-name');
	   name.innerHTML = response.name

	   container.append(name);


	   let address = document.createElement('div');
	   address.classList.add(prefix + 'info-address');
	   address.innerHTML = response.address;

	   container.append(address);


	   let link = document.createElement('div');
	   link.classList.add(prefix + 'info-link');
	   link.innerHTML = response.link;

	   container.append(link);


	   if(dir){
	   
               name.classList.add(prefix + 'float-right');
		   name.classList.add(prefix + 'right');
		   address.classList.add(prefix + 'float-right');
		   address.classList.add(prefix + 'right');

		   link.classList.add(prefix + 'float-right');
		   link.classList.add(prefix + 'right');
	   }
      
   }	
  
   function set_body(){
      body = document.createElement('div');
	   body.classList.add(prefix + 'body');
	   main.append(body);
   }
   function set_body_header(){
     let header = document.createElement('div');
	   header.classList.add(prefix + 'body-header');
	   body.append(header);

	   let edit = document.createElement('div');
	   edit.classList.add(prefix + 'body-editHeader');

	   edit.innerHTML = 'edit profile';

	   let addHash = document.createElement('div');
	   addHash.classList.add(prefix + 'body-hashHeader');
	   
	   addHash.innerHTML = 'add hash';
           

	   addHash.addEventListener('click',create_hash);
	   edit.addEventListener('click',edit_profile);


	   header.append(edit);
	   header.append(addHash);

	   if(dir){
	      addHash.classList.add(prefix + 'float-right');
	      edit.classList.add(prefix + 'float-right');
	      addHash.style.marginRight = 10 + 'px'; 
	   }
   }

   function edit_profile(evt){

      document.getElementsByClassName(prefix + 'body-editHeader')[0].remove();

      document.getElementsByClassName(prefix + 'body-hashHeader')[0].style.marginLeft = 0;
     let save = document.createElement('div');
	   save.classList.add(prefix + 'box-saveI');
           save.innerHTML = 'save'
	   let cancel = document.createElement('div');
	   cancel.classList.add(prefix + 'box-cancelI');
           cancel.innerHTML = 'cancel';   
 

          let infoName = document.createElement('input');
	   let infoAddress = document.createElement('input');
	   let infoLink = document.createElement('input');
            
            
           infoName.classList.add(prefix + 'info-nameI');
	   infoAddress.classList.add(prefix + 'info-addressI');
	   infoLink.classList.add(prefix + 'info-linkI');

	   let infoNameDiv = document.getElementsByClassName(prefix + 'info-name')[0];
	   let infoAddressDiv = document.getElementsByClassName(prefix + 'info-address')[0];
	   let infoLinkDiv = document.getElementsByClassName(prefix + 'info-link')[0];

	   infoName.value = infoNameDiv.innerHTML;
	   infoAddress.value = infoAddressDiv.innerHTML;
	   infoLink.value = infoLinkDiv.innerHTML;


	   let info = document.getElementsByClassName(prefix + 'info')[0];
           info.innerHTML = '';
 


          if(dir) {
	    infoName.classList.add(prefix + 'right');
	     infoAddress.classList.add(prefix + 'right');
	     infoLink.classList.add(prefix + 'right');

             save.classList.add(prefix + 'float-left');
	     cancel.classList.add(prefix  + 'float-left');
	    cancel.style.marginLeft = 10 + 'px';		  

             document.getElementsByClassName(prefix + 'body-header')[0].append(save)
             document.getElementsByClassName(prefix + 'body-header')[0].append(cancel)

	     }else {
	        document.getElementsByClassName(prefix + 'body-header')[0].append(cancel)
                document.getElementsByClassName(prefix + 'body-header')[0].append(save)
	     }

	   info.append(infoName);
	   info.append(infoAddress);
	   info.append(infoLink);

	   infoName.focus();


   }


   function create_hash(evt){
             let source = evt.target;
	   source.style.display = 'none';
	    let box = document.createElement('div');
	    box.classList.add(prefix + 'box-hash');

	    let input = document.createElement('input');
	    input.classList.add(prefix + 'box-input');

	    let text = document.createElement('textarea');
            text.classList.add(prefix + 'box-textarea');

	    box.append(input);
	    box.append(text);
           
            document.getElementById(prefix + 'hash-container').remove();

	    body.append(box);

	   input.focus();


	   let save = document.createElement('div');
	   save.classList.add(prefix + 'box-save');
           save.innerHTML = 'save'
	   let cancel = document.createElement('div');
	   cancel.classList.add(prefix + 'box-cancel');
           cancel.innerHTML = 'cancel';
          if(dir){
	       input.classList.add(prefix + 'input-hashR');
  	       text.style.direction = 'rtl';
               save.classList.add(prefix + 'float-left');
	       cancel.classList.add(prefix  + 'float-left');
	       cancel.style.marginLeft = 10 + 'px';		  

               body.append(save)
               body.append(cancel);


	  }   else {
	    
	   body.append(cancel);
	   body.append(save);	  
	  }
   }

   function add_hash(){

          let hashes = ['cooking','car','sewing','learing','else'];


          let hashContainer = document.createElement('div');
          hashContainer.id =prefix + 'hash-container';

	   for(let i = 0 ; i < hashes.length ; i++){
	   
	     let div = document.createElement('div');
		   div.innerHTML = '#' + hashes[i];
                   div.classList.add(prefix + 'hash');
		   hashContainer.append(div);
		   if(dir){
		      div.classList.add(prefix + 'float-right');
		   }
	   }

         body.append(hashContainer);	
   }

   function getLink(x){
      return 'http://' + host + '/arrow/' + links[x];
   }

   function getText(x){
      return 'back';
   }
   
   let Controller = (function(){
          
     View.init(); 
   
   })()



}



window.onload = Profile 
