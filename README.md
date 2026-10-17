# Solis V1

Versão simples do Solis: os dados e o servidor ficam no seu computador, e você acessa pelo navegador do computador e do celular (inclusive fora de casa, por uma rede privada).

Documentação em [`docs/`](docs/). Como montar o seu: [`docs/TUTORIAL.md`](docs/TUTORIAL.md).

Estrutura:

| Pasta | Conteúdo |
|---|---|
| `docs/` | PRD, PI, DS, Segurança, Tutorial e decisões (ADR) |
| `config/` | Configurações de exemplo (as reais ficam fora do Git) |
| `src/domain/` | Regras de negócio puras |
| `src/server/` | Servidor local |
| `src/web/` | Interface no navegador |
| `tests/` | Testes (unidade, integração, ponta a ponta, dados sintéticos) |
| `scripts/` | Iniciar, backup, preparar ambiente |
| `data/` | Banco local (fora do Git) |
| `backups/` | Cópias do banco (fora do Git) |
