import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavigationComponent } from "./shared/navigation/navigation.component";

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  imports: [RouterOutlet, NavigationComponent],
})
export class AppComponent {
  title = 'lab-frontend';
}
