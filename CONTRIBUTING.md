# Como contribuir

O Solis é um projeto pessoal, mas sugestões e correções são bem-vindas.

1. Siga o [`docs/TUTORIAL.md`](docs/TUTORIAL.md), partes 1 e 2, para preparar o ambiente (inclui o gitleaks).
2. Crie uma branch a partir da `main`.
3. Antes de abrir o Pull Request, rode:
   ```bash
   pnpm lint && pnpm typecheck && pnpm test
   ```
4. Toda regra nova vem com teste.
5. **Nunca** inclua dados reais: valores, extratos, prints, e-mails, IDs da Pluggy ou o endereço `*.ts.net`. Use só dados sintéticos (`tests/fixtures/`).

Problemas de segurança: veja o [`SECURITY.md`](SECURITY.md).
