import Dexie from 'dexie';
import dexieRelationships from 'dexie-relationships';
import {resetDatabase, promisedTest} from '../../dexie-unittest-utils';
import {module, asyncTest, start, stop, strictEqual, deepEqual, ok} from 'QUnit';

const assert = ok;

//
// Define DB and schema
//
var db = new Dexie('bands-simple', {addons: [dexieRelationships]});
db.version(1).stores({
    genres: `
            id,
            name`,
    bands: `
            id,
            name,
            genreId -> genres.id`,
    albums: `
            id,
            name,
            bandId -> bands.id,
            year`
});

//
// Populate Database
//
db.on('populate', () => {
    // Genres
    db.genres.bulkAdd([{
        id: 1,
        name: "Rock"
    },{
        id: 2,
        name: "Schlager"
    }])

    // Bands
    db.bands.bulkAdd([{
        id: 1,
        name: 'Beatles',
        genreId: 1
    },{
        id: 2,
        name: 'Abba',
        genreId: 2
    }])

    // Albums
    db.albums.bulkAdd([{
        id: 1,
        name: 'Abbey Road',
        year: 1969,
        bandId: 1
    }, {
        id: 2,
        name: 'Let It Be',
        year: 1970,
        bandId: 1
    }, {
        id: 3,
        name: 'Super Trouper',
        bandId: 2,
        year: 1980
    }, {
        id: 4,
        name: 'Waterloo',
        bandId: 2,
        year: 1974
    }]);
});

//
// Test Module setup script
//
module('dexie-relationships-basics', {
    setup: () => {
        stop();
        resetDatabase(db).catch(e => {
            ok(false, "Error resetting database: " + e.stack);
        }).then(()=>start());
    }
});

//
// Tests goes here...
//

promisedTest ('many-to-one - should be possible to retrieve an entity with a collection of referring entities attached to it', async () => {
    // Query
    const bands = await db.bands.where('name').equals('Beatles').with({
        albums: 'albums'
    });

    // Assertions
    assert(bands.length == 1, "Should be one Beatles");
    let beatles = bands[0]
    assert(!!beatles.albums, "Should have got the foreign albums collection")
    assert(beatles.albums.length === 2, "Should have 2 albums in this db")
    assert(beatles.albums[0].name === "Abbey Road", "First albums should be 'Abbey Roead'")
    assert(beatles.albums[1].name === "Let It Be", "Second album should be 'Let It Be'")
});

promisedTest('one-to-one - should be possible to retrieve entity with a foreign key to expand that foreign key', async () => {
    const albums = await db.albums.where('year').between(1970, 1974, true, true).with ({
        band: 'bandId'
    });

    assert (albums.length === 2, "Should retrieve two albums between 1970 to 1974")
    const [letItBe, waterloo] = albums;

    assert (letItBe.name === "Let It Be", "First album should be 'Let It Be'")
    assert (!!letItBe.band, "Should get the band resolved with the query")
    assert (letItBe.band.name === "Beatles", "The band should be Beatles")

    assert (waterloo.name === "Waterloo", "Second album should be 'Waterloo'")
    assert (!!waterloo.band, "Should get the band resolved with the query")
    assert (waterloo.band.name === "Abba", "The band should be Abba")
});

promisedTest('Multiple foreign keys of different kind - Should be possible to retrieve entities with oneToOne as well as manyToOne relations', async () => {
    const bands = await db.bands.where('name').equals('Beatles').with({
        albums: 'albums',
        genre: 'genreId'
    });
    assert(bands.length == 1, "Should be one Beatles")
    let beatles = bands[0]
    assert(!!beatles.albums, "Should have got the foreign albums collection")
    assert(beatles.albums.length === 2, "Should have 2 albums in this db")
    assert(beatles.albums[0].name === "Abbey Road", "First albums should be 'Abbey Roead'")
    assert(beatles.albums[1].name === "Let It Be", "Second album should be 'Let It Be'")
    assert(!!beatles.genre, "Should have got the foreign genre entity")
    assert(beatles.genre.name === "Rock", "The genre should be 'Rock' (even though that could be questionable)");
});

promisedTest('Navigation properties should be non-enumerable', async () => {
    console.log('should be possible to put back an object to indexedDB after ' +
      'having retrieved it with navigation properties ' +
      'without storing the navigation properties redundantly');
    
    const bands = await db.bands.where('name').equals('Abba').with({albums: 'albums', genre: 'genreId'});

    assert(bands.length === 1, "Should be one Abba");
    let abba = bands[0]
    assert (!!abba.albums, "Abba should have its 'albums' foreign collection")
    assert (!!abba.genre, "Abba should have its 'genre' foreign property")
    abba.customProperty = "Hello world";

    await db.bands.put(abba);

    abba = db.bands.where('name').equals('Abba').first();

    assert(!abba.albums, "Abba should not have the 'albums' foreign collection stored redundantly")
    assert(!abba.genre, "Abba should not have the 'genre' foreign property stored redundantly")
});

promisedTest('Sample from README - should be possible to copy and paste the sample from README', async () => {
    let rows = await db.bands
        .where('name').startsWithAnyOf('A', 'B')
        .with({albums: 'albums', genre: 'genreId'}); // Resolves foreign keys into props

    assert (true, "Promise resolved and no exception occured");

    // Print the result:
    rows.forEach (band => {
        console.log (`Band Name: ${band.name}`)
        console.log (`Genre: ${band.genre.name}`)
        console.log (`Albums: ${JSON.stringify(band.albums, null, 4)}`)
    });
});
