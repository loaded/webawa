
window.onload = function(){
//  let socket = io("localhost");
     
  var Handicraft = (function(){

    let Events = document.getElementById('handicraft');

    let View = {
      config : {
	el : document.getElementById('handicraft'),
        mainWith : window.innerWidth,
	mainHeight : window.innerHeight,
	desktop : 900,
	mainContainer : null,
	header : null,
        files : null,
        site : 'localhost',
        basket : [],
        currentView : 'archive'
      },

       init : function(){
         this.initialize();
	 this.setMainContainer();
	 this.setHeader();
         this.setMenu();	
      },
      
      initialize : function(){
        this.config.mainWidth = window.innerWidth ;
        this.config.mainHeight = window.innerHeight;
        this.config.el.style.width = this.config.mainWidth + 'px';
	this.config.el.style.height = this.config.mainHeight + 'px';        	
      },
      
      setHeader : function(){
        let header = document.createElement('div');
        header.classList.add('handi--header');
        
	this.config.header = header;     
	this.config.mainContainer.appendChild(header);

      },

      clearContainer : function(){
         
        let container=  document.getElementById('handi--' + this.currentView);
        if(container) {
         container.remove();
         this.config.header.innerHTML = '';
        }
      },

      headerUploadView : function(){
         this.headerUpload();
         this.headerBack();
      },

      headerBack : function(){
        let back = document.createElement('div');
        back.classList.add('handi--header-backHome');
        let image = new Image();
        image.classList.add('handi--header-backHomeImg');
        image.src = this.getHeaderLink('back-home');
        back.addEventListener('click',this.trigger.bind(this,'socket-archive'));
        back.appendChild(image);
        this.config.header.appendChild(back);
      },
   
      getHeaderLink : function(el){
          return 'http://' +  this.config.site + '/public/arrow/home.png';
      },

      getLink : function(path) {
          return 'http://' + this.config.site + path;
      },
      
      setMainContainer : function(){
        let container = document.createElement('div');
	container.classList.add('handi--container');
	if(this.isMobile()) 
	    container.style.width = this.config.mainWidth + 'px';
	else
	    container.style.width = this.config.desktop + 'px';
        	
	container.style.height = this.config.mainHeight + 'px';
	this.config.mainContainer = container;
	this.config.el.appendChild(container);
       
      },

      setMenu : function(){
       _menu();
      },
      
      isMobile : function(){
        return this.config.mainWidth < this.config.desktop
      },

      uploadView : function(){
         this.headerUploadView();
         let uploadContainer = document.createElement('div');
         uploadContainer.id = 'handi--upload';
         this.handiUpload = uploadContainer;  
         this.initUploadView(uploadContainer);
         this.config.mainContainer.appendChild(uploadContainer);
      },
    
       initUploadView : function(el){
            _createUploadView(el);  
       },      

      headerUpload : function(){
         let hash = document.createElement('div');
         hash.innerHTML = '#';
         hash.classList.add('handi--header-item');
         hash.style.marginTop = '8px';         
         let map = new Image();
         map.classList.add('handi--header-png');
         map.src = this.getLink('/public/arrow/a.png');
         
         let add = new Image();
         add.classList.add('handi--header-png');

         add.src= this.getLink('/public/arrow/add.png');
         
         add.addEventListener('click',function(e){
             $(View.input).trigger('click');
         })

         let edit = new Image();
         edit.classList.add('handi--header-png');
         edit.src = this.getLink('/public/arrow/edit.png');
         
         edit.addEventListener('click',_add_details);
         map.addEventListener('click',_select_location);
         hash.addEventListener('click',_add_hash); 
         this.config.header.appendChild(add);
         this.config.header.appendChild(map);
         this.config.header.appendChild(hash);
         this.config.header.appendChild(edit);
      },

      upload : function(data){

        let elements = document.getElementsByClassName('handi--container-thumbs');       
         
        Array.from(elements).forEach(function(elem){
            let shadow = document.createElement('div');
            shadow.classList.add('handi--container-thumbShadow');
            let style  = window.getComputedStyle(elem);
            shadow.style.width = style.getPropertyValue('width');
            shadow.style.height = style.getPropertyValue('height');
            let canvas = document.createElement('canvas');
            canvas.width = 25;
            canvas.height = 25;
            canvas.classList.add('handi--container-progressbar') ; 
            canvas.name = elem.name ; 
            let context = canvas.getContext('2d');

            context.beginPath();
            context.arc(Math.floor(25/2),Math.floor(25/2),10,0,Math.PI * 2,true);
            context.closePath();
            context.fillStyle = 'lightgrey';
            context.fill();
            shadow.name = elem.name;            
            shadow.appendChild(canvas);
            elem.appendChild(shadow);
        })

        _startUpload();     
      },

     archiveHeader : function(){
         let btn = document.createElement('div');
         btn.innerHTML = 'Add something'
         btn.classList.add('handi--header-create');
         btn.addEventListener('click',this.trigger.bind(this,'upload'));
         this.config.header.appendChild(btn);
     },

     trigger : function(evt){
       let event = new Event(evt);
       if(evt == 'show-image') 
        event.models = this;

       Events.dispatchEvent(event);
    }, 

      archiveView : function(){      
         
          this.archiveHeader(); 
           let container = document.createElement('div');
          container.id = 'handi--archive';
  
          if(this.isMobile())
              container.style.width = this.config.mainWidth  + 'px';
          else 
              container.style.width = this.config.desktop + 'px';;


          container.style.height =( this.config.mainHeight -45-30 ) + 'px';   
         
                     
          this.config.mainContainer.appendChild(container);     
         this.archiveWindow = new PerfectScrollbar(container,{suppressScrollX : true}) 

      
          },
      
      loadArchive : function(archive){
       
        let array = [];
        let objs = {};
        for(let i = 0 ; i < archive.data.length; i++){
            if(!objs[archive.data[i].gallery]){
                objs[archive.data[i].gallery] = true;
                array.push(archive.data[i]);
            }
        }
        let view ; 
        for(let i = 0 ; i < array.length ; i++){
       
           view = _add_model_to_archive(array[i]);
           let models = archive.data.filter(elem => elem.gallery == array[i].gallery)
           view.addEventListener('click',this.trigger.bind(models,'show-image'));
           document.getElementById('handi--archive').appendChild(view);
        }

       this.archiveWindow.update(); 
 
      },

 

      modelView : function(data){
         this.modelHeader();
         let container = document.createElement('div');
         container.id  = 'handi--model';
         
         if(this.isMobile()){
           container.style.width = this.config.mainWidth + 'px';
           
         }else{
           container.style.width = this.config.desktop + 'px';
         }

         container.style.height = this.config.mainHeight -(225 + 30) + 'px';
       
         this.handiModel =container ;
         this.config.mainContainer.appendChild(container);
        _create_model_view(container); 
         
         for(let i = 0 ; i < data.length ; i++) {
           _load_file(data[i]);
         }

         this.currentModelData = data;
        
        
      },

      modelHeader : function(){
              this.headerBack();
      },

      progress : function(data){ 
         
         let elem = document.getElementsByClassName("handi--container-progressbar");
        // let el =  Array.from(elem).find(function(el){el.name == data.name})
         let el = elem[0]; 
         let x = Math.floor(el.width/2);
         let y = Math.floor(el.height/2);
         
         let context = el.getContext('2d');
         let radius = 10 * Math.sqrt(data.percent);       

         context.beginPath();
         context.arc(x,y,radius.toFixed(2),0,Math.PI * 2,true);
         context.closePath();
         context.fillStyle = 'green';
         context.fill();
      },

      thumb : function(data){ 
        let elem = document.getElementsByClassName('handi--container-thumbShadow');
        let el = elem[0];
        el.remove();         
      }
    }

                          /* this part is for  public functions that possibly be used in another place */
                                     /*-------------------Upload View ------------------*/
   function _add_model_to_archive(model){

      let view = document.createElement('div');
      let container = document.createElement('div');
      let thumb = document.createElement('div');
      let details = document.createElement('div');
     
     view.classList.add('handi--archive-view');
     container.classList.add('handi--archive-viewContainer');
     thumb.classList.add('handi--archive-viewThumb');
     details.classList.add('handi--archive-viewDetails');
     
     let image = new Image();
     image.src = View.getLink('/uploads/' +model.gallery +'/mobile/'+model.src);
     let width = model.width ;
     let height = model.height;

     let portionX = model.width/model.height;
     let portionY = model.height/model.width;

      thumb.appendChild(image);
     
     view.style.width = 450 + 'px';
     view.style.height = 250 + 'px';
     

     thumb.style.width = 250 + 'px';
     thumb.style.height = 250 + 'px';


     let detailsContainer = document.createElement('div');
    
     let gallery = document.createElement('div');
     let description = document.createElement('div');
     let price = document.createElement('div');

     gallery.innerHTML = model.gallery;
     description.innerHTML = model.description;
     price.innerHTML = model.price;
     

     gallery.classList.add('handi--archive-viewDetail');
     description.classList.add('handi--archive-viewDetail');
     description.classList.add('handi--archive-viewDesc');
    
     price.classList.add('handi--archive-viewDetail');
     
     detailsContainer.appendChild(gallery);
     detailsContainer.appendChild(description);
     detailsContainer.appendChild(price);
     detailsContainer.style.paddingLeft = 10 + 'px';

     details.appendChild(detailsContainer);

     details.style.width = 200 + 'px';
     details.style.height = 250 + 'px';
     
    
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

     details.addEventListener('click',function(e){
        
         this.style.position = 'relative';
         e.preventDefault();
         e.stopPropagation();
         if(this.left){
            this.left = 0; 
            $(image).animate({opacity : 1},200) 
            $(this).animate({left : 0},200)
         }
         else {
            this.left = 1;
            $(image).animate({opacity : 0.3},200);
            $(this).animate({left : '-=260px'},200);
         }
     })
     container.appendChild(thumb);
     container.appendChild(details);
     view.appendChild(container);
    
     return view;
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
     if(View.isMobile()){
        el.style.width = View.config.mainWidth + 'px';
     }else
     el.style.width = View.config.desktop + 'px';
   
     el.style.height  =( View.config.mainHeight - 225-30) + 'px';
     el.id = 'handi--container-preview';
     View.handiModel.appendChild(el);

   }

   function _create_model_space(el){
     if(View.isMobile()){
        el.style.width = View.config.mainWidth + 'px';
     }else
     el.style.width = View.config.desktop + 'px';
     el.style.height = 40 + 'px';
    
     _create_model_space_buttons(el);
     View.handiModel.appendChild(el);

   }

   function _create_model_thumbs(el){

     el.id = 'handi--container-thumbs';
     el.style.height =130 + 5 + 5 + 'px';
     el.style.width = View.config.desktop + 'px';
     el.style.borderTop = '1px solid grey';
     el.style.display = 'flex';
     View.handiModel.appendChild(el);
 
   }

  
   function  _createUploadView(el){
        if(View.isMobile()){
           el.style.width = View.config.mainWidth + 'px';
        }else
           el.style.width = View.config.desktop + 'px';

        el.style.height = (View.config.mainHeight - 45 - 225 - 30) + 'px';        
         
        let preview = document.createElement('div');
        _createUploadPreview(preview);
        let space = document.createElement('div');
        _createUploadSpace(space);
        let thumbContainer = document.createElement('div'); 
        _createUploadThumbs(thumbContainer);

     }
    
   function _createUploadPreview(el){
      if(View.isMobile()){
         el.style.width = View.config.mainWidth  + 'px';
      }else
      el.style.width = View.config.desktop + 'px';

      el.style.height  = (View.config.mainHeight - 225 - 30) + 'px';
     // el.style.height = (View.config.mainHeight - 225 - 45) + 'px';
      el.id = 'handi--container-preview';
      View.handiUpload.appendChild(el);
   }

  function _createUploadSpace(el){

      if(View.isMobile()){
         el.style.width = View.config.mainWidth + 'px';
      }else
      el.style.width = View.config.desktop + 'px';
      el.style.height = 40 + 'px';
    
      _create_upload_space_buttons(el);
     View.handiUpload.appendChild(el);
  }

  function _createUploadThumbs(el){
    el.id = 'handi--container-thumbs';
    el.style.height = 140 + 'px';
    if(View.isMobile()){
      el.style.width = View.config.mainWidth + 'px';
    }else
    el.style.width = View.config.desktop + 'px';
    el.style.borderTop = '1px solid grey';
    el.style.display = 'flex';
    View.handiUpload.appendChild(el);
  }
  
 function _add_details() { 

   let shadow = document.createElement('div');
   shadow.style.width = window.innerWidth + 'px';
   shadow.style.height = window.innerHeight + 'px';

   shadow.classList.add('handi-shadow');
   
   let inputContainer  = document.createElement('div');
   inputContainer.classList.add('handi--details-addContainer');
   
   let detailsInput = ['name','description','price'];

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
   submit.innerHTML = 'save';
   submit.addEventListener('click',_send_details);   
  
   inputContainer.appendChild(submit);
   shadow.addEventListener('click',_close_shadow);
   shadow.appendChild(inputContainer);
   document.body.appendChild(shadow);
 
 }

function _add_hash(){
   let shadow = document.createElement('div');
   shadow.style.width = window.innerWidth + 'px';
   shadow.style.height = window.innerHeight + 'px';

   shadow.classList.add('handi-shadow');
   
   let inputContainer  = document.createElement('div');
   inputContainer.classList.add('handi--details-addContainer');   
   
   let preview = document.getElementById('handi--container-preview');
   let style = window.getComputedStyle(preview);
   let height =parseInt( style.getPropertyValue('height'));
   let container = document.createElement('div');
   container.style.width = '100%';
   container.style.height  =( height -60)  + 'px';
   container.style.padding= 5 + 'px';
   container.style.paddingTop = 10 + 'px';
   container.id = 'handi--hash-mainContainer'; 
  
   let trends = document.createElement('div');
   trends.style.width  = 'auto';
   trends.style.height =( height -30) + 'px';
   trends.style.border = '1px solid white';
   trends.style.marginTop = 10 + 'px';

   let header = document.createElement('div');
   
   let usedHash = document.createElement('div');
 
   let trend = document.createElement('div');

   usedHash.innerHTML  = '#';
 
   trend.innerHTML = 'trend';

   let map = new Image();
   map.src = View.getLink('/public/arrow/a.png');

   let mapContainer = document.createElement('div');
   mapContainer.classList.add('handi--hash-headerItem');

   usedHash.classList.add('handi--hash-headerItem');
   map.classList.add('handi--hash-mapItem');
   trend.classList.add('handi--hash-headerItem');
   trend.classList.add('handi--hash-trendItem'); 
   usedHash.style.color = 'black';

   header.classList.add('handi--hash-header');
   mapContainer.appendChild(map);
   header.appendChild(usedHash);
   header.appendChild(mapContainer);
   header.appendChild(trend);

   trends.appendChild(header);
   trends.appendChild(container);
   let input = document.createElement('input');
   input.type = 'text';
   input.id = 'handi--details-' +'hash'+ 'Input';
//   input.placeholder = '#';
  
   input.classList.add('handi--details-inputs');
   input.classList.add('handi--details-placeholderLeft');
   input.placeholder  = '#'
    let inputWrapper = document.createElement('div');
    inputWrapper.appendChild(input);
    inputWrapper.style.position = 'relative';

    inputContainer.appendChild(inputWrapper);

   input.addEventListener('click',function(e){
       e.stopPropagation();

      if(this.edit == true) return;
      this.edit = true;
      this.placeholder  = '';
      let that  = this;
 /*     $(this).animate({width : '-=23'},200,function(){
       
         })*/
        })



    let hash = document.createElement('div');
        let add = new Image();
        add.src  = View.getLink('/public/arrow/ad.png');
        add.style.marginTop = 2 + 'px';
        add.style.marginRight = -2 + 'px';
        add.style.width = 22 + 'px';
        add.style.height = 22 + 'px';
        hash.appendChild(add);
        hash.style.position = 'absolute';
        hash.style.top = 5 + 'px';
        hash.style.cursor = 'pointer';
        hash.style.right = 0;
        
     
       hash.addEventListener('click',function(evt){

           let span = document.createElement('span');
           span.classList.add('handi--hash-containerAdd');
           container.appendChild(span);
           span.innerHTML = input.value;
           input.value = ''; 
           evt.stopPropagation();

       }) 
      inputWrapper.appendChild(hash);




   
  inputContainer.addEventListener('click',function(e){e.stopPropagation()})

  usedHash.addEventListener('click',function(e){        
               View.hashMap.remove();
               container.className = '';
  })


   mapContainer.addEventListener('click',function(e){
           
           container.innerHTML = '';
           e.stopPropagation();
       	   let map=L.map('handi--hash-mainContainer',{zoomControl : false}).setView([60.505, -0.09], 13);
           View.hashMap = map;
            L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
              attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
              maxZoom: 18,
              id: 'mapbox.streets',
                accessToken: 'pk.eyJ1IjoiMWlvMWwiLCJhIjoiY2psNThyd3luMGVsMjN4bnR3bXc4MXV2cyJ9.ks2qVsrV6d1rXu54-CyqIw'
            }).addTo(map);        
  new L.Control.Zoom({position:'bottomright'}).addTo(map);    


   })

   inputContainer.appendChild(trends);

   let hashes = document.createElement('div');
   hashes.style.height = 150 + 'px';
   hashes.style.width = 'auto';
   hashes.style.border = '1px solid white';
   hashes.style.marginTop = '10px';
//   inputContainer.appendChild(hashes); 


  shadow.appendChild(inputContainer);
   shadow.addEventListener('click',_close_shadow);
   document.body.appendChild(shadow);
 }


function _close_shadow(e){
  let shadow = document.getElementsByClassName('handi-shadow');
  shadow[0].remove();
}

function _send_details(e){
 e.stopPropagation();

 let shadow =  document.getElementsByClassName('handi-shadow');
 let inputs = document.getElementsByClassName('handi--details-inputs');
 let obj = {};
 for(let input of inputs){
   if(input.value != '' )
     obj[input.id] = input.value;
   else {
     alert('fill the input please');
     break;
 } 
}

 View.inputs = obj;

_close_shadow();
 
}

  function _create_model_basket_buttons(parent){
      let buttonContainer = document.createElement('div');
     buttonContainer.classList.add('handi--container-basketContainer');

     let upload = document.createElement('div');
     let details = document.createElement('div');
     let check = document.createElement('div');


     details.innerHTML = 'buy 456900$';
     details.classList.add('handi--container-basketBuy');
     upload.classList.add('handi--container-basketPrice'); 
   
     check.classList.add('handi--container-basketCheck');

     let s1 = document.createElement('span');
     let s2 = document.createElement('span');

     let remove = document.createElement('div');
     let select = document.createElement('div');
     let deselect = document.createElement('div');

   
     remove.innerHTML = 'remove';
     select.innerHTML = 'edit';
    
     
     s1.innerHTML = '/';    

     remove.classList.add('handi--basket-btns');
     select.classList.add('handi--basket-btns');
     deselect.classList.add('handi--basket-btns');
     
     s1.classList.add('handi--basket-btns');
     
     check.appendChild(remove);
     check.appendChild(s1);
    
     check.appendChild(s2);
     check.appendChild(select); 
   
     buttonContainer.appendChild(details); 
 
     buttonContainer.appendChild(check); 

     Array.from(buttonContainer.children).forEach((child,index)=>{
       child.classList.add('handi--container-basketbtns') ;
     })
 
     select.addEventListener('click',function(){
        if(View.activeSelect){
          View.activeSelect = false;
          this.style.color = 'white';
          remove.style.color = 'white';
        }else {
           this.style.color = 'grey';
           View.activeSelect = true;
           remove.style.color = 'red'
         }
     })

     parent.appendChild(buttonContainer); 

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
     
    
     Array.from(buttonContainer.children).forEach((child,index)=>{
       child.classList.add('handi--container-spacebtns') ;
       child.addEventListener('mouseenter',_handle_upload_btns_mouseenter.bind(child));
       child.addEventListener('mouseleave',_handle_upload_btns_mouseleave.bind(child));
     })

     upload.addEventListener('click',function(){
         View.config.basket.push(View.currentModelData);
         
         _menu();
      });

     details.style.borderTop = '2px solid black';
     parent.appendChild(buttonContainer); 

  }

  function _create_upload_space_buttons(parent){
     let buttonContainer = document.createElement('div');
     buttonContainer.classList.add('handi--container-spaceContainer');

   
     let upload = document.createElement('div');
     let editRemove = document.createElement('div');

     let remove = document.createElement('span');
     let edit = document.createElement('span');
     
     remove.innerHTML = 'remove';
     edit.innerHTML = 'edit';
       
     upload.innerHTML = 'upload';    
     
   
     buttonContainer.appendChild(upload);
     buttonContainer.appendChild(remove);
     buttonContainer.appendChild(edit);
     

     Array.from(buttonContainer.children).forEach((child,index)=>{
       child.classList.add('handi--container-spacebtns') ;
       child.addEventListener('mouseenter',_handle_upload_btns_mouseenter.bind(child));
       child.addEventListener('mouseleave',_handle_upload_btns_mouseleave.bind(child));
       child.addEventListener('click',_handle_upload_space_click.bind(child));
     })

     let input = document.createElement('input');
     input.type = 'file';
     input.multiple = 'multiple';

     input.style.display = 'none';
     input.addEventListener('change',_get_and_save_files);
     View.input = input;
     parent.appendChild(input);
     
    
     parent.appendChild(buttonContainer);
   
  }

 function _handle_upload_space_click(){
    switch(this.innerHTML){
      case 'remove':
            break;
      case 'upload' :
           View.upload(); 
           break;
      case 'edit' :
         break;
      default : 
        break;
   }  
 }

 function _handle_upload_btns_mouseenter(){
   switch(this.innerHTML){
     case 'remove' : 
         this.style.borderTop = "2px solid tomato";
         break; 
    case 'upload' :
        this.style.borderTop = "2px solid green";
       break;
    case 'edit' : 
       this.style.borderTop = "2px solid black";
      break;
   default :
       this.style.borderTop = '2px solid black'; 
       break;
   }
 }

 function _handle_upload_btns_mouseleave(){

  this.style.borderTop = "1px solid grey"; 
 }

 function _get_and_save_files(e){

   let files = e.target.files; 
   View.files = Array.from(files);
  
   Array.from(files).forEach(function(file){
      _get_orientation(file).then(function(orient){
           _load_image(file,orient);
       })
    })
   
  } 
 
 function _load_file_basket(model){
   let image = new Image();
  image.mSize = 100;
  image.dSize = 130;
  image.addEventListener('load',_load_template_for_basket);
  image.src = View.getLink("/uploads/" + model.gallery + "/" + model.src);
  image.name = model.gallery;
  image.filename = model.src;
  
 }


 function _load_file(model){
  let image = new Image();
  image.mSize = 100;
  image.dSize = 130;
  image.addEventListener('load',_load_template_for_thumb);
  image.src = View.getLink("/uploads/" + model.gallery + "/" + model.src);
  image.name = model.gallery;
  image.filename = model.src;
  
}

 function _load_image(file,orient){
   let reader = new FileReader();
   reader.onload = function(e){
     let image = new Image();
     image.name = file.name;
     image.mSize= 100;
     image.dSize = 130;
     image.orient = orient;
     image.addEventListener('load',_load_template_for_thumb);
     image.src = reader.result;
   } 

  reader.readAsDataURL(file);
 }

function _slide_canvas(e){
   
  let elem = e.target;
 
  elem.parentElement.remove();
  ex(elem);
 
}


function ex(el){
  
  let width = el.width;
  let height = el.height;
  let top = el.top;

  
  let src = el.src;
  if(View.isMobile()){
    left = parseInt((View.config.mainWidth - width)/2) ;   
   }else
   left = parseInt((View.config.desktop - width)/2) ;
   
  let style = window.getComputedStyle(el) ;
  //let top = style.getPropertyValue('margin-top')
  
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
         _create_show_details(el);
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
   if(height < 210)
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
  div.style.height = height + 'px';
  div.id = 'handi--menu-footer';
  div.style.top = (window.innerHeight - height) + 'px';
  div.style.right = 0;


  let footer = document.createElement('div');
  if(View.isMobile()){
   footer.style.width = View.config.mainWidth + 'px';
  }else
  footer.style.width = View.config.desktop + 'px';
  footer.style.height = 30 + 'px';
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
  if(View.isMobile()){
    details.style.width = View.config.mainWidth + 'px';
  }else
  details.style.width = View.config.desktop;
  details.style.height = 40 + 'px';
  _create_model_basket_buttons(details);
  let basketContent = document.createElement('div');
  basketContent.id = 'handi--basket';
  basketContent.style.width = View.config.mainWidth + 'px';
  basketContent.style.height = 140 + 'px';
   
  footer.appendChild(links);
  _fill_basket_thumbs();

  div.appendChild(details);
  div.appendChild(basketContent);
  div.appendChild(footer);
  document.body.appendChild(div);
  
}



function _fill_basket_thumbs(){

  for(let i = 0 ; i < View.config.basket.length ; i++){
     _load_file_basket(View.config.basket[i][0]);
  }

}


function _create_show_details(el){

  let container = document.createElement('div');

  let hmContainer = document.createElement('div');

  let product = document.createElement('div');
  let description = document.createElement('div');
  let price = document.createElement('div');

  container.style.float = 'left';
  if(View.isMobile()){
    container.style.marginLeft = 0;
  }else
  container.style.marginLeft = 20 + 'px';

  product.innerHTML = el.gallery;
  description.innerHTML = 'this is some kinde of allocation that could';
  price.innerHTML = 234 + ' dollar';

  product.classList.add('handi--container-detailProduct');
  description.classList.add('handi--container-detailDesc');
  price.classList.add('handi--container-detailPrice');
  
  let tags = ['1io1l','jini','oldest god','jizandapost','hell'];

     let hash = document.createElement('div');
         hash.innerHTML = '#';
         hash.classList.add('handi--header-item');
         
         let map = new Image();
         map.classList.add('handi--header-item');
         map.src = View.getLink('/public/arrow/a.png');

 hash.addEventListener('click',function(){
  if(this.state == 'active'){
    this.state = 'down';
    this.style.color = 'blue';
   let elems = document.getElementsByClassName('handi--header-tag');
   Array.from(elems).forEach(elem => elem.remove());
   return;
  }else {
    this.state = 'active';
    this.style.color = 'black';
  }
  
  for(let i = 0 ; i < tags.length ; i++){
   let div = document.createElement('div');
   div.classList.add('handi--header-item','handi--header-tag');
   div.style.width = 'auto';
   hmContainer.appendChild(div);
   div.innerHTML = tags[i];
  }
 
 })


 map.addEventListener('click',function(){
    switch(this.state){
       case 'active' : 
         _clear_map();
         this.state = 'down';
         break;      
      case 'down' : 
         _create_map();
          this.state = 'active';
         break;
      default : 
         this.state = 'active';
         _create_map();
        break;
    } 
});         

 hmContainer.classList.add('handi--container-hmContainer');
 hmContainer.id = 'handi--container-hmContainer' 

 hmContainer.appendChild(map);
 hmContainer.appendChild(hash);
 container.id = 'handi--container-details';
 container.appendChild(hmContainer);

 container.appendChild(product);
 container.appendChild(description);
 container.appendChild(price);

 document.getElementById('handi--container-preview').appendChild(container);
}

function _clear_map(){
  document.getElementById('handi--container-map').remove();
}

function _select_location(){
 let shadow = document.createElement('div');
   shadow.style.width = window.innerWidth + 'px';
   shadow.style.height = window.innerHeight + 'px';

   shadow.classList.add('handi-shadow');
   
   let inputContainer  = document.createElement('div');
   inputContainer.classList.add('handi--details-addContainer');   
   
   let preview = document.getElementById('handi--container-preview');
   let style = window.getComputedStyle(preview);
   let height =parseInt( style.getPropertyValue('height'));
   let container = document.createElement('div');
   container.style.width = '100%';
   container.style.height  =( height -60)  + 'px';
   container.style.padding= 5 + 'px';
   container.style.paddingTop = 10 + 'px';
   container.id = 'handi--hash-mainContainer'; 
  
   let trends = document.createElement('div');
   trends.style.width  = 'auto';
   trends.style.height =( height -30) + 'px';
   trends.style.border = '1px solid white';
   trends.style.marginTop = 10 + 'px';

   let header = document.createElement('div');
   
   let usedHash = document.createElement('div');
 
   let trend = document.createElement('div');

   usedHash.innerHTML  = '#';
 
   trend.innerHTML = 'trend';

   let map = new Image();
   map.src = View.getLink('/public/arrow/a.png');

   let mapContainer = document.createElement('div');
   mapContainer.classList.add('handi--hash-headerItem');

   usedHash.classList.add('handi--hash-headerItem');
   map.classList.add('handi--hash-mapItem');
   trend.classList.add('handi--hash-headerItem');
   trend.classList.add('handi--hash-trendItem'); 
   usedHash.style.color = 'black';

   header.classList.add('handi--hash-header');
   mapContainer.appendChild(map);
   header.appendChild(usedHash);
   header.appendChild(mapContainer);
   header.appendChild(trend);

   trends.appendChild(header);
   trends.appendChild(container);
   let input = document.createElement('input');
   input.type = 'text';
   input.id = 'handi--details-' +'hash'+ 'Input';
//   input.placeholder = '#';
  
   input.classList.add('handi--details-inputs');
   input.classList.add('handi--details-placeholderLeft');
   input.placeholder  = '#'
    let inputWrapper = document.createElement('div');
    inputWrapper.appendChild(input);
    inputWrapper.style.position = 'relative';

    inputContainer.appendChild(inputWrapper);

   input.addEventListener('click',function(e){
       e.stopPropagation();

      if(this.edit == true) return;
      this.edit = true;
      this.placeholder  = '';
      let that  = this;
 /*     $(this).animate({width : '-=23'},200,function(){
       
         })*/
        })



    let hash = document.createElement('div');
        let add = new Image();
        add.src  = View.getLink('/public/arrow/ad.png');
        add.style.marginTop = 2 + 'px';
        add.style.marginRight = -2 + 'px';
        add.style.width = 22 + 'px';
        add.style.height = 22 + 'px';
        hash.appendChild(add);
        hash.style.position = 'absolute';
        hash.style.top = 5 + 'px';
        hash.style.cursor = 'pointer';
        hash.style.right = 0;
        
     
       hash.addEventListener('click',function(evt){

           let span = document.createElement('span');
           span.classList.add('handi--hash-containerAdd');
           container.appendChild(span);
           span.innerHTML = input.value;
           input.value = ''; 
           evt.stopPropagation();

       }) 
      inputWrapper.appendChild(hash);




   
  inputContainer.addEventListener('click',function(e){e.stopPropagation()})

  usedHash.addEventListener('click',function(e){        
               View.hashMap.remove();
               container.className = '';
  })


   mapContainer.addEventListener('click',function(e){
           
           container.innerHTML = '';
           e.stopPropagation();
       	   let map=L.map('handi--hash-mainContainer',{zoomControl : false}).setView([60.505, -0.09], 13);
           View.hashMap = map;
            L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
              attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
              maxZoom: 18,
              id: 'mapbox.streets',
                accessToken: 'pk.eyJ1IjoiMWlvMWwiLCJhIjoiY2psNThyd3luMGVsMjN4bnR3bXc4MXV2cyJ9.ks2qVsrV6d1rXu54-CyqIw'
            }).addTo(map);        
  new L.Control.Zoom({position:'bottomright'}).addTo(map);    


   })

   inputContainer.appendChild(trends);

   let hashes = document.createElement('div');
   hashes.style.height = 150 + 'px';
   hashes.style.width = 'auto';
   hashes.style.border = '1px solid white';
   hashes.style.marginTop = '10px';
