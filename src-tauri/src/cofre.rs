//! Encrypted local vault: SQLCipher v4 file keyed by scrypt(password, salt).
//! Same format and parameters as ADR 0001, so a file from the Node spike opens here.

use rand::{rngs::OsRng, RngCore};
use rusqlite::Connection;
use serde::Serialize;
use std::fs;
use std::path::PathBuf;
use zeroize::Zeroizing;

pub const MIN_CARACTERES: usize = 12;
const IDLE_MS: u64 = 30 * 60 * 1000;
const JANELA_MS: u64 = 15 * 60 * 1000;
const MAX_ERROS: usize = 5;
const MIGRACOES: &[&str] = &[include_str!("../migrations/0001_init.sql")];

#[derive(Debug, Serialize, PartialEq, Eq)]
#[serde(rename_all = "kebab-case")]
pub enum Erro {
    SenhaFraca,
    JaConfigurado,
    NaoConfigurado,
    SenhaIncorreta,
    MuitasTentativas,
    Interno(String),
}

impl From<rusqlite::Error> for Erro {
    fn from(e: rusqlite::Error) -> Self {
        Erro::Interno(e.to_string())
    }
}
impl From<std::io::Error> for Erro {
    fn from(e: std::io::Error) -> Self {
        Erro::Interno(e.to_string())
    }
}

#[derive(Debug, Serialize, PartialEq, Eq)]
pub struct Status {
    pub configurado: bool,
    pub desbloqueado: bool,
    pub autenticado: bool,
}

/// log2(N), r, p — N = 2^17, r = 8, p = 1 (ADR 0001)
#[derive(Clone, Copy)]
pub struct Kdf(pub u8, pub u32, pub u32);
pub const KDF_PADRAO: Kdf = Kdf(17, 8, 1);

pub struct Cofre {
    dir: PathBuf,
    kdf: Kdf,
    conn: Option<Connection>,
    ultimo_uso: u64,
    erros: Vec<u64>,
    seguidos: u32,
}

impl Cofre {
    pub fn new(dir: PathBuf, kdf: Kdf) -> Self {
        Self { dir, kdf, conn: None, ultimo_uso: 0, erros: Vec::new(), seguidos: 0 }
    }

    fn db_path(&self) -> PathBuf {
        self.dir.join("solis.db")
    }
    fn kdf_path(&self) -> PathBuf {
        self.dir.join("solis.kdf.json")
    }

    pub fn status(&mut self, agora: u64) -> Status {
        self.expirar(agora);
        let aberto = self.conn.is_some();
        Status { configurado: self.db_path().exists(), desbloqueado: aberto, autenticado: aberto }
    }

    /// Locks after 30 min without activity: the key leaves memory with the connection.
    fn expirar(&mut self, agora: u64) {
        if self.conn.is_some() && agora.saturating_sub(self.ultimo_uso) > IDLE_MS {
            self.conn = None;
        }
    }

    pub fn tocar(&mut self, agora: u64) {
        self.expirar(agora);
        if self.conn.is_some() {
            self.ultimo_uso = agora;
        }
    }

    pub fn criar(&mut self, senha: &str, agora: u64) -> Result<(), Erro> {
        if self.db_path().exists() {
            return Err(Erro::JaConfigurado);
        }
        // zxcvbn runs in the UI; here only the hard floor
        if senha.chars().count() < MIN_CARACTERES {
            return Err(Erro::SenhaFraca);
        }
        fs::create_dir_all(&self.dir)?;
        let chave = self.derivar(senha)?;
        self.conn = Some(abrir(&self.db_path(), &chave)?);
        self.ultimo_uso = agora;
        Ok(())
    }

    /// Returns how long the caller should wait before answering (1 s per consecutive error).
    pub fn entrar(&mut self, senha: &str, agora: u64) -> (Result<(), Erro>, u64) {
        if !self.db_path().exists() {
            return (Err(Erro::NaoConfigurado), 0);
        }
        self.erros.retain(|t| agora.saturating_sub(*t) < JANELA_MS);
        if self.erros.len() >= MAX_ERROS {
            return (Err(Erro::MuitasTentativas), 0);
        }
        let aberto = self.derivar(senha).and_then(|c| abrir(&self.db_path(), &c));
        match aberto {
            Ok(conn) => {
                self.conn = Some(conn);
                self.ultimo_uso = agora;
                self.seguidos = 0;
                (Ok(()), 0)
            }
            Err(Erro::SenhaIncorreta) => {
                self.erros.push(agora);
                self.seguidos += 1;
                (Err(Erro::SenhaIncorreta), 1000 * u64::from(self.seguidos))
            }
            Err(e) => (Err(e), 0),
        }
    }

    pub fn sair(&mut self) {
        self.conn = None;
    }

    #[cfg(test)]
    pub fn conn(&self) -> Option<&Connection> {
        self.conn.as_ref()
    }

    fn derivar(&self, senha: &str) -> Result<Zeroizing<[u8; 32]>, Erro> {
        let sal = self.sal()?;
        let params = scrypt::Params::new(self.kdf.0, self.kdf.1, self.kdf.2, 32)
            .map_err(|e| Erro::Interno(e.to_string()))?;
        let mut chave = Zeroizing::new([0u8; 32]);
        scrypt::scrypt(senha.as_bytes(), &sal, &params, chave.as_mut())
            .map_err(|e| Erro::Interno(e.to_string()))?;
        Ok(chave)
    }

