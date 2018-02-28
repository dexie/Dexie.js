
# Paging

```ts

class Collection<T> {
  ...
  getPage (pageQuery: {pageNo?: number | 'last', valuesPerPage: number}): Promise<Page<T>>
  getNextPage (pageToken: string): Promise<page>
}

interface Page<T> {
  pageNo: number,
  values: T[],
  //totalCount: number, Dåligt eftersom man helst vill se resultatet innan count är färdigt.
  //totalPages: number, Bättre att användaren gör count() i annat async anrop och uppdaterar state då.
  pageToken: string,
  nextPageToken?: string,
  prevPageToken?: string,
  firstPageToken: string,
  //lastPageToken: string, // Redundant. Använd getLastPage() istället.
  //next(): Promise<Page<T>>;
  //prev(): Promise<Page<T>>;
}

```

## Alternativt Collection API (snyggare):

```ts

const query = db.people.where({
  name: startsWith('R'),
  age: between(7, 16),
  interests: anyOf("sports", "gaming", "music")
}).orderBy('age')
  .pageSize(10)

const firstPage = await query.getFirstPage();
const lastPage = await query.getLastPage();
const nextPage = await query.getPageByToken(firstPage.nextPageToken)
const prevPage = await query.getPageByToken(lastPage.prevPageToken)
const page10 = await query.getPageByNumber(10);

```

## Paging Usage

```tsx

interface Props {
  query: PagedCollection<Friend>;
}

interface State {
  page?: Page<Friend>;
}

class SearchResults extends React.Component<Props> {
  observable: Observable<Partial<State>>;
  setLiveState: Dexie.SetLiveStateFunction<Partial<State>>;
  refreshLiveState: ()=>void;
  stopLiveState: ()=>void;

  constructor(props: Props) {
    const {observable, setLiveState, refresh, teardown} = db.observe(); // Returns a LiveQuerier
    this.observable = observable;
    this.setLiveState = setLiveState;
    this.refreshLiveState = refresh;
    this.teardown = teardown;
    this.state = {loading: true};

    setLiveState({
      page: state => this.props.query.getFirstPage(),
      count: state => this.props.query.count(),
    });
  }

  componentDidMount() {
    observable.subscribe({
      next: state => this.setState(state),
      error: error => this.setState({error})
    });
  }

  componentWillUnmound() {
    this.teardown();
  }

  componentWillReceiveProps (nextProps, prevProps) {
    if (nextProps.query !== prevProps.query) {
      this.refreshLiveState();
    }
  }

  /*async refresh() {
    const page = await this.props.query.getPageByToken({this.state.page.pageToken});
    this.setState({page});
    const count = await this.props.query.count();
    this.setState({count});
  }*/

  async prevPage() {
    this.setLiveState({
      page: state => this.props.query.getPageByToken({state.page.prevPageToken})
    });
  }

  async nextPage() {
    this.setLiveState({
      page: ({page}) => this.props.query.getPageByToken(page.nextPageToken);
    });
  }

  async lastPage() {
    const page = await this.props.query.getNextPage({this.state.page.lastPageToken});
    this.setState({page});
  }

  async loadPage(pageNo: number) {
    const page = await this.props.query.getPageByNumber(pageNo);
    this.setState({page});
  }

  render() {
    const {page: {pageToken, pageNo, values, totalPages, nextPageToken, prevPageToken, firstPageToken, lastPageToken}} = this.state;
    const pages = new Array(totalPages);
    
    for (let pageIter=1; pageIter<= Math.min(totalPages, 10); ++pageIter) {
      pages[pageIter] = {
        pageNo: pageIter,
        load: pageNo == pageIter ? ()=>this.refresh() :
          pageIter === pageNo + 1 ? ()=>this.nextPage() :
          pageIter === pageNo - 1 ? ()=>this.prevPage() :
          pageIter === totalPages ? ()=>this.lastPage() :
          ()=> this.loadPage(pageIter);
    }
    return <table>
      <thead><tr>
        <th>Last Name</th>
        <th>First Name</th>
        <th>Age</th>
      </tr></thead>
      <tbody>
        {}
      </tbody>
      <tfoot><tr><td colspan={3}>
        <a onClick={()=>this.prevPage()}>Previous page</a>
        <a onClick={()=>this.nextPage()}>Next page</a>
        {pages.map(({pageNo, load}) => <a onClick={load && load()}>{pageNo}</a>)}
        <a onClick={()=>this.lastPage()}>Last page</a>
      </td></tr></tfoot>
    </table>
  }
}

```

