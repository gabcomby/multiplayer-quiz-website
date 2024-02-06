import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

// TODO: Do we stille need this service?
@Injectable({
    providedIn: 'root',
})
export class DeleteService {
    deleteSubject = new Subject<string>();
    delete$ = this.deleteSubject.asObservable();
    notifyDelete(id: string) {
        this.deleteSubject.next(id);
    }
}
