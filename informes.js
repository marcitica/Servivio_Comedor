let registros = [], filasCSV = [];
const el = id => document.getElementById(id);
const seguro = valor => String(valor ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
el('fechaInforme').value = new Date().toLocaleDateString('en-CA');
el('acceso').addEventListener('submit', async e => {
  e.preventDefault();
  el('resultado').hidden = true;
  el('imprimir').disabled = el('csv').disabled = true;
  el('mensaje').textContent = 'Consultando…';
  try {
    const r = await fetch('http://localhost:3000/informes-comedor', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({cedula:el('cedula').value.trim(), password:el('clave').value})});
    const datos = await r.json();
    if (!r.ok) throw new Error(datos.mensaje || 'No se pudo consultar el informe');
    registros = datos.registros;
    el('clave').value = '';
    el('docenteInforme').value = datos.docente;
    el('seccionInforme').innerHTML = '<option value="">Todas</option>' + [...new Set(registros.map(s=>s.seccion).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'es',{numeric:true})).map(s=>`<option>${seguro(s)}</option>`).join('');
    el('mensaje').textContent = `${registros.length} solicitudes consultadas. Actualice después de cambiar una resolución.`;
    el('resultado').hidden = false;
    el('imprimir').disabled = el('csv').disabled = false;
    dibujar();
  } catch(error) { registros = []; el('mensaje').textContent = error.message; }
});
function dibujar() {
  const lista = registros.filter(s=>(!el('nivel').value || s.nivel===el('nivel').value) && (!el('seccionInforme').value || s.seccion===el('seccionInforme').value) && (!el('estadoInforme').value || s.estado===el('estadoInforme').value));
  el('alcance').textContent = `Nivel: ${el('nivel').value || 'todos'}. Sección: ${el('seccionInforme').value || 'todas'}. Estado: ${el('estadoInforme').value || 'todos'}. Total: ${lista.length}.`;
  filasCSV = [];
  const contar = (nivel, categoria, datos) => {
    const h = datos.filter(s=>s.genero.trim().toLowerCase()==='masculino').length;
    const m = datos.filter(s=>s.genero.trim().toLowerCase()==='femenino').length;
    filasCSV.push([nivel,categoria,h,m,datos.length-h-m,datos.length]);
  };
  const categorias = ['Pobreza extrema','Pobreza','Vulnerabilidad','No pobre','Sin información'];
  const niveles = el('nivel').value ? [el('nivel').value] : ['7','8','9','10','11','12',...(lista.some(s=>s.nivel==='Sin nivel')?['Sin nivel']:[])];
  niveles.forEach(n=>{
    const grupo=lista.filter(s=>s.nivel===n);
    categorias.forEach(c=>contar(n,c,grupo.filter(s=>s.categoria===c)));
    contar(n,'Total del nivel',grupo);
  });
  contar('Todos','TOTAL GENERAL',lista);
  el('estadisticas').innerHTML = filasCSV.map(f=>`<tr class="${String(f[1]).includes('Total') || f[1]==='TOTAL GENERAL'?'total':''}">${f.map(v=>`<td>${seguro(v)}</td>`).join('')}</tr>`).join('');
  const aceptados=lista.filter(s=>s.estado==='Aceptada');
  el('notificaciones').innerHTML = aceptados.length ? [...new Set(aceptados.map(s=>s.seccion))].sort((a,b)=>a.localeCompare(b,'es',{numeric:true})).map(seccion=>{
    const estudiantes=aceptados.filter(s=>s.seccion===seccion).sort((a,b)=>a.nombre.localeCompare(b.nombre,'es'));
    return `<section class="card notificacion"><h3>DOCUMENTOS DEL PROGRAMA DE ALIMENTACIÓN Y NUTRICIÓN DEL ESCOLAR Y ADOLESCENTE</h3><h3>Notificación a las personas beneficiarias del comedor estudiantil</h3><p>Nombre del Centro Educativo: CTP Cañas · Código: 6538-00</p><p>Dirección Regional: Cañas · Circuito Escolar: 01</p><p>Sección: ${seguro(seccion || 'Sin sección')} · Fecha: ${seguro(el('fechaInforme').value)}</p><p>Nombre del Docente: ${seguro(el('docenteInforme').value)} · Firma: __________________</p><p>Beneficiarios con solicitud aceptada: ${estudiantes.length}</p><table><thead><tr><th>Nombre completo</th><th>N.º de cédula</th><th class="firma">Firma</th></tr></thead><tbody>${estudiantes.map(s=>`<tr><td>${seguro(s.nombre)}</td><td>${seguro(s.cedula)}</td><td></td></tr>`).join('')}</tbody></table><p>Recibido por: __________________________ Fecha de recibido: ______________</p></section>`;
  }).join('') : '<section class="card"><p>No hay solicitudes aceptadas para generar notificaciones con estos filtros.</p></section>';
}
['nivel','seccionInforme','estadoInforme','fechaInforme','docenteInforme'].forEach(id=>el(id).addEventListener('input',dibujar));
el('imprimir').onclick=()=>window.print();
el('csv').onclick=()=>{
  const celda=v=>'"'+String(v).replace(/^[=+@-]/,"'$&").replace(/"/g,'""')+'"';
  const texto=[['Nivel','Categoría','Hombres','Mujeres','Sin género registrado','Total'],...filasCSV].map(f=>f.map(celda).join(';')).join('\r\n');
  const url=URL.createObjectURL(new Blob(['\uFEFF'+texto],{type:'text/csv;charset=utf-8'}));
  const a=document.createElement('a');a.href=url;a.download='Estadisticas_comedor.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
};
