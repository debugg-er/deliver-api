const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const fs = require('fs');
const { pool } = require('./db');
const { createUser, login, createConversations, seedConversations } = require('./function');
const { parseTokens } = require('./util');

async function main() {
    console.log('creating users...');
    const tokens = await createUser(50);
    console.log('create user done !!');

    // let users = JSON.parse(fs.readFileSync('./users.json', 'utf8'))
    //     .slice(0, 2000)
    //     .map((user) => ({ username: user.login.username }));
    // console.log('logging in');
    // const tokens = await login(users);

    const users = parseTokens(tokens);

    const conversations = await createConversations(users);

    await seedConversations(conversations, users);

    pool.end();
    process.exit(0);
}

main().catch((err) => {
    console.log(err);
    process.exit(1);
});
