import Dexie from 'dexie';
import dexieObservable from 'dexie-observable';

const db = new Dexie('hej', {addons: [dexieObservable]});
db.version(1).stores({
  foo: '++id,bar'
});

// The following line will throw if not adaptTo() has been called
db.foo.where({id: 1})
  .observe()
  .subscribe(result => this.setState({result}));

class MyComponent extends React.Component {
  
  componentDidMount() {
    db.observe(async ()=>{
      const count = await db.foo.count();
      const items = await db.foo
        .offset(this.state.offset)
        .limit(this.props.limit)
        .toArray();
      return {count, items};
    }).subscribe(({count, items}) => {
      this.setState({count, items});
    });
  }

}
