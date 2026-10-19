const tablaFamilia = document.querySelector("#tablaFamilia tbody");

const canvas = document.getElementById("firmaCanvas");
const ctx = canvas.getContext("2d");

let dibujando = false;

/* Control de la firma */
let firmaRealizada = false;
let firmaExistente = false;
let firmaDebeCorregirse = false;

canvas.width = 600;
canvas.height = 220;

ctx.lineWidth = 2;
ctx.lineCap = "round";
ctx.strokeStyle = "#000";

/* ===== SOLO NÚMEROS ===== */

document.getElementById("telefonoSolicitante").addEventListener("input", function () {
  this.value = this.value.replace(/[^0-9]/g, "");
});

document.getElementById("telefonoEncargado").addEventListener("input", function () {
  this.value = this.value.replace(/[^0-9]/g, "");
});

document.getElementById("identificacionSolicitante").addEventListener("input", function () {
  this.value = this.value.replace(/[^0-9]/g, "");
});

document.getElementById("identificacionEncargado").addEventListener("input", function () {
  this.value = this.value.replace(/[^0-9]/g, "");
});

/* ===== MOUSE ===== */

canvas.addEventListener("mousedown", (e) => {
  dibujando = true;

  ctx.beginPath();
  ctx.moveTo(e.offsetX, e.offsetY);
});

canvas.addEventListener("mousemove", (e) => {

  if (!dibujando) return;

  firmaRealizada = true;

  ctx.lineTo(e.offsetX, e.offsetY);

  ctx.stroke();

});

canvas.addEventListener("mouseup", () => {
  dibujando = false;
});

canvas.addEventListener("mouseleave", () => {
  dibujando = false;
});

/* ===== TOUCH ===== */

canvas.addEventListener("touchstart", (e) => {
  e.preventDefault();

  dibujando = true;

  const rect = canvas.getBoundingClientRect();
  const touch = e.touches[0];

  ctx.beginPath();

  ctx.moveTo(
    touch.clientX - rect.left,
    touch.clientY - rect.top
  );
});

canvas.addEventListener("touchmove", (e) => {

  e.preventDefault();

  if (!dibujando) return;

  firmaRealizada = true;

  const rect = canvas.getBoundingClientRect();

  const touch = e.touches[0];

  ctx.lineTo(
    touch.clientX - rect.left,
    touch.clientY - rect.top
  );

  ctx.stroke();

});

canvas.addEventListener("touchend", () => {
  dibujando = false;
});

/* ===== LIMPIAR ===== */

function limpiarFirma() {

  ctx.clearRect(
    0,
    0,
    canvas.width,
    canvas.height
  );

  firmaRealizada = false;

}

/* =========================================
   CONVERTIR FIRMA A IMAGEN PNG
========================================= */

async function obtenerFirmaPNG() {

    /*
       Creamos otro canvas para que la imagen
       tenga fondo blanco.
    */

    const canvasExportar =
        document.createElement("canvas");

    canvasExportar.width = canvas.width;

    canvasExportar.height = canvas.height;


    const contextoExportar =
        canvasExportar.getContext("2d");


    /* Fondo blanco */

    contextoExportar.fillStyle = "#ffffff";

    contextoExportar.fillRect(
        0,
        0,
        canvasExportar.width,
        canvasExportar.height
    );


    /* Copiar la firma */

    contextoExportar.drawImage(
        canvas,
        0,
        0
    );


    /* Convertir a PNG */

    const blob = await new Promise(resolve => {

        canvasExportar.toBlob(
            resolve,
            "image/png"
        );

    });


    return blob;
}

function agregarIntegrante() {

  const fila = document.createElement("tr");

  fila.innerHTML = `
    <td><input type="text" class="nombre"></td>

    <td>
      <input 
        type="text" 
        class="cedula"
        oninput="this.value = this.value.replace(/[^0-9]/g, '')"
      >
    </td>

    <td><input type="number" class="edad"></td>

    <td><input type="text" class="parentesco"></td>

    <td><input type="text" class="escolaridad"></td>

    <td><input type="text" class="ocupacion"></td>

    <td>
      <input 
        type="number" 
        class="ingreso" 
        value="0"
      >
    </td>

    <td>
      <button type="button" onclick="eliminarFila(this)">
        Eliminar
      </button>
    </td>
  `;

  tablaFamilia.appendChild(fila);
}

function eliminarFila(boton) {

  boton.closest("tr").remove();
}

