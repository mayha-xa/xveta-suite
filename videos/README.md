# 🎬 Videos Tutoriales

Coloca aquí tus videos en formato MP4.

## Especificaciones Técnicas:

- **Formato:** MP4 (H.264)
- **Resolución:** 1920x1080 (Full HD) o 1280x720 (HD)
- **Bitrate:** 2-5 Mbps
- **Duración:** 5-15 minutos recomendado
- **Audio:** AAC, 128-192 kbps

## Nombres Sugeridos:

```
01-introduccion.mp4
02-activar-licencia.mp4
03-xveta-ids.mp4
04-optimizador.mp4
05-tablero.mp4
06-despiece.mp4
07-cantos.mp4
08-pintar.mp4
09-vetas.mp4
10-proyecto.mp4
11-revelar.mp4
12-rotar.mp4
```

## ⚠️ Límite de Tamaño

GitHub tiene un límite de **100MB por archivo**.

### Si tus videos son más grandes:

**Opción A: Comprimir**
```bash
ffmpeg -i input.mp4 -vcodec h264 -b:v 2500k -acodec aac -b:a 128k output.mp4
```

**Opción B: Usar servicio externo**
- YouTube (privados/no listados)
- Vimeo
- Cloudinary
- AWS S3

Si usas servicio externo, actualiza los links en `js/tutoriales.js`:

```javascript
const videoSources = {
  'intro-1': 'https://youtube.com/embed/VIDEO_ID',
  // ...
};
```

## Subir Videos

```bash
git add videos/
git commit -m "Agregar videos tutoriales"
git push
```

Si Git rechaza archivos grandes:
```bash
git lfs track "*.mp4"
git add .gitattributes
git commit -m "Track videos con LFS"
```
