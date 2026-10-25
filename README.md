# App préstamo

API Express 5 + Knex + MySQL con autenticación JWT en cookie httpOnly.

## Puesta en marcha
1. `cp .env.example .env` y completar los valores (`JWT_SECRET` con 32+ caracteres).
2. Crear la base de datos en MySQL (`DB_NAME`).
3. `npm install`
4. `npm run migrate && npm run seed`
5. `npm run dev` → http://localhost:3000

Usuarios de prueba (seed): `hugo` / `hugo123*` (ADMIN), `paco` / `paco123?` (USUARIO).

## Scripts
`start`, `dev`, `migrate`, `migrate:rollback`, `seed`, `db_reset`.