function obtenerGrupoFamiliar() {

  const filas = document.querySelectorAll("#tablaFamilia tbody tr");

  const grupo = [];

  filas.forEach((fila, index) => {

    grupo.push({

      numero: index + 1,

      nombreCompleto: fila.querySelector(".nombre").value,

      cedula: fila.querySelector(".cedula").value,

      edad: Number(fila.querySelector(".edad").value) || 0,

      parentesco: fila.querySelector(".parentesco").value,

      escolaridad: fila.querySelector(".escolaridad").value,

      ocupacion: fila.querySelector(".ocupacion").value,

      ingresoMensual: Number(fila.querySelector(".ingreso").value) || 0

    });

  });

  return grupo;
}

function obtenerDocumentos() {

  return {

    cedula: document.getElementById("docCedula").files[0],

    salario: document.getElementById("docSalario").files[0],

    declaracion: document.getElementById("docDeclaracion").files[0],

    pension: document.getElementById("docPension").files[0],

    medico: document.getElementById("docMedico").files[0],

    otros: document.getElementById("docOtros").files
  };
}

function obtenerAyudas() {

  const filas = document.querySelectorAll("#tablaAyudas tbody tr");

  const ayudas = [];

  filas.forEach(fila => {

    const selectRecibe =
      fila.children[0].querySelector("select");

    const nombre =
      fila.children[1].querySelector("input")?.value || "";

    const tipoAyuda =
      fila.children[2].querySelector("select")?.value || "";

    const monto =
      Number(
        fila.children[3].querySelector("input")?.value
      ) || 0;

    const detalle =
      fila.children[4].querySelector("input")?.value || "";

    ayudas.push({

      recibeAyuda: selectRecibe.value,

      nombrePersona: nombre,

      tipoAyuda: tipoAyuda,

      monto: monto,

      detalle: detalle
    });

  });

  return ayudas;
}

document.getElementById("formulario").addEventListener("submit", async function(e) {

  e.preventDefault();

  /* =========================================
   VALIDAR FIRMA
========================================= */

const necesitaFirmaNueva =
    !firmaExistente ||
    firmaDebeCorregirse;


if (necesitaFirmaNueva && !firmaRealizada) {

    alert(
        "Debe realizar la firma del encargado legal antes de enviar la solicitud."
    );

    document
        .getElementById("seccionFirma")
        .scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

    return;
}

  const botonGuardar = document.querySelector(".guardar");

  botonGuardar.disabled = true;

  botonGuardar.textContent = "Enviando...";

  const solicitud = {

    fechaRegistro: new Date(),

    estadoSolicitud: "Pendiente",

    datosSolicitante: {

      nombreCompleto: document.getElementById("nombreSolicitante").value,

      genero: document.getElementById("generoSolicitante").value,

      nacionalidad: document.getElementById("nacionalidadSolicitante").value,

      identificacion: document.getElementById("identificacionSolicitante").value,

      edad: Number(document.getElementById("edadSolicitante").value) || 0,

      fechaNacimiento: document.getElementById("fechaNacimiento").value,

      telefono: document.getElementById("telefonoSolicitante").value,

      seccion: document.getElementById("seccion").value
    },

    datosEncargado: {

      nombreCompleto: document.getElementById("nombreEncargado").value,

      genero: document.getElementById("generoEncargado").value,

      nacionalidad: document.getElementById("nacionalidadEncargado").value,

      identificacion: document.getElementById("identificacionEncargado").value,

      telefono: document.getElementById("telefonoEncargado").value,

      correoElectronico: document.getElementById("correoEncargado").value
    },

    direccionGrupoFamiliar: {

  provincia: document.getElementById("provincia").value,

  canton: document.getElementById("canton").value,

  distrito: document.getElementById("distrito").value,

  comunidad: document.getElementById("comunidad").value,

  direccionExacta: document.getElementById("direccionExacta").value,

  distanciaKm: Number(document.getElementById("distanciaKm").value) || 0
},
   ayudasEstadoSolicitante: obtenerAyudas(),

    grupoFamiliar: obtenerGrupoFamiliar()
  };

  const documentos = obtenerDocumentos();

  const formData = new FormData();

  formData.append("datos", JSON.stringify(solicitud));

  if (documentos.cedula) {
    formData.append("cedula", documentos.cedula);
  }

  if (documentos.salario) {
    formData.append("salario", documentos.salario);
  }

  if (documentos.declaracion) {
    formData.append("declaracion", documentos.declaracion);
  }

  if (documentos.pension) {
    formData.append("pension", documentos.pension);
  }

  if (documentos.medico) {
    formData.append("medico", documentos.medico);
  }

  for (let i = 0; i < documentos.otros.length; i++) {

    formData.append("otros", documentos.otros[i]);
  }

/* =========================================
   AGREGAR FIRMA COMO IMAGEN
========================================= */

if (firmaRealizada) {

    const firmaPNG =
        await obtenerFirmaPNG();


    if (firmaPNG) {

        const cedulaEstudiante =
            document
                .getElementById(
                    "identificacionSolicitante"
                )
                .value;


        formData.append(
            "firma",
            firmaPNG,
            `firma-${cedulaEstudiante}.png`
        );

    }

}

  try {

    const respuesta = await fetch("http://localhost:3000/solicitudes", {

      method: "POST",

      body: formData
    });

    const resultado = await respuesta.json();

    alert(resultado.mensaje);

    document.getElementById("formulario").reset();

    tablaFamilia.innerHTML = "";

    agregarIntegrante();

    botonGuardar.disabled = false;

    botonGuardar.textContent = "Guardar solicitud";

  } catch (error) {

    console.error(error);

    alert("Error al guardar la solicitud");

    botonGuardar.disabled = false;

    botonGuardar.textContent = "Guardar solicitud";
  }
});

