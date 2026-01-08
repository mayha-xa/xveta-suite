const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

// Configuración
const CONFIG = {
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  GITHUB_TOKEN: process.env.GITHUB_TOKEN,
  GITHUB_OWNER: 'mayha-xa',
  GITHUB_REPO: 'xveta-licenses',
  GITHUB_WORKFLOW: 'generate-license.yml',
  SHEET_ID: process.env.SHEET_ID,
  EMAIL_ADMIN: 'mayha.xa@gmail.com',
  WEBHOOK_SECRET: process.env.WEBHOOK_SECRET || 'xveta-2026'
};

// Verificar pago en Stripe
async function verificarPagoStripe(email) {
  try {
    console.log('Buscando pago para:', email);
    
    const headers = {
      'Authorization': `Bearer ${CONFIG.STRIPE_SECRET_KEY}`
    };
    
    // Buscar subscripciones activas
    const resSubs = await axios.get('https://api.stripe.com/v1/subscriptions?limit=20&status=active', { headers });
    
    for (const sub of resSubs.data.data) {
      if (sub.customer) {
        const resCustomer = await axios.get(`https://api.stripe.com/v1/customers/${sub.customer}`, { headers });
        const customer = resCustomer.data;
        
        console.log('Subscription email:', customer.email, 'Status:', sub.status);
        
        if (customer.email && customer.email.toLowerCase() === email.toLowerCase() && sub.status === 'active') {
          console.log('✅ Subscripción activa encontrada');
          return true;
        }
      }
    }
    
    // Buscar en charges
    const resCharges = await axios.get('https://api.stripe.com/v1/charges?limit=20', { headers });
    
    for (const charge of resCharges.data.data) {
      const chargeEmail = charge.billing_details?.email || charge.receipt_email || charge.customer_email;
      
      console.log('Charge email:', chargeEmail, 'Status:', charge.status);
      
      if (chargeEmail && chargeEmail.toLowerCase() === email.toLowerCase() && charge.status === 'succeeded') {
        console.log('✅ Pago encontrado');
        return true;
      }
    }
    
    console.log('⏳ Pago no encontrado');
    return false;
  } catch (error) {
    console.error('Error verificando pago:', error.message);
    return false;
  }
}

// Disparar GitHub Actions
async function dispararGitHubAction(machineId, email, nombre) {
  try {
    const url = `https://api.github.com/repos/${CONFIG.GITHUB_OWNER}/${CONFIG.GITHUB_REPO}/actions/workflows/${CONFIG.GITHUB_WORKFLOW}/dispatches`;
    
    const payload = {
      ref: 'main',
      inputs: {
        machine_id: String(machineId),
        email: String(email),
        user_name: String(nombre)
      }
    };
    
    await axios.post(url, payload, {
      headers: {
        'Authorization': `Bearer ${CONFIG.GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    
    console.log('✅ GitHub Actions disparado');
    return { success: true };
  } catch (error) {
    console.error('Error disparando GitHub:', error.response?.data || error.message);
    return { success: false, error: error.response?.data?.message || error.message };
  }
}

// Actualizar Google Sheets
async function actualizarSheet(fila, estado, notas = '') {
  try {
    const { google } = require('googleapis');
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS),
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });
    
    const sheets = google.sheets({ version: 'v4', auth });
    
    await sheets.spreadsheets.values.update({
      spreadsheetId: CONFIG.SHEET_ID,
      range: `Sheet1!E${fila}`,
      valueInputOption: 'RAW',
      resource: { values: [[estado]] }
    });
    
    if (notas) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: CONFIG.SHEET_ID,
        range: `Sheet1!G${fila}`,
        valueInputOption: 'RAW',
        resource: { values: [[notas]] }
      });
    }
    
    console.log('✅ Sheet actualizado');
  } catch (error) {
    console.error('Error actualizando sheet:', error.message);
  }
}

// Webhook para procesar solicitudes
app.post('/webhook', async (req, res) => {
  try {
    const { secret, fila, machineId, email, nombre } = req.body;
    
    if (secret !== CONFIG.WEBHOOK_SECRET) {
      return res.status(401).json({ error: 'No autorizado' });
    }
    
    console.log('Nueva solicitud:', email);
    
    // Verificar pago
    const pagado = await verificarPagoStripe(email);
    
    if (pagado) {
      await actualizarSheet(fila, '⏳ Procesando licencia...');
      
      const resultado = await dispararGitHubAction(machineId, email, nombre);
      
      if (resultado.success) {
        await actualizarSheet(fila, '✅ Licencia enviada', '');
        res.json({ success: true, message: 'Licencia generada' });
      } else {
        await actualizarSheet(fila, '❌ Error al generar', resultado.error);
        res.json({ success: false, error: resultado.error });
      }
    } else {
      await actualizarSheet(fila, '⏳ Esperando pago');
      res.json({ success: false, message: 'Pago no encontrado aún' });
    }
  } catch (error) {
    console.error('Error en webhook:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'running', service: 'XVETA License Automation' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en puerto ${PORT}`);
});
