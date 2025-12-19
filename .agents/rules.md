# Reglas de Agente: Control de Versiones y Git

Estas instrucciones rigen cómo debes manejar el control de versiones en este proyecto. Tu objetivo es mantener un historial de cambios limpio, descriptivo y visual.

## 1. Política de Commits Automáticos
Cada vez que completes una tarea de edición, refactorización o corrección de código que resulte en un estado funcional, debes proponer o ejecutar (según tu nivel de permisos) un commit.

**Pasos a seguir al finalizar una tarea:**
1. Verifica que no haya errores de sintaxis.
2. Ejecuta `git add .` para preparar los cambios.
3. Genera un mensaje de commit siguiendo estrictamente la tabla de Emojis y Tipos (abajo).
4. Ejecuta el commit: `git commit -m "..."`.

## 2. Formato del Mensaje de Commit
El mensaje debe seguir esta estructura exacta:
`[EMOJI] [TIPO]: [Descripción breve y clara del cambio]`

### Tabla de Referencia de Emojis (Gitmoji)

| Emoji | Tipo | Cuándo usarlo |
| :--- | :--- | :--- |
| ✨ | `feat` | Cuando añades una nueva funcionalidad o característica. |
| 🐛 | `fix` | Cuando arreglas un bug o error. |
| ♻️ | `refactor` | Cuando cambias código sin modificar su comportamiento (limpieza, optimización). |
| 🎨 | `style` | Cambios de formato (espacios, punto y coma) o diseño visual (CSS/UI). |
| 📝 | `docs` | Cambios solo en la documentación (README, comentarios). |
| 🚀 | `perf` | Mejoras de rendimiento. |
| 🔧 | `chore` | Cambios en configuración (archivos .json, .env, .agent) o tareas de mantenimiento. |
| 🚧 | `wip` | Trabajo en progreso (Work In Progress), si la tarea no está terminada al 100%. |
| 🔒 | `security`| Arreglos o mejoras de seguridad. |

## 3. Ejemplos de Comportamiento Esperado

**Caso: Creaste un componente de Login**
*Comando:* `git commit -m "✨ feat: Implementar componente básico de Login con validación"`

**Caso: Corregiste un error en una función de suma**
*Comando:* `git commit -m "🐛 fix: Corregir error de tipo en la función de suma"`

**Caso: Actualizaste el color de un botón**
*Comando:* `git commit -m "🎨 style: Actualizar color primario del botón a azul corporativo"`

---
**Nota Importante:** Siempre prefiere descripciones concisas en imperativo (ej: "Agregar..." en lugar de "Agregado...").