agregarIntegrante();
function bloquearSeccion(idSeccion) {

    const seccion = document.getElementById(idSeccion);

    if (!seccion) return;

    // Bloquear todos los controles de la sección
    seccion.querySelectorAll("input, select, textarea, button").forEach(control => {

        // No bloquear el botón para limpiar la firma
        if (control.getAttribute("onclick") === "limpiarFirma()") return;

        control.disabled = true;

    });

    // El canvas de la firma también queda bloqueado
    const canvas = seccion.querySelector("canvas");

    if (canvas) {

        canvas.style.pointerEvents = "none";
        canvas.style.opacity = "0.7";

    }

}
cargarSolicitudExistente();

const ubicaciones = {

    "San José": {

        "San José": [
            "Carmen",
            "Merced",
            "Hospital",
            "Catedral",
            "Zapote",
            "San Francisco de Dos Ríos",
            "Uruca",
            "Mata Redonda",
            "Pavas",
            "Hatillo",
            "San Sebastián"
        ],

        "Escazú": [
            "Escazú",
            "San Antonio",
            "San Rafael"
        ],

        "Desamparados": [
            "Desamparados",
            "San Miguel",
            "San Juan de Dios",
            "San Rafael Arriba",
            "San Antonio",
            "Frailes",
            "Patarrá",
            "San Cristóbal",
            "Rosario",
            "Damas",
            "San Rafael Abajo",
            "Gravilias",
            "Los Guido"
        ],

        "Puriscal": [
            "Santiago",
            "Mercedes Sur",
            "Barbacoas",
            "Grifo Alto",
            "San Rafael",
            "Candelarita",
            "Desamparaditos",
            "San Antonio",
            "Chires"
        ],

        "Tarrazú": [
            "San Marcos",
            "San Lorenzo",
            "San Carlos"
        ],

        "Aserrí": [
            "Aserrí",
            "Tarbaca",
            "Vuelta de Jorco",
            "San Gabriel",
            "Legua",
            "Monterrey",
            "Salitrillos"
        ],

        "Mora": [
            "Colón",
            "Guayabo",
            "Tabarcia",
            "Piedras Negras",
            "Picagres"
        ],

        "Goicoechea": [
            "Guadalupe",
            "San Francisco",
            "Calle Blancos",
            "Mata de Plátano",
            "Ipís",
            "Rancho Redondo",
            "Purral"
        ],

        "Santa Ana": [
            "Santa Ana",
            "Salitral",
            "Pozos",
            "Uruca",
            "Piedades",
            "Brasil"
        ],

        "Alajuelita": [
            "Alajuelita",
            "San Josecito",
            "San Antonio",
            "Concepción",
            "San Felipe"
        ],

        "Vásquez de Coronado": [
            "San Isidro",
            "San Rafael",
            "Dulce Nombre de Jesús",
            "Patalillo",
            "Cascajal"
        ]
    },

    "Alajuela": {

        "Alajuela": [
            "Alajuela",
            "San José",
            "Carrizal",
            "San Antonio",
            "Guácima",
            "San Isidro",
            "Sabanilla",
            "San Rafael",
            "Río Segundo",
            "Desamparados",
            "Turrúcares",
            "Tambor",
            "Garita",
            "Sarapiquí"
        ],

        "San Ramón": [
            "San Ramón",
            "Santiago",
            "San Juan",
            "Piedades Norte",
            "Piedades Sur",
            "San Rafael",
            "San Isidro",
            "Ángeles",
            "Alfaro",
            "Volio"
        ],

        "Grecia": [
            "Grecia",
            "San Isidro",
            "San José",
            "San Roque",
            "Tacares",
            "Puente de Piedra",
            "Bolívar"
        ],

        "Naranjo": [
            "Naranjo",
            "San Miguel",
            "San José",
            "Cirrí Sur",
            "San Jerónimo",
            "San Juan",
            "Rosario",
            "Palmitos"
        ],

        "Palmares": [
            "Palmares",
            "Zaragoza",
            "Buenos Aires",
            "Santiago",
            "Candelaria",
            "Esquipulas",
            "La Granja"
        ],

        "Poás": [
            "San Pedro",
            "San Juan",
            "San Rafael",
            "Carrillos",
            "Sabana Redonda"
        ],

        "Orotina": [
            "Orotina",
            "Mastate",
            "Hacienda Vieja",
            "Coyolar",
            "La Ceiba"
        ],

        "San Carlos": [
            "Quesada",
            "Florencia",
            "Buenavista",
            "Aguas Zarcas",
            "Venecia",
            "Pital",
            "La Fortuna"
        ]
    },

    "Cartago": {

        "Cartago": [
            "Oriental",
            "Occidental",
            "Carmen",
            "San Nicolás",
            "Aguacaliente",
            "Guadalupe",
            "Corralillo",
            "Tierra Blanca",
            "Dulce Nombre",
            "Llano Grande",
            "Quebradilla"
        ],

        "Paraíso": [
            "Paraíso",
            "Santiago",
            "Orosi",
            "Cachí"
        ],

        "La Unión": [
            "Tres Ríos",
            "San Diego",
            "San Juan",
            "San Rafael",
            "Concepción",
            "Dulce Nombre",
            "San Ramón",
            "Río Azul"
        ]
    },

    "Heredia": {

        "Heredia": [
            "Heredia",
            "Mercedes",
            "San Francisco",
            "Ulloa",
            "Varablanca"
        ],

        "Barva": [
            "Barva",
            "San Pedro",
            "San Pablo",
            "San Roque",
            "Santa Lucía",
            "San José de la Montaña"
        ],

        "Santo Domingo": [
            "Santo Domingo",
            "San Vicente",
            "San Miguel",
            "Paracito",
            "Santo Tomás"
        ]
    },

    "Guanacaste": {

        "Liberia": [
            "Liberia",
            "Cañas Dulces",
            "Mayorga",
            "Nacascolo",
            "Curubandé"
        ],

        "Nicoya": [
            "Nicoya",
            "Mansión",
            "San Antonio",
            "Quebrada Honda",
            "Sámara",
            "Nosara",
            "Belén de Nosarita"
        ],

        "Santa Cruz": [
            "Santa Cruz",
            "Bolsón",
            "Veintisiete de Abril",
            "Tempate",
            "Cartagena"
        ],

        "Bagaces": [
            "Bagaces",
            "La Fortuna",
            "Mogote",
            "Río Naranjo"
        ],

        "Carrillo": [
            "Filadelfia",
            "Palmira",
            "Sardinal",
            "Belén"
        ],

        "Cañas": [
            "Cañas",
            "Palmira",
            "San Miguel",
            "Bebedero",
            "Porozal"
        ],

        "Abangares": [
            "Las Juntas",
            "Sierra",
            "San Juan",
            "Colorado"
        ],

        "Tilarán": [
            "Tilarán",
            "Quebrada Grande",
            "Tronadora",
            "Santa Rosa"
        ]
    },

    "Puntarenas": {

        "Puntarenas": [
            "Puntarenas",
            "Pitahaya",
            "Chomes",
            "Lepanto",
            "Paquera",
            "Manzanillo"
        ],

        "Esparza": [
            "Espíritu Santo",
            "San Juan Grande",
            "Macacona",
            "San Rafael"
        ],

        "Buenos Aires": [
            "Buenos Aires",
            "Volcán",
            "Potrero Grande",
            "Boruca"
        ]
    },

    "Limón": {

        "Limón": [
            "Limón",
            "Valle La Estrella",
            "Río Blanco",
            "Matama"
        ],

        "Pococí": [
            "Guápiles",
            "Jiménez",
            "Rita",
            "Roxana",
            "Cariari",
            "Colorado"
        ],

        "Siquirres": [
            "Siquirres",
            "Pacuarito",
            "Florida",
            "Germania"
        ]
    }

};

