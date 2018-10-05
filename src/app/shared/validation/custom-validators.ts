import { AsyncValidatorFn, AbstractControl } from '@angular/forms';
import { of as observableOf } from 'rxjs';
import { map } from 'rxjs/operators';

/** Class which contain static validator functions */
export class CustomValidators {

    /** Async version of nonNumerciValidator */
    public static mustBeNumberValidator(control: AbstractControl) {
        return observableOf(control.value !== undefined && isNaN(control.value)).pipe(
            map(result => result ? { mustBeNumber: true } : null)
        );
    }

    /** Check if amount number */
    public static nonNumericValidator(control: AbstractControl): { [key: string]: boolean } | null {
        if (control.value !== undefined && (isNaN(control.value))) {
            return { 'nonNumericAmount': true };
        }
        return null;
    }

    /** Validator for check is value contained in specific array */
    public static isIncludedValidator(values: number[]): AsyncValidatorFn {
        return (control: AbstractControl) => {
            return observableOf(control.value !== undefined && !isNaN(control.value) && !values.includes(+control.value)).pipe(
                map(result => result ? { isIncluded: true } : null)
            );
        };
    }
}
