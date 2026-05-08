let canvas, context;

let inputFisier, btnSalveaza;

 let btnCrop,  btnAlbNegru, btnAlb;


let inpLatime, inpInaltime, btnLatime,  btnInaltime;

let inpText, inpMarime,  inpCuloare, inpX, inpY, btnText;

let raster = null;

let selX = 0, selY = 0,  selW = 1, selH = 1;


let trag = false;
let startX = 0,   startY = 0;

document.addEventListener("DOMContentLoaded", aplicatie);




function aplicatie(){
  canvas = document.getElementById("canvas");
  context = canvas.getContext("2d");

  inputFisier =  document.getElementById("inputFisier");
  btnSalveaza = document.getElementById("btnSalveaza");

  btnCrop = document.getElementById("btnCrop");
  btnAlbNegru   = document.getElementById("btnAlbNegru");
  btnAlb  =document.getElementById("btnAlb") ;


  inpLatime = document.getElementById("inpLatime");
  inpInaltime = document.getElementById("inpInaltime");
  btnLatime = document.getElementById("btnLatime");
  btnInaltime = document.getElementById("btnInaltime");

  inpText= document.getElementById("inpText");
  inpMarime =document.getElementById("inpMarime");
  inpCuloare = document.getElementById("inpCuloare");
  inpX = document.getElementById("inpX");
  inpY = document.getElementById("inpY" );
  btnText =  document.getElementById("btnText");

  inputFisier.addEventListener("change", onSchimbareFisier);

   canvas.addEventListener("mousedown", onMouseDown);

  canvas.addEventListener("mousemove", onMouseMove);
  window.addEventListener("mouseup", onMouseUp);

  btnCrop.addEventListener("click", crop);
  btnAlbNegru.addEventListener("click", albNegru);
  btnAlb.addEventListener("click", stergeAlb);


  btnLatime.addEventListener("click", scaleazaDupaLatime);
  btnInaltime.addEventListener("click", scaleazaDupaInaltime);

  btnText.addEventListener("click", adaugaText);

  btnSalveaza.addEventListener("click", salveazaImagine);


  context.clearRect(0,0, canvas.width, canvas.height);
  context.fillStyle = "#aaa";
  context.fillRect(0, 0 , canvas.width, canvas.height);
}

function onSchimbareFisier(e){
  let file = e.target.files[0]; //primaul fisier din input
  if(!file) return ;
  incarcaImagine(file);
  e.target.value = ""; // golesc inputul pentru a putea incarca aceasi poza de cate ori vreau
}

function incarcaImagine(file){
    //url temporar pentru fisier ca sa il pot descarca in obiectul image
  let url = URL.createObjectURL(file);
  let img = new Image();

  img.onload = function(){
        URL.revokeObjectURL(url);

    //canvasul meu devine la fel ca poza ca sa nu o deformez 
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;


    //desenez poza pe canvas si salvez in raster poza curenta
    context.drawImage(img, 0, 0);
    raster = context.getImageData(0, 0, canvas.width, canvas.height);

    //selectez toata poza
    selX = 0; selY = 0;  selW = canvas.width; selH = canvas.height;


    //valorile initiale pentru scalare
     inpLatime.value = canvas.width;

    inpInaltime.value = canvas.height;

    desenare();
  };


  //in caz de eroare daca poza nu este buna
  img.onerror = function(){

    //eliberez URL temporar
    URL.revokeObjectURL(url);
    alert("Eroare la incarcare.");
  };

  img.src = url;
}

function onMouseDown(e){
  //nu am poza nu selectez
  if(!raster) return;

  //calculez coordonatele in canva si punctul inital de unde incep
  let p = coordCanvas(e);
  trag = true;

  startX = p.x;
    
  startY = p.y;


  //incep cu drepunghi mic
  selX = startX;
  selY = startY;
  selW = 1;
  selH = 1;

  desenare();
}

function onMouseMove(e){

    //doar daca exista poza si tin apasat click altfel ies din functie
  if(!raster || !trag) return;

  let p = coordCanvas(e);


  //calculez marginile
  let xMin = Math.min(startX, p.x);
  let yMin = Math.min(startY, p.y);

  let xMax  =  Math.max(startX, p.x);
  let yMax = Math.max(startY, p.y);  


  //pot sa trag in orice directie
  selX =  xMin;
  selY = yMin;
  selW = xMax -  xMin;
  selH =yMax - yMin;


  //minim 1 pixel ca altfel nu selectezi nimic
  if(selW < 1) selW = 1;
  if(selH < 1) selH = 1;


  //limitez selectia ca sa nu ies in afara imaginii
  if(selX < 0) selX = 0;
  if(selY < 0) selY  =0;
  if(selX + selW  > canvas.width) selW = canvas.width  - selX;
  if(selY +selH > canvas.height) selH = canvas.height - selY;

  desenare();
}

function onMouseUp()  {
  trag = false;  //opresc selectia
}