window.onload = () => {

    let provincia = document.getElementById("provincia");

    for(let p in ubicaciones){

        provincia.innerHTML += `
            <option value="${p}">
                ${p}
            </option>
        `;
    }

};

function cargarCantones() {

    let provincia = document.getElementById("provincia").value;

    let canton = document.getElementById("canton");

    canton.innerHTML =
        `<option value="">Seleccione cantón</option>`;

    document.getElementById("distrito").innerHTML =
        `<option value="">Seleccione distrito</option>`;

    for(let c in ubicaciones[provincia]) {

        canton.innerHTML += `
            <option value="${c}">
                ${c}
            </option>
        `;
    }
}

function cargarDistritos() {

    let provincia = document.getElementById("provincia").value;

    let canton = document.getElementById("canton").value;

    let distrito = document.getElementById("distrito");

    distrito.innerHTML =
        `<option value="">Seleccione distrito</option>`;

    ubicaciones[provincia][canton].forEach(d => {

        distrito.innerHTML += `
            <option value="${d}">
                ${d}
            </option>
        `;
    });
}

function toggleAyuda(selectPrincipal) {

  

    let fila = selectPrincipal.closest("tr");

    let nombre =
    fila.children[1].querySelector("input");

    let tipoAyuda =
    fila.children[2].querySelector("select");

    let monto =
    fila.children[3].querySelector("input");

    let detalle =
    fila.children[4].querySelector("input");

    let activar =
    selectPrincipal.value === "Sí";
    nombre.disabled = !activar;
    tipoAyuda.disabled = !activar;
    monto.disabled = !activar;
    detalle.disabled = !activar;

    if(!activar) {
  
        nombre.value = "";

        tipoAyuda.selectedIndex = 0;

        monto.value = 0;

        detalle.value = "";
    }
}

