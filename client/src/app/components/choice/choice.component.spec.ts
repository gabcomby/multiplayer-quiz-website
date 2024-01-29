// import { ComponentFixture, TestBed } from '@angular/core/testing';

// import { ChoiceComponent } from './choice.component';
// const MAX_CHOICES = 4;

// describe('ChoiceComponent', () => {
//     let component: ChoiceComponent;
//     let fixture: ComponentFixture<ChoiceComponent>;

//     beforeEach(() => {
//         TestBed.configureTestingModule({
//             declarations: [ChoiceComponent],
//         });
//         fixture = TestBed.createComponent(ChoiceComponent);
//         component = fixture.componentInstance;
//         fixture.detectChanges();
//     });

//     it('should create', () => {
//         expect(component).toBeTruthy();
//     });

//     it('should have a minimum of 2 choices and a maximum of 4 choices', () => {
//         expect(component.answers.length).toBe(MAX_CHOICES);

//         while (component.answers.length > 1) {
//             component.removeChoice(0);
//         }
//         expect(component.answers.length).toBe(2);

//         component.addChoice();
//         expect(component.answers.length).toBe(3);

//         component.addChoice();
//         expect(component.answers.length).toBe(MAX_CHOICES);
//     });

//     it('should determine if a choice is a good or bad answer', () => {
//         // doit mettre async?
//         expect(component.answers[0].isCorrect).toBe(false);

//         const checkbox = fixture.nativeElement.querySelector('mat-checkbox');
//         checkbox.click();

//         expect(component.answers[0].isCorrect).toBe(true);
//     });

//     // it('should require at least one good and bad answer', () => {

//     // });

//     it('should be able to add and remove a choice', () => {
//         expect(component.answers.length).toBe(MAX_CHOICES);

//         component.removeChoice(0);
//         expect(component.answers.length).toBe(3);

//         component.addChoice();
//         expect(component.answers.length).toBe(MAX_CHOICES);
//     });

//     // faire test pour modifier et pour changer ordre
// });
