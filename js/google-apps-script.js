// ═══════════════════════════════════════════════════════════════
// XVETA SUITE - GOOGLE APPS SCRIPT
// Automatiza: Verificación de pago → GitHub Action → Envío de email
// ═══════════════════════════════════════════════════════════════

// ⚠️ CONFIGURACIÓN - COMPLETA ESTOS DATOS
const CONFIG = {
  // Tu API Key de Stripe (modo test)
  STRIPE_SECRET_KEY: 'sk_test_51SlsM1Rt1ZKQZLINSDpMlmSpiZ1RZYbuJ2KHQF7VZQrzN60ukETy0m7w52rvfyKNkLdQlZsfHu1o8ueAk3ngiwlZ00SCKCIF0Y',
  
  // Configuración de GitHub
  GITHUB_TOKEN: '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',
  GITHUB_OWNER: 'mayha-xa',
  GITHUB_REPO: 'xveta-licenses',
  GITHUB_WORKFLOW: 'generate-license.yml',
  
  // Precio esperado (Stripe cobra en centavos)
  PRECIO_ESPERADO: 100, // $1.00 USD = 100 centavos
  
  // Email de notificación
  EMAIL_ADMIN: 'mayha.xa@gmail.com'
};

// ═══════════════════════════════════════════════════════════════
// FUNCIÓN PRINCIPAL - Se ejecuta cada vez que se agrega una fila
// ═══════════════════════════════════════════════════════════════

function onFormSubmit(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSheet();
    const row = e.range.getRow();
    
    // Obtener datos de la fila
    const timestamp = sheet.getRange(row, 1).getValue();
    const machineId = sheet.getRange(row, 2).getValue();
    const email = sheet.getRange(row, 3).getValue();
    const nombre = sheet.getRange(row, 4).getValue();
    
    Logger.log(`Nueva solicitud: ${email} - Machine ID: ${machineId}`);
    
    // Marcar como "Procesando"
    sheet.getRange(row, 5).setValue('⏳ Procesando...');
    
    // Verificar pago en Stripe
    const pagado = verificarPagoStripe(email);
    
    if (pagado) {
      Logger.log('✅ Pago verificado en Stripe');
      
      // Disparar GitHub Action para generar licencia
      const resultado = dispararGitHubAction(machineId, email, nombre);
      
      if (resultado.success) {
        // Marcar como completado
        sheet.getRange(row, 5).setValue('✅ Licencia enviada');
        sheet.getRange(row, 6).setValue(new Date());
        
        Logger.log('✅ Licencia generada y enviada');
        
      } else {
        sheet.getRange(row, 5).setValue('❌ Error al generar');
        sheet.getRange(row, 7).setValue(resultado.error);
        
        // Notificar al admin
        enviarEmailAdmin('Error al generar licencia', 
          `Usuario: ${email}\nMachine ID: ${machineId}\nError: ${resultado.error}`);
      }
      
    } else {
      Logger.log('⏳ Pago no encontrado, esperando...');
      sheet.getRange(row, 5).setValue('⏳ Esperando pago');
      
      // Programar verificación en 5 minutos
      crearTriggerVerificacion(row, machineId, email, nombre);
    }
    
  } catch (error) {
    Logger.log('❌ Error en onFormSubmit: ' + error);
    enviarEmailAdmin('Error en procesamiento', error.toString());
  }
}

// ═══════════════════════════════════════════════════════════════
// VERIFICAR PAGO EN STRIPE
// ═══════════════════════════════════════════════════════════════

function verificarPagoStripe(email) {
  try {
    const url = 'https://api.stripe.com/v1/payment_intents?limit=10';
    
    const options = {
      method: 'get',
      headers: {
        'Authorization': 'Bearer ' + CONFIG.STRIPE_SECRET_KEY
      },
      muteHttpExceptions: true
    };
    
    const response = UrlFetchApp.fetch(url, options);
    const data = JSON.parse(response.getContentText());
    
    // Buscar pago de este email en las últimas 24 horas
    const hace24h = Date.now() - (24 * 60 * 60 * 1000);
    
    for (let payment of data.data) {
      // Verificar email y estado
      if (payment.receipt_email === email || 
          (payment.charges && payment.charges.data[0] && 
           payment.charges.data[0].billing_details.email === email)) {
        
        // Verificar que sea exitoso y del monto correcto
        if (payment.status === 'succeeded' && 
            payment.amount >= CONFIG.PRECIO_ESPERADO &&
            payment.created * 1000 > hace24h) {
          return true;
        }
      }
    }
    
    return false;
    
  } catch (error) {
    Logger.log('Error al verificar pago: ' + error);
    return false;
  }
}

// ═══════════════════════════════════════════════════════════════
// DISPARAR GITHUB ACTION
// ═══════════════════════════════════════════════════════════════