function coordCanvas(e){
  let r = canvas.getBoundingClientRect(); //dimensiunea afisata in canvas

  //raportul intre dimensiunea reala si cea afisata
  let scalaX = canvas.width / r.width;
  let scalaY = canvas.height / r.height;

  //se transofrma coordonatele de pe ecran in coordonate corecte pe canvas
  let x = Math.floor(( e.clientX - r.left) * scalaX);
  let y = Math.floor( (e.clientY - r.top)  * scalaY);


  //limitarile nu are cum sa fie mai mic ca 0 sau mai mare ca canvasul meu
  if(x < 0) x = 0;
  if(y < 0 ) y = 0;

  if(x > canvas.width - 1) x  = canvas.width - 1;
  if(y > canvas.height - 1) y = canvas.height - 1;

  return {x:x, y:y};
}

 function desenare(){

  //curatare canvas
  if(!raster){
    context.clearRect(0 , 0, canvas.width, canvas.height);
    context.fillStyle = "#fff";
    context.fillRect(0, 0, canvas.width , canvas.height);
    return;
  }


  //afisez pixelii pozei curente
  context.putImageData(raster, 0, 0);

  //conturul selectiei 
  context.save();
  context.strokeStyle = "blue";
  context.lineWidth= 2;
  context.strokeRect(selX + 0.5, selY + 0.5, selW, selH);
  context.restore();
}

function crop(){
  if(!raster) return;


  //poza curenta
  context.putImageData(raster, 0, 0);
  
  //selectia
  let bucata = context.getImageData(selX, selY, selW, selH);


  //redimensionez canvasul pe marimea selectie
  canvas.width = selW ;
  canvas.height = selH;


  //pun bucata si refac rasterul
  context.putImageData(bucata, 0, 0);
  raster= context.getImageData(0, 0, canvas.width, canvas.height);

  selX = 0; selY = 0; selW = canvas.width; selH = canvas.height;

  inpLatime.value =canvas.width;
  inpInaltime.value = canvas.height;


  desenare();
}

function albNegru(){
  if(!raster) return;

  //fac selectia
  context.putImageData(raster,  0, 0);
  let bucata =  context.getImageData(selX, selY, selW, selH);
  let v= bucata.data;


  //lucrez pe pixeli si merg in 4 in 4 rgba
  for(let i=0; i<v.length; i+=4){
    let r = v[i];
    let g = v[i+1];
    let b = v[i+2];


    let gri = Math.round((r + g + b) / 3); //medie pentru alb negru

    v[i]   = gri;
    v[i+1] = gri;
    v[i+2] = gri;
  }

  context.putImageData(raster, 0, 0);
  context.putImageData(bucata , selX, selY);

  raster = context.getImageData(0,  0, canvas.width, canvas.height);
  desenare();
}

function stergeAlb(){
  if(!raster) return;


  context.putImageData(raster, 0, 0);
  let bucata = context.getImageData(selX, selY, selW, selH);
  let v = bucata.data;


  //pentru fiecare pixel il fac alb 
  for(let i=0; i<v.length; i+=4 ){
    v[i] = 255;
    v[i+1] = 255;
    v[i+2] = 255;
    v[i+3] = 255;
  }

  context.putImageData(raster, 0, 0);
  context.putImageData(bucata, selX, selY);

  raster= context.getImageData(0, 0, canvas.width, canvas.height);
  desenare();
}

function scaleazaDupaLatime(){



  if(!raster) return;

  //iau valorea noua
  let wNou = parseInt(inpLatime.value, 10);
  if(!wNou ||  wNou < 1) return;


  //pastrez proportia in funtie de latime
  let hNou = Math.round(canvas.height * wNou / canvas.width);
  inpInaltime.value = hNou;

  scaleaza(wNou, hNou);
}

function scaleazaDupaInaltime(){
  if(!raster) return;


  let hNou = parseInt(inpInaltime.value, 10);
  if(!hNou || hNou< 1) return;

  let wNou = Math.round(canvas.width * hNou / canvas.height);
  inpLatime.value =wNou;

  scaleaza(wNou, hNou);
}

function scaleaza(wNou, hNou){
  let tmp = document.createElement("canvas"); //canvas temp ca sa nu pierd imaginea

  //redimensionez canvas
  tmp.width = canvas.width;
  tmp.height = canvas.height;

  let tctx= tmp.getContext("2d");
  tctx.putImageData(raster,0, 0);

  canvas.width =  wNou;
  canvas.height = hNou;

  context.drawImage(tmp, 0, 0, wNou, hNou);

  raster = context.getImageData(0, 0, canvas.width, canvas.height);

  selX = 0; selY = 0; selW = canvas.width; selH = canvas.height;
  desenare();
}

function adaugaText(){
  if(!raster ) return;


  let txt = (inpText.value || "").trim();
  if(txt.length === 0 ) return;

  let marime= parseInt(inpMarime.value, 10);
  if(!marime || marime < 6) marime = 24;

  let x = parseInt(inpX.value, 10);
  let y = parseInt(inpY.value, 10);

  //setez limitele
  if(!x) x =0;
  if(!y ) y= 0;

  if(x < 0) x = 0;
  if(y < 0) y = 0;
  if(x > canvas.width) x = canvas.width;
  if(y> canvas.height) y = canvas.height;

  context.putImageData(raster, 0, 0);

  context.save();

  context.fillStyle = inpCuloare.value;
  context.font = marime +  "px Arial";


  //pentru a putea introduce y=0
  context.textBaseline = "top";
  context.textAlign= "left";

  //scriu textul la coordonatele introduse
  context.fillText(txt, x, y );
  context.restore();


  //reface resterul
  raster = context.getImageData(0,0, canvas.width, canvas.height);
  desenare();
}

function salveazaImagine(){
  if(!raster) return;

  //creez un link
  let a =  document.createElement("a");
  a.download = "rezultat.png";

  //scot PNG din canvas
  a.href= canvas.toDataURL("image/png");
  document.body.appendChild(a);

  //simtulez clink ca sa incep descarcarea
  a.click();
  a.remove();
}