//   inputContainer.appendChild(hashes); 


  shadow.appendChild(inputContainer);
   shadow.addEventListener('click',_close_shadow);
   document.body.appendChild(shadow);

          /*
            //document.getElementById('handi--container-hmContainer').style.backgroundColor = 'white';
          
           if(document.getElementById('handi--container-map')){
               document.getElementById('handi--container-map').remove();
               return;
           }

           let mapContainer = document.createElement('div');
           mapContainer.id = 'handi--container-map'; 
           mapContainer.classList.add('handi--container-map');
          let container =  document.getElementById('handi--container-preview');

          container.appendChild(mapContainer);
           
          let style = window.getComputedStyle(container);
          // let canvas = document.getElementById('handi--container-preview').firstChild;
           if(View.isMobile()){
             mapContainer.style.width = (View.config.mainWidth) + 'px';
           }else            
           mapContainer.style.width =View.config.desktop + 'px';
           mapContainer.style.height = ( View.config.mainHeight -225 -30-5) + 'px';

 
        	   let map=L.map('handi--container-map').setView([51.505, -0.09], 13);
            L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
              attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
              maxZoom: 18,
              id: 'mapbox.streets',
                accessToken: 'pk.eyJ1IjoiMWlvMWwiLCJhIjoiY2psNThyd3luMGVsMjN4bnR3bXc4MXV2cyJ9.ks2qVsrV6d1rXu54-CyqIw'
            }).addTo(map);            
*/

}

