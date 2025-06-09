let token = getCookie("token");
const avatarInput = document.getElementById('avatar');
let currentUserId = null;
let currentUserData = {}; // Almacenaremos los datos originales del usuario
let avatarFileName = null; // Para almacenar el nombre del archivo de avatar

document.addEventListener('DOMContentLoaded', function () {
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
                imagenAvatar.style.backgroundImage = `url('${e.target.result}')`;
                imagenAvatar.style.backgroundSize = 'cover';
                imagenAvatar.style.backgroundPosition = 'center';
                imagenAvatar.style.borderRadius = '50%';
                document.querySelector(".custom-file-upload label").classList.add("has-image");
            };

            reader.readAsDataURL(archivo);
            plusIcon.style.opacity = '0.5';

            // Subir el avatar al servidor
            //uploadAvatar(archivo);
        }
    });

    // Función para subir el avatar al servidor
    /*async function uploadAvatar(file) {
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('http://localhost:8080/api/v1/upload', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!response.ok) {
                throw new Error('Error al subir el avatar');
            }

            const data = await response.json();
            //avatarFileName = data.fileName; // Guardamos el nombre del archivo
            //mostrarMensaje("Avatar actualizado correctamente", "exito")
        } catch (error) {
            console.error('Error:', error);
            mostrarMensaje("Error al subir el avatar", "error")
        }
    }*/

    // Habilitar edición solo para los campos con icono de lápiz
    const editIcons = document.querySelectorAll('.edit-icon');
    editIcons.forEach(icon => {
        icon.addEventListener('click', function () {
            const targetId = this.getAttribute('data-target');
            const input = document.getElementById(targetId);

            if (input.classList.contains('locked-input')) {
                input.classList.remove('locked-input');
                input.classList.add('editing');
                input.readOnly = false;
                input.focus();
                this.innerHTML = '<i class="fas fa-lock"></i>';
            } else {
                input.classList.add('locked-input');
                input.classList.remove('editing');
                input.readOnly = true;
                this.innerHTML = '<i class="fas fa-pencil-alt"></i>';
            }
        });
    });

    // Validación de contraseña
    const passwordInput = document.getElementById('password');
    const password2Input = document.getElementById('password2');
    const passwordMatch = document.querySelector('.password-match');
    const strengthBars = document.querySelectorAll('.strength-bar');
    const strengthText = document.querySelector('.strength-text');

    passwordInput.addEventListener('input', function () {
        const password = this.value;
        checkPasswordStrength(password);
    });

    password2Input.addEventListener('input', function () {
        if (passwordInput.value === this.value && this.value.length > 0) {
            passwordMatch.style.display = 'flex';
        } else {
            passwordMatch.style.display = 'none';
        }
    });

    function checkPasswordStrength(password) {
        let strength = 0;
        if (password.length >= 8) strength++;
        if (password.match(/([0-9])/)) strength++;
        if (password.match(/([!,%,&,@,#,$,^,*,?,_,~])/)) strength++;

        strengthBars.forEach((bar, index) => {
            bar.style.background = index < strength ?
                (strength === 1 ? '#ef4444' : strength === 2 ? '#f59e0b' : '#10b981') :
                '#e0e7ff';
        });

        strengthText.textContent = `Seguridad: ${strength === 0 ? 'ninguna' :
            strength === 1 ? 'baja' :
                strength === 2 ? 'media' : 'alta'
            }`;
    }

    // Función para bloquear todos los campos editables
    function resetFormToLockedState() {
        document.querySelectorAll('.edit-icon').forEach(icon => {
            const targetId = icon.getAttribute('data-target');
            const input = document.getElementById(targetId);
            input.classList.add('locked-input');
            input.classList.remove('editing');
            input.readOnly = true;
            icon.innerHTML = '<i class="fas fa-pencil-alt"></i>';
        });

        // Limpiar campos de contraseña
        document.getElementById('antiguaPassword').value = '';
        document.getElementById('password').value = '';
        document.getElementById('password2').value = '';
        passwordMatch.style.display = 'none';
        strengthText.textContent = 'Seguridad: baja';
        strengthBars.forEach(bar => {
            bar.style.background = '#e0e7ff';
        });
    }

    // Manejo del formulario
    const form = document.getElementById('edit-profile-form');
    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        // Obtener valores de los campos
        const nombre = document.getElementById('nombre').value;
        const email = document.getElementById('email').value;
        const username = document.getElementById('username').value;
        const antiguaPassword = document.getElementById('antiguaPassword').value;
        const password = document.getElementById('password').value;
        const password2 = document.getElementById('password2').value;

        // Flags para saber qué campos se están editando
        const editandoNombre = document.getElementById('nombre').classList.contains('editing');
        const editandoEmail = document.getElementById('email').classList.contains('editing');
        const editandoUsername = document.getElementById('username').classList.contains('editing');
        const cambiandoPassword = password || password2;
        const cambiandoAvatar = avatarInput.files.length > 0;

        // Validar campos solo si se están editando
        if (editandoNombre) {
            if (!nombre) {
                mostrarMensaje("El nombre no puede estar en blanco", "error");
                return;
            }
            if (!/^[A-Za-zñÑáéíóúÁÉÍÓÚ ]{1,50}$/.test(nombre)) {
                mostrarMensaje("El nombre solo puede contener letras y espacios", "error");
                return;
            }
        }

        if (editandoEmail) {
            if (!email) {
                mostrarMensaje("El email no puede estar en blanco", "error");
                return;
            }
            if (!/^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,6}$/.test(email)) {
                mostrarMensaje("Introduce un email válido", "error");
                return;
            }
        }

        if (editandoUsername) {
            if (!username) {
                mostrarMensaje("El nombre de usuario no puede estar en blanco", "error");
                return;
            }
            if (!/^[a-zA-Z0-9_.-]{3,20}$/.test(username)) {
                mostrarMensaje("El username debe tener entre 3 y 20 caracteres y solo puede contener letras, números, puntos, guiones y guiones bajos", "error");
                return;
            }
        }

        if (cambiandoPassword) {
            if (!antiguaPassword) {
                mostrarMensaje("Debes ingresar tu contraseña actual para realizar cambios", "error");
                return;
            }
            if (password !== password2) {
                mostrarMensaje("Las contraseñas nuevas no coinciden", "error");
                return;
            }
            if (password.length < 12) {
                mostrarMensaje("La contraseña debe tener mínimo 12 caracteres", "error");
                return;
            }
            if (!/(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}/.test(password)) {
                mostrarMensaje("La contraseña debe incluir al menos una mayúscula, una minúscula, un número y un carácter especial (@$!%*?&)", "error");
                return;
            }
            if (antiguaPassword === password) {
                mostrarMensaje("La contraseña nueva no puede ser igual a la actual", "error");
                return;
            }
        }

        // Verificar que al menos un campo esté siendo modificado
        if (!editandoNombre && !editandoEmail && !editandoUsername && !cambiandoPassword && !cambiandoAvatar) {
            mostrarMensaje("No se han realizado cambios", "error");
            return;
        }

        // Mostrar loading
        const saveBtn = document.querySelector('.save-btn');
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';

        try {
            const fd = new FormData();

            // Solo agregar campos que están siendo editados
            if (editandoNombre) fd.append('nombre', nombre);
            if (editandoEmail) fd.append('email', email);
            if (editandoUsername) fd.append('username', username);
            if (cambiandoPassword) {
                fd.append('antiguaPassword', antiguaPassword);
                fd.append('password', password);
            }
            if (cambiandoAvatar) fd.append('avatar', avatarInput.files[0]);

            fd.append('tipo', 'local');

            const response = await fetch(`http://localhost:8080/api/v1/usuario/edit/${currentUserId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: fd
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al actualizar');
            }

            const data = await response.json();

            // Actualizar el token si viene en la respuesta
            if (data.token) {
                document.cookie = `token=${data.token}; path=/; max-age=${24 * 60 * 60}`;
                token = data.token;
            }

            // Actualizar avatar si hubo cambio
            if (data.avatarUrl) {
                const imagenAvatar = document.getElementById('imagenAvatar');
                imagenAvatar.style.backgroundImage = `url('${data.avatarUrl}?t=${new Date().getTime()}')`;
            }

            mostrarMensaje(data.success || "Cambios guardados correctamente", "exito");
            resetFormToLockedState();
            await initializeUser();

        } catch (error) {
            console.error('Error:', error);
            mostrarMensaje(error.message, "error");
        } finally {
            saveBtn.disabled = false;
            saveBtn.innerHTML = 'Guardar cambios';
        }
    });
});

function getCookie(name) {
    const cookies = document.cookie.split('; ');
    for (const cookie of cookies) {
        const [cookieName, cookieValue] = cookie.split('=');
        if (cookieName === name) {
            return decodeURIComponent(cookieValue);
        }
    }
    return null;
}

function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
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

// Función para obtener el ID del usuario desde el JWT
const initializeUser = async () => {
    try {
        const response = await fetch("http://localhost:8080/decode-jwt", {
            method: "GET",
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            credentials: 'include' // Añade esto para manejar cookies correctamente
        });

        if (!response.ok) {
            throw new Error(await response.text());
        }

        const data = await response.json();

        // Verifica si la respuesta es un objeto de usuario válido
        if (!data || !data.id) {
            // Si no es un usuario válido, podría ser una redirección OAuth
            if (data && data.redirect) {
                // Manejar redirección OAuth de manera diferente
                console.warn("Redirección OAuth detectada para usuario local");
                return;
            }
            throw new Error("Datos de usuario no válidos");
        }

        currentUserData = data;
        currentUserId = data.id;

        // Manejo del avatar más robusto
        if (data.avatar) {
            try {
                const url = data.avatar;
                const match = url.match(/(?<=uploads\/avatars\/)[^\/]+$/);
                avatarFileName = match ? match[0] : null;
            } catch (e) {
                console.warn("Error procesando avatar URL:", e);
                avatarFileName = null;
            }
        }

        // Actualizar UI
        document.getElementById('nombre').value = data.nombre || '';
        document.getElementById('email').value = data.email || '';
        document.getElementById('username').value = data.username || '';

        // Configurar avatar
        const imagenAvatar = document.getElementById('imagenAvatar');
        if (data.avatar) {
            imagenAvatar.style.backgroundImage = `url('${data.avatar}')`;
            imagenAvatar.style.backgroundSize = 'cover';
            imagenAvatar.style.backgroundPosition = 'center';
            imagenAvatar.style.borderRadius = '50%';
            document.querySelector(".custom-file-upload label").classList.add("has-image");
        } else {
            // Usar un avatar por defecto local en lugar de Gravatar para evitar problemas
            imagenAvatar.style.backgroundImage = 'url(images/default-avatar.png)';
            imagenAvatar.style.backgroundColor = getRandomColor();
        }

    } catch (error) {
        console.error("Error en la petición:", error);
        if (error.message.includes("401")) {
            // Redirigir al login solo si es un error de autenticación
            window.location.href = "/index.html";
        } else if (error.message.includes("Failed to fetch")) {
            // Manejar específicamente errores de conexión
            mostrarMensaje("Error de conexión con el servidor", "error");
        }
    }
};

// Inicializar usuario
initializeUser();

function confirmarEliminacion() {
    if (!confirm('¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer.')) {
        return;
    }

    // Construimos la URL usando currentUserId
    const url = `http://localhost:8080/api/v1/usuario/delete/${currentUserId}`;

    fetch(url, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => Promise.reject(err));
            }
            // Si todo va bien, redirigimos
            window.location.href = 'index.html';
        })
        .catch(err => {
            console.error('Error eliminando la cuenta:', err);
            alert('Ha ocurrido un error al eliminar tu cuenta. Inténtalo de nuevo más tarde.');
        });
}