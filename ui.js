function mostrarLogin() {
  document.getElementById("login-screen").classList.remove("hidden");
  document.getElementById("register-screen").classList.add("hidden");
  document.getElementById("dashboard").classList.add("hidden");
}

function mostrarRegistro() {
  document.getElementById("login-screen").classList.add("hidden");
  document.getElementById("register-screen").classList.remove("hidden");
}

function mostrarDashboard(usuario) {
  document.getElementById("login-screen").classList.add("hidden");
  document.getElementById("register-screen").classList.add("hidden");
  document.getElementById("dashboard").classList.remove("hidden");

  document.getElementById("saldo").innerText = usuario.saldo;
}

function ocultarTodo() {
  document.querySelectorAll(".card").forEach(el => el.classList.add("hidden"));
}

function volverDashboard() {
  ocultarTodo();
  document.getElementById("dashboard").classList.remove("hidden");
}

function irRetirar() {
  ocultarTodo();
  document.getElementById("retirar-screen").classList.remove("hidden");
}

function irConsignar() {
  ocultarTodo();
  document.getElementById("consignar-screen").classList.remove("hidden");
}

function irTransferir() {
  ocultarTodo();
  document.getElementById("transferir-screen").classList.remove("hidden");
}

function irMovimientos() {
  ocultarTodo();
  document.getElementById("movimientos-screen").classList.remove("hidden");
  mostrarMovimientosUI();
}