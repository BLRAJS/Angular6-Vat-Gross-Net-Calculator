import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { CalculatorService } from '../../services/calculator.service';
import { CustomValidators } from '../../shared/validation/custom-validators';
import { CountryVatRateService } from '../../services/country-vat-rate.service';
import { CountryVatRate } from '../../models/country-vat-rate';
import { Calculator } from '../../shared/infrastructure/calculator';

@Component({
  selector: 'app-vat-calc-radio',
  templateUrl: './vat-calc-radio.component.html',
  styleUrls: ['./vat-calc-radio.component.css']
})
export class VatCalcRadioComponent implements OnInit, Calculator {
  vatForm: FormGroup;

  /** This variable will be used when we change vat rate
   * and relative to last changed we modify other amounts
   */
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
      .subscribe(cvr => this.countryVatRate = cvr);

    this.vatForm = this.fb.group({
      vatRate: [
        null, [
          Validators.required
        ]
      ],
      amountType: [
        null
      ],
      gross: [{ value: '', disabled: true }, [
        Validators.required,
        CustomValidators.nonNumericValidator,
        // Must be greater than zero so min is smallest possible number
        Validators.min(Number.MIN_VALUE)
      ]],
      nett: [{ value: '', disabled: true }, [
        Validators.required,
        CustomValidators.nonNumericValidator,
        Validators.min(Number.MIN_VALUE)
      ]],
      vat: [{ value: '', disabled: true }, [
        Validators.required,
        CustomValidators.nonNumericValidator,
        Validators.min(Number.MIN_VALUE)
      ]]
    });

    /** Subscription on change event for every form control */
    this.gross.valueChanges.subscribe(val => this.calculateFromGross(val));
    this.nett.valueChanges.subscribe(val => this.calculateFromNett(val));
    this.vat.valueChanges.subscribe(val => this.calucateFromVat(val));
    this.vatRate.valueChanges.subscribe(() => this.changeVatRate());
    this.amountType.valueChanges.subscribe(val => this.changeAmoutType(val));

    // default value for lastChanged
    this.lastChanged = this.gross;
  }

  get gross() { return this.vatForm.get('gross'); }
  get nett() { return this.vatForm.get('nett'); }
  get vat() { return this.vatForm.get('vat'); }
  get vatRate() { return this.vatForm.get('vatRate'); }
  get amountType() { return this.vatForm.get('amountType'); }


  /** Function for calculate VAT and Nett from Gross */
  calculateFromGross(gross: number): void {
    // Last changed will only set up if value is valid
    if (this.gross.valid) { this.lastChanged = this.gross; }
    // if vat rate is not set up or not valid raise a error message
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
    if (this.lastChanged.value !== '') {
      this.lastChanged.setValue(this.lastChanged.value);
    }
  }

  // quick disable all amounts
  private disableAllAmounts() {
    this.gross.disable({ emitEvent: false });
    this.nett.disable({ emitEvent: false });
    this.vat.disable({ emitEvent: false });
  }

  private changeAmoutType(value: string) {
    // after changeing focused amount set all other invalid to empty (clear invalid values in all fields)
    if (this.nett.invalid) { this.nett.setValue('', { emitEvent: false }); }
    if (this.gross.invalid) { this.gross.setValue('', { emitEvent: false }); }
    if (this.vat.invalid) { this.vat.setValue('', { emitEvent: false }); }

    this.disableAllAmounts();
    this.vatForm.get(value).enable({ emitEvent: false });
  }

  /** Methods which reset other fields except given one */
  resetOtherFields(control: AbstractControl): void {
    if (control !== this.gross) { this.gross.setValue('', { emitEvent: false }); }
    if (control !== this.nett) { this.nett.setValue('', { emitEvent: false }); }
    if (control !== this.vat) { this.vat.setValue('', { emitEvent: false }); }
  }
}