function agregarAyuda() {

    let tabla =
        document.querySelector("#tablaAyudas tbody");

    let fila = document.createElement("tr");

    fila.innerHTML = `

        <td>
            <select onchange="toggleAyuda(this)">
                <option value="No">No</option>
                <option value="Sí">Sí</option>
            </select>
        </td>

        <td>
            <input
                type="text"
                placeholder="Nombre completo"
                disabled
            >
        </td>

        <td>
            <select disabled>
                <option>Ninguna</option>
                <option>CRECEMOS</option>
                <option>AVANCEMOS</option>
                <option>Otra</option>
            </select>
        </td>

        <td>
            <input
                type="number"
                value="0"
                disabled
            >
        </td>

        <td>
            <input
                type="text"
                placeholder="Especifique"
                disabled
            >
        </td>

        <td>
            <button
                type="button"
                class="btn-delete"
                onclick="eliminarAyuda(this)"
            >
                Eliminar
            </button>
        </td>

    `;

    tabla.appendChild(fila);
}
function eliminarAyuda(boton) {

    let filas =
    document.querySelectorAll("#tablaAyudas tbody tr");

    if(filas.length > 1){

        boton.closest("tr").remove();

    } else {

        alert("Debe existir al menos una fila.");
    }
}
async function cargarSolicitudExistente() {

    const cedula =
        localStorage.getItem("cedulaEstudiante");

    if (!cedula) return;

    console.log(
        "Preparado para cargar solicitud:",
        cedula
    );

}

