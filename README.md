# 🔧 XVETA Suite - Sitio Web

Sitio web profesional para XVETA Suite con sistema de descargas, tutoriales y pagos seguros.

## 📁 Estructura del Proyecto

```
xveta-suite/
├── index.html              # Página principal
├── descargas.html          # Página de descargas
├── tutoriales.html         # Tutoriales con videos
├── comprar.html            # Página de compra con Stripe
├── css/
│   └── styles.css          # Estilos principales
├── js/
│   ├── particles.js        # Partículas animadas de fondo
│   ├── animations.js       # Animaciones de scroll
│   ├── main.js            # Funcionalidad principal
│   ├── tutoriales.js      # Sistema de videos
│   └── stripe-checkout.js # Integración Stripe
├── images/
│   ├── logo.png           # Logo principal
│   ├── plugin-preview.png # Preview del plugin
│   └── thumbnails/        # Miniaturas de videos
├── videos/                # Videos tutoriales (MP4)
│   ├── 01-introduccion.mp4
│   ├── 02-activar-licencia.mp4
│   └── ...
├── descargas/             # Archivos del plugin
│   └── xveta-v1.0.3.rbz
└── README.md              # Este archivo
```

---

## 🚀 PASO 1: Configuración Inicial

### 1.1 Clonar el repositorio

```bash
git clone https://github.com/mayha-xa/xveta-suite.git
cd xveta-suite
```

### 1.2 Agregar tus imágenes

Reemplaza estas imágenes con las tuyas:

```
images/logo.png              (Logo de XVETA, 200x200px)
images/plugin-preview.png    (Screenshot del plugin, 800x600px)
images/thumbnails/           (Miniaturas de videos, 640x360px)
```

**Logos temporales:** Por ahora usa placeholders, mañana los reemplazas.

---

## 💳 PASO 2: Configurar Stripe (Pagos)

### 2.1 Crear cuenta en Stripe

1. Ve a https://stripe.com
2. Crea una cuenta
3. Activa tu cuenta con tus datos bancarios

### 2.2 Obtener claves API

1. Dashboard de Stripe → Developers → API Keys
2. Copia tu **Publishable Key** (empieza con `pk_`)
3. Copia tu **Secret Key** (empieza con `sk_`)

### 2.3 Configurar en el sitio

Edita `js/stripe-checkout.js` línea 8:

```javascript
const STRIPE_PUBLIC_KEY = 'pk_live_TU_CLAVE_AQUI'; // ← Pega tu clave pública
```

⚠️ **IMPORTANTE:**
- La **clave pública** (`pk_`) va en el frontend (es segura)
- La **clave secreta** (`sk_`) NUNCA va en el frontend
- La clave secreta debe estar en tu backend

---

## 🔐 PASO 3: Backend para Generar Licencias

Tu sitio necesita un backend simple para:
1. Procesar pagos con Stripe
2. Generar licencias cuando se confirma el pago
3. Enviar emails con la licencia

### Opción A: Usando Netlify Functions (RECOMENDADO)

**Ventajas:**
- ✅ Gratis
- ✅ Fácil de configurar
- ✅ Se despliega automáticamente con GitHub

**Configuración:**

1. Crea carpeta `netlify/functions/`
2. Crea archivo `netlify/functions/create-payment.js`:

```javascript
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  const { email, amount } = JSON.parse(event.body);
  
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount,
    currency: 'usd',
    receipt_email: email,
    metadata: {
      product: 'XVETA-SUITE'
    }
  });
  
  return {
    statusCode: 200,
    body: JSON.stringify({
      client_secret: paymentIntent.client_secret
    })
  };
};
```

3. Crea archivo `netlify.toml`:

```toml
[build]
  functions = "netlify/functions"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200
```

4. Agrega variables de entorno en Netlify:
   - `STRIPE_SECRET_KEY` = tu clave secreta de Stripe
   - `GITHUB_TOKEN` = token para GitHub Actions

### Opción B: Usando tu propio servidor

Si ya tienes un servidor PHP/Node.js/Python, puedes crear los endpoints ahí.

---

## 📧 PASO 4: Configurar Generación de Licencias

### 4.1 Crear GitHub Action

Crea `.github/workflows/generate-license.yml`:

```yaml
name: Generar Licencia

on:
  repository_dispatch:
    types: [generate-license]

jobs:
  generate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Generar licencia
        run: |
          EMAIL="${{ github.event.client_payload.email }}"
          PAYMENT_ID="${{ github.event.client_payload.payment_id }}"
          
          # Generar licencia
          ruby generador_licencia.rb "$EMAIL" mensual
          
          # Enviar email
          # (Usa SendGrid, Mailgun, etc)
          
      - name: Commit licencia
        run: |
          git config --global user.name "XVETA Bot"
          git config --global user.email "bot@xveta.com"
          git add licencias/
          git commit -m "Nueva licencia para $EMAIL"
          git push
```

### 4.2 Configurar Webhook de Stripe

1. Dashboard de Stripe → Developers → Webhooks
2. Agregar endpoint: `https://tu-sitio.netlify.app/api/stripe-webhook`
3. Eventos a escuchar:
   - `payment_intent.succeeded`
   - `customer.subscription.created`
4. Copiar **Signing Secret**

