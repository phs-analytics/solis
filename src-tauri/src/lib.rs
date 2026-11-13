mod cofre;

use cofre::{Cofre, Erro, Status, KDF_PADRAO};
use std::sync::Mutex;
use std::time::{Duration, SystemTime, UNIX_EPOCH};
use tauri::{Manager, State};

struct Estado(Mutex<Cofre>);

fn agora() -> u64 {
    SystemTime::now().duration_since(UNIX_EPOCH).map(|d| d.as_millis() as u64).unwrap_or(0)
}

fn travar(e: &State<'_, Estado>) -> std::sync::MutexGuard<'_, Cofre> {
    // a panic while holding the lock leaves Cofre consistent (fields are plain values)
    e.0.lock().unwrap_or_else(|p| p.into_inner())
}

#[tauri::command]
fn status(estado: State<'_, Estado>) -> Status {
    travar(&estado).status(agora())
}

#[tauri::command]
fn tocar(estado: State<'_, Estado>) {
    travar(&estado).tocar(agora());
}

// async: scrypt takes ~1 s and must not freeze the window
#[tauri::command]
async fn criar_senha(senha: String, estado: State<'_, Estado>) -> Result<(), Erro> {
    travar(&estado).criar(&senha, agora())
}

#[tauri::command]
async fn entrar(senha: String, estado: State<'_, Estado>) -> Result<(), Erro> {
    let (resultado, espera_ms) = travar(&estado).entrar(&senha, agora());
    std::thread::sleep(Duration::from_millis(espera_ms));
    resultado
}

#[tauri::command]
fn sair(estado: State<'_, Estado>) {
    travar(&estado).sair();
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            let dir = app.path().app_data_dir()?;
            app.manage(Estado(Mutex::new(Cofre::new(dir, KDF_PADRAO))));
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![status, tocar, criar_senha, entrar, sair])
        .run(tauri::generate_context!())
        .expect("falha ao iniciar o Solis");
}
