import {wrap} from '../../promise';

export function preventDefault(event) {
    if (event.stopPropagation) // IndexedDBShim doesnt support this on Safari 8 and below.
        event.stopPropagation();
    if (event.preventDefault) // IndexedDBShim doesnt support this on Safari 8 and below.
        event.preventDefault();
}

export function eventRejectHandler(reject) {
    return wrap(event => {
        preventDefault(event);
        reject (event.target.error);
    });
}

export function eventSuccessHandler (resolve) {
    return wrap(function (event){
        resolve(event.target.result);
    });
}
