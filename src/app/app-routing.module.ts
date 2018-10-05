import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VatCalcComponent } from './components/vat-calc/vat-calc.component';
import { VatCalcRadioComponent } from './components/vat-calc-radio/vat-calc-radio.component';

const routes: Routes = [
    { path: '', component: VatCalcComponent },
    { path: 'vatcalc1', component: VatCalcComponent },
    { path: 'vatcalc2', component: VatCalcRadioComponent },
    { path: '**', component: VatCalcComponent },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule {}
