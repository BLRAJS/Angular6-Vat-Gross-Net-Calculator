import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';

import { CalculatorService } from '../../services/calculator.service';
import { CustomValidators } from '../../shared/validation/custom-validators';
import { environment } from '../../../environments/environment';
import { CountryVatRate } from '../../models/country-vat-rate';
import { CountryVatRateService } from '../../services/country-vat-rate.service';
import { Calculator } from '../../shared/infrastructure/calculator';

@Component({
  selector: 'app-vat-calc',
  templateUrl: './vat-calc.component.html',
  styleUrls: ['./vat-calc.component.css']
})
export class VatCalcComponent implements OnInit, Calculator {
  vatForm: FormGroup;

  lastChanged: AbstractControl;

  countryVatRate: CountryVatRate;

  constructor(
    private fb: FormBuilder,
    private calculatorService: CalculatorService,
    private countryVatRateService: CountryVatRateService
  ) { }

  ngOnInit() {
    this.countryVatRateService
      .getCountryVatRate()
      .subscribe(cvr => {

        this.countryVatRate = cvr;

        this.vatForm = this.fb.group({
          vatRate: [
            '',
            Validators.required,
            Validators.composeAsync([
              CustomValidators.mustBeNumberValidator,
              CustomValidators.isIncludedValidator(this.countryVatRate.vatRates)
            ])
          ],
          gross: ['', [
            Validators.required,
            CustomValidators.nonNumericValidator,
            Validators.min(Number.MIN_VALUE) // Must be greater than zero
          ]],
          nett: ['', [
            Validators.required,
            CustomValidators.nonNumericValidator,
            Validators.min(Number.MIN_VALUE)
          ]],
          vat: ['', [
            Validators.required,
            CustomValidators.nonNumericValidator,
            Validators.min(Number.MIN_VALUE)
          ]]
        });

      });

    /** Subscription on change event for every form control */
    this.gross.valueChanges.subscribe(val => this.calculateFromGross(val));
    this.nett.valueChanges.subscribe(val => this.calculateFromNett(val));
    this.vat.valueChanges.subscribe(val => this.calucateFromVat(val));
    this.vatRate.valueChanges.subscribe(() => this.changeVatRate());

    // default value for lastChanged
    this.lastChanged = this.gross;
  }

  get gross() { return this.vatForm.get('gross'); }
  get nett() { return this.vatForm.get('nett'); }
  get vat() { return this.vatForm.get('vat'); }
  get vatRate() { return this.vatForm.get('vatRate'); }

  /** Function for calculate VAT and Nett from Gross */
  calculateFromGross(gross: number): void {
    if (this.gross.valid) { this.lastChanged = this.gross; }
    if (!this.vatRate.valid) { this.vatRate.markAsTouched(); return; }
    if (this.gross.invalid) { this.resetOtherFields(this.gross); return; }

    // Call service to get amounts
    const amounts = this.calculatorService.getFromGross(gross, this.vatRate.value);

    this.vat.setValue(amounts.vat, { emitEvent: false });
    this.nett.setValue(amounts.nett, { emitEvent: false });
  }

  /** Function for calculate Gross and VAT from Nett */
  calculateFromNett(nett: number): void {
    if (this.nett.valid) { this.lastChanged = this.nett; }
    if (!this.vatRate.valid) { this.vatRate.markAsTouched(); return; }
    if (this.nett.invalid) { this.resetOtherFields(this.nett); return; }

    const amounts = this.calculatorService.getFromNett(nett, this.vatRate.value);

    this.gross.setValue(amounts.gross, { emitEvent: false });
    this.vat.setValue(amounts.vat, { emitEvent: false });
  }

  /** Function for calculate Gross and Nett from VAT */
  calucateFromVat(vat: number): void {
    if (this.vat.valid) { this.lastChanged = this.vat; }
    if (!this.vatRate.valid) { this.vatRate.markAsTouched(); return; }
    if (this.vat.invalid) { this.resetOtherFields(this.vat); return; }

    const amounts = this.calculatorService.getFromVat(vat, this.vatRate.value);

    this.gross.setValue(amounts.gross, { emitEvent: false });
    this.nett.setValue(amounts.nett, { emitEvent: false });
  }

  /** After VAT rate is changed this function will be raised
   * to update parameters by last changed parameter */
  changeVatRate() {
    if (this.vatRate.invalid) { return; }
    this.lastChanged.setValue(this.lastChanged.value);
  }

  /** Methods which reset other fields except given one */
  resetOtherFields(control: AbstractControl): void {
    if (control !== this.gross) { this.gross.setValue('', { emitEvent: false }); }
    if (control !== this.nett) { this.nett.setValue('', { emitEvent: false }); }
    if (control !== this.vat) { this.vat.setValue('', { emitEvent: false }); }
  }
}


