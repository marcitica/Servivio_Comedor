
/* =========================
   MOSTRAR / OCULTAR REGISTRO
========================= */

function mostrarRegistro() {

  document.getElementById(
    "registroDocente"
  ).style.display = "block";
}

function ocultarRegistro() {

  document.getElementById(
    "registroDocente"
  ).style.display = "none";
}

/* =========================
   MOSTRAR CONTRASEÑA
========================= */

function togglePassword() {

  const input =
    document.getElementById(
      "passwordDocenteLogin"
    );

  if (input.type === "password") {

    input.type = "text";

  } else {

    input.type = "password";
  }
}

/* =========================
   REGISTRO DOCENTE
========================= */

document.getElementById(
  "registroDocenteForm"
).addEventListener("submit", async (e) => {

  e.preventDefault();

  const datos = {

    nombre:
      document.getElementById(
        "nombreDocente"
      ).value,

    cedula:
      document.getElementById(
        "cedulaDocente"
      ).value
  };

  if (!datos.nombre || !datos.cedula) {

    alert("Complete todos los campos");
    return;
  }

  try {

    const respuesta = await fetch(
      "http://localhost:3000/registro-docente",
      {

        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify(datos)
      }
    );

    const resultado =
      await respuesta.json();

    alert(resultado.mensaje);

  } catch (error) {

    console.log(error);

    alert("Error en el registro");
  }
});

/* =========================
   LOGIN DOCENTE
========================= */

async function loginDocente() {

  const cedulaDocente =
    document.getElementById(
      "cedulaDocenteLogin"
    ).value;

  const password =
    document.getElementById(
      "passwordDocenteLogin"
    ).value;

  const cedulaEstudiante =
    document.getElementById(
      "cedulaEstudiante"
    ).value;

  if (
    !cedulaDocente ||
    !password ||
    !cedulaEstudiante
  ) {

    alert("Complete todos los campos");
    return;
  }

  try {

    const respuesta = await fetch(
      "http://localhost:3000/login-docente",
      {

        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({

          cedulaDocente,
          password
        })
      }
    );

    const resultado =
      await respuesta.json();

    if (!respuesta.ok) {

      alert(resultado.mensaje);
      return;
    }

    localStorage.setItem(
      "docente",
      JSON.stringify(resultado.usuario)
    );

    localStorage.setItem(
      "cedulaEstudiante",
      cedulaEstudiante
    );

    window.location.href =
      "administracion.html";

  } catch (error) {

    console.log(error);

    alert("Error al iniciar sesión");
  }
}

