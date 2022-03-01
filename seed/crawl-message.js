const fs = require('fs');
const request = require('request-promise');

const GOOGLE_API_KEY = 'AIzaSyDsjNTYmvYcFkQ6uEhoYY47bCNzBgqyZE4';
const id = 'YbJOTdZBX1g';

async function main() {
    let pageToken = '';
    const items = [];

    do {
        try {
            const gRes = await request.get(
                `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet,replies&maxResults=100&videoId=${id}&pageToken=${pageToken}&key=${GOOGLE_API_KEY}`,
                { json: true },
            );
            pageToken = gRes.nextPageToken;
            items.push(...gRes.items);
        } catch (err) {
            console.log(err.response);
            return;
        }
    } while (pageToken && items.length < 3000);

    fs.writeFileSync(
        './messages.json',
        JSON.stringify(items.map((item) => item.snippet.topLevelComment.snippet.textOriginal)),
    );
}
main();
