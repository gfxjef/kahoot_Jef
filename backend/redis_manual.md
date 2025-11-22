# Manual de Uso de Redis para Mini-Kahoot

## 🎯 ¿Por qué Redis?
Redis no reemplaza a MySQL. Su función es **proteger** la base de datos principal (MySQL) del tráfico masivo en tiempo real.

- **MySQL**: Historial, datos permanentes (Partidas terminadas, jugadores, respuestas históricas). Lento pero seguro.
- **Redis**: Tiempo real, datos volátiles (Estado del juego, puntajes en vivo, quién respondió qué). Extremadamente rápido.

## 🛠️ Esquema de Datos en Redis

Redis funciona con **Llaves (Keys)** y **Valores**. Usaremos estructuras tipo `HASH` (diccionarios) para organizar la información.

### 1. Estado del Juego
Información general de la partida en curso.
- **Key**: `game:<PIN>`
- **Tipo**: `HASH`
- **Campos**:
    - `pin`: El PIN del juego (ej. "123456")
    - `current_question_index`: Índice de la pregunta actual (0, 1, 2...). `-1` si no ha empezado.
    - `is_active`: "1" (activo) o "0" (inactivo).

**Ejemplo de comando:**
```redis
HSET game:123456 pin "123456" current_question_index "-1" is_active "1"
EXPIRE game:123456 3600
```

### 2. Jugadores
Lista de jugadores unidos a la partida.
- **Key**: `game:<PIN>:players`
- **Tipo**: `HASH`
- **Campos**: `player_id` -> `nombre_jugador`

**Ejemplo de comando:**
```redis
HSET game:123456:players abc123 "Jefferson"
```

### 3. Puntajes (En Vivo)
Puntaje actual de cada jugador.
- **Key**: `game:<PIN>:scores`
- **Tipo**: `HASH`
- **Campos**: `player_id` -> `puntaje`

**Ejemplo de comando:**
```redis
HSET game:123456:scores abc123 "10"
```

### 4. Respuestas por Pregunta
Registro de qué respondió cada quién en la pregunta actual.
- **Key**: `game:<PIN>:answers:<QUESTION_INDEX>`
- **Tipo**: `HASH`
- **Campos**: `player_id` -> `option_index` (índice de la respuesta elegida)

**Ejemplo de comando:**
```redis
HSET game:123456:answers:0 abc123 "1"
```

## 🔄 Flujo de Trabajo

1.  **Crear Juego**: Se genera el PIN y se inicializa `game:<PIN>` en Redis.
2.  **Unirse**: El jugador se añade a `game:<PIN>:players` y `game:<PIN>:scores`.
3.  **Jugar**:
    - El frontend hace *polling* a un endpoint que lee de `game:<PIN>`.
    - Al responder, se escribe en `game:<PIN>:answers:<INDEX>`.
4.  **Terminar**:
    - Al finalizar una pregunta o el juego, los datos se pueden volcar a MySQL para el historial.
    - Las llaves de Redis tienen un tiempo de expiración (TTL) para limpiarse solas (ej. 1 hora).

---
**Nota**: Este esquema asegura que el endpoint de estado (`/state`), que es el más consultado, **nunca** toque MySQL, evitando bloqueos y graylists.
