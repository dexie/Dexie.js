# Push

## Service Worker

Om { serviceWorker: true } så används denna strategi:

- DOM-noderna gör bara SyncMiddleware (logga mutations). Inget annat.
- Service workern lyssnar på ändringar i mutations-tabellerna och ändring i online läge.
- När den triggas så kollar den om den verkligen har alla state som krävs för att pusha:
  - Inte redan håller på att pusha
  - Är online
  - Har något att synca
- Ingen persisted låsning för att tala om att vi tar jobbet. Vi bara gör det.
- Listar alla mutations
- Resolvar värden
- reducerar till slutligt resultat
- skickar till servern med fetch.
- När klar så raderar den alla mutations som den fått synkat till servern alternativt uppdaterar en pekare.

## Utan service worker

- Samma start som med service worker, men det är samtliga windows som startar sin egen pushWorker.
- Kontrollerar också att den är visible innan den sätter igång.
- Innan den sätter igång låser den IDB object "sync" och kollar om nån annan tagit jobbet.
  Om inte så skriver den att den gör det och en tidsstämpel.
  Medans den håller på så uppdaterar den tidsstämpeln periodiskt så länge jobber håller på.
  Men om nån annan tagit över så släpper den det hela. Kan slutföra jobbet dock - gör inget.
  När klar så raderar den alla mutations som den fått synkat till servern alternativt uppdaterar en pekare.
  - Om nån annan hade tagit jobbet så checkas periodiskt att den andra lever
  - Om den andra blir klar så hoppar vi ut.
  - Om den andra tajmar ut så tar vi över.

# Pull

- Skicka med client-identity, senaste server revision och signerade realms för senaste sync.
- Servern minns denna client-identitys ändringar som är baserat på klientens senaste server-revision.
  Varje ändring är baserad på viss server-revision.
- Servern går igenom sina ändringar sedan revisionen med allt vad det innebär:
  - creates
  - updates
  - deletes
  - realm-changes (moves). Kan agera som delete/create med samma id men behöver inte lika mycket info.
  - Servern har till slut en summerad lista över det ändrade datat som ska skickas ned till klienten.
    Denna mängd inkluderar de ändringar som klienten varit orsak till.
  - Servern reducerar datat genom att gå igenom klientens ändringar som var baserade på föregående revisioner
    - Icke överlapp: serverns version gäller.
    - Överlapp: Reducera bort alla props som är identiska mellan klienten och servern.
      Om hela objektet är identiskt reduceras hela objektet bort.
  - Servern skickar ned sina ändringar, revision och signerade realms (om de ändrats sedan sist)
- Klienten gör en rw trans mot mutations table för de mutations som tillkommit under fetch-perioden.
- Klienten gör liknande algoritm för att skala bort fler av serverns ändringar:
  - Om klient-ändringar skett på överlappande props som servern skickat ned, så skala bort serverns props.
  HÄR: Om det pågår en ny PUSH (fortf. baserad på gamla server-rev) samtidigt om vi fetchar server-ändringar, så:
    - servern måste minnas klient-ändringar över 2 generationer. Kanske minns den dem via sin mutations-tabell?
    - i så fall requestar vi inte bara från senaster server-rev, utan från den rev där klienten senast börjare
      pusha upp sina ändringar.

# Om 2 gör pull "samtidigt"

- Spelar faktiskt ingen roll. Pull är icke-muterande på serverns sida.
- push däremot, om de förekommer två samtidigt så tror jag att det inte gör något heller så vida mutationerna är idempotenta. Icke-idempotenta operationer däremot måste kontrolleras från dubletter på något sätt.

