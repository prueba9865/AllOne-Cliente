// Manejo de pestañas
document.querySelectorAll('.tab-button').forEach(button => {
    button.addEventListener('click', () => {
        // Remover clase active de todos los botones y secciones
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
            section.style.display = 'none';
        });

        // Añadir clase active al botón clickeado
        button.classList.add('active');

        // Mostrar la sección correspondiente
        const tab = button.dataset.tab;
        const section = document.querySelector(`.${tab}-section`);
        if (section) {
            section.classList.add('active');
            section.style.display = 'block';
        }

        // Manejo específico para la sección de IA
        if (tab === 'ai') {
            showAIChatView(); // Mostrar la vista de chat por defecto
        }
    });
});

// Asegurarse de que la sección de chat esté activa al inicio
document.addEventListener('DOMContentLoaded', function () {
    // Activar la pestaña de chat por defecto
    document.querySelector('.tab-button[data-tab="chat"]').classList.add('active');
    document.querySelector('.chat-section').classList.add('active');
    document.querySelector('.chat-section').style.display = 'block';

    // Inicializar la vista de IA
    showAIChatView();
});
let currentContactId = null;
let currentUserId = null;
const messagesContainer = document.getElementById('messages');
const messageInput = document.getElementById('messageInput');
let friendRequestsInterval = null;
document.addEventListener('DOMContentLoaded', () => {
    // Elementos del popup
    const addPeopleBtn = document.getElementById('addPeopleBtn');
    const addChat = document.getElementById('createChatBtn');
    const searchPopup = document.getElementById('searchPopup');
    const closePopup = document.getElementById('closePopup');
    const userSearchInput = document.getElementById('userSearchInput');
    const userSearchResults = document.getElementById('userSearchResults');

    // Añade estas variables al inicio de tu script
    const allRequestsPopup = document.getElementById('allRequestsPopup');
    const closeAllRequestsPopup = document.getElementById('closeAllRequestsPopup');
    const allRequestsList = document.getElementById('allRequestsList');
    const viewPendingRequests = document.getElementById('viewPendingRequests');
    const viewAllRequests = document.getElementById('viewAllRequests');
    const notificationDropdown = document.getElementById('notificationDropdown');

    // Evento para mostrar todas las solicitudes
    viewAllRequests?.addEventListener('click', (e) => {
        e.preventDefault();
        requestsPopup.classList.remove('active');
        allRequestsPopup.classList.add('active');
        loadAllFriendRequests('received'); // Carga las recibidas por defecto
    });

    // Evento para cerrar el popup
    closeAllRequestsPopup?.addEventListener('click', () => {
        allRequestsPopup.classList.remove('active');
    });

    // Cambio entre pestañas
    document.querySelectorAll('.requests-tabs .tab-button').forEach(button => {
        button.addEventListener('click', () => {
            document.querySelectorAll('.requests-tabs .tab-button').forEach(btn => {
                btn.classList.remove('active');
            });
            button.classList.add('active');
            loadAllFriendRequests(button.dataset.tab);
        });
    });

    // Mostrar popup
    addPeopleBtn.addEventListener('click', () => {
        searchPopup.classList.add('active');
    });

    /*addChat.addEventListener('click', () => {
        alert("añadir un chat de usuario");
    });*/

    // Ocultar popup
    closePopup.addEventListener('click', () => {
        searchPopup.classList.remove('active');
    });

    let searchTimeout;

    userSearchInput.addEventListener('input', function (e) {
        const query = e.target.value.trim();
        clearTimeout(searchTimeout); // Cancela el timeout anterior

        if (query.length > 0) {
            searchTimeout = setTimeout(() => {
                searchUsers(query);
            }, 300); // Espera 300ms después de la última tecla
        } else {
            userSearchResults.innerHTML = '';
        }
    });

    // Función que busca usuarios en el backend
    function searchUsers(query) {
        fetch("http://localhost:8080/usuarios")
            .then(response => {
                if (!response.ok) throw new Error("Error al cargar usuarios");
                return response.json();
            })
            .then(users => {
                // Filtrar para no mostrar al usuario actual
                const filteredUsers = users.filter(user =>
                    user.id !== currentUserId && (
                        user.name.toLowerCase().includes(query.toLowerCase()) ||
                        user.username.toLowerCase().includes(query.toLowerCase())
                    )
                );
                displaySearchResults(filteredUsers);
            })
            .catch(error => {
                console.error("Error en la búsqueda:", error);
                userSearchResults.innerHTML = '<div class="no-results">Error al buscar usuarios</div>';
            });
    }

    function displaySearchResults(users) {
        userSearchResults.innerHTML = '';

        if (users.length === 0) {
            userSearchResults.innerHTML = '<div class="no-results">No se encontraron usuarios</div>';
            return;
        }

        users.forEach(user => {
            const userCard = document.createElement('div');
            userCard.className = 'user-card';
            userCard.innerHTML = `
                        <img src="${user.avatar}" alt="${user.name}" class="user-avatar">
                        <div class="user-info">
                            <div class="user-name">${user.name}</div>
                            <div class="user-username">@${user.username}</div>
                        </div>
                        <button class="add-btn" data-user-id="${user.id}">Agregar</button>
                    `;

            // Lógica para agregar usuario
            userCard.querySelector('.add-btn').addEventListener('click', async (e) => {
                const userId = e.target.getAttribute('data-user-id');
                try {
                    const response = await fetch(`http://localhost:8080/usuarios/${currentUserId}/agregar-contacto/${userId}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' }
                    });

                    if (response.ok) {
                        mostrarMensaje("Solicitud de amistad enviada", "exito")
                    } else {
                        mostrarMensaje("Error al enviar solicitud", "error")
                    }
                } catch (error) {
                    console.error("Error:", error);
                }
                /*e.stopPropagation();
                console.log('Usuario agregado:', user.id);
                // Aquí iría tu lógica para agregar el usuario
                mostrarMensaje("Solicitud de amistad enviada", "exito")*/
            });

            userSearchResults.appendChild(userCard);
        });
    }

    // Cerrar popup al hacer clic fuera
    searchPopup.addEventListener('click', (e) => {
        if (e.target === searchPopup) {
            searchPopup.classList.remove('active');
        }
    });

    // Estilo para "no hay resultados"
    const style = document.createElement('style');
    style.textContent = `
                .no-results {
                    padding: 20px;
                    text-align: center;
                    color: #6b7280;
                }
            `;
    document.head.appendChild(style);

    const profileAvatar = document.getElementById('profileAvatar');
    const profileDropdown = document.getElementById('profileDropdown');
    const logoutButton = profileDropdown.querySelector('a.logout');

    // Variables globales
    let menuTimeout;
    const menuHoverDelay = 200; // ms de retraso para cerrar

    // Configuración de eventos
    profileAvatar.addEventListener('mouseenter', () => {
        clearTimeout(menuTimeout);
        profileDropdown.classList.add('show-dropdown');
    });

    profileAvatar.addEventListener('mouseleave', () => {
        menuTimeout = setTimeout(() => {
            if (!profileDropdown.matches(':hover')) {
                profileDropdown.classList.remove('show-dropdown');
            }
        }, menuHoverDelay);
    });

    profileDropdown.addEventListener('mouseenter', () => {
        clearTimeout(menuTimeout);
    });

    profileDropdown.addEventListener('mouseleave', () => {
        menuTimeout = setTimeout(() => {
            profileDropdown.classList.remove('show-dropdown');
        }, menuHoverDelay);
    });

    // Evento click para dispositivos táctiles
    profileAvatar.addEventListener('click', (e) => {
        e.stopPropagation();
        profileDropdown.classList.toggle('show-dropdown');
    });

    // Cierre al hacer click fuera
    document.addEventListener('click', (e) => {
        if (!profileAvatar.contains(e.target) && !profileDropdown.contains(e.target)) {
            profileDropdown.classList.remove('show-dropdown');
        }
    });

    logoutButton.addEventListener('click', function (e) {
        e.preventDefault(); // Evita que siga el href
        handleLogout(); // Llama a la función
    });

    const token = getCookie("token");

    if (!token) {
        console.error("No se encontró el token en cookies");
        // Imagen por defecto si no hay avatar
        profileAvatar.style.backgroundImage = 'url(https://www.gravatar.com/avatar/default?s=200)';
        profileAvatar.style.backgroundColor = getRandomColor();
        return;
    }

    // Función para obtener y establecer el ID del usuario
    const initializeUser = async () => {
        try {
            const response = await fetch("http://localhost:8080/decode-jwt", {
                method: "GET",
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Cache-Control': 'no-cache',
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error(await response.text());
            }

            const data = await response.json();
            currentUserId = data.id;
            console.log("Usuario ID obtenido:", currentUserId);

            // Configurar avatar con cache-busting
            if (data.avatar) {
                // Le añadimos un timestamp para que la URL sea siempre distinta
                const avatarUrl = `${data.avatar}?t=${Date.now()}`;
                profileAvatar.style.backgroundImage = `url(${avatarUrl})`;
            } else {
                profileAvatar.style.backgroundImage = 'url(https://www.gravatar.com/avatar/default?s=200)';
                profileAvatar.style.backgroundColor = getRandomColor();
            }


            //currentUserId = 2

            await loadUserContacts();
            // Cargar solicitudes ahora que tenemos el ID
            await loadFriendRequests();

            // Iniciar intervalo de refresco
            setInterval(loadFriendRequests, 30000);

        } catch (error) {
            console.error("Error en la petición:", error);
            if (error.message.includes("401")) {
                window.location.href = "/index.html";
            }
        }
    };

    // Inicializar usuario
    initializeUser();


});

// Función para obtener el valor de una cookie por nombre
function getCookie(name) {
    const cookies = document.cookie.split('; ');
    for (const cookie of cookies) {
        const [cookieName, cookieValue] = cookie.split('=');
        if (cookieName === name) {
            return decodeURIComponent(cookieValue); // Decodifica caracteres especiales
        }
    }
    return null; // Si no encuentra la cookie
}

// También deberías limpiar el intervalo cuando se cierra el chat
function showChatList() {
    if (chatRefreshInterval) {
        clearInterval(chatRefreshInterval);
        chatRefreshInterval = null;
    }
    document.querySelector('.chat-list-view').classList.add('active');
    document.querySelector('.chat-detail-view').classList.remove('active');
}

// Función para manejar el logout
function handleLogout() {
    // Elimina la cookie del token
    document.cookie = 'token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    // Redirige al login
    window.location.href = '/index.html';
}

function toggleAddUserPopup() {
    const popup = document.getElementById("addUserPopup");
    const overlay = document.getElementById("overlay");

    const isVisible = popup.style.display === "block";

    if (isVisible) {
        popup.style.display = "none";
        overlay.style.display = "none";
    } else {
        popup.style.display = "block";
        overlay.style.display = "block";
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

// ========== CÓDIGO MEJORADO PARA SOLICITUDES ========== //

// Elementos del popup de solicitudes
const notificationBell = document.getElementById('notificationBell');
const notificationCount = document.getElementById('notificationCount');
const requestsPopup = document.getElementById('requestsPopup');
const closeRequestsPopup = document.getElementById('closeRequestsPopup');
const requestsList = document.getElementById('requestsList');

// Mostrar popup de solicitudes
notificationBell.addEventListener('click', () => {
    if (!currentUserId) {
        console.error("ID de usuario no disponible");
        return;
    }
    requestsPopup.classList.add('active');
    loadFriendRequests();
});

// Cerrar popup
closeRequestsPopup.addEventListener('click', () => {
    requestsPopup.classList.remove('active');
});

// Función para cargar todas las solicitudes (recibidas y enviadas)
async function loadAllFriendRequests(type = 'received') {
    if (!currentUserId) {
        console.error("ID de usuario no disponible");
        return;
    }

    try {
        allRequestsList.innerHTML = '<div class="loading">Cargando...</div>';

        const endpoint = type === 'received'
            ? `usuarios/${currentUserId}/solicitudes-pendientes`
            : `usuarios/${currentUserId}/solicitudes-enviadas`;

        const response = await fetch(`http://localhost:8080/${endpoint}`);

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const solicitudes = await response.json();
        renderAllRequests(solicitudes, type);

    } catch (error) {
        console.error("Error al cargar todas las solicitudes:", error);
        allRequestsList.innerHTML = '<div class="error-msg">Error al cargar solicitudes</div>';
    }
}

// Función para renderizar todas las solicitudes
function renderAllRequests(solicitudes, type) {
    allRequestsList.innerHTML = '';

    if (!solicitudes || solicitudes.length === 0) {
        allRequestsList.innerHTML = `
            <div class="no-requests">
                No tienes solicitudes ${type === 'received' ? 'recibidas' : 'enviadas'}
            </div>
        `;
        return;
    }

    solicitudes.forEach(solicitud => {
        const requestItem = document.createElement('div');
        requestItem.className = 'request-history-item';

        if (type === 'received') {
            requestItem.innerHTML = `
                <img src="${solicitud.avatar || 'https://www.gravatar.com/avatar/default?s=200'}" 
                     class="user-avatar">
                <div class="user-info">
                    <div class="user-name">${solicitud.name || solicitud.nombre || 'Usuario'}</div>
                    <div class="user-username">@${solicitud.username || 'usuario'}</div>
                </div>
                <div class="request-actions">
                    <button class="accept-btn" data-id="${solicitud.id || solicitud.solicitudId}">✓</button>
                    <button class="reject-btn" data-id="${solicitud.id || solicitud.solicitudId}">✗</button>
                </div>
            `;

            // Manejar aceptar/rechazar
            requestItem.querySelector('.accept-btn')?.addEventListener('click', async (e) => {
                const solicitudId = e.target.getAttribute('data-id');
                await respondToRequest(solicitudId, true);
                loadAllFriendRequests('received');
            });

            requestItem.querySelector('.reject-btn')?.addEventListener('click', async (e) => {
                const solicitudId = e.target.getAttribute('data-id');
                await respondToRequest(solicitudId, false);
                loadAllFriendRequests('received');
            });

        } else {
            // Para solicitudes enviadas (solo visualización)
            requestItem.innerHTML = `
                <img src="${solicitud.avatar || 'https://www.gravatar.com/avatar/default?s=200'}" 
                     class="user-avatar">
                <div class="user-info">
                    <div class="user-name">${solicitud.name || solicitud.nombre || 'Usuario'}</div>
                    <div class="user-username">@${solicitud.username || 'usuario'}</div>
                </div>
                <div class="status ${solicitud.aceptado ? 'accepted' : 'pending'}">
                    ${solicitud.aceptado ? 'Aceptada' : 'Pendiente'}
                </div>
            `;
        }

        allRequestsList.appendChild(requestItem);
    });
}

// Cargar solicitudes pendientes
async function loadFriendRequests() {
    // Mostrar estado de carga
    if (requestsList) {
        requestsList.innerHTML = '<div class="loading">Cargando solicitudes...</div>';
    }

    if (!currentUserId) {
        console.error("currentUserId no está definido");
        if (requestsList) {
            requestsList.innerHTML = '<div class="no-requests">Error: No se pudo identificar al usuario</div>';
        }
        return;
    }

    try {
        const response = await fetch(`http://localhost:8080/usuarios/${currentUserId}/solicitudes-pendientes`);

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const solicitudes = await response.json();
        console.log("Solicitudes recibidas:", solicitudes);

        updateNotificationCount(solicitudes.length);
        renderRequests(solicitudes);
    } catch (error) {
        console.error("Error al cargar solicitudes:", error);
        if (requestsList) {
            requestsList.innerHTML = '<div class="no-requests">Error al cargar solicitudes</div>';
        }
    }
}

// Renderizar lista de solicitudes (versión mejorada)
function renderRequests(solicitudes) {
    requestsList.innerHTML = '';

    if (!solicitudes || solicitudes.length === 0) {
        requestsList.innerHTML = '<div class="no-requests">No tienes solicitudes pendientes</div>';
        return;
    }

    solicitudes.forEach(solicitud => {
        const requestItem = document.createElement('div');
        requestItem.className = 'request-item';

        // Asegúrate que estos campos coinciden con tu respuesta del backend
        requestItem.innerHTML = `
            <img src="${solicitud.avatar || 'https://www.gravatar.com/avatar/default?s=200'}" 
                 class="user-avatar">
            <div class="user-info">
                <div class="user-name">${solicitud.name || solicitud.nombre || 'Usuario'}</div>
                <div class="user-username">@${solicitud.username || 'usuario'}</div>
            </div>
            <div class="request-actions">
                <button class="accept-btn" data-id="${solicitud.id || solicitud.solicitudId}">✓</button>
                <button class="reject-btn" data-id="${solicitud.id || solicitud.solicitudId}">✗</button>
            </div>
        `;

        // Manejar aceptar/rechazar
        requestItem.querySelector('.accept-btn').addEventListener('click', async (e) => {
            const solicitudId = e.target.getAttribute('data-id');
            await respondToRequest(solicitudId, true);
        });

        requestItem.querySelector('.reject-btn').addEventListener('click', async (e) => {
            const solicitudId = e.target.getAttribute('data-id');
            await respondToRequest(solicitudId, false);
        });

        requestsList.appendChild(requestItem);
    });
}

// Función mejorada para responder a solicitudes
async function respondToRequest(solicitudId, aceptar) {
    try {
        const response = await fetch(`http://localhost:8080/solicitudes/${solicitudId}/responder?aceptar=${aceptar}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        mostrarMensaje(aceptar ? "¡Solicitud aceptada!" : "Solicitud rechazada", "exito");
        loadFriendRequests(); // Recargar lista

        // Actualizar lista de contactos si es necesario
        if (aceptar) {
            // loadUserContacts(); // Si tienes esta función
        }
    } catch (error) {
        console.error("Error al responder solicitud:", error);
        mostrarMensaje("Error al procesar la solicitud", "error");
    }
}

// Actualizar contador de notificaciones
function updateNotificationCount(count) {
    notificationCount.textContent = count;
    notificationCount.style.display = count > 0 ? 'flex' : 'none';

    // Animación para llamar la atención
    if (count > 0) {
        notificationBell.classList.add('has-notifications');
    } else {
        notificationBell.classList.remove('has-notifications');
    }
}

// Función para cargar los contactos del usuario
async function loadUserContacts() {
    if (!currentUserId) {
        console.error("ID de usuario no disponible");
        return;
    }

    try {
        const chatList = document.getElementById("chatList");
        chatList.innerHTML = '<div class="loading">Cargando contactos...</div>';

        console.log(currentUserId)

        const response = await fetch(`http://localhost:8080/usuarios/${currentUserId}/contactos`);

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const contactos = await response.json();
        console.log(contactos)
        renderContactList(contactos);

    } catch (error) {
        console.error("Error al cargar contactos:", error);
        const chatList = document.getElementById("chatList");
        chatList.innerHTML = '<div class="error-msg">Error al cargar contactos</div>';
    }
}

async function loadChatMessages() {
    try {
        const res = await fetch(`http://localhost:8080/api/user/${currentUserId}/${currentContactId}/messages?t=${Date.now()}`);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const mensajes = await res.json();

        // Solo actualizar si hay nuevos mensajes
        const currentMessageIds = Array.from(messagesContainer.querySelectorAll('.message')).map(el => el.dataset.id);
        const newMessages = mensajes.filter(m => !currentMessageIds.includes(m.id.toString()));

        if (newMessages.length > 0) {
            newMessages.forEach(m => {
                const div = document.createElement('div');
                div.className = 'message ' + (m.usuarioId === currentUserId ? 'mine' : 'theirs');
                div.dataset.id = m.id;

                // Crear elemento para el contenido del mensaje
                const content = document.createElement('p');
                content.textContent = m.contenido;
                div.appendChild(content);

                // Opcional: agregar fecha/hora
                const time = document.createElement('span');
                time.className = 'message-time';
                time.textContent = new Date(m.createdAt).toLocaleTimeString();
                div.appendChild(time);

                // Solo si es tu mensaje añadimos los botones de acción
                if (m.usuarioId === currentUserId) {
                    const actions = document.createElement('div');
                    actions.className = 'message-actions';

                    // Botón Editar
                    const editBtn = document.createElement('div');
                    editBtn.className = 'edit-btn';
                    editBtn.title = 'Editar mensaje';
                    const editIcon = document.createElement('i');
                    editIcon.className = 'fas fa-pencil-alt';
                    editBtn.appendChild(editIcon);
                    editBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        openEditModal(m, content); // Pasamos el mensaje y el elemento del contenido
                    });
                    actions.appendChild(editBtn);

                    // Botón Eliminar
                    const deleteBtn = document.createElement('div');
                    deleteBtn.className = 'delete-btn';
                    deleteBtn.title = 'Eliminar mensaje';
                    const trashIcon = document.createElement('i');
                    trashIcon.className = 'fas fa-trash';
                    deleteBtn.appendChild(trashIcon);
                    deleteBtn.addEventListener('click', async e => {
                        e.stopPropagation();
                        if (confirm("¿Estás seguro que quieres eliminar este mensaje?")) {
                            try {
                                const delRes = await fetch(
                                    `http://localhost:8080/api/messages/${m.id}`,
                                    { method: 'DELETE' }
                                );
                                if (!delRes.ok) throw new Error(delRes.status);
                                div.remove();
                            } catch (err) {
                                console.error('Error eliminando mensaje:', err);
                                alert('No se pudo eliminar el mensaje.');
                            }
                        }
                    });
                    actions.appendChild(deleteBtn);

                    div.appendChild(actions);
                }

                messagesContainer.appendChild(div);
            });

            // Scroll al final
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    } catch (err) {
        console.error('Error cargando mensajes:', err);
        // Opcional: mostrar mensaje de error al usuario
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = 'No se pudieron cargar los mensajes';
        messagesContainer.appendChild(errorDiv);
    }
}


function openEditModal(message, contentElement) {
    const modal = document.getElementById('editMessageModal');
    const textarea = document.getElementById('editMessageText');
    const closeBtn = document.querySelector('.close-modal');
    const cancelBtn = document.getElementById('cancelEdit');
    const saveBtn = document.getElementById('saveEdit');

    // Rellena el textarea con el mensaje actual
    textarea.value = message.contenido;
    modal.style.display = 'flex';

    // Cierra el modal
    const closeModal = () => {
        modal.style.display = 'none';
    };

    // Event listeners
    closeBtn.onclick = closeModal;
    cancelBtn.onclick = closeModal;

    saveBtn.onclick = async () => {
        const nuevoTexto = textarea.value.trim();
        if (nuevoTexto !== '' && nuevoTexto !== message.contenido) {
            try {
                const patchRes = await fetch(`http://localhost:8080/api/messages/${message.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ contenido: nuevoTexto })
                });
                if (!patchRes.ok) throw new Error(patchRes.status);

                // Actualiza tanto el DOM como el objeto original
                contentElement.textContent = nuevoTexto;
                message.contenido = nuevoTexto;

                closeModal();
            } catch (err) {
                console.error('Error editando mensaje:', err);
                alert('No se pudo editar el mensaje.');
            }
        } else {
            closeModal();
        }
    };

    // Cerrar al hacer clic fuera del modal
    modal.onclick = (e) => {
        if (e.target === modal) closeModal();
    };
}

async function sendMessage() {
    const texto = messageInput.value.trim();
    if (!texto) return;

    const dto = {
        contenido: texto,
        tipo: 'texto',
        usuarioId: currentUserId,
        contactoId: currentContactId
    };

    try {
        const res = await fetch(
            `http://localhost:8080/api/user/${currentUserId}/${currentContactId}/messages`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dto)
            }
        );
        if (!res.ok) throw new Error(res.status);
        const nuevo = await res.json();

        // --- CREACIÓN DEL DIV COMO EN loadChatMessages ---
        const div = document.createElement('div');
        div.className = 'message mine';
        div.dataset.id = nuevo.id;

        // Contenido
        const content = document.createElement('p');
        content.textContent = nuevo.contenido;
        div.appendChild(content);

        // Hora
        const time = document.createElement('span');
        time.className = 'message-time';
        time.textContent = new Date(nuevo.createdAt).toLocaleTimeString();
        div.appendChild(time);                  // <— ¡Ojo aquí, lo insertas en el div!

        // Actions container
        const actions = document.createElement('div');
        actions.className = 'message-actions';

        // Edit button
        const editBtn = document.createElement('div');
        editBtn.className = 'edit-btn';
        editBtn.title = 'Editar mensaje';
        const editIcon = document.createElement('i');
        editIcon.className = 'fas fa-pencil-alt';
        editBtn.appendChild(editIcon);

        editBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            //console.log("mensaje de mierda: " + nuevo.contenido)
            openEditModal(nuevo, content); // Pasamos el mensaje y el elemento del contenido
        });

        actions.appendChild(editBtn);

        // Delete button
        const deleteBtn = document.createElement('div');
        deleteBtn.className = 'delete-btn';
        deleteBtn.title = 'Eliminar mensaje';
        const trashIcon = document.createElement('i');
        trashIcon.className = 'fas fa-trash';
        deleteBtn.appendChild(trashIcon);

        deleteBtn.addEventListener('click', async e => {
            e.stopPropagation();
            if (confirm("¿Estás seguro que quieres eliminar este mensaje?")) {
                try {
                    const delRes = await fetch(
                        `http://localhost:8080/api/messages/${nuevo.id}`,
                        { method: 'DELETE' }
                    );
                    if (!delRes.ok) throw new Error(delRes.status);
                    div.remove();
                } catch (err) {
                    console.error('Error eliminando mensaje:', err);
                    alert('No se pudo eliminar el mensaje.');
                }
            }
        });

        actions.appendChild(deleteBtn);

        // Añadimos actions al mensaje
        div.appendChild(actions);

        // Ahora sí, lo añades al contenedor
        messagesContainer.appendChild(div);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        messageInput.value = '';
    } catch (err) {
        console.error('Error enviando mensaje:', err);
    }
}




// Función para renderizar la lista de contactos
function renderContactList(contactos) {
    const chatList = document.getElementById("chatList");
    chatList.innerHTML = '';

    if (!contactos || contactos.length === 0) {
        chatList.innerHTML = `
            <div class="no-contacts">
                No tienes contactos aún. Agrega amigos para chatear.
            </div>
        `;
        return;
    }

    contactos.forEach(contacto => {
        const contactItem = document.createElement('div');
        contactItem.className = 'chat-item';
        contactItem.innerHTML = `
            <img src="${"http://localhost:8080/uploads/avatars/" + contacto.avatar || 'https://www.gravatar.com/avatar/default?s=200'}" 
                 class="chat-avatar">
            <div class="chat-info">
                <span class="chat-name">${contacto.nombre}</span>
                <span class="chat-last-msg">@${contacto.username}</span>
            </div>
        `;

        // Evento para iniciar chat
        contactItem.addEventListener('click', () => {
            startChatWithContact(contacto);
        });

        chatList.appendChild(contactItem);
    });
}

// Variable para almacenar el intervalo
let chatRefreshInterval = null;

async function startChatWithContact(contacto) {
    console.log("el contacto de mierda es: " + contacto)
    currentContactId = contacto.id;

    // Detener el intervalo anterior si existe
    if (chatRefreshInterval) {
        clearInterval(chatRefreshInterval);
    }

    // Cargar mensajes inmediatamente
    await loadChatMessages();

    // Configurar intervalo para refrescar mensajes cada 5 segundos
    chatRefreshInterval = setInterval(async () => {
        await loadChatMessages();
    }, 5000); // 5000 ms = 5 segundos

    document.querySelector('.chat-list-view').classList.remove('active');
    document.querySelector('.chat-detail-view').classList.add('active');

    const chatHeader = document.querySelector('.chat-header');
    const avatarUrl = contacto.avatar
        ? `http://localhost:8080/uploads/avatars/${contacto.avatar}`
        : 'https://www.gravatar.com/avatar/default?s=200';
    chatHeader.querySelector('.profile-pic').src = avatarUrl;
    chatHeader.querySelector('.chat-name').textContent = contacto.username || 'Usuario sin nombre';
}

// Funciones para manejar el chat IA
function showAIChatList() {
    document.querySelector('#aiChatListView').classList.add('active');
    document.querySelector('#aiChatView').classList.remove('active');
}

function showAIChatView() {
    document.querySelector('#aiChatListView').classList.remove('active');
    document.querySelector('#aiChatView').classList.add('active');
}

function handleChatKeyPress(e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
}

function handleAIKeyPress(e) {
    if (e.key === 'Enter') {
        sendAIMessage();
    }
}

async function sendAIMessage() {
    const input = document.getElementById('aiMessageInput');
    const message = input.value.trim();

    if (!message) return;

    // 1. Mostrar el mensaje del usuario
    addAIMessage(message, 'sent');
    input.value = '';

    try {
        // 2. Llamada a tu API
        const response = await fetch(`http://localhost:8080/api/chat/${currentUserId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contenido: message })
        });

        if (!response.ok) {
            throw new Error(`Error en la respuesta: ${response.status}`);
        }

        // 3. Obtener el texto completo de la respuesta
        let text = await response.text();

        // 4. Eliminar todas las apariciones de "**Respuesta:**"
        text = text.replace(/\*\*Respuesta:\*\*/g, '').trim();

        // 5. Mostrar la respuesta de la IA en el chat
        addAIMessage(text, 'received');

    } catch (err) {
        console.error('Error enviando el mensaje:', err);
        addAIMessage('¡Ups! Hubo un error al comunicarme con el servidor.', 'received');
    }
}



function addAIMessage(text, type) {
    const messagesContainer = document.getElementById('aiMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;

    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    messageDiv.innerHTML = `
        <div class="message-content">
            <p>${text}</p>
        </div>
        <div class="message-time">${timeString}</div>
    `;

    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}