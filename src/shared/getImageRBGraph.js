const puppeteer = require('puppeteer');
require('dotenv').config();

async function generarPDFDesdeGrafica(idSensor,urlImageRB) {
  const url = `${urlImageRB}`;

  try {
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox']
    });

    const page = await browser.newPage();
    await page.setContent(`
      <html>
        <body style="margin: 0; padding: 0; text-align: center;">
          <h2 style="font-family: sans-serif;">Gráfico de Monitoreo ID: ${idSensor}</h2>
          <img src="${url}" style="width: 100%; max-width: 600px;" />
          <p style="font-size: 12px;">Documento generado automáticamente desde PRTG</p>
        </body>
      </html>
    `, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({ format: 'A4' });
    await browser.close();

    return pdfBuffer;

  } catch (error) {
    console.error('Error al generar PDF:', error);
    throw new Error('No se pudo generar el PDF');
  }
}

module.exports = generarPDFDesdeGrafica;