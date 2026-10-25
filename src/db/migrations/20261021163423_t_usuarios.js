/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  await knex.schema.createTable("usuarios", (t) => {
    t.increments('id')
    t.integer('idpersona').unsigned().notNullable().references('id').inTable('personas').onDelete('RESTRICT')
    t.string('nombre_usuario', 50).notNullable().unique()
    t.string('clave_acceso', 255).notNullable()
    t.enum('nivel_acceso', ['ADMIN', 'USUARIO']).notNullable().defaultTo('USUARIO')
    t.boolean('estado').notNullable().defaultTo(true)
    t.timestamps(true, true)
  })
};

//unsigned    : entero sin signo, es decir, mayor 0
//onDelete    : compartamiento cuando se trate de eliminar

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  await knex.schema.dropTableIfExists('usuarios')
};
