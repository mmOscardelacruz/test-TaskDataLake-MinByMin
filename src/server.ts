// import { executeSqlCommand } from './db';

const main = async () => {
  try {
    const query = `select alertsapeedrelenti_get();`;

    // const result = await executeSqlCommand(query, [], false);

    // return result;

    console.log(query);
  } catch (error) {
    console.error(error);
    throw error;
  }
};

main();
