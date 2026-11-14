# ADR 0002: app Tauri 2 para Android, Windows e Linux

- Situação: **aceito** pelo desenvolvedor em 13/11/2026 (escolha da plataforma). O spike de build ainda não rodou: as ferramentas (Rust, Build Tools, Android SDK/NDK) serão instaladas pelo desenvolvedor.
- Data: 13/11/2026

## Contexto
O Solis precisa rodar como app no celular Android (APK instalado à mão, sem Play Store) e como programa no Windows e no Linux. Cada aparelho guarda os dados localmente e sincroniza uma vez por dia com um servidor do próprio usuário. As etapas 2 e 3 já tinham interface e regras em React/TypeScript.

## Opções
| Opção | Prós | Contras |
|---|---|---|
| **Tauri 2 + React/TS** | Uma base para os três sistemas; reaproveita telas, domínio, tokens e testes; apps de ~10 MB | Núcleo nativo em Rust; Android exige SDK/NDK |
| Flutter | Ótimo no Android | Reescrever tudo em Dart |
| Kotlin Multiplatform + Compose | Nativo no Android | Reescrever tudo; desktop menos maduro |
| Electron + Capacitor | Só JS | Dois projetos; Electron pesado (>100 MB, mais RAM) |

## Decisão
- **Tauri 2** com a interface React existente (`src/web`) e um núcleo Rust fino em `src-tauri`.
- **Cofre local** em Rust (`src-tauri/src/cofre.rs`): `rusqlite` com SQLCipher embutido (`bundled-sqlcipher-vendored-openssl`, sem bibliotecas do sistema), chave bruta de 32 bytes por `scrypt` (N = 2^17, r = 8, p = 1), sal em `solis.kdf.json` na pasta de dados do app. Mesmo formato do ADR 0001.
- **Regras de acesso** no núcleo: mínimo de 12 caracteres (o medidor zxcvbn fica na interface), 5 erros em 15 min, atraso de 1 s por erro seguido, bloqueio após 30 min sem uso (a chave sai da memória junto com a conexão).
- **Comandos** expostos à interface: `status`, `criar_senha`, `entrar`, `sair`, `tocar`. Erros chegam como códigos (`senha-incorreta`, `muitas-tentativas`…).
- **CSP** no `tauri.conf.json`, igual à do SEC-05, com `connect-src` só para o IPC do Tauri.
- **Distribuição**: `.exe` (NSIS), `.deb` e AppImage, APK. Linux é gerado no GitHub Actions.

## Verificação
- `cargo test` (8 testes do cofre: chave certa/errada, arquivo ilegível, bloqueio na 6ª tentativa, inatividade). Roda no CI (Linux) desde já.
- E2e da interface com o IPC do Tauri simulado (`tests/e2e/ipc-falso.ts`).
- **Pendente (spike):** `pnpm app:dev` no Windows; `tauri android build --apk --debug` instalado no celular; conferir que o OpenSSL embutido compila no Windows/MSVC e no NDK.

## Consequências
- O servidor Node das etapas 2 (`src/server`) deixa de abrir o banco do usuário; vira o servidor de sincronização na etapa 4.
- O acesso ao "PC ligado pelo Tailscale" (antiga etapa 4) sai; o Tailscale passa a ligar os apps ao servidor.
- A chave de assinatura do APK precisa ser guardada fora do Git; perdê-la impede atualizar o app por cima.
