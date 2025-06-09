document.addEventListener('DOMContentLoaded', function () {
    console.log('DOM completamente cargado');

    const avatarInput = document.getElementById('avatar');
    const imagenAvatar = document.getElementById('imagenAvatar');
    const plusIcon = document.querySelector('.custom-file-upload .icon');

    if (!avatarInput || !imagenAvatar) {
        console.error('El elemento con ID "avatar" o "imagenAvatar" no se encontró en el DOM.');
        return;
    }

    avatarInput.addEventListener('change', function () {
        const archivo = this.files[0];

        if (archivo) {
            const reader = new FileReader();

            reader.onload = function (e) {
                // Aplica la imagen seleccionada como background-image
                imagenAvatar.style.backgroundImage = `url('${e.target.result}')`;
                imagenAvatar.style.backgroundSize = 'cover';
                imagenAvatar.style.backgroundPosition = 'center';
                imagenAvatar.style.borderRadius = '50%';

                // Quita el fondo del label
                document.querySelector(".custom-file-upload label").classList.add("has-image");
            };

            reader.readAsDataURL(archivo);
            // Hacer el icono "+" transparente
            plusIcon.style.opacity = '0.5';
        }
    });



    // Función para enviar el formulario de registro
    document.getElementById('registerForm').addEventListener('submit', function (event) {
        event.preventDefault();

        const nombre = document.getElementById('nombre').value;
        const email = document.getElementById('email').value;
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const password2 = document.getElementById('password2').value;

        const avatarInput = document.getElementById('avatar');

        if (!avatarInput) {
            console.error('El elemento con ID "avatar" no se encontró en el DOM.');
            //console.log('Contenido del body:', document.body.innerHTML); // Muestra el contenido del body
            return;
        }

        const avatar = avatarInput.files[0];

        const formData = new FormData();
        formData.append('nombre', nombre);
        formData.append('email', email);
        formData.append('username', username);
        formData.append('password', password);
        formData.append('password2', password2);
        formData.append('avatar', avatar);

        fetch('http://localhost:8080/api/v1/auth/register', {
            method: 'POST',
            body: formData,
        })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(errorData => {
                        throw errorData;
                    });
                }
                return response.json();
            })
            .then(data => {
                console.log('Registro exitoso:', data);
                mostrarMensaje('Registro exitoso', 'exito');
            })
            .catch(errorData => {
                console.error('Error en el registro:', errorData);
                mostrarErrores(errorData);
            });
    });

    // Función para enviar el formulario de login
    document.getElementById('loginForm').addEventListener('submit', function (event) {
        event.preventDefault(); // Evitar que el formulario se envíe automáticamente

        // Obtener los valores de los inputs
        const username = document.getElementById('usernameLogin').value;
        const password = document.getElementById('passwordLogin').value;

        // Validar los datos
        const errores = {
            username: validarLoginUsername(username),
            password: validarLoginPassword(password),
        };

        // Verificar si hay errores
        const hayErrores = Object.values(errores).some(error => error !== null);

        if (hayErrores) {
            // Mostrar los errores en la interfaz
            mostrarErrores(errores);
        } else {
            // Si no hay errores, enviar los datos al servidor
            const data = { username, password };

            fetch('http://localhost:8080/api/v1/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            })
                .then(response => {
                    if (!response.ok) {
                        return response.json().then(errorData => {
                            throw errorData; // Lanzar los errores para manejarlos en el catch
                        });
                    }
                    return response.json();
                })
                .then(data => {
                    console.log('Login exitoso:', data);
                    // Redirigir al usuario o realizar otras acciones
                    document.cookie = `token=${data.token}; path=/; max-age=86400`; // Expira en 1 día
                    window.location.href = "home.html";
                })
                .catch(errorData => {
                    console.error('Error en el login:', errorData);
                    if (errorData.message) {
                        // Si hay un mensaje de error, mostrarlo
                        mostrarMensaje(errorData.message, 'error');
                    } else {
                        // Mostrar un mensaje genérico de error
                        mostrarMensaje('Error en el login', 'error');
                    }
                });
        }
    });
});

// Función para mostrar errores en la interfaz
function mostrarErrores(errores) {
    for (const campo in errores) {
        if (errores[campo]) {
            mostrarMensaje(errores[campo], 'error');
        }
    }
}

function mostrarMensaje(mensaje, tipo) {
    const contenedorMensaje = document.getElementById("mensaje");
    contenedorMensaje.textContent = mensaje;
    contenedorMensaje.className = `mensaje ${tipo}`; // Aplica la clase de estilo
    contenedorMensaje.style.display = "block"; // Muestra el mensaje

    // Opcional: Ocultar el mensaje después de unos segundos
    setTimeout(() => {
        contenedorMensaje.style.display = "none";
    }, 5000); // 5 segundos
}
// Función para validar el nombre
function validarNombre(nombre) {
    const regex = /^[A-Za-zñÑáéíóúÁÉÍÓÚ ]{1,50}$/;
    if (!nombre) {
        return "El nombre no puede estar en blanco.";
    }
    if (!regex.test(nombre)) {
        return "El nombre solo puede contener letras y espacios.";
    }
    return null; // No hay error
}

// Función para validar el email
function validarEmail(email) {
    const regex = /^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,6}$/;
    if (!email) {
        return "El email no puede estar en blanco.";
    }
    if (!regex.test(email)) {
        return "Introduce un email válido.";
    }
    return null; // No hay error
}

// Función para validar el username
function validarUsername(username) {
    const regex = /^[a-zA-Z0-9_.-]{3,20}$/;
    if (!username) {
        return "El usuario no puede estar en blanco.";
    }
    if (username.length < 3 || username.length > 20) {
        return "El username debe tener entre 3 y 20 caracteres.";
    }
    if (!regex.test(username)) {
        return "El username solo puede contener letras, números, puntos, guiones y guiones bajos.";
    }
    return null; // No hay error
}

// Función para validar la contraseña
function validarPassword(password) {
    const regex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/;
    if (!password) {
        return "La contraseña no puede estar en blanco.";
    }
    if (password.length < 12) {
        return "La contraseña debe tener mínimo 12 caracteres.";
    }
    if (!regex.test(password)) {
        return "La contraseña debe tener al menos 12 caracteres, incluir una mayúscula, una minúscula, un número y un carácter especial.";
    }
    return null; // No hay error
}

// Función para validar que las contraseñas coincidan
function validarPassword2(password, password2) {
    if (password !== password2) {
        return "Las contraseñas no coinciden.";
    }
    return null; // No hay error
}

// Función para validar el username en el login
function validarLoginUsername(username) {
    if (!username) {
        return "El nombre de usuario no puede estar en blanco.";
    }
    return null; // No hay error
}

// Función para validar la contraseña en el login
function validarLoginPassword(password) {
    if (!password) {
        return "La contraseña no puede estar en blanco.";
    }
    return null; // No hay error
}