import { AbstractControl } from '@angular/forms';

/** Interface which must implement every VAT calculator */
export interface Calculator {
    calculateFromGross(gross: number): void;
    calculateFromNett(nett: number): void;
    calucateFromVat(vat: number): void;
    resetOtherFields(control: AbstractControl): void;
}