async function cargarSolicitudExistente() {
    function llenarFormulario(datos) {

    // DATOS DEL SOLICITANTE

    document.getElementById("nombreSolicitante").value =
        datos.datosSolicitante?.nombreCompleto || "";

    document.getElementById("generoSolicitante").value =
        datos.datosSolicitante?.genero || "";

    document.getElementById("nacionalidadSolicitante").value =
        datos.datosSolicitante?.nacionalidad || "";

    document.getElementById("identificacionSolicitante").value =
        datos.datosSolicitante?.identificacion || "";

    document.getElementById("edadSolicitante").value =
        datos.datosSolicitante?.edad || "";

    document.getElementById("fechaNacimiento").value =
        datos.datosSolicitante?.fechaNacimiento || "";

    document.getElementById("telefonoSolicitante").value =
        datos.datosSolicitante?.telefono || "";

    document.getElementById("seccion").value =
        datos.datosSolicitante?.seccion || "";

    // DATOS ENCARGADO

    document.getElementById("nombreEncargado").value =
        datos.datosEncargado?.nombreCompleto || "";

    document.getElementById("generoEncargado").value =
        datos.datosEncargado?.genero || "";

    document.getElementById("nacionalidadEncargado").value =
        datos.datosEncargado?.nacionalidad || "";

    document.getElementById("identificacionEncargado").value =
        datos.datosEncargado?.identificacion || "";

    document.getElementById("telefonoEncargado").value =
        datos.datosEncargado?.telefono || "";

    document.getElementById("correoEncargado").value =
        datos.datosEncargado?.correoElectronico || "";

    // DIRECCIÓN

    document.getElementById("provincia").value =
        datos.direccionGrupoFamiliar?.provincia || "";

    cargarCantones();

    document.getElementById("canton").value =
        datos.direccionGrupoFamiliar?.canton || "";

    cargarDistritos();

    document.getElementById("distrito").value =
        datos.direccionGrupoFamiliar?.distrito || "";

    document.getElementById("comunidad").value =
        datos.direccionGrupoFamiliar?.comunidad || "";

    document.getElementById("direccionExacta").value =
        datos.direccionGrupoFamiliar?.direccionExacta || "";

    document.getElementById("distanciaKm").value =
        datos.direccionGrupoFamiliar?.distanciaKm || "";
    
    // GRUPO FAMILIAR

tablaFamilia.innerHTML = "";

(datos.grupoFamiliar || []).forEach(persona => {

    const fila = document.createElement("tr");

    fila.innerHTML = `
        <td>
            <input type="text"
            class="nombre"
            value="${persona.nombreCompleto || ""}">
        </td>

        <td>
            <input type="text"
            class="cedula"
            value="${persona.cedula || ""}">
        </td>

        <td>
            <input type="number"
            class="edad"
            value="${persona.edad || 0}">
        </td>

        <td>
            <input type="text"
            class="parentesco"
            value="${persona.parentesco || ""}">
        </td>

        <td>
            <input type="text"
            class="escolaridad"
            value="${persona.escolaridad || ""}">
        </td>

        <td>
            <input type="text"
            class="ocupacion"
            value="${persona.ocupacion || ""}">
        </td>

        <td>
            <input type="number"
            class="ingreso"
            value="${persona.ingresoMensual || 0}">
        </td>

        <td>
            <button
                type="button"
                onclick="eliminarFila(this)"
            >
                Eliminar
            </button>
        </td>
    `;

    tablaFamilia.appendChild(fila);

});

// AYUDAS DEL ESTADO

const tablaAyudas =
document.querySelector("#tablaAyudas tbody");

tablaAyudas.innerHTML = "";

(datos.ayudasEstadoSolicitante || []).forEach(ayuda => {

    const fila = document.createElement("tr");

    fila.innerHTML = `

        <td>
            <select onchange="toggleAyuda(this)">
                <option value="No"
                ${ayuda.recibeAyuda === "No" ? "selected" : ""}>
                No
                </option>

                <option value="Sí"
                ${ayuda.recibeAyuda === "Sí" ? "selected" : ""}>
                Sí
                </option>
            </select>
        </td>

        <td>
            <input
                type="text"
                value="${ayuda.nombrePersona || ""}"
            >
        </td>

        <td>
            <select>
                <option ${ayuda.tipoAyuda === "Ninguna" ? "selected" : ""}>
                    Ninguna
                </option>

                <option ${ayuda.tipoAyuda === "CRECEMOS" ? "selected" : ""}>
                    CRECEMOS
                </option>

                <option ${ayuda.tipoAyuda === "AVANCEMOS" ? "selected" : ""}>
                    AVANCEMOS
                </option>

                <option ${ayuda.tipoAyuda === "Otra" ? "selected" : ""}>
                    Otra
                </option>
            </select>
        </td>

        <td>
            <input
                type="number"
                value="${ayuda.monto || 0}"
            >
        </td>

        <td>
            <input
                type="text"
                value="${ayuda.detalle || ""}"
            >
        </td>

        <td>
            <button
                type="button"
                onclick="eliminarAyuda(this)"
            >
                Eliminar
            </button>
        </td>
    `;

    tablaAyudas.appendChild(fila);

});

}

    const cedula =
    localStorage.getItem("cedulaEstudiante");

    if (!cedula) return;

    try {

        const respuesta = await fetch(

            `http://localhost:3000/solicitud-edicion/${cedula}`
        );

        if (!respuesta.ok) return;

        const datos = await respuesta.json();

        /* SABER SI YA EXISTE UNA FIRMA */

firmaExistente =
    Boolean(datos.firma);


/* SABER SI EL DOCENTE PIDIÓ CORREGIR LA FIRMA */

firmaDebeCorregirse =
    Array.isArray(datos.camposCorregir) &&
    datos.camposCorregir.includes("firma");

       if (datos.estadoSolicitud === "Corrección pendiente") {

    document.getElementById("mensajeCorreccion").style.display = "block";

    document.getElementById("textoCorreccion").textContent =
        datos.observaciones || "";

    document.getElementById("btnEnviar").textContent =
        "Reenviar corrección";
}
        llenarFormulario(datos);
if (datos.camposCorregir && datos.camposCorregir.length > 0) {
    document.getElementById("contadorCorrecciones").style.display = "block";

document.getElementById("textoContador").innerHTML =
`Se deben corregir <strong>${datos.camposCorregir.length}</strong> sección(es) antes de volver a enviar la solicitud.`;

    datos.camposCorregir.forEach(campo => {

        let seccion = null;

        switch (campo) {

            case "estudiante":
                seccion = document.getElementById("seccionEstudiante");
                break;

            case "encargado":
                seccion = document.getElementById("seccionEncargado");
                break;

            case "direccion":
                seccion = document.getElementById("seccionDireccion");
                break;

            case "ayudas":
                seccion = document.getElementById("seccionAyudas");
                break;

            case "grupo":
                seccion = document.getElementById("seccionGrupo");
                break;
            case "calculo":
                seccion = document.getElementById("seccionCalculo");
                break;
            case "documentos":
                seccion = document.getElementById("seccionDocumentos");
                break;

            case "firma":
                seccion = document.getElementById("seccionFirma");
                break;

        }

       if (seccion) {

    console.log("Resaltando:", campo);

    seccion.classList.add("seccion-corregir");

    // Solo crear el aviso si todavía no existe
if (!seccion.querySelector(".aviso-correccion")) {

    const aviso = document.createElement("div");

    aviso.className = "aviso-correccion";

    aviso.innerHTML =
        "⚠️ Esta sección debe corregirse antes de reenviar la solicitud.";

    seccion.querySelector("h3").insertAdjacentElement(
        "afterend",
        aviso
    );
}

    if (!window.primeraCorreccion) {

        window.primeraCorreccion = true;

        setTimeout(() => {

            seccion.scrollIntoView({

                behavior: "smooth",
                block: "center"

            });

        }, 300);

    }

}
    });

}
const todasLasSecciones = {

    estudiante: "seccionEstudiante",
    encargado: "seccionEncargado",
    direccion: "seccionDireccion",
    ayudas: "seccionAyudas",
    grupo: "seccionGrupo",
    documentos: "seccionDocumentos",
    firma: "seccionFirma"

};

Object.entries(todasLasSecciones).forEach(([clave, id]) => {

    if (!datos.camposCorregir.includes(clave)) {

        bloquearSeccion(id);

    }

});
    } catch (error) {

        console.log(error);
    }
}
agregarIntegrante();

