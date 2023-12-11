
    /** TODO:
     * 1. Convert these unsynced changes into sync mutations by resolving values from ordinaryTables.
     * 2. Append a convertion of mutReqs[table].muts into sync mutations.
     * 3. Send all this using fetch
     * 4. if successful response, delete muts from mutTables by
     *    1. a new rw-transaction where we start by finding revs above those we generated.
     *    2. for tables where none such found, clear the table. if some of those found, deleteRange on the table.
     * 
     * Tankar att följa upp:
     *  * Varje DOM environmnet får en MutationSyncer
     *  * Håller koll på huruvida den tror att en sync redan pågår eller inte.
     *  * Bro
     * 
     * Leader election
     *  * IDB persisted value: leaderId
     *  * Varje browsing-env får en nodeId (random string).
     *  * db.open: Kolla om det finns en leader. Om inte, sätt dig själv som leader.
     *  * Leaders: Ha sync consumer uppe.
     *  * Service worker: Ta ledarskap. Spara även en prop som säger att detta är service worker (för att workaround BroadCastChannel props)
     *  * Om det finns en non-service worker ledare, försök kontakta den (via BroadCastChannel)
     *  * Om ledaren inte svarar inom 1 sekund, ta ledarskap.
     *  * Ledare: Lyssna på ändring av ledarskap och sluta vara ledare i så fall.
     *  * Följare: Lyssna på ändring av ledarskap så att du alltid kontaktar rätt ledare.
     *  * När man postar något till non-SW ledaren så ska den ACKa inom 1 sek. Annars, ta ledarskapet.
     * 
     * 
     * Enklare:
     *  * Vi har en som leker service worker per window. Två aktiva flikar:
     *     * Båda vaknar upp och låser tabellen X för skrivning, om ingen annan tagit jobbet, skriver timestamp till X och
     *       börjar sedan synka. Under tiden för sync, uppdaterar den timestamp kontinuerligt för att signallera att den
     *       jobbar. När klar, clearar ut timestampen och avslutar jobbet.
     *       - Om det inte fanns nåt att göra så clearas timestamp ut och man schedulerar inget mer uppvaknande.
     *     * Den som kom sist ser att annan tagit jobbet inom rimlig timestamp och väljer då att polla igen ifall timestampet
     *       skulle timat ut.
     *     * Om jobbaren verkar tajma ut: gör nytt försök från början. Kan leda till att du blir ledare denna gång.
     *     * Om jobbaren clearar ut timestampen pga avslutat jobb så kan väntaren ädnå för säkerhets-skull göra om'et från början.
     * 
     * 
     */
