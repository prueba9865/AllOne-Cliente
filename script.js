// Función para simular el inicio de sesión con Google
function loginWithGoogle() {
    // Aquí iría la lógica para integrar con la API de Google
    alert('Iniciando sesión con Google...');
    // Redirigir a la autenticación de Google
    // window.location.href = 'URL_DE_AUTENTICACION_GOOGLE';
}

// Validación del formulario de inicio de sesión
document.getElementById('loginForm').addEventListener('submit', function (event) {
    event.preventDefault(); // Evita que el formulario se envíe

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Validación básica
    if (username === '' || password === '') {
        alert('Por favor, completa todos los campos.');
        return;
    }

    // Simulación de inicio de sesión
    if (username === 'usuario' && password === 'contraseña') {
        alert('Inicio de sesión exitoso.');
        // Redirigir a otra página
        window.location.href = '/dashboard';
    } else {
        alert('Usuario o contraseña incorrectos.');
    }
});