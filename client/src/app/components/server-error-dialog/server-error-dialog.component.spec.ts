import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServerErrorDialogComponent } from './server-error-dialog.component';

describe('ServerErrorDialogComponent', () => {
  let component: ServerErrorDialogComponent;
  let fixture: ComponentFixture<ServerErrorDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ServerErrorDialogComponent]
    });
    fixture = TestBed.createComponent(ServerErrorDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
