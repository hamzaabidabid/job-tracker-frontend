import {Routes} from '@angular/router';
import {DashboardComponent} from './components/dashboard/dashboard.component';
import {JobListComponent} from './components/job-list/job-list.component';
import {JobDetailComponent} from './components/job-detail/job-detail.component';
import {JobFormComponent} from './components/job-form/job-form.component';
import {FavoriteListComponent} from './components/favorite-list/favorite-list.component';

export const routes: Routes = [
  {path: '', redirectTo: '/dashboard', pathMatch: 'full'},
  {path: 'dashboard', component: DashboardComponent},
  {path: 'jobs', component: JobListComponent},
  { path: 'favorites', component: FavoriteListComponent },
  {path: 'jobs/:id', component: JobDetailComponent},
  {path: 'add-job', component: JobFormComponent},
  {path: 'edit-job/:id', component: JobFormComponent}
];
