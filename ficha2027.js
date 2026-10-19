const selectorPDF=document.getElementById('pdf');
let urlPDF;
function quitarPDF(){
  if(urlPDF) URL.revokeObjectURL(urlPDF);
  urlPDF=null;
  document.querySelector('iframe').removeAttribute('src');
  document.getElementById('visor').hidden=true;
  document.getElementById('abrirPdf').hidden=true;
  document.getElementById('abrirPdf').removeAttribute('href');
  document.getElementById('quitarPdf').hidden=true;
}
selectorPDF.addEventListener('change',async()=>{
  quitarPDF();
  const archivo=selectorPDF.files[0];
  if(!archivo)return;
  const estado=document.getElementById('estadoPdf');
  if(archivo.size>20*1024*1024){estado.textContent='Seleccione un PDF de hasta 20 MB.';selectorPDF.value='';return;}
  const firma=new TextDecoder().decode(await archivo.slice(0,5).arrayBuffer());
  if(firma!=='%PDF-'){estado.textContent='El archivo seleccionado no tiene formato PDF válido.';selectorPDF.value='';return;}
  urlPDF=URL.createObjectURL(new Blob([archivo],{type:'application/pdf'}));
  document.querySelector('iframe').src=urlPDF;
  document.getElementById('visor').hidden=false;
  const enlace=document.getElementById('abrirPdf');enlace.href=urlPDF;enlace.hidden=false;
  document.getElementById('quitarPdf').hidden=false;
  estado.textContent=archivo.name+' — abierto en este equipo. Use el enlace para imprimir el PDF original.';
});
document.getElementById('quitarPdf').onclick=()=>{quitarPDF();selectorPDF.value='';document.getElementById('estadoPdf').textContent='PDF retirado.';};
document.getElementById('imprimirFicha').onclick=()=>window.print();
window.addEventListener('beforeunload',()=>{if(urlPDF)URL.revokeObjectURL(urlPDF);});
