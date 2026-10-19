const cedulaEstudiante = localStorage.getItem("cedulaEstudiante");

alert("Buscando solicitud de: " + cedulaEstudiante);

async function cargarSolicitud() {

    try {

        const respuesta = await fetch(
            `http://localhost:3000/solicitud/${cedulaEstudiante}`
        );

        const datos = await respuesta.json();

        console.log(datos);

        // =====================
        // DATOS DEL ESTUDIANTE
        // =====================

        document.getElementById("adminNombre").textContent =
            datos.datosSolicitante?.nombreCompleto || "";

        document.getElementById("adminCedula").textContent =
            datos.datosSolicitante?.identificacion || "";

        document.getElementById("adminSeccion").textContent =
            datos.datosSolicitante?.seccion || "";

        document.getElementById("adminTelefono").textContent =
            datos.datosSolicitante?.telefono || "";

        // =====================
        // ENCARGADO
        // =====================

        document.getElementById("adminEncargado").textContent =
            datos.datosEncargado?.nombreCompleto || "";

        document.getElementById("adminCorreo").textContent =
            datos.datosEncargado?.correoElectronico || "";

        document.getElementById("adminTelefonoEncargado").textContent =
            datos.datosEncargado?.telefono || "";

        // =====================
        // DIRECCIÓN
        // =====================

        document.getElementById("adminProvincia").textContent =
            datos.direccionGrupoFamiliar?.provincia || "";

        document.getElementById("adminCanton").textContent =
            datos.direccionGrupoFamiliar?.canton || "";

        document.getElementById("adminDistrito").textContent =
            datos.direccionGrupoFamiliar?.distrito || "";

        document.getElementById("adminComunidad").textContent =
            datos.direccionGrupoFamiliar?.comunidad || "";

        document.getElementById("adminDireccion").textContent =
            datos.direccionGrupoFamiliar?.direccionExacta || "";

        // =====================
        // GRUPO FAMILIAR
        // =====================

        const tabla = document.querySelector("#tablaAdminFamilia tbody");

        tabla.innerHTML = "";

        (datos.grupoFamiliar || []).forEach(persona => {

            tabla.innerHTML += `
                <tr>
                    <td>${persona.nombreCompleto || ""}</td>
                    <td>${persona.cedula || ""}</td>
                    <td>${persona.edad || ""}</td>
                    <td>${persona.parentesco || ""}</td>
                    <td>${persona.escolaridad || ""}</td>
                    <td>${persona.ocupacion || ""}</td>
                    <td>₡${persona.ingresoMensual || 0}</td>
                </tr>
            `;

        });

        // =====================
        // CÁLCULO
        // =====================

        document.getElementById("totalIngresos").textContent =
            datos.calculoSocioeconomico?.totalIngresos || 0;

        document.getElementById("cantidadIntegrantes").textContent =
            datos.calculoSocioeconomico?.cantidadIntegrantes || 0;

        document.getElementById("perCapita").textContent =
            Math.round(datos.calculoSocioeconomico?.ingresoPerCapita || 0);

        document.getElementById("clasificacion").textContent =
            datos.calculoSocioeconomico?.clasificacion || "Pendiente";

        if (datos.estadoSolicitud) {

            document.getElementById("estadoSolicitud").value =
                datos.estadoSolicitud;

        }

        if (datos.observaciones) {

            document.getElementById("observaciones").value =
                datos.observaciones;

        }

        // =====================
        // SI YA FUE CORREGIDA
        // =====================

        if (datos.estadoSolicitud === "Corregida") {

            document.getElementById("avisoCorregida").style.display = "block";

        }

        if (
            datos.estadoSolicitud === "Corregida" &&
            datos.camposCorregir?.length > 0
        ) {

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

                    seccion.classList.add("seccion-corregida");

                    const aviso = document.createElement("div");

                    aviso.className = "aviso-corregida";

                    aviso.innerHTML =
                        "✅ Esta sección fue corregida por el estudiante.";

                    seccion.querySelector("h3")
                        ?.insertAdjacentElement("afterend", aviso);

                }

            });

        }

    } catch (error) {

        console.log(error);

        alert("Error al cargar la solicitud");

    }

}

async function guardarResolucion() {

    const estado =
        document.getElementById("estadoSolicitud").value;

    const observaciones =
        document.getElementById("observaciones").value;

    const camposCorregir = [];

    if (document.getElementById("corregirEstudiante").checked)
        camposCorregir.push("estudiante");

    if (document.getElementById("corregirEncargado").checked)
        camposCorregir.push("encargado");

    if (document.getElementById("corregirDireccion").checked)
        camposCorregir.push("direccion");

    if (document.getElementById("corregirGrupo").checked)
        camposCorregir.push("grupo");

    if (document.getElementById("corregirCalculo").checked)
        camposCorregir.push("calculo");

    try {

        const respuesta = await fetch(
            "http://localhost:3000/guardar-resolucion",
            {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    cedula: cedulaEstudiante,
                    estado,
                    observaciones,
                    camposCorregir

                })

            }
        );

        const resultado = await respuesta.json();

        alert(resultado.mensaje);

        cargarSolicitud();

    } catch (error) {

        console.log(error);

        alert("Error al guardar la resolución");

    }

}

/* =========================================================
   GENERAR EXCEL DE TODAS LAS SOLICITUDES
========================================================= */

async function generarExcel() {

    const boton = document.getElementById("btnGenerarExcel");

    try {

        /* Desactivar botón mientras genera el archivo */
        boton.disabled = true;
        boton.textContent = "⏳ Generando Excel...";


        /* Pedir el archivo al servidor */
        const respuesta = await fetch(
            "http://localhost:3000/exportar-excel"
        );


        /* Verificar que el servidor respondió bien */
        if (!respuesta.ok) {

            throw new Error(
                "No se pudo generar el archivo Excel"
            );

        }


        /* Convertir la respuesta en un archivo */
        const archivo = await respuesta.blob();


        /* Crear una dirección temporal para descargarlo */
        const url = window.URL.createObjectURL(archivo);


        /* Crear enlace temporal */
        const enlace = document.createElement("a");

        enlace.href = url;

        enlace.download = "Solicitudes_Comedor_2026.xlsx";


        /* Descargar */
        document.body.appendChild(enlace);

        enlace.click();

        enlace.remove();


        /* Liberar memoria */
        window.URL.revokeObjectURL(url);


        /* Mostrar éxito */
        boton.textContent = "✅ Excel generado";


        setTimeout(() => {

            boton.textContent = "📥 Generar Excel";

            boton.disabled = false;

        }, 2000);


    } catch (error) {

        console.error(
            "Error al generar Excel:",
            error
        );

        alert(
            "No se pudo generar el archivo Excel."
        );

        boton.disabled = false;

        boton.textContent = "📥 Generar Excel";

    }

}


cargarSolicitud();

