import { Injectable } from '@angular/core';
import { Amount } from '../models/amount';

@Injectable({
  providedIn: 'root'
})
export class CalculatorService {

  constructor() { }

  /** Get amounts from GROSS and VAT Rate
   * @param gross: value of GROSS
   * @param vatRate: value of VAT Rate
   */
  getFromGross(gross: number, vatRate: number): Amount {
    const vat = gross - gross / (1 + vatRate / 100);
    return <Amount>{
      gross: gross,
      nett: gross - vat,
      vat: vat
    };
  }

  /** Get amounts from NETT and VAT RAte
   * @param nett: value of NETT
   * @param vatRate: value of VAT Rate
   */
  getFromNett(nett: number, vatRate: number): Amount {
    const gross = nett * (1 + vatRate / 100);
    return <Amount>{
      gross: gross,
      nett: nett,
      vat: gross - nett
    };
  }

  /** Get amounts from VAT and VAT RAte
   * @param vat: value of VAT
   * @param vatRate: value of VAT Rate
   */
  getFromVat(vat: number, vatRate: number): Amount {
    const gross = vat * (1 + vatRate / 100) * 100 / vatRate;
    return <Amount>{
      gross: gross,
      nett: gross - vat,
      vat: vat
    };
  }

}
