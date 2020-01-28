import Dexie from 'dexie';

interface IFriend {
    id?: number;
    name?: string;
    age?: number;
}

//
// Declare Database
//
class FriendDatabase extends Dexie {
    friends: Dexie.Table<IFriend,number>;

    constructor() {
        super("FriendsDatabase");
        this.version(1).stores({
            friends: "++id,name,age"
        });
    }
}

var db = new FriendDatabase();
//
// Manipulate and Query Database
//
db.friends.add({name: "Josephine", age: 21}).then(()=>{
    return db.friends.where("age").below(25).toArray();
}).then(youngFriends => {
    alert ("My young friends: " + JSON.stringify(youngFriends));
}).catch(e => {
    alert("error: " + e.stack || e);
});
