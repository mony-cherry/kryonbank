let usuarioActual = null;

function registrar() {
  let nombre = regUser.value.trim();
  let clave = regPass.value.trim();
  let saldo = Number(regSaldo.value);

  if (!nombre || !clave || saldo < 0) {
    alert("Datos inválidos");
    return;
  }

  let usuarios = obtenerUsuarios();

  if (usuarios.find(u => u.nombre === nombre)) {
    alert("Usuario ya existe");
    return;
  }

  usuarios.push({
    nombre,
    clave,
    saldo,
    movimientos: []
  });

  guardarUsuarios(usuarios);
  alert("Cuenta creada");
  mostrarLogin();
}

function login() {
  let nombre = loginUser.value.trim();
  let clave = loginPass.value.trim();

  let usuarios = obtenerUsuarios();
  let usuario = usuarios.find(u => u.nombre === nombre);

  if (!usuario || usuario.clave !== clave) {
    alert("Datos incorrectos");
    return;
  }

  usuarioActual = usuario;
  mostrarDashboard(usuario);
}

function logout() {
  usuarioActual = null;
  mostrarLogin();
}

function confirmarRetiro() {
  let monto = Number(montoRetiro.value);

  if (monto <= 0 || monto > usuarioActual.saldo) {
    alert("Monto inválido");
    return;
  }

  usuarioActual.saldo -= monto;

  usuarioActual.movimientos.push({
    tipo: "Retiro",
    monto
  });

  actualizarDatos();
  volverDashboard();
}

function confirmarConsignacion() {
  let monto = Number(montoConsignar.value);

  if (monto <= 0) return;

  usuarioActual.saldo += monto;

  usuarioActual.movimientos.push({
    tipo: "Consignación",
    monto
  });

  actualizarDatos();
  volverDashboard();
}

function confirmarTransferencia() {
  let destinoNombre = usuarioDestino.value;
  let monto = Number(montoTransferir.value);

  let usuarios = obtenerUsuarios();
  let destino = usuarios.find(u => u.nombre === destinoNombre);

  if (!destino || monto <= 0 || monto > usuarioActual.saldo) {
    alert("Error en transferencia");
    return;
  }

  usuarioActual.saldo -= monto;
  destino.saldo += monto;

  actualizarDatos();
  guardarUsuarios(usuarios);

  volverDashboard();
}

function actualizarDatos() {
  let usuarios = obtenerUsuarios();
  let index = usuarios.findIndex(u => u.nombre === usuarioActual.nombre);
  usuarios[index] = usuarioActual;
  guardarUsuarios(usuarios);
}

function mostrarMovimientosUI() {
  let cont = document.getElementById("listaMovimientos");
  cont.innerHTML = "";

  usuarioActual.movimientos.forEach(m => {
    let div = document.createElement("div");
    div.innerText = `${m.tipo} - $${m.monto}`;
    cont.appendChild(div);
  });
}