document.getElementById("registroForm").addEventListener("submit", async (e) => {

    e.preventDefault();

    const datos = {
        nombre: document.getElementById("nombre").value,
        cedula: document.getElementById("cedula").value
    };

    try {

        const respuesta = await fetch("http://localhost:3000/registro", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(datos)
        });

        const resultado = await respuesta.json();

        alert(resultado.mensaje);

    } catch (error) {

        console.log(error);

        alert("Error en el registro");
    }
});


async function iniciarSesion() {

    const cedula = document.getElementById("loginCedula").value;

    const password = document.getElementById("loginPassword").value;

    try {

        const respuesta = await fetch("http://localhost:3000/login", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                cedula,
                password
            })
        });

        const resultado = await respuesta.json();

     if (respuesta.ok) {

  localStorage.setItem(
    "cedulaEstudiante",
    resultado.usuario.cedula
  );

  alert("Inicio de sesión correcto");

  document.getElementById("verificacionEstudiante").style.display = "none";

  document.getElementById("loginCard").style.display = "none";

  document.getElementById("perfilCard").style.display = "block";

  document.getElementById("perfilNombre").textContent =
    resultado.usuario.nombre;

  document.getElementById("perfilCedula").textContent =
    resultado.usuario.cedula;
    
    cargarEstadoSolicitud(
    resultado.usuario.cedula
);
    localStorage.setItem(
    "cedulaEstudiante",
    resultado.usuario.cedula
);

const botonFormulario = document.getElementById("btnFormulario");

if (resultado.solicitud) {

    if (resultado.solicitud.estadoSolicitud === "Corrección pendiente") {

        botonFormulario.textContent = "Realizar corrección";
        botonFormulario.disabled = false;

    } else {

        botonFormulario.textContent = "Solicitud enviada";
        botonFormulario.disabled = true;
    }

} else {

    botonFormulario.textContent = "Realizar solicitud";
    botonFormulario.disabled = false;
}
    localStorage.setItem(
    "cedulaEstudiante",
    resultado.usuario.cedula
);
    if(resultado.usuario.estadoSolicitud){

    document.getElementById("perfilEstado").textContent =
    resultado.usuario.estadoSolicitud;

}

        } else {

            alert(resultado.mensaje);
        }

    } catch (error) {

        console.log(error);

        alert("Error al iniciar sesión");
    }
}
async function cargarEstadoSolicitud(cedula) {

    try {

        console.log("Cédula enviada:", cedula);

        const respuesta = await fetch(
            `http://localhost:3000/estado-solicitud/${cedula}`
        );

        const datos = await respuesta.json();

        console.log("Respuesta del servidor:", datos);

        document.getElementById("perfilEstado").textContent =
            datos.estado;

    } catch (error) {

        console.log(error);
    }
}

function irFormulario() {

    window.location.href = "index.html";

}

function mostrarVerificacion() {

    document.getElementById(
        "verificacionEstudiante"
    ).style.display = "block";

}

function ocultarVerificacion() {

    document.getElementById(
        "verificacionEstudiante"
    ).style.display = "none";

}