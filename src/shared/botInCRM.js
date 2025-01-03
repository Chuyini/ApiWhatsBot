const puppeteer = require('puppeteer');

const getApiKeyFromLocalStorage = async () => {
    try {
        // Lanza Puppeteer en modo headless
        const browser = await puppeteer.launch({
            headless: true, // Modo headless habilitado
            args: ['--no-sandbox', '--disable-setuid-sandbox'], // Configuración requerida para Vercel
        });

        // Abre una nueva pestaña en el navegador
        const page = await browser.newPage();

        // Navega a la página de inicio de sesión
        const loginUrl = 'https://uisp.elpoderdeinternet.mx/nms/login'; 
        await page.goto(loginUrl, { waitUntil: 'networkidle2' });

        // Interactúa con los campos del formulario
        await page.type('#username', 'jesus.lara@elpoderdeinternet.mx'); 
        await page.type('#password', 'Lara231201Sp'); 

        // Envía el formulario
        await Promise.all([
            page.click('button[type="submit"]'), 
            page.waitForNavigation({ waitUntil: 'networkidle2' }), 
        ]);

        console.log('Inicio de sesión completado.');

        // Extrae la clave del Local Storage
        const apiKey = await page.evaluate(() => {
            return localStorage.getItem('x-auth-token'); 
        });

        console.log('API Key obtenida:', apiKey);

        // Cierra el navegador
        await browser.close();

        // Retorna la clave obtenida
        return apiKey;
    } catch (error) {

        console.error('Error al obtener la API Key del Local Storage:', error);
        return null;

    }
};

// Ejecutar la función
(async () => {
    const apiKey = await getApiKeyFromLocalStorage();
    if (apiKey) {
        console.log('Clave obtenida:', apiKey);
    } else {
        console.log('No se pudo obtener la clave.');
    }
})();