cargarSolicitudExistente();

/* =========================================
   AYUDA INDIVIDUAL DEL FORMULARIO
========================================= */

document.addEventListener("DOMContentLoaded", function () {

    const ayudasFormulario = {

        /* ================================
           1. DATOS DEL SOLICITANTE
        ================================= */

        nombreSolicitante:
            "Escriba el nombre completo del estudiante tal como aparece en su documento de identificación.",

        generoSolicitante:
            "Seleccione el género del estudiante.",

        nacionalidadSolicitante:
            "Indique la nacionalidad del estudiante. Por ejemplo: costarricense, nicaragüense, colombiana, entre otras.",

        identificacionSolicitante:
            "Escriba únicamente los números de la cédula, DIMEX o documento de identificación del estudiante. No utilice espacios ni guiones.",

        edadSolicitante:
            "Indique la edad actual del estudiante en años cumplidos.",

        fechaNacimiento:
            "Seleccione la fecha de nacimiento del estudiante.",

        telefonoSolicitante:
            "Escriba un número telefónico de 8 dígitos donde se pueda contactar al estudiante o a su familia.",

        seccion:
            "Seleccione la sección que actualmente cursa el estudiante en el Colegio Técnico Profesional de Cañas.",


        /* ================================
           2. ENCARGADO LEGAL
        ================================= */

        nombreEncargado:
            "Escriba el nombre completo de la madre, padre o persona responsable legal del estudiante.",

        generoEncargado:
            "Seleccione el género de la persona encargada legal.",

        nacionalidadEncargado:
            "Indique la nacionalidad del encargado legal.",

        identificacionEncargado:
            "Escriba únicamente los números del documento de identificación del encargado legal.",

        telefonoEncargado:
            "Ingrese un número de teléfono de 8 dígitos donde la institución pueda contactar al encargado legal.",

        correoEncargado:
            "Ingrese un correo electrónico que utilice actualmente. A este correo se enviarán avisos relacionados con la solicitud de comedor.",


        /* ================================
           3. DIRECCIÓN
        ================================= */

        provincia:
            "Seleccione la provincia donde vive actualmente el estudiante y su grupo familiar.",

        canton:
            "Seleccione el cantón correspondiente a su lugar de residencia.",

        distrito:
            "Seleccione el distrito correspondiente a su lugar de residencia.",

        comunidad:
            "Escriba el nombre del barrio, caserío o comunidad donde vive la familia.",

        direccionExacta:
            "Describa la dirección de la vivienda utilizando puntos de referencia que permitan localizarla fácilmente.",

        distanciaKm:
            "Indique aproximadamente cuántos kilómetros existen entre la vivienda del estudiante y el centro educativo.",


        /* ================================
           4. AYUDAS DEL ESTADO
        ================================= */


        /* ================================
           6. DOCUMENTOS
        ================================= */

        docCedula:
            "Adjunte una fotografía o archivo PDF de la cédula, tarjeta de identificación de menores o documento de identidad correspondiente.",

        docSalario:
            "Adjunte la constancia salarial de las personas del grupo familiar que reciben salario, cuando corresponda.",

        docDeclaracion:
            "Utilice este espacio para adjuntar una declaración jurada de ingresos cuando corresponda.",

        docPension:
            "Adjunte la constancia relacionada con pensiones, cuando algún miembro del grupo familiar reciba este tipo de ingreso.",

        docMedico:
            "Adjunte un certificado o documento médico únicamente cuando sea necesario para respaldar alguna situación indicada en la solicitud.",

        docOtros:
            "Aquí puede adjuntar otros documentos que considere importantes para respaldar la situación socioeconómica de la familia."

    };


    /* BUSCAR TODOS LOS LABEL DEL FORMULARIO */

    const labels = document.querySelectorAll("#formulario label");


    labels.forEach(function(label){

        /*
         El código busca el input, select o textarea
         que está inmediatamente después del label.
        */

        const campo = label.nextElementSibling;


        if(!campo){
            return;
        }


        /*
         Si no tiene ID o no existe explicación
         para ese campo, no hacemos nada.
        */

        if(!campo.id || !ayudasFormulario[campo.id]){
            return;
        }


        /* CONTENEDOR PRINCIPAL */

        const contenedor = document.createElement("div");

        contenedor.className = "campo-con-ayuda";


        /* FILA DEL LABEL + ? */

        const fila = document.createElement("div");

        fila.className = "label-fila";


        /*
         Colocamos el nuevo contenedor exactamente
         donde estaba el label.
        */

        label.parentNode.insertBefore(
            contenedor,
            label
        );


        /* MOVER LABEL A LA FILA */

        fila.appendChild(label);


        /* CREAR BOTÓN ? */

        const botonAyuda =
            document.createElement("button");

        botonAyuda.type = "button";

        botonAyuda.className = "btn-ayuda";

        botonAyuda.textContent = "?";

        botonAyuda.setAttribute(
            "aria-label",
            "Mostrar ayuda"
        );

        botonAyuda.setAttribute(
            "aria-expanded",
            "false"
        );


        fila.appendChild(botonAyuda);

        contenedor.appendChild(fila);


        /* CREAR MENSAJE */

        const mensaje =
            document.createElement("div");

        mensaje.className = "texto-ayuda";

        mensaje.textContent =
            ayudasFormulario[campo.id];

        mensaje.hidden = true;


        contenedor.appendChild(mensaje);


        /* AL PRESIONAR EL ? */

        botonAyuda.addEventListener(
            "click",
            function(){

                const estaOculto =
                    mensaje.hidden;


                /*
                 CERRAMOS OTRAS AYUDAS ABIERTAS
                */

                document
                    .querySelectorAll(".texto-ayuda")
                    .forEach(function(otraAyuda){

                        otraAyuda.hidden = true;

                    });


                document
                    .querySelectorAll(".btn-ayuda")
                    .forEach(function(otroBoton){

                        otroBoton.setAttribute(
                            "aria-expanded",
                            "false"
                        );

                    });


                /*
                 SI ESTABA CERRADO,
                 ABRIMOS ESTE
                */

                if(estaOculto){

                    mensaje.hidden = false;

                    botonAyuda.setAttribute(
                        "aria-expanded",
                        "true"
                    );

                }

            }
        );

    });

});