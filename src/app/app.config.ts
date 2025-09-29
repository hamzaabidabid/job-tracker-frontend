import { ApplicationConfig, importProvidersFrom ,LOCALE_ID} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { MatTooltipModule } from '@angular/material/tooltip';
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import { routes } from './app.routes';

// Importez les modules Angular Material
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatListModule } from '@angular/material/list';
import {MatStepperModule} from '@angular/material/stepper';
import {MatPaginatorModule} from '@angular/material/paginator';


registerLocaleData(localeFr);
export const appConfig: ApplicationConfig = {
  providers: [

    provideRouter(routes),
    provideHttpClient(),
    provideAnimations(),
    importProvidersFrom([
      ReactiveFormsModule,
      MatListModule,
      MatStepperModule,
      NgxChartsModule,
      MatToolbarModule,
      MatButtonModule,
      MatTableModule,
      MatCardModule,
      MatIconModule,
      MatFormFieldModule,
      MatInputModule,
      MatSelectModule,
      MatDatepickerModule,
      MatNativeDateModule,
      MatChipsModule,
      MatGridListModule,
      MatPaginatorModule,
      MatFormFieldModule,
      MatInputModule

    ]),
    { provide: LOCALE_ID, useValue: 'fr-FR' }
  ]
};
