# 📅 Calendario Escolar — Crisutf

Este proyecto es un **calendario escolar** diseñado para informar a los alumnos sobre **exámenes, entregas, excursiones, festivos** y otros eventos importantes del curso.

## 🌐 URLs del proyecto

- Página principal: **[https://digital.crisu.qzz.io/](https://digital.crisu.qzz.io/)**

## 🛠️ Tecnologías utilizadas 🛠️

- **Vite**
- **React**
- **TailwindCSS**

La web es rápida, ligera y fácil de actualizar.

---


## 🛠️ ¿Como arreglar los datos de la app? 🛠️
Para que se vean correctamente los cambios de la versión del **11/12/2025**, es necesario borrar los datos guardados de la web.  
> **Tranquilo:** esto **solo hace falta una vez**. Es porque la app cambió de URL; mientras no vuelva a cambiar de dominio, no tendrás que repetir este proceso.

#### 🔹 Google Chrome
1. Abre **Configuración**.  
2. Entra en **Privacidad y seguridad**.  
3. Ve a **Configuración del sitio**.  
4. Pulsa **Ver permisos y datos almacenados en todos los sitios**.  
5. Busca esta URL:
   - `crisu.qzz.io`
6. Pulsa **Eliminar datos** de la web.  
7. Recarga la página.

#### 🔹 Safari (iPhone, iPad o Mac)
1. Abre **Ajustes** (iOS) o **Safari → Preferencias** (Mac).  
2. Ve a **Avanzado → Datos de sitios web**.  
3. Busca esta URL:
   - `crisu.qzz.io`
4. Elimina los datos de la web.  
5. Recarga la página.
6. Y ya esta

---

## ✏️ Cómo añadir o editar eventos ✏️

Los eventos están almacenados en el archivo:
> donde tu quieras o puede que en tu servidor donde estara el JSON

```
src/data/events.json
```

Cada evento debe seguir esta estructura:

```json
{"date": "AAAA-MM-DD", "title": "Nombre del evento", "type": "event|exam|holiday"}
```

### 🔍 Explicación de los campos

- **date** → Fecha en formato `Año-Mes-Día` (ejemplo: `2025-03-18`).
- **title** → Nombre del evento.
- **type** → Tipo de evento:
  - `event` → Azul. Para entregas, excursiones o actividades.
  - `exam` → Rojo. Para exámenes.
  - `holiday` → Verde. Para festivos como Navidad, Semana Santa, etc.

### 📌 Ejemplo 
> Ahora se tiene que poner el JSON en otro server para que funcione

```json
{"date": "2025-02-14", "title": "Examen de Matemáticas", "type": "exam"}
```

---

## 📖 Descripción del proyecto

Este calendario permite a los alumnos estar informados de todo lo importante durante el curso. Su diseño simple y visual hace que sea fácil ver los días clave y mantenerse organizado.

---

## 🚀 Instalación y ejecución

1. Instalar dependencias:

```bash
bun install
```

2. Ejecutar en modo desarrollo:

```bash
bun run dev
```

3. Construir para producción:

```bash
bun run build
```
