/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  await knex.schema.createTable("personas", (t) => {
    t.increments('id')
    t.string('apellidos', 100).notNullable()
    t.string('nombres', 100).notNullable()
    t.string('telefono', 9)
    t.string('email', 120).notNullable()
    t.string('direccion', 150)
    t.timestamps(true, true)
  })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  await knex.schema.dropTableIfExists("personas")
};
