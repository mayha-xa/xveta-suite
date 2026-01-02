# 📦 Descargas

Coloca aquí los archivos del plugin para descarga.

## Archivo Principal:

### `xveta-v1.0.3.rbz`
- Tu plugin empaquetado
- Usuarios lo descargarán desde descargas.html

## Versionado

Mantén múltiples versiones:

```
descargas/
├── xveta-v1.0.3.rbz   ← Versión actual
├── xveta-v1.0.2.rbz   ← Versión anterior
├── xveta-v1.0.1.rbz   ← Historial
└── xveta-v1.0.0.rbz   ← Primera versión
```

## Actualizar Versión

Cuando saques nueva versión:

1. **Agregar nuevo archivo:**
   ```bash
   cp XVETA-SUITE-v1.0.4.rbz descargas/xveta-v1.0.4.rbz
   git add descargas/
   ```

2. **Actualizar version.json:**
   ```json
   {
     "version": "1.0.4",
     "notas": "Nueva versión con...",
     "url_descarga": "https://mayha-xa.github.io/xveta-suite/descargas/xveta-v1.0.4.rbz"
   }
   ```

3. **Actualizar descargas.html:**
   - Cambiar versión en botón de descarga
   - Agregar entrada en historial de actualizaciones

4. **Commit y push:**
   ```bash
   git commit -m "Release v1.0.4"
   git tag v1.0.4
   git push --tags
   ```

## Link de Descarga

La URL será:
```
https://mayha-xa.github.io/xveta-suite/descargas/xveta-vX.X.X.rbz
```

Esta URL se usa en:
- `descargas.html` (botón de descarga)
- `version.json` (verificación de actualizaciones)
