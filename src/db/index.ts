import { BindOrReplacements, QueryTypes, Sequelize } from 'sequelize';

import config from '../config';

const { dbHost, dbName, dbPassword, dbPort, dbUser } = config.db;

export const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
  dialect: 'postgres',
  host: dbHost,
  port: parseInt(dbPort, 10),
  logging: false,
  dialectOptions: {
    supportBigNumbers: true,
    bigNumberStrings: true
  },
  omitNull: false,
  native: false,
  define: {
    underscored: false,
    freezeTableName: false,
    charset: 'utf8',
    timestamps: false
  },
  pool: {
    max: 5,
    idle: 30000,
    acquire: 60000
  }
});

export const executeSqlCommand = async function (query: string, bind: BindOrReplacements, oneRecord = false) {
  try {
    const result = await sequelize.query(query, {
      bind,
      type: QueryTypes.SELECT,
      raw: true,
      plain: oneRecord
    });

    return result;
  } catch (ex) {
    throw ex;
  }
};
