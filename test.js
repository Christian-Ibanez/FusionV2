const testRegister = async () => {
    try {
        const response = await fetch('http://localhost:8000/api/auth/registro', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                nombre: 'test4',
                correo: 'test4@test.com',
                contrasena: 'password',
                telefono: '4444',
                nombreInstitucion: ''
            })
        });
        const text = await response.text();
        console.log("Register response:", response.status, text);
    } catch (e) {
        console.error("Register error:", e);
    }
};

const testLogin = async () => {
    try {
        const response = await fetch('http://localhost:8000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                correo: 'test4@test.com',
                contrasena: 'password'
            })
        });
        const text = await response.text();
        console.log("Login response:", response.status, text);
    } catch (e) {
        console.error("Login error:", e);
    }
};

const run = async () => {
    await testRegister();
    await testLogin();
};

run();
