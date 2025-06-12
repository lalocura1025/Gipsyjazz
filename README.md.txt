
## 🛠️ Desarrollo
# Gipsyjazz Mástil de Estudio

Una sencilla pero potente aplicación web para visualizar escalas, acordes y arpegios en el mástil de la guitarra. Ideal para estudiantes de guitarra, especialmente enfocados en jazz manouche o cualquier otro estilo.

## ✨ Características

- **Visualización Clara:** Muestra las notas de una escala, acorde o arpegio directamente sobre un mástil virtual.
- **Interactividad:** Cambia la tónica, el tipo (escala, acorde, arpegio) y el nombre para actualizar la vista en tiempo real.
- **Personalizable:** Construido con HTML, CSS y JavaScript puros, es fácil de modificar y ampliar.
- **Responsive:** Se adapta a pantallas de escritorio y dispositivos móviles.

## 🚀 Cómo Usar

1.  Abre `index.html` en tu navegador web.
2.  Usa los menús desplegables en la parte superior:
    - **Tónica:** Elige la nota raíz para el patrón que quieres ver.
    - **Tipo:** Selecciona si quieres visualizar una 'Escala', un 'Acorde' o un 'Arpegio'.
    - **Nombre:** Elige el patrón específico (ej. 'Mayor', 'Menor 7', etc.).
3.  El mástil se actualizará automáticamente mostrando las notas correspondientes. Las notas tónicas se resaltan en un color diferente.

## 📂 Estructura del Proyecto
Para trabajar en el proyecto, simplemente clona el repositorio y abre los archivos en tu editor de código. Como no requiere un build step, puedes ver los cambios recargando la página `index.html` en tu navegador.

Se recomienda usar un servidor local (como la extensión "Live Server" de VS Code) para evitar problemas con las políticas de CORS al cargar los archivos `.json`.

Gipsyjazz-Mastil/
│
├── index.html → La página principal de la aplicación.
├── style.css → Estilos para la interfaz y el mástil.
├── app.js → Lógica principal de la aplicación (módulo ES).
│
├── data/
│ ├── scales.json → Definiciones de escalas (intervalos).
│ ├── chords.json → Definiciones de acordes (intervalos).
│ └── arpeggios.json → Definiciones de arpegios (intervalos).
│
├── README.md → Este archivo.
├── .eslintrc.json → Configuración de ESLint para la calidad del código.
└── .prettierrc → Reglas de formato para Prettier.
## 🛠️ Desarrollo

Para trabajar en el proyecto, simplemente clona el repositorio y abre los archivos en tu editor de código. Como no requiere un build step, puedes ver los cambios recargando la página `index.html` en tu navegador.

Se recomienda usar un servidor local (como la extensión "Live Server" de VS Code) para evitar problemas con las políticas de CORS al cargar los archivos `.json`.