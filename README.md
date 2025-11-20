# Kahoot Clone (Flask + React + SocketIO)

Este proyecto usa WebSockets para evitar el polling constante y reducir la carga en el servidor.

## Estructura

- `/backend`: Servidor Flask con Flask-SocketIO.
- `/frontend`: Cliente React (Vite).

## Cómo ejecutar

### Backend

1.  Navega a `/backend`.
2.  Instala dependencias:
    ```bash
    pip install -r requirements.txt
    ```
3.  Ejecuta el servidor:
    ```bash
    python app.py
    ```
    El servidor correrá en `http://localhost:5000`.

### Frontend

1.  Navega a `/frontend`.
2.  Instala dependencias:
    ```bash
    npm install
    ```
3.  Ejecuta el servidor de desarrollo:
    ```bash
    npm run dev
    ```

## Puntos Clave para "No Polling"

-   **`backend/events.py`**: Aquí se definen los eventos de SocketIO. Cuando el admin cambia de pregunta, se emite `new_question` a todos los clientes en la sala (`room=pin`).
-   **`frontend/src/services/socket.js`**: Mantiene la conexión persistente.
-   **`frontend/src/context/GameContext.jsx`**: Escucha los eventos y actualiza el estado de React automáticamente sin que el cliente tenga que preguntar.
