const puppeteer = require('puppeteer');

(async () => {
    try {
        // Inicia el navegador en modo visible con acciones ralentizadas
        const browser = await puppeteer.launch({
            headless: false, // Navegador visible
            slowMo: 100, // Ralentiza cada acción 100ms
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        // Crea una nueva página y establece un tamaño de ventana adecuado
        const page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 800 });

        // Navega a la página de inicio de sesión
        const loginUrl = 'https://uisp.elpoderdeinternet.mx/nms/login';
        console.log('Navegando a la página de inicio de sesión...');
        await page.goto(loginUrl, { waitUntil: 'networkidle2' });
        console.log('Página de inicio de sesión cargada.');

        // Captura una pantalla al llegar a la página
        await page.screenshot({ path: 'step1-login-page.png' });

        // Ingresa el usuario
        console.log('Buscando el campo de usuario...');
        await page.waitForSelector('#username');
        console.log('Campo de usuario encontrado. Ingresando usuario...');
        await page.type('#username', 'jesus.lara@elpoderdeinternet.mx');

        // Captura una pantalla después de ingresar el usuario
        await page.screenshot({ path: 'step2-username-filled.png' });

        // Ingresa la contraseña
        console.log('Buscando el campo de contraseña...');
        await page.waitForSelector('#password');
        console.log('Campo de contraseña encontrado. Ingresando contraseña...');
        await page.type('#password', 'Lara231201Sp');

        // Captura una pantalla después de ingresar la contraseña
        await page.screenshot({ path: 'step3-password-filled.png' });

        // Envía el formulario de inicio de sesión
        console.log('Enviando el formulario de inicio de sesión...');
        await Promise.all([
            page.click('button[type="submit"]'), // Reemplaza con el selector de tu botón
            page.waitForNavigation({ waitUntil: 'networkidle2' })
        ]);
        console.log('Inicio de sesión completado.');

        // Captura una pantalla después del inicio de sesión
        await page.screenshot({ path: 'step4-logged-in.png' });

        // Extrae la clave del Local Storage
        console.log('Extrayendo clave del Local Storage...');
        const apiKey = await page.evaluate(() => {
            return localStorage.getItem('apiKey'); // Cambia 'apiKey' por tu clave específica
        });

        if (apiKey) {
            console.log('Clave API extraída con éxito:', apiKey);
        } else {
            console.error('No se encontró la clave especificada en el Local Storage.');
        }

        // Cierra el navegador
        console.log('Cerrando el navegador...');
        await browser.close();
    } catch (error) {
        console.error('Ocurrió un error durante el proceso:', error);
    }
})();