---

## 🎬 PASO 5: Subir Videos Tutoriales

### 5.1 Preparar videos

- Formato: MP4 (H.264)
- Resolución: 1920x1080 o 1280x720
- Bitrate: 2-5 Mbps
- Duración: 5-15 minutos recomendado

### 5.2 Subir a GitHub

```bash
git add videos/
git commit -m "Agregar tutoriales"
git push
```

⚠️ **Límite:** GitHub tiene límite de 100MB por archivo.

Si tus videos son más grandes, usa:
- **YouTube** (privados/no listados)
- **Vimeo**
- **Cloudinary**

---

## 📱 PASO 6: Configurar Publicidad (Opcional)

### Para Google AdSense:

1. Aplica en https://www.google.com/adsense
2. Espera aprobación (1-2 semanas)
3. Copia el código de anuncios
4. Pega en `tutoriales.html` en los div con id `ad-top` y `ad-bottom`

Ejemplo:

```html
<div id="ad-top">
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>
  <ins class="adsbygoogle"
       style="display:block"
       data-ad-client="ca-pub-XXXXXXXXXX"
       data-ad-slot="XXXXXXXXXX"
       data-ad-format="auto"></ins>
  <script>
       (adsbygoogle = window.adsbygoogle || []).push({});
  </script>
</div>
```

---

## 🌐 PASO 7: Desplegar en GitHub Pages

### 7.1 Activar GitHub Pages

1. Ve a tu repositorio en GitHub
2. Settings → Pages
3. Source: `main` branch
4. Carpeta: `/ (root)`
5. Guardar

### 7.2 Tu sitio estará en:

```
https://mayha-xa.github.io/xveta-suite/
```

### 7.3 Dominio personalizado (Opcional)

Si tienes un dominio (ej: xvetasuite.com):

1. Settings → Pages → Custom domain
2. Agrega tu dominio
3. En tu proveedor de DNS agrega:
   ```
   CNAME    www    mayha-xa.github.io
   ```

---

## 🔒 SEGURIDAD

### ✅ Qué está seguro:

- Pagos procesados por Stripe (PCI DSS Level 1)
- Licencias firmadas con RSA-2048
- HTTPS forzado en GitHub Pages
- No hay claves privadas en el frontend

### ⚠️ Qué debes proteger:

1. **Clave Secreta de Stripe (`sk_`):**
   - NUNCA la subas a GitHub
   - Solo en backend/Netlify env vars

2. **GitHub Token:**
   - Necesario para disparar Actions
   - Solo en backend
   - Permisos mínimos (solo `repo`)

3. **Clave Privada RSA:**
   - La del generador de licencias
   - Solo en servidor backend
   - NUNCA en el sitio web

---

## 📝 PASO 8: Personalización

### 8.1 Cambiar colores

Edita `css/styles.css` líneas 8-16:

```css
:root {
  --primary: #667eea;      /* Color primario */
  --secondary: #764ba2;    /* Color secundario */
  --accent: #f093fb;       /* Color de acento */
  --dark: #0f0f0f;         /* Fondo negro */
}
```

### 8.2 Cambiar textos

Edita los archivos HTML directamente.

### 8.3 Agregar más tutoriales

En `tutoriales.html`, copia una `<div class="video-card">` y modifica:
- `data-category`: categoría del video
- `onclick="openVideo('ID')"`: ID único
- Título y descripción
- Duración

---

## 🐛 Solución de Problemas

### Los pagos no funcionan

1. ¿Configuraste la clave pública de Stripe?
2. ¿Está tu backend funcionando?
3. Revisa la consola del navegador (F12)

### Los videos no se reproducen

1. ¿Están en formato MP4?
2. ¿Están en la carpeta `videos/`?
3. ¿El tamaño es menor a 100MB?

### Las animaciones no funcionan

1. Abre la consola (F12)
2. Revisa si hay errores de JavaScript
3. Recarga la página con Ctrl+F5

---

## 📞 Soporte

¿Necesitas ayuda?

- Email: mayha.xa@gmail.com
- GitHub Issues: https://github.com/mayha-xa/xveta-suite/issues

---

## ✅ Checklist de Lanzamiento

Antes de publicar, verifica:

- [ ] Logo y imágenes agregadas
- [ ] Clave pública de Stripe configurada
- [ ] Backend funcionando (Netlify Functions o propio)
- [ ] GitHub Action para licencias configurado
- [ ] Videos subidos (o enlaces de YouTube)
- [ ] Probado en móvil y desktop
- [ ] HTTPS activo
- [ ] Links funcionando

---

## 📊 Estadísticas

Después de lanzar, agrega Google Analytics:

```html
<!-- En <head> de cada HTML -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

---

## 🎉 ¡Listo!

Tu sitio está configurado con:

✅ Diseño negro profesional y moderno  
✅ Animaciones suaves y responsive  
✅ Sistema de descargas  
✅ Tutoriales con videos  
✅ Pagos seguros con Stripe  
✅ Generación automática de licencias  
✅ Seguridad bancaria/militar (RSA-2048)  

**Solo falta:**
1. Agregar tus imágenes
2. Configurar Stripe
3. Subir videos
4. ¡Publicar!

---

**Desarrollado con ❤️ para XVETA Suite**
