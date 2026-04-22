let usuarioActual = null;
let saldoVisible = true;

// CAMBIAR PANTALLA
function cambiar(id){
    document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"));
    document.getElementById(id).classList.add("active");
}

function mostrarRegistro(){ cambiar("registro"); }
function mostrarLogin(){ cambiar("login"); }

// STORAGE
function getUsers(){
    let data = localStorage.getItem("usuarios");
    return data ? JSON.parse(data) : [];
}

function saveUsers(users){
    localStorage.setItem("usuarios", JSON.stringify(users));
}

function actualizarUsuario(){
    let users = getUsers();

    let index = users.findIndex(u => u.nombre === usuarioActual.nombre);

    if(index !== -1){
        users[index] = usuarioActual;
        saveUsers(users);
    } else {
        console.log("Error: usuario no encontrado");
    }
}

// VALIDAR PIN
function validarPin(pin){
    return /^[0-9]{4}$/.test(pin);
}

// MENSAJES
function msg(texto){
    if (document.getElementById("login").classList.contains("active")) {
        document.getElementById("msgLogin").innerText = texto;
    } 
    else if (document.getElementById("registro").classList.contains("active")) {
        document.getElementById("msgRegistro").innerText = texto;
    } 
    else {
        document.getElementById("pantalla").innerHTML = texto;
    }
}

// REGISTRO
function registrar(){
    let users = getUsers();

    let n = regNombre.value;
    let c = regClave.value;
    let s = parseFloat(regSaldo.value);

    if(!n || !c || isNaN(s)) return msg("Complete todo");
    if(!validarPin(c)) return msg("PIN debe tener 4 números");

    let existe = users.find(u => u.nombre === n);
    if(existe) return msg("Usuario ya existe");

    let nuevo = {
        nombre: n,
        clave: c,
        saldo: s,
        intentos: 0,
        bloqueado: false,
        movimientos: []
    };

    users.push(nuevo);
    saveUsers(users);

    cambiar("login");
    document.getElementById("msgLogin").innerText = "Usuario creado";
}

// LOGIN
function login(){
    let users = getUsers();

    let n = loginNombre.value;
    let c = loginClave.value;

    let u = users.find(user => user.nombre === n);

    if(!u) return msg("Usuario no existe");
    if(u.bloqueado) return msg("Cuenta bloqueada");

    if(c === u.clave){
        usuarioActual = u;
        u.intentos = 0;
        saveUsers(users);

        saludo.innerText = "Hola, " + 
        usuarioActual.nombre.charAt(0).toUpperCase() + 
        usuarioActual.nombre.slice(1);
        actualizarSaldo();
        cambiar("app");
    } else {
        u.intentos++;
        if(u.intentos >= 3){
            u.bloqueado = true;
            msg("Cuenta bloqueada");
        } else {
            msg("Intentos restantes: " + (3 - u.intentos));
        }
        saveUsers(users);
    }
}

// SALDO
function actualizarSaldo(){
    saldo.innerText = saldoVisible ? "$"+usuarioActual.saldo : "$***";
}

function toggleSaldo(){
    saldoVisible = !saldoVisible;
    actualizarSaldo();
}

// INPUT DINÁMICO
function mostrarInput(tipo){
    let box = document.getElementById("operacionBox");

    box.classList.remove("hidden");

    if(tipo === "consignar"){
        box.innerHTML = `
            <input id="monto" type="number" placeholder="Monto">
            <button onclick="consignar()">Confirmar consignación</button>
        `;
    }

    else if(tipo === "retirar"){
        box.innerHTML = `
            <input id="monto" type="number" placeholder="Monto">
            <button onclick="retirar()">Confirmar retiro</button>
        `;
    }

    else if(tipo === "transferir"){
        box.innerHTML = `
            <input id="destino" placeholder="Usuario destino">
            <input id="monto" type="number" placeholder="Monto">
            <button onclick="transferir()">Confirmar transferencia</button>
        `;
    }
}

