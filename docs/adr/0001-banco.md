# ADR 0001: banco SQLite cifrado com Drizzle

- Situação: **proposto** (aguarda aprovação do desenvolvedor)
- Data: 13/11/2026

## Contexto
Os dados do Solis ficam só no computador do usuário e precisam estar cifrados em repouso (PRD, SEC). Queremos um ORM tipado sem compilar código nativo no Windows nem no CI.

## Decisão
- **Driver:** `better-sqlite3-multiple-ciphers` 13.x, instalado com o alias `better-sqlite3@npm:better-sqlite3-multiple-ciphers`. O alias é necessário porque o driver do Drizzle importa `better-sqlite3` pelo nome. O pacote traz binários prontos para Windows e Linux (sem compilação).
- **Cifra:** `cipher='sqlcipher'`, `legacy=4` (formato SQLCipher v4). Chave bruta de 32 bytes passada como `x'…'`, derivada por `scrypt` (N = 2^17, r = 8, p = 1) com sal em `data/solis.kdf.json`. Assim o SQLCipher não roda o próprio PBKDF2 em cima.
- **ORM:** Drizzle ORM 0.45 (`drizzle-orm/better-sqlite3`).
- **Migrações:** arquivos `.sql` numerados em `src/server/db/migrations`, controlados por `PRAGMA user_version`. Não usamos o `drizzle-kit migrate` em produção: ele exige um arquivo de journal e não sabe abrir o banco cifrado.

## Verificação (tests/db.test.ts)
- Chave certa abre e lê o que foi gravado.
- Chave errada lança erro ao abrir.
- Os primeiros bytes do arquivo não são `SQLite format 3`.

## Consequências
- O plano B (SQL puro) não foi necessário.
- Trocar a senha exige `PRAGMA rekey` (etapa 10).
- Esquecer a senha torna os dados irrecuperáveis; a tela de criação avisa isso.
