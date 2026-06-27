import { Component } from '@ariana-framework/core';

@Component({
  selector: 'ari-page',
  templateUrl: './page.component.html'
})
export class PageComponent {
  title = 'Ariana';
  user: { name: string } = { name: 'Ariana' };
  save(id: string) {}
}