    fn sal(&self) -> Result<Vec<u8>, Erro> {
        let caminho = self.kdf_path();
        if let Ok(texto) = fs::read_to_string(&caminho) {
            let v: serde_json::Value =
                serde_json::from_str(&texto).map_err(|e| Erro::Interno(e.to_string()))?;
            let hex_sal = v["salt"].as_str().ok_or(Erro::Interno("salt ausente".into()))?;
            return hex::decode(hex_sal).map_err(|e| Erro::Interno(e.to_string()));
        }
        let mut sal = vec![0u8; 32];
        OsRng.fill_bytes(&mut sal);
        fs::write(&caminho, serde_json::json!({ "salt": hex::encode(&sal) }).to_string())?;
        Ok(sal)
    }
}

fn abrir(caminho: &PathBuf, chave: &[u8; 32]) -> Result<Connection, Erro> {
    let conn = Connection::open(caminho)?;
    // x'..' = raw key, so SQLCipher skips its own PBKDF2 (scrypt already ran)
    let hex_chave = Zeroizing::new(hex::encode(chave));
    conn.execute_batch(&format!("PRAGMA key = \"x'{}'\";", hex_chave.as_str()))?;
    // First real read fails with NOTADB on a wrong key
    let versao: usize = match conn.query_row("PRAGMA user_version", [], |r| r.get(0)) {
        Ok(v) => v,
        Err(rusqlite::Error::SqliteFailure(e, _)) if e.code == rusqlite::ErrorCode::NotADatabase => {
            return Err(Erro::SenhaIncorreta)
        }
        Err(e) => return Err(e.into()),
    };
    for (i, sql) in MIGRACOES.iter().enumerate().skip(versao) {
        conn.execute_batch(sql)?;
        conn.pragma_update(None, "user_version", i + 1)?;
    }
    Ok(conn)
}

#[cfg(test)]
mod testes {
    use super::*;

    const SENHA: &str = "Cavalo-Bateria-Grampo-42";
    const RAPIDO: Kdf = Kdf(10, 8, 1);

    fn novo() -> (tempfile::TempDir, Cofre) {
        let dir = tempfile::tempdir().unwrap();
        let c = Cofre::new(dir.path().to_path_buf(), RAPIDO);
        (dir, c)
    }

    #[test]
    fn comeca_nao_configurado() {
        let (_d, mut c) = novo();
        assert_eq!(c.status(0), Status { configurado: false, desbloqueado: false, autenticado: false });
    }

    #[test]
    fn recusa_senha_curta() {
        let (_d, mut c) = novo();
        assert_eq!(c.criar("curta", 0), Err(Erro::SenhaFraca));
    }

    #[test]
    fn chave_certa_abre_e_persiste() {
        let (d, mut c) = novo();
        c.criar(SENHA, 0).unwrap();
        c.conn().unwrap().execute("INSERT INTO setting VALUES ('k','v',0)", []).unwrap();
        c.sair();
        let mut c2 = Cofre::new(d.path().to_path_buf(), RAPIDO);
        assert!(c2.entrar(SENHA, 0).0.is_ok());
        let v: String =
            c2.conn().unwrap().query_row("SELECT value FROM setting", [], |r| r.get(0)).unwrap();
        assert_eq!(v, "v");
    }

    #[test]
    fn chave_errada_falha_e_atraso_cresce() {
        let (_d, mut c) = novo();
        c.criar(SENHA, 0).unwrap();
        c.sair();
        assert_eq!(c.entrar("outra-senha-qualquer", 0), (Err(Erro::SenhaIncorreta), 1000));
        assert_eq!(c.entrar("outra-senha-qualquer", 0), (Err(Erro::SenhaIncorreta), 2000));
    }

    #[test]
    fn arquivo_nao_e_sqlite_legivel() {
        let (d, mut c) = novo();
        c.criar(SENHA, 0).unwrap();
        c.sair();
        let cabecalho = fs::read(d.path().join("solis.db")).unwrap();
        assert_ne!(&cabecalho[..15], b"SQLite format 3");
    }

    #[test]
    fn sexta_tentativa_bloqueada_ate_15_min() {
        let (_d, mut c) = novo();
        c.criar(SENHA, 0).unwrap();
        c.sair();
        for _ in 0..5 {
            assert_eq!(c.entrar("errada-errada-errada", 0).0, Err(Erro::SenhaIncorreta));
        }
        assert_eq!(c.entrar(SENHA, 0).0, Err(Erro::MuitasTentativas));
        assert!(c.entrar(SENHA, JANELA_MS + 1).0.is_ok());
    }

    #[test]
    fn bloqueia_apos_30_min_parado() {
        let (_d, mut c) = novo();
        c.criar(SENHA, 0).unwrap();
        c.tocar(IDLE_MS);
        assert!(c.status(IDLE_MS + 1).autenticado);
        assert!(!c.status(2 * IDLE_MS + 2).autenticado);
    }

    #[test]
    fn nao_recria_cofre_existente() {
        let (_d, mut c) = novo();
        c.criar(SENHA, 0).unwrap();
        assert_eq!(c.criar(SENHA, 0), Err(Erro::JaConfigurado));
    }
}
