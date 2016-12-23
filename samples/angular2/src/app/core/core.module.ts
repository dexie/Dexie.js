import { NgModule, Optional, SkipSelf } from '@angular/core';

import {DexieService} from './dexie.service';

// See: https://angular.io/docs/ts/latest/cookbook/ngmodule-faq.html#!#q-is-it-loaded
// and: https://angular.io/docs/ts/latest/guide/ngmodule.html#!#core-module for an explanation on what the CoreModule is
// and what its constructor does

@NgModule({
  declarations: [],
  imports: [],
  providers: [
    DexieService,
  ],
  bootstrap: []
})
export class CoreModule {
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    if (parentModule) {
      throw new Error(
        'CoreModule is already loaded. Import it in the AppModule only');
    }
  }
}