function _create_map(){
           document.getElementById('handi--container-hmContainer').style.backgroundColor = 'white';
           let mapContainer = document.createElement('div');
           mapContainer.id = 'handi--container-map'; 
           mapContainer.classList.add('handi--container-map');
           let container =  document.getElementById('handi--container-details');

           container.appendChild(mapContainer);
           
           let style = window.getComputedStyle(container);
           let canvas = document.getElementById('handi--container-preview').firstChild;
           if(View.isMobile()){
               mapContainer.style.width = (View.config.mainWidth) + 'px';
           }else {
                if(canvas.width > canvas.height)
                  mapContainer.style.width =( View.config.desktop -canvas.width ) + 'px';
                else 
                   mapContainer.style.width =( View.config.desktop -canvas.width -20 ) + 'px';

              }    
                        
            mapContainer.style.height = ( View.config.mainHeight -225 -30-5) + 'px';

           let map=L.map('handi--container-map').setView([51.505, -0.09], 13);
           L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
           attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
              maxZoom: 18,
              id: 'mapbox.streets',
                accessToken: 'pk.eyJ1IjoiMWlvMWwiLCJhIjoiY2psNThyd3luMGVsMjN4bnR3bXc4MXV2cyJ9.ks2qVsrV6d1rXu54-CyqIw'
            }).addTo(map);   
             

}