function showToast(mensaje, tipo = "default") {
    let toast = document.getElementById("toast");

    toast.innerText = mensaje;

    // reset base
    toast.style.background = "rgba(10,15,35,0.95)";
    toast.style.color = "white";
    toast.style.border = "1px solid gold";

    // estilos dinámicos
    if(tipo === "error"){
        toast.style.background = "#2a0000";
        toast.style.color = "#ff4d4d";
        toast.style.border = "1px solid #ff4d4d";
    }

    if(tipo === "success"){
        toast.style.background = "#002a1a";
        toast.style.color = "#00ff99";
        toast.style.border = "1px solid #00ff99";
    }

    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 2500);
}

// CONSIGNAR
function consignar(){
    let m = parseFloat(monto.value);
    if(isNaN(m)||m<=0) return showToast("Monto inválido", "error");

    usuarioActual.saldo += m;

    usuarioActual.movimientos.push({
        tipo:"Consignación",
        monto:m,
        fecha:new Date().toLocaleString(),
        saldo:usuarioActual.saldo
    });

    actualizarUsuario();
    actualizarSaldo();
    showToast("Consignación exitosa", "success");
    document.getElementById("operacionBox").classList.add("hidden");
}

// RETIRAR
function retirar(){
    let m = parseFloat(monto.value);
    if(isNaN(m)||m<=0) return showToast("Monto inválido", "error");
    if(m>usuarioActual.saldo) return showToast("Fondos insuficientes", "error");

    usuarioActual.saldo -= m;

    usuarioActual.movimientos.push({
        tipo:"Retiro",
        monto:m,
        fecha:new Date().toLocaleString(),
        saldo:usuarioActual.saldo
    });

    actualizarUsuario();
    actualizarSaldo();
    showToast("Retiro exitoso", "success");
    document.getElementById("operacionBox").classList.add("hidden");
}

function transferir(){
    let users = getUsers();

    let destinoNombre = document.getElementById("destino").value;
    let monto = parseFloat(document.getElementById("monto").value);

    if(!destinoNombre || isNaN(monto) || monto <= 0){
        return msg("Datos inválidos");
    }

    if(destinoNombre === usuarioActual.nombre){
        return msg("No puedes transferirte a ti mismo");
    }

    let destino = users.find(u => u.nombre === destinoNombre);

    if(!destino){
        return msg("Usuario destino no existe");
    }

    if(monto > usuarioActual.saldo){
        return msg("Fondos insuficientes");
    }

    // RESTAR
    usuarioActual.saldo -= monto;

    usuarioActual.movimientos.push({
        tipo: "Transferencia enviada",
        monto: monto,
        fecha: new Date().toLocaleString(),
        saldo: usuarioActual.saldo
    });

    // SUMAR
    destino.saldo += monto;

    destino.movimientos.push({
        tipo: "Transferencia recibida",
        monto: monto,
        fecha: new Date().toLocaleString(),
        saldo: destino.saldo
    });

    saveUsers(users);

    actualizarSaldo();
    showToast("Transferencia exitosa", "success");
    document.getElementById("operacionBox").classList.add("hidden");
}

// MOVIMIENTOS
function verMovimientos(){
    if(usuarioActual.movimientos.length===0)
        return msg("Sin movimientos");

    let html = `<table class="tabla">
    <tr><th>Fecha</th><th>Tipo</th><th>Monto</th><th>Saldo</th></tr>`;

    usuarioActual.movimientos.reverse().forEach(m => {
        html+=`<tr>
        <td>${m.fecha}</td>
        <td>${m.tipo}</td>
        <td>$${m.monto}</td>
        <td>$${m.saldo}</td>
        </tr>`;
    });

    html+="</table>";
    pantalla.innerHTML = html;
}

// SALIR
function cerrarSesion(){
    location.reload();
}


