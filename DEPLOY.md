# Guía de Despliegue - ShiftMaster Pro

Esta aplicación está lista para ser desplegada en la web de forma gratuita y sencilla.

## Opción 1: Vercel (Recomendado)

Vercel es la plataforma más sencilla para aplicaciones React/Vite.

1.  Sube tu código a un repositorio de **GitHub**.
2.  Entra en [vercel.com](https://vercel.com) y crea una cuenta.
3.  Haz clic en **"Add New"** > **"Project"**.
4.  Importa tu repositorio de GitHub.
5.  Vercel detectará automáticamente que es un proyecto de Vite. Haz clic en **"Deploy"**.
6.  ¡Listo! Te darán una URL (ej: `shiftmaster-pro.vercel.app`).

## Opción 2: Netlify

1.  Entra en [netlify.com](https://netlify.com).
2.  Puedes arrastrar la carpeta `dist` directamente a su panel de control tras ejecutar `npm run build` localmente, o conectar tu GitHub.
3.  Netlify usará el archivo `_redirects` que hemos configurado para que todo funcione correctamente.

## Consideraciones Importantes

- **Privacidad**: La aplicación guarda los datos en el navegador (`localStorage`). Esto significa que los datos no se comparten entre diferentes ordenadores o navegadores.
- **Backups**: Es recomendable usar la función de "Exportar" (si está implementada) antes de borrar la caché del navegador.
- **Actualizaciones**: Cada vez que subas cambios a GitHub, Vercel/Netlify actualizarán la web automáticamente.

---
*Preparado por Antigravity*