function map(setting){
 

}



function _load_template_for_basket(e){
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

  if(View.isMobile()){
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
  canvas.classList.add('handi--basket-green');
  
  if(image.filename)
     canvas.addEventListener('click',function(e){
        if(View.activeSelect){
           if(this.classList.contains('handi--basket-green')){
                this.classList.remove('handi--basket-green');
                this.classList.add('handi--basket-red');

           }else{
               this.classList.remove('handi--basket-red');
               this.classList.add('handi--basket-green');
           }
        }else 
           _preview_file(e);
    
    });
  else 
    canvas.addEventListener('click',_preview_image);
  
 document.getElementById('handi--basket').appendChild(preview);
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

  if(View.isMobile()){
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
  else 
    canvas.addEventListener('click',_preview_image);
  
 document.getElementById('handi--container-thumbs').appendChild(preview);
}

function _preview_file(e){

   let canvas = e.target;
   let image = new Image();
   image.gallery = canvas.gallery;
   image.name = canvas.name;
   image.mSize = parseInt(View.config.mainWidth);
   image.dSize =parseInt(View.config.mainHeight -225 - 30-5);
   image.pType = 'file';
   image.addEventListener('load',_load_template_for_show);
   image.src = canvas.src;   
}


function _preview_image(e){

  let canvas = e.target;
   
  let file = View.files.find(function(elem){return elem.name == canvas.name})
 
  _get_orientation(file).then(function(orient){
      let reader = new FileReader();
   
      reader.onload = function(e){
 
       let image = new Image();
       image.name = file.name;
   
       image.dSize =parseInt( View.config.mainHeight-225 -30-5);
       image.orient = orient;
       image.addEventListener('load',_load_template_for_show);
       image.src = reader.result;
       image.mSize = View.config.mainWidth ; 	
       console.log('n ' + orient + ' ' + image.width + ' ' + image.height);  
      } 

    reader.readAsDataURL(file);
  })
}

 
function _load_template_for_show(e){
  
  let image = e.target;

  let mSize = image.mSize;
  let dSize = image.dSize;
    
  let preview = document.createElement('div');
  
  let canvas = _load_canvas(image);
  preview.appendChild(canvas); 
  
  let marginTop ;
  let marginLeft;

  if(View.isMobile()){
     marginLeft = parseInt(mSize - canvas.width)/2;
     marginTop = parseInt(mSize - canvas.height)/2;   
     preview.style.width = mSize + 'px';
     preview.style.height = mSize + 'px';
  }else{
     marginLeft = parseInt(dSize - canvas.width)/2;
     marginTop = parseInt(dSize - canvas.height)/2;
     preview.style.width = dSize + 'px';
     preview.style.height = dSize  + 'px';
  }
  
  if(image.pType == 'file') { 
    canvas.src = image.src;
    canvas.name = image.name;
    canvas.gallery = image.gallery;
   }
   

   if(View.isMobile()){
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


function _load_canvas(image){ 
   
  let width = image.width;
  let height = image.height;
  
  let orientation = image.orient;
  
  let mSize = image.mSize;
  let dSize = image.dSize;
  
  let canvas = document.createElement('canvas');
  canvas.name = image.name;
 console.log( orientation  + ' ' + width + ' ' + height);
  if( 4 < orientation && orientation < 9){console.log('1');
    if(width > height){console.log('1');
       if(View.isMobile()){console.log('1');  
           height = mSize * height/width;
           width = mSize;
       }else{console.log('2');            
            height  =  dSize * height/width ;
           width = dSize;
       }
    }else{console.log('2');
       if(View.isMobile()){console.log('1')
          width = parseInt(mSize * (width/height));
          height = mSize;
       }else{ console.log('2');
          height = parseInt(dSize * (width/height));
          width = dSize; 
        } 
    }

  canvas.height = width; 
  canvas.width = height; 
  }else{console.log('2');
       if(width > height){console.log('1');
         if(View.isMobile()){console.log('1');        
            height = parseInt(mSize*(height/width));
            width = mSize;
         }else{          console.log('2');
           height   = parseInt(dSize * height/width);
           width = dSize;
         }
      }else{console.log('2');
        if(View.isMobile()){        console.log('1');
           width = parseInt(mSize * (width/height));
           height = mSize;
        }else{console.log('2');
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
  
  switch(orientation){
    case 2 :
      ctx.transform(-1,0,0,1,width,0); 
      break;
    case 3 : 
      ctx.transform(-1,0,0,-1,width,height);
      break;
    case 4 : 
      ctx.transform(-1,0,0,-1,0,height);
      break;  
    case 5 : 
      ctx.transform(0,1,1,0,0,0);
      break;
    case 6 : 
      ctx.transform(0,1,-1,0,height,0);
      break;
    case 7:
      ctx.transform(0,-1,-1,0,height,width)
      break;
    case 8 : 
      ctx.transform(0,-1,1,0,0,width);
      break;
    default : 
     break;
  } 
 
  ctx.drawImage(image,0,0,width,height);
 
  return canvas;
}
                     

 

 // stack flow over question s 

  function _get_orientation(file){
       
        let promise = new Promise(function(resolve,reject){
        let reader = new FileReader();
        reader.onload = function(e){
                     
          var view = new DataView(e.target.result);
          if (view.getUint16(0, false) != 0xFFD8)
          {
              return resolve(-2);
          }
          var length = view.byteLength, offset = 2;
          while (offset < length) 
          {
              if (view.getUint16(offset+2, false) <= 8) return resolve(-1);
              var marker = view.getUint16(offset, false);
              offset += 2;
              if (marker == 0xFFE1) 
              {
                  if (view.getUint32(offset += 2, false) != 0x45786966) 
                  {
                      return resolve(-1);
                  }

                  var little = view.getUint16(offset += 6, false) == 0x4949;
                  offset += view.getUint32(offset + 4, little);
                  var tags = view.getUint16(offset, little);
                  offset += 2;
                  for (var i = 0; i < tags; i++)
                  {
                      if (view.getUint16(offset + (i * 12), little) == 0x0112)
                      {
                          return resolve(view.getUint16(offset + (i * 12) + 8, little));
                      }
                  }
              }
              else if ((marker & 0xFF00) != 0xFF00)
              {
                  break;
              }
              else
              { 
                  offset += view.getUint16(offset, false);
              }
          }
          return resolve(-1);
       } 

        reader.readAsArrayBuffer(file);
       })

      return promise;  
 }
                        /* this is Controller and Collection part of the code */

    function _startUpload (){

         for(let i = 0 ; i < View.files.length ; i++){
           
            socket.emit('g-start', {
               'name' : View.files[i].name,
               'size' : View.files[i].size,
               'title' : View.inputs['handi--details-nameInput'],
               'description' : View.inputs['handi--details-descriptionInput'],
               'price'       : View.inputs['handi--details-priceInput']               
            })
         }
      }

    function _upload(data){ 

     let events = this;
     if(data) View.progress(data);

        if(events.length != 0 && data ) {
            events.push(data);
            return ;
        }
 
        if(!data && events.lenght) {
          data = events[0];
          events[0].splice(0,1);
        }else if(!data && !events.length) {
          return;
        }
 
        let reader = new FileReader();
       
        reader.onload = function(e){

          socket.emit('g-upload',{ name : data.name, data : e.target.result });
       }
        
       
        let index = View.files.findIndex(function(elem){return elem.name == data.name}); 
        let place = data.place * 524288;
        let newSlice = View.files[index].slice(place,place + Math.min(524288,View.files[index].size - place));
        reader.readAsBinaryString(newSlice); 
    }


   function _thumb(data){
      let index =  View.files.findIndex(function(el){return el.name == data.src}) ;
        View.files.splice(index,1);
        View.thumb(data);
    }

  

   function _upload_view(){

     View.clearContainer();
     View.currentView = 'upload';
     View.uploadView();
   }

   function _archive_view(){

     View.clearContainer();
     View.currentView = 'archive';
     View.archiveView();
     socket.emit('archive',{});
   }

   function _model_view(e){

       View.clearContainer();
       View.currentView = 'model';
       let elems = e.models;
       View.modelView(elems);
   }
   
    let controller = (function(){

      View.init();

      let views = ['archive','upload','model'];
      let events = [];
 
      Events.addEventListener('upload',_upload_view);
      Events.addEventListener('socket-archive',_archive_view); 
      Events.addEventListener('show-image',_model_view);

      Events.dispatchEvent( new Event('socket-archive'));           

      socket.on('g-continue',_upload.bind(events));
      socket.on('thumb',_thumb);
      socket.on('archive',View.loadArchive.bind(View));

    })()

  })()

 }
