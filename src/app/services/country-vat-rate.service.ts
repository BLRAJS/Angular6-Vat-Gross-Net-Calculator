import { Injectable } from '@angular/core';
import { CountryVatRate } from '../models/country-vat-rate';
import { Observable, of as observableOf } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class CountryVatRateService {

    /** Get country VAT RATE by id
     * @default: id = 1 for Austria
     */
    getCountryVatRate(id: number = 1): Observable<CountryVatRate> {
        return observableOf(VAT_RATE_DATA.find(vr => vr.id === id));
    }
}

// HARDCODED DATA
const VAT_RATE_DATA = [<CountryVatRate>{
    id: 1,
    country: 'Austria',
    vatRates: [10, 13, 20]
}];
