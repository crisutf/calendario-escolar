# 📅 Calendario Escolar — Crisutf

Un calendario escolar rápido, ligero y diseñado para mantener a los alumnos informados sobre **exámenes, entregas, excursiones, festivos** y otros eventos importantes del curso.

---

## 🌐 URLs del proyecto

- 📅 **Calendario:** [https://digital.crisu.qzz.io](https://digital.crisu.qzz.io)
- ⚙️ **Servidor / Gestión:** [https://dev-management-digital-v1.crisu.qzz.io](https://dev-management-digital-v1.crisu.qzz.io)

> ⚠️ **Nota importante:** El enlace del servidor corresponde al entorno actual. Deberás actualizarlo con el enlace de tu propio servidor o dominio tras realizar el despliegue para que todo funcione y se configure correctamente.

---

## 📖 Descripción del proyecto

Este calendario permite a los alumnos estar informados de todo lo importante durante el curso. Su diseño simple y visual hace que sea fácil ver los días clave y mantenerse organizado.

---

## 🛠️ Tecnologías utilizadas

* **Vite** — Entorno de desarrollo ultrarrápido
* **React** — Librería para la interfaz de usuario
* **TailwindCSS** — Framework de estilos

---

## 🚀 Instalación y ejecución

Asegúrate de tener [Bun](https://bun.sh/) instalado en tu entorno local.

1. **Instalar dependencias:**
   ```bash
   bun install
   ```

2. **Ejecutar en modo desarrollo:**
   ```bash
   bun run dev
   ```

3. **Construir para producción:**
   ```bash
   bun run build
   ```

---

## ✏️ Cómo añadir o editar eventos

Los eventos se administran de forma sencilla desde el propio panel de control de la aplicación:

1. Dirígete a la esquina superior derecha del menú en la web y haz clic en el botón de acceso al panel de control.
2. Inicia sesión con tus credenciales de administrador.

### 🔑 Credenciales por defecto

> ⚠️ **Seguridad:** Estas credenciales vienen configuradas por defecto, pero se recomienda encarecidamente modificarlas mediante un archivo `.env` en tu entorno para mayor control y seguridad.

* **Correo electrónico:** `admin@crisutf.dev`
* **Contraseña:** `D1g1t@l_Crisutf@_`

---

## 🛠️ Solución de problemas (Datos de la app)

Si no visualizas correctamente los cambios recientes, es necesario limpiar los datos almacenados localmente en tu navegador debido a cambios previos de URL o versión.

> 💡 **Nota:** Esto **solo es necesario hacerlo una vez** por cambio de dominio.

### 🔹 Google Chrome
1. Abre la **Configuración** del navegador.
2. Ve a **Privacidad y seguridad** > **Configuración del sitio**.
3. Selecciona **Ver permisos y datos almacenados en todos los sitios**.
4. Busca el dominio del calendario y del servidor.
5. Haz clic en **Eliminar datos** y recarga la página.

### 🔹 Safari (iPhone, iPad o Mac)
1. Abre **Ajustes** (en iOS) o **Safari → Preferencias** (en Mac).
2. Dirígete a **Avanzado** > **Datos de sitios web**.
3. Busca el dominio del calendario y del servidor.
4. Elimina los datos asociados y recarga la página.