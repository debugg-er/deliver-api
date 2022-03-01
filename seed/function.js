const fs = require('fs');
const request = require('request-promise');
const {
    promisePool,
    takeRandomEleInArray,
    randomRange,
    randomDateFrom,
    dateDiff,
} = require('./util');
const { query } = require('./db');

const [, , apiBaseUrl] = process.argv;
const { USER_DEFAULT_PASSWORD } = process.env;
if (!apiBaseUrl) throw new Error('missing argument');

const vietnameseCharacters =
    'ÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ';

const nameRegex = new RegExp(`^(?! )[ a-zA-Z${vietnameseCharacters}]+(?<! )$`);

module.exports.createUser = async function (numUser) {
    let users = JSON.parse(fs.readFileSync('./users.json', 'utf8')).slice(0, numUser);

    const tokens = [];
    while (users.length > 0) {
        const regiss = users.splice(0, 50).map((u) =>
            request
                .post(apiBaseUrl + '/account/register', {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: {
                        username: u.login.username,
                        password: USER_DEFAULT_PASSWORD,
                        firstName: u.name.first,
                        lastName: u.name.last,
                        email: u.email,
                        female: u.gender === 'female' ? '1' : '0',
                    },
                    json: true,
                })
                .then((res) => tokens.push(res.data.token))
                .catch((e) => console.log(e.message)),
        );
        await Promise.all(regiss);
    }

    return tokens;
};

module.exports.login = function (userList) {
    return promisePool(userList, 50, (user) =>
        request
            .post(apiBaseUrl + '/account/login', {
                form: {
                    username: user.username,
                    password: USER_DEFAULT_PASSWORD,
                },
                json: true,
            })
            .then((res) => res.data.token),
    );
};

module.exports.createConversations = function (users) {
    const numOfConv = users.length * 13;
    const nonsense = new Array(numOfConv).fill(0);
    const q = `insert into conversations(type, created_at) values ($1, $2) returning id, type, created_at`;

    return promisePool(nonsense, 50, () => {
        const type = Math.random() < 0.1 ? 'group' : 'personal';
        return query(q, [type, randomDateFrom(365)]).then(({ rows }) => rows[0]);
    });
};

module.exports.seedConversations = async function (conversations, users) {
    const messages = JSON.parse(fs.readFileSync('./messages.json', 'utf8'));
    const q1 = `INSERT INTO participants("user", conversation_id, role) VALUES ($1, $2, $3) RETURNING id`;
    const q2 = `INSERT INTO messages(content, participant_id, created_at) VALUES ($1, $2, $3)`;

    let i = 0;
    for (const cnv of conversations) {
        const usrs =
            cnv.type === 'personal'
                ? takeRandomEleInArray(users, 2)
                : takeRandomEleInArray(users, randomRange(2, 9));

        const participants = [];
        for (let i = 0; i < usrs.length; i++) {
            const role = cnv.type == 'group' ? (i == 0 ? 'admin' : 'member') : null;
            const { rows } = await query(q1, [usrs[i].username, cnv.id, role]);
            participants.push(...rows);
        }

        for (const ptcp of participants) {
            const msgs = takeRandomEleInArray(messages, randomRange(0, 500 / participants.length));
            await promisePool(msgs, 50, (msg) => {
                const createdAt = randomDateFrom(dateDiff(cnv.created_at, new Date()));
                return query(q2, [msg, ptcp.id, createdAt]);
                // return Promise.resolve();
            });
        }
        console.log(`${++i}/${conversations.length}`);
    }
};