function dispararGitHubAction(machineId, email, nombre) {
  try {
    const url = `https://api.github.com/repos/${CONFIG.GITHUB_OWNER}/${CONFIG.GITHUB_REPO}/actions/workflows/${CONFIG.GITHUB_WORKFLOW}/dispatches`;
    
    const payload = {
      ref: 'main', // o 'master' según tu rama principal
      inputs: {
        machine_id: machineId,
        email: email,
        user_name: nombre,
        plan: 'monthly'
      }
    };
    
    const options = {
      method: 'post',
      headers: {
        'Authorization': 'token ' + CONFIG.GITHUB_TOKEN,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };
    
    const response = UrlFetchApp.fetch(url, options);
    const statusCode = response.getResponseCode();
    
    if (statusCode === 204) {
      Logger.log('✅ GitHub Action disparado exitosamente');
      return { success: true };
    } else {
      const error = `Status ${statusCode}: ${response.getContentText()}`;
      Logger.log('❌ Error al disparar GitHub Action: ' + error);
      return { success: false, error: error };
    }
    
  } catch (error) {
    Logger.log('❌ Error en dispararGitHubAction: ' + error);
    return { success: false, error: error.toString() };
  }
}

// ═══════════════════════════════════════════════════════════════
// VERIFICACIÓN RETRASADA (si pago aún no aparece)
// ═══════════════════════════════════════════════════════════════

function verificarPagoRetrasado(row, machineId, email, nombre) {
  try {
    const sheet = SpreadsheetApp.getActiveSheet();
    const estado = sheet.getRange(row, 5).getValue();
    
    // Solo verificar si sigue esperando
    if (estado.includes('Esperando')) {
      const pagado = verificarPagoStripe(email);
      
      if (pagado) {
        sheet.getRange(row, 5).setValue('⏳ Procesando licencia...');
        
        const resultado = dispararGitHubAction(machineId, email, nombre);
        
        if (resultado.success) {
          sheet.getRange(row, 5).setValue('✅ Licencia enviada');
          sheet.getRange(row, 6).setValue(new Date());
        } else {
          sheet.getRange(row, 5).setValue('❌ Error al generar');
          sheet.getRange(row, 7).setValue(resultado.error);
        }
      } else {
        // Si después de 1 hora no hay pago, marcar como pendiente
        const horaRegistro = new Date(sheet.getRange(row, 1).getValue());
        const horasTranscurridas = (Date.now() - horaRegistro.getTime()) / (1000 * 60 * 60);
        
        if (horasTranscurridas > 1) {
          sheet.getRange(row, 5).setValue('⚠️ Pago no detectado');
          enviarEmailAdmin('Pago no detectado después de 1 hora', 
            `Usuario: ${email}\nMachine ID: ${machineId}`);
        }
      }
    }
  } catch (error) {
    Logger.log('Error en verificarPagoRetrasado: ' + error);
  }
}

// ═══════════════════════════════════════════════════════════════
// CREAR TRIGGER PARA VERIFICACIÓN RETRASADA
// ═══════════════════════════════════════════════════════════════

function crearTriggerVerificacion(row, machineId, email, nombre) {
  ScriptApp.newTrigger('verificarPagoRetrasado')
    .timeBased()
    .after(5 * 60 * 1000) // 5 minutos
    .create();
  
  // Guardar parámetros en propiedades del script
  const props = PropertiesService.getScriptProperties();
  props.setProperty('ultimaFila', row);
  props.setProperty('ultimoMachineId', machineId);
  props.setProperty('ultimoEmail', email);
  props.setProperty('ultimoNombre', nombre);
}

// ═══════════════════════════════════════════════════════════════
// ENVIAR EMAIL AL ADMINISTRADOR
// ═══════════════════════════════════════════════════════════════

function enviarEmailAdmin(asunto, mensaje) {
  try {
    MailApp.sendEmail({
      to: CONFIG.EMAIL_ADMIN,
      subject: `[XVETA] ${asunto}`,
      body: mensaje
    });
  } catch (error) {
    Logger.log('Error al enviar email admin: ' + error);
  }
}

// ═══════════════════════════════════════════════════════════════
// FUNCIÓN DE PRUEBA
// ═══════════════════════════════════════════════════════════════

function testVerificarPago() {
  const email = 'test@ejemplo.com'; // Cambia por un email de prueba
  const resultado = verificarPagoStripe(email);
  Logger.log('Pago verificado: ' + resultado);
}

function testDispararAction() {
  const resultado = dispararGitHubAction(
    'TEST-MACHINE-123',
    'test@ejemplo.com',
    'Usuario Prueba'
  );
  Logger.log('GitHub Action resultado: ' + JSON.stringify(resultado));
}